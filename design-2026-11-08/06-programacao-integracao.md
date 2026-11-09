## Entrega — integração de `app.js`

O `app.js` atual não foi fornecido, portanto não é possível indicar linhas reais ou garantir nomes internos existentes. Para evitar sobrescrever funcionalidades, o bloco abaixo foi desenhado como uma camada de integração isolada.

Ele deve ser incorporado ao final de `app.js`, ou adaptado ao carregamento atual. O código não executa conteúdo gerado: apenas armazena texto e cria um ZIP para download.

### 1. Camada de integração

```js
/* ============================================================
   Apollo — integração de navegação, voz e entregas
   Compatível com os IDs contratuais do DOM.
   Não depende de bibliotecas externas.
   ============================================================ */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const els = {
    status: $("status"),
    tabs: {
      chat: $("tab-chat"),
      plan: $("tab-plan"),
      results: $("tab-results"),
      more: $("tab-more")
    },
    panels: {
      chat: $("panel-chat"),
      plan: $("panel-plan"),
      results: $("panel-results"),
      more: $("panel-more")
    },
    voiceWave: $("voiceWave"),
    voice: $("voice"),
    autoListen: $("autoListen"),
    captureStatus: $("captureStatus"),
    rawTranscript: $("rawTranscript"),
    cleanTranscript: $("cleanTranscript"),
    voiceUsage: $("voiceUsage"),
    chatInput: $("chatInput"),
    sendChat: $("sendChat"),
    autoVoice: $("autoVoice"),
    voiceNotice: $("voiceNotice"),
    playFeedback: $("playFeedback"),
    stopFeedback: $("stopFeedback"),
    voiceStatus: $("voiceStatus"),
    voicePlayer: $("voicePlayer"),
    approve: $("approve"),
    run: $("run"),
    results: $("results"),
    resultHint: $("resultHint"),
    stepPosition: $("stepPosition"),
    approvalStatus: $("approvalStatus"),
    history: $("history")
  };

  const state = {
    activeTab: "chat",
    stream: null,
    recorder: null,
    audioContext: null,
    analyser: null,
    animationFrame: 0,
    recognition: null,
    recognitionRunning: false,
    recognitionSupported: false,
    speechPermission: false,
    speechTimer: 0,
    currentStep: null,
    currentVersion: null,
    artifacts: [],
    lastCompletionKey: null,
    lastTranscript: "",
    lastTranscriptConfidence: 0,
    oldBrowser: false
  };

  const negativePattern =
    /\b(não|nao|cancelar|cancela|pare|parar|não aprovo|nao aprovo|rejeito|rejeitar)\b/i;

  function setStatus(message) {
    if (els.status) els.status.textContent = message;
  }

  function announceVoice(message) {
    if (els.voiceStatus) els.voiceStatus.textContent = message;
    if (els.captureStatus) els.captureStatus.textContent = message;
  }

  function getVersion(detail = {}) {
    return (
      detail.version ??
      document.body.dataset.planVersion ??
      window.apolloState?.plan?.version ??
      null
    );
  }

  function getStepNumber(detail = {}) {
    const explicit = Number(detail.stepNumber);
    if (Number.isInteger(explicit) && explicit > 0) return explicit;

    const text = els.stepPosition?.textContent || "";
    const match = text.match(/^\s*(\d+)\s*\/\s*\d+/);
    return match ? Number(match[1]) : null;
  }

  function setTab(name, focus = false) {
    if (!els.tabs[name] || !els.panels[name]) return;

    state.activeTab = name;

    Object.entries(els.tabs).forEach(([key, tab]) => {
      const selected = key === name;
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });

    Object.entries(els.panels).forEach(([key, panel]) => {
      panel.hidden = key !== name;
    });

    if (focus) {
      els.tabs[name].focus();
    }
  }

  function bindTabs() {
    Object.entries(els.tabs).forEach(([name, tab]) => {
      if (!tab) return;

      tab.addEventListener("click", () => setTab(name));

      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
          return;
        }

        event.preventDefault();

        const names = Object.keys(els.tabs);
        const current = names.indexOf(name);
        let next = current;

        if (event.key === "ArrowRight") next = (current + 1) % names.length;
        if (event.key === "ArrowLeft") {
          next = (current - 1 + names.length) % names.length;
        }
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = names.length - 1;

        setTab(names[next], true);
      });
    });
  }

  /* ------------------------------------------------------------
     Visualização circular baseada em áudio real
     ------------------------------------------------------------ */

  function drawVoiceCircle() {
    const canvas = els.voiceWave;
    const analyser = state.analyser;

    if (!canvas || !analyser) return;

    const context = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.29;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);

    context.clearRect(0, 0, width, height);

    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2);
    context.strokeStyle = "#333333";
    context.lineWidth = 2;
    context.stroke();

    context.beginPath();

    for (let i = 0; i < data.length; i++) {
      const angle = (i / data.length) * Math.PI * 2;
      const amplitude = data[i] / 255;
      const pointRadius = radius + amplitude * 25;

      const x = centerX + Math.cos(angle) * pointRadius;
      const y = centerY + Math.sin(angle) * pointRadius;

      if (i === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }

    context.closePath();
    context.strokeStyle = "#c8f135";
    context.lineWidth = 3;
    context.stroke();

    state.animationFrame = requestAnimationFrame(drawVoiceCircle);
  }

  async function connectAudioStream(stream) {
    if (!window.AudioContext && !window.webkitAudioContext) {
      announceVoice("Visualização de áudio indisponível neste navegador.");
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;

    state.audioContext = state.audioContext || new AudioContextClass();

    if (state.audioContext.state === "suspended") {
      await state.audioContext.resume();
    }

    const source = state.audioContext.createMediaStreamSource(stream);
    state.analyser = state.audioContext.createAnalyser();
    state.analyser.fftSize = 128;
    state.analyser.smoothingTimeConstant = 0.78;

    source.connect(state.analyser);

    cancelAnimationFrame(state.animationFrame);
    drawVoiceCircle();
  }

  async function startMicrophone() {
    if (!navigator.mediaDevices?.getUserMedia) {
      announceVoice("Este navegador não oferece captura de microfone.");
      state.oldBrowser = true;
      return false;
    }

    try {
      state.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      await connectAudioStream(state.stream);

      if (window.MediaRecorder) {
        state.recorder = new MediaRecorder(state.stream);
      }

      announceVoice("Microfone ativo.");
      return true;
    } catch (error) {
      announceVoice("Microfone não autorizado ou indisponível.");
      return false;
    }
  }

  function stopMicrophone() {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
      state.stream = null;
    }

    if (state.recorder && state.recorder.state !== "inactive") {
      state.recorder.stop();
    }

    cancelAnimationFrame(state.animationFrame);
    state.analyser = null;

    const canvas = els.voiceWave;
    if (canvas) {
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    }

    announceVoice("Microfone desligado.");
  }

  /* ------------------------------------------------------------
     Reconhecimento opcional.
     Não usa voz do Windows nem inicia automaticamente.
     ------------------------------------------------------------ */

  function createRecognition() {
    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      state.recognitionSupported = false;
      announceVoice("Reconhecimento de voz não disponível neste navegador.");
      return null;
    }

    const recognition = new Recognition();

    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      state.recognitionRunning = true;
      announceVoice("Ouvindo. Fale uma instrução.");
    };

    recognition.onend = () => {
      state.recognitionRunning = false;
      if (state.speechTimer) clearTimeout(state.speechTimer);
      announceVoice("Escuta encerrada.");
    };

    recognition.onerror = () => {
      state.recognitionRunning = false;
      announceVoice("Não foi possível entender a entrada de voz.");
    };

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const alternative = result?.[0];

      const transcript = String(alternative?.transcript || "").trim();
      const confidence = Number(alternative?.confidence || 0);

      if (!transcript) {
        announceVoice("Nenhuma fala detectada.");
        return;
      }

      state.lastTranscript = transcript;
      state.lastTranscriptConfidence = confidence;

      if (els.rawTranscript) {
        els.rawTranscript.textContent = transcript;
      }

      if (confidence >= 0.7 && els.cleanTranscript) {
        els.cleanTranscript.textContent = transcript;
      } else if (els.cleanTranscript) {
        els.cleanTranscript.textContent =
          "Transcrição incerta. Revise antes de enviar.";
      }

      if (isApprovalPhrase(transcript)) {
        handleVoiceApproval(transcript, confidence);
        return;
      }

      if (els.chatInput && confidence >= 0.7) {
        els.chatInput.value = transcript;
        announceVoice("Transcrição inserida no Chat. Revise antes de enviar.");
      } else {
        announceVoice("Transcrição incerta. Nada foi enviado.");
      }
    };

    state.recognitionSupported = true;
    return recognition;
  }

  async function startVoiceInput() {
    if (!state.speechPermission) {
      state.speechPermission = window.confirm(
        "Permitir que o Apollo use o microfone para transcrever esta fala?"
      );

      if (!state.speechPermission) {
        announceVoice("Permissão de voz recusada.");
        return;
      }
    }

    if (!state.stream) {
      const started = await startMicrophone();
      if (!started) return;
    }

    if (!state.recognition) {
      state.recognition = createRecognition();
    }

    if (!state.recognition || state.recognitionRunning) return;

    try {
      state.recognition.start();

      state.speechTimer = window.setTimeout(() => {
        if (state.recognitionRunning) {
          state.recognition.stop();
          announceVoice("Tempo de escuta encerrado por silêncio.");
        }
      }, 12000);
    } catch (error) {
      announceVoice("A escuta já está em andamento.");
    }
  }

  function isApprovalPhrase(transcript) {
    return (
      /\b(aprovar|aprovado|aprovo)\b/i.test(transcript) &&
      /\b(etapa|passo)\b/i.test(transcript) &&
      /\d+/.test(transcript) &&
      !negativePattern.test(transcript)
    );
  }

  function handleVoiceApproval(transcript, confidence) {
    const numberMatch = transcript.match(/\b(?:etapa|passo)\s+(\d+)\b/i);
    const spokenStep = numberMatch ? Number(numberMatch[1]) : null;
    const actualStep = getStepNumber();

    if (confidence < 0.86) {
      announceVoice(
        "Aprovação não confirmada: transcrição incerta. Use o botão Aprovar."
      );
      return;
    }

    if (!spokenStep || !actualStep || spokenStep !== actualStep) {
      announceVoice(
        "Aprovação não confirmada: o número da etapa não corresponde à etapa atual."
      );
      return;
    }

    if (negativePattern.test(transcript)) {
      announceVoice("Aprovação cancelada.");
      return;
    }

    const confirmed = window.confirm(
      `Confirmar aprovação da etapa ${actualStep}?`
    );

    if (!confirmed) {
      announceVoice("Aprovação cancelada.");
      return;
    }

    if (els.approve && !els.approve.disabled) {
      els.approve.click();
      announceVoice(`Etapa ${actualStep} aprovada.`);
    }
  }

  function bindVoice() {
    els.voice?.addEventListener("click", startVoiceInput);

    els.autoListen?.addEventListener("click", async () => {
      const enabled = els.autoListen.getAttribute("aria-pressed") !== "true";

      els.autoListen.setAttribute("aria-pressed", String(enabled));

      if (enabled) {
        await startVoiceInput();
      } else {
        if (state.recognitionRunning) state.recognition.stop();
        stopMicrophone();
      }
    });

    els.stopFeedback?.addEventListener("click", () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }

      if (els.voicePlayer) {
        els.voicePlayer.pause();
        els.voicePlayer.currentTime = 0;
      }

      announceVoice("Resumo falado interrompido.");
    });
  }

  /* ------------------------------------------------------------
     Som curto de conclusão.
     O som só é disparado após evento explícito de conclusão.
     ------------------------------------------------------------ */

  function playCompletionTone() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    try {
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        880,
        context.currentTime + 0.12
      );

      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.24
      );

      oscillator.connect(gain);
      gain.connect(context.destination);

      oscillator.start();
      oscillator.stop(context.currentTime + 0.25);
    } catch (error) {
      // Falha de áudio não deve interromper a entrega.
    }
  }

  /* ------------------------------------------------------------
     Resumo falado somente após permissão explícita.
     ------------------------------------------------------------ */

  function speakSummary(text) {
    if (!els.autoVoice?.checked) {
      if (els.voiceNotice) els.voiceNotice.hidden = true;
      return;
    }

    if (!("speechSynthesis" in window)) {
      announceVoice("Resumo falado não disponível neste navegador.");
      return;
    }

    if (!text || !String(text).trim()) return;

    if (els.voiceNotice) els.voiceNotice.hidden = false;

    els.playFeedback?.addEventListener(
      "click",
      () => {
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(String(text));
        utterance.lang = "pt-BR";
        utterance.rate = 0.95;
        utterance.pitch = 1;

        window.speechSynthesis.speak(utterance);
      },
      { once: true }
    );
  }

  /* ------------------------------------------------------------
     Artefatos e ZIP.
     Arquivos são tratados como texto opaco.
     Nenhum conteúdo é executado.
     ------------------------------------------------------------ */

  function addArtifact(name, content) {
    if (!name || typeof content !== "string") return false;

    const safeName = String(name)
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .replace(/\.\./g, "_");

    state.artifacts.push({
      name: safeName,
      content
    });

    renderArtifacts();
    return true;
  }

  function renderArtifacts() {
    if (!els.results) return;

    const existing = els.results.querySelector("[data-apollo-artifacts]");
    if (existing) existing.remove();

    if (!state.artifacts.length) return;

    const wrapper = document.createElement("section");
    wrapper.dataset.apolloArtifacts = "true";
    wrapper.className = "artifact-list";
    wrapper.setAttribute("aria-label", "Entregas disponíveis");

    const title = document.createElement("h3");
    title.textContent = "Arquivos da entrega";
    wrapper.appendChild(title);

    const list = document.createElement("ul");

    state.artifacts.forEach((artifact) => {
      const item = document.createElement("li");
      item.textContent = artifact.name;
      list.appendChild(item);
    });

    wrapper.appendChild(list);

    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Baixar entrega em ZIP";
    button.addEventListener("click", downloadArtifactsZip);

    wrapper.appendChild(button);
    els.results.appendChild(wrapper);
  }

  function crc32(bytes) {
    let crc = 0xffffffff;

    for (let i = 0; i < bytes.length; i++) {
      crc ^= bytes[i];

      for (let j = 0; j < 8; j++) {
        crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      }
    }

    return (crc ^ 0xffffffff) >>> 0;
  }

  function u16(value) {
    return new Uint8Array([value & 255, (value >>> 8) & 255]);
  }

  function u32(value) {
    return new Uint8Array([
      value & 255,
      (value >>> 8) & 255,
      (value >>> 16) & 255,
      (value >>> 24) & 255
    ]);
  }

  function concatBytes(...parts) {
    const total = parts.reduce((sum, part) => sum + part.length, 0);
    const result = new Uint8Array(total);
    let offset = 0;

    parts.forEach((part) => {
      result.set(part, offset);
      offset += part.length;
    });

    return result;
  }

  function makeZip(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let offset = 0;

    files.forEach((file) => {
      const name = encoder.encode(file.name);
      const data = encoder.encode(file.content);
      const checksum = crc32(data);

      const localHeader = concatBytes(
        u32(0x04034b50),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(checksum),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        name
      );

      localParts.push(localHeader, data);

      const centralHeader = concatBytes(
        u32(0x02014b50),
        u16(20),
        u16(20),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(checksum),
        u32(data.length),
        u32(data.length),
        u16(name.length),
        u16(0),
        u16(0),
        u16(0),
        u16(0),
        u32(0),
        u32(offset),
        name
      );

      centralParts.push(centralHeader);
      offset += localHeader.length + data.length;
    });

    const local = concatBytes(...localParts);
    const central = concatBytes(...centralParts);

    const end = concatBytes(
      u32(0x06054b50),
      u16(0),
      u16(0),
      u16(files.length),
      u16(files.length),
      u32(central.length),
      u32(local.length),
      u16(0)
    );

    return concatBytes(local, central, end);
  }

  function downloadArtifactsZip() {
    if (!state.artifacts.length) {
      announceVoice("Nenhum arquivo disponível para compactar.");
      return;
    }

    const zip = makeZip(state.artifacts);
    const blob = new Blob([zip], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "apollo-entrega.zip";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ------------------------------------------------------------
     Evento de conclusão.
     Deve ser emitido pelo handler existente de execução.
     ------------------------------------------------------------ */

  function handleStepFinished(event) {
    const detail = event.detail || {};
    const stepNumber = getStepNumber(detail);
    const version = getVersion(detail);

    if (!stepNumber || !version) {
      announceVoice(
        "Entrega recebida sem número ou versão verificável. Nenhuma aprovação automática foi feita."
      );
      return;
    }

    const completionKey = `${version}:${stepNumber}`;

    if (state.lastCompletionKey === completionKey) return;
    state.lastCompletionKey = completionKey;

    state.currentStep = stepNumber;
    state.currentVersion = version;

    playCompletionTone();

    if (detail.summary) {
      speakSummary(detail.summary);
    }

    if (detail.artifacts && Array.isArray(detail.artifacts)) {
      detail.artifacts.forEach((artifact) => {
        addArtifact(artifact.name, artifact.content);
      });
    }

    if (els.approvalStatus) {
      els.approvalStatus.dataset.status = "pending";
      els.approvalStatus.textContent =
        `Etapa ${stepNumber} concluída. Aprovação necessária para continuar.`;
    }

    setStatus(`Etapa ${stepNumber} concluída.`);
    setTab("results");
  }

  function bindCompletionEvent() {
    window.addEventListener("apollo:step-finished", handleStepFinished);
  }

  /* ------------------------------------------------------------
     API pequena para o app.js existente.
     ------------------------------------------------------------ */

  window.apolloIntegration = {
    setTab,
    startVoiceInput,
    stopMicrophone,
    addArtifact,
    speakSummary,
    playCompletionTone,
    downloadArtifactsZip,
    getState: () => ({
      activeTab: state.activeTab,
      currentStep: state.currentStep,
      currentVersion: state.currentVersion,
      recognitionSupported: state.recognitionSupported,
      oldBrowser: state.oldBrowser
    })
  };

  function init() {
    bindTabs();
    bindVoice();
    bindCompletionEvent();

    setTab("chat");

    if (els.voiceUsage) {
      els.voiceUsage.textContent =
        "A voz é opcional. O Apollo só escuta após permissão explícita.";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
```

### 2. Alteração necessária no handler existente de conclusão

No ponto em que a etapa termina com sucesso, o `app.js` existente deve emitir o evento abaixo. O evento deve ocorrer somente depois de a entrega ter sido registrada:

```js
window.dispatchEvent(
  new CustomEvent("apollo:step-finished", {
    detail: {
      version: plan.version,
      stepNumber: currentStepIndex + 1,
      summary: resultSummary,

      // Opcional. Os conteúdos permanecem como texto.
      artifacts: [
        {
          name: "index.html",
          content: htmlText
        },
        {
          name: "style.css",
          content: cssText
        },
        {
          name: "app.js",
          content: jsText
        }
      ]
    }
  })
);
```

Se a etapa não produzir arquivos, omita `artifacts`.

### 3. Proteções incluídas

- `tab-more` e `panel-more` usam navegação por teclado com:
  - `ArrowLeft`
  - `ArrowRight`
  - `Home`
  - `End`
- A voz não é ativada automaticamente.
- O microfone exige permissão do navegador e confirmação do Apollo.
- Nenhum mecanismo de voz do Windows é selecionado ou acionado.
- O resumo falado só aparece quando `autoVoice` está marcado.
- A aprovação por voz exige:
  - frase contendo “aprovar etapa N” ou “aprovo etapa N”;
  - confiança mínima de `0.86`;
  - número igual à etapa atual;
  - ausência de term
[Resposta truncada pelo limite local de 24.000 caracteres.]