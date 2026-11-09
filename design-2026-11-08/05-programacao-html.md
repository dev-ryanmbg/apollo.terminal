```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1a1a1a">
  <meta name="description" content="Apollo local — sala de trabalho para conversar, planejar e receber entregas.">
  <meta name="apollo-token" content="__TOKEN__">
  <title>Apollo local</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="app-header">
    <div>
      <h1>Apollo</h1>
      <span id="status" role="status" aria-live="polite">Pronto</span>
    </div>
    <div>
      <span aria-label="Projeto atual">Projeto</span>
      <select id="projectSelect" aria-label="Selecionar projeto"></select>
    </div>
  </header>

  <main class="app-shell">
    <section class="projectbar" aria-label="Gestão do projeto">
      <label for="projectName">
        Nome do projeto
        <input id="projectName" name="projectName" type="text" autocomplete="off">
      </label>
      <button id="newProject" type="button">Novo projeto</button>
    </section>

    <nav class="tabs" role="tablist" aria-label="Destinos do Apollo">
      <button
        id="tab-chat"
        type="button"
        role="tab"
        aria-selected="true"
        aria-controls="panel-chat"
        tabindex="0">
        Chat
      </button>
      <button
        id="tab-plan"
        type="button"
        role="tab"
        aria-selected="false"
        aria-controls="panel-plan"
        tabindex="-1">
        Plano
      </button>
      <button
        id="tab-results"
        type="button"
        role="tab"
        aria-selected="false"
        aria-controls="panel-results"
        tabindex="-1">
        Resultado
      </button>
      <button
        id="tab-more"
        type="button"
        role="tab"
        aria-selected="false"
        aria-controls="panel-more"
        tabindex="-1">
        Mais…
      </button>
    </nav>

    <section
      id="panel-chat"
      class="panel"
      role="tabpanel"
      aria-labelledby="tab-chat"
      tabindex="0">

      <div id="chat" class="chatlog" aria-live="polite" aria-label="Conversa"></div>

      <form id="chatForm">
        <label class="sr-only" for="chatInput">Mensagem</label>
        <textarea
          id="chatInput"
          name="chatInput"
          rows="2"
          placeholder="O que precisa acontecer?"
          autocomplete="off"></textarea>
        <button id="voice" type="button" aria-label="Ativar entrada de voz">
          Voz
        </button>
        <button id="sendChat" type="submit">Enviar</button>
      </form>

      <section class="voice-console" aria-labelledby="voiceConsoleTitle">
        <div>
          <h2 id="voiceConsoleTitle">Voz opcional</h2>
          <canvas
            id="voiceWave"
            width="220"
            height="220"
            role="img"
            aria-label="Visualização circular da voz"></canvas>
        </div>

        <div class="voice-controls">
          <button
            id="autoListen"
            type="button"
            aria-pressed="false">
            Escuta contínua
          </button>

          <span id="captureStatus" role="status" aria-live="polite">
            Microfone desligado
          </span>

          <p id="rawTranscript">Transcrição bruta aguardando entrada.</p>
          <p id="cleanTranscript">Transcrição revisada aguardando entrada.</p>
          <p id="voiceUsage">A voz só será usada quando você permitir.</p>
        </div>
      </section>

      <section aria-label="Retorno falado">
        <p id="message" role="status" aria-live="polite"></p>

        <label for="autoVoice">
          Permitir resumo falado
          <input id="autoVoice" name="autoVoice" type="checkbox">
        </label>

        <div id="voiceNotice" role="status" aria-live="polite" hidden>
          <span>Um resumo falado está disponível.</span>
          <button id="playFeedback" type="button">Ouvir resumo</button>
          <button id="stopFeedback" type="button">Parar áudio</button>
        </div>
      </section>

      <form id="planForm">
        <label for="task">
          Nova tarefa ou objetivo
          <textarea
            id="task"
            name="task"
            rows="5"
            placeholder="Descreva o resultado que você quer obter."></textarea>
        </label>

        <label for="strategy">
          Estratégia
          <select id="strategy" name="strategy">
            <option value="balanced">Equilibrada</option>
            <option value="deep">Profunda</option>
            <option value="fast">Direta</option>
          </select>
        </label>

        <button id="plan" type="button">Criar plano</button>
      </form>
    </section>

    <section
      id="panel-plan"
      class="panel"
      role="tabpanel"
      aria-labelledby="tab-plan"
      tabindex="0"
      hidden>

      <header class="plan-header">
        <span id="planBadge">Nenhum plano ativo</span>
        <h2 id="planTitle">Plano de trabalho</h2>
        <p id="planGoal"></p>
      </header>

      <div id="planEmpty">
        <p>Crie um plano no Chat para começar.</p>
      </div>

      <div id="planContent" hidden>
        <div id="progress" role="progressbar" aria-label="Progresso do plano"></div>

        <ol id="steps" aria-label="Etapas do plano"></ol>

        <div id="stepPosition" aria-live="polite">0 / 0</div>
        <h3 id="stepTitle">Etapa</h3>

        <label for="executor">
          Executor
          <select id="executor" name="executor">
            <option value="claude">Claude</option>
            <option value="jarvis-programacao">Jarvis programação</option>
            <option value="apollo">Apollo</option>
          </select>
        </label>

        <details id="stepDetails">
          <summary>Detalhes da etapa</summary>
          <div>
            <p id="stepDescription"></p>
          </div>
        </details>

        <section aria-label="Editar etapa">
          <label for="stepTitleEdit">
            Título
            <input id="stepTitleEdit" name="stepTitleEdit" type="text">
          </label>

          <label for="stepEdit">
            Instrução
            <textarea id="stepEdit" name="stepEdit" rows="6"></textarea>
          </label>

          <label for="expected">
            Entrega esperada
            <textarea id="expected" name="expected" rows="4"></textarea>
          </label>

          <p id="editStatus" role="status" aria-live="polite"></p>
          <button id="saveStep" type="button">Salvar etapa</button>
        </section>

        <p id="approvalStatus" data-status="pending">
          Aprovação necessária
        </p>

        <button id="approve" type="button">Aprovar etapa</button>
        <button id="run" type="button">Executar etapa</button>
        <button id="showResults" type="button">Ver resultado</button>
        <button id="discard" type="button">Descartar plano</button>

        <div class="step-navigation">
          <button id="previousStep" type="button">Etapa anterior</button>
          <button id="nextStep" type="button">Próxima etapa</button>
        </div>
      </div>
    </section>

    <section
      id="panel-results"
      class="panel"
      role="tabpanel"
      aria-labelledby="tab-results"
      tabindex="0"
      hidden>

      <h2 id="resultTitle">Resultados</h2>
      <p id="resultHint">As entregas aparecerão aqui quando uma etapa terminar.</p>
      <div id="results" aria-live="polite"></div>
      <button id="continuePlan" type="button">Continuar plano</button>
    </section>

    <section
      id="panel-more"
      class="panel"
      role="tabpanel"
      aria-labelledby="tab-more"
      tabindex="0"
      hidden>

      <h2>Mais</h2>

      <section class="config-group" aria-labelledby="connectionTitle">
        <h3 id="connectionTitle">Conexões</h3>

        <label for="demo">
          Modo demonstração
          <input id="demo" name="demo" type="checkbox">
        </label>

        <label for="baseUrl">
          URL base
          <input id="baseUrl" name="baseUrl" type="url" placeholder="http://localhost">
        </label>

        <label for="planner">
          Modelo de planejamento
          <input id="planner" name="planner" type="text">
        </label>

        <label for="worker">
          Modelo de execução
          <input id="worker" name="worker" type="text">
        </label>

        <label for="chatModel">
          Modelo de conversa
          <input id="chatModel" name="chatModel" type="text">
        </label>

        <label for="routes">
          Rotas da API
          <textarea id="routes" name="routes" rows="7"></textarea>
        </label>

        <p id="keyStatus" role="status" aria-live="polite"></p>
        <button id="save" type="button">Salvar configurações</button>
      </section>

      <section class="config-group" aria-labelledby="voiceSettingsTitle">
        <h3 id="voiceSettingsTitle">Voz</h3>

        <label for="asrEngine">
          Reconhecimento de voz
          <select id="asrEngine" name="asrEngine">
            <option value="browser">Navegador</option>
            <option value="media-recorder">MediaRecorder</option>
            <option value="none">Desativado</option>
          </select>
        </label>

        <label for="ttsEngine">
          Síntese de voz
          <select id="ttsEngine" name="ttsEngine">
            <option value="browser">Navegador</option>
            <option value="none">Desativada</option>
          </select>
        </label>

        <label for="voicePreset">
          Perfil de voz
          <select id="voicePreset" name="voicePreset">
            <option value="default">Padrão</option>
            <option value="calm">Calma</option>
            <option value="direct">Direta</option>
          </select>
        </label>

        <p id="voiceStatus" role="status" aria-live="polite"></p>

        <div>
          <button id="checkVoice" type="button">Verificar voz</button>
          <button id="testVoice" type="button">Testar voz</button>
          <button id="stopVoice" type="button">Parar voz</button>
        </div>

        <audio id="voicePlayer" controls preload="none"></audio>
      </section>

      <section class="config-group" aria-labelledby="auditTitle">
        <h3 id="auditTitle">Auditoria</h3>
        <div id="history" aria-live="polite"></div>
      </section>
    </section>
  </main>

  <footer id="memory">
    <small>Memória local do Apollo. Aprovação explícita antes da próxima etapa.</small>
  </footer>

  <script src="app.js" defer></script>
</body>
</html>
```