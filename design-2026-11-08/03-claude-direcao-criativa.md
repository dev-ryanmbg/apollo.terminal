# Direção Visual Autoral — Apollo local de Ryan

---

## Premissa de atitude

O Apollo não é um produto. É uma sala de trabalho de uma pessoa. A interface não precisa se vender, não precisa onboarding, não precisa impressionar visitantes. Precisa estar lá quando Ryan voltar da outra aba e precisa comunicar estado em meio segundo. Essa premissa muda tudo: cada decisão que serve "usuário genérico" é uma decisão errada aqui.

A referência visual descrita — globo cortado pelo enquadramento, bloco lime, tipografia monoespaçada enorme, fundo carvão com grade — tem uma qualidade específica que não é o estilo: é a **disposição a ocupar espaço**. Títulos que não cabem inteiros. Um globo que transborda a borda. Nada pede licença para existir. Essa é a qualidade a transportar, não a paleta.

---

## Sistema de cor

**Fundo:** `#1a1a1a` — carvão com leve calor, não preto puro. Preto puro achata; `#1a1a1a` tem espessura.

**Grade:** linhas de `1px` em `#2a2a2a`, espaçadas a cada `32px`. Visível apenas em fundos vazios — painéis com conteúdo denso a suprimem. A grade não é decoração: é a evidência de que há uma estrutura debaixo.

**Verde-lima elétrico:** `#c8f135` — usado em **exatamente três papéis**: (1) o indicador de estado ativo do destino selecionado; (2) o status de aprovação quando aprovado; (3) o indicador de etapa em execução no Plano. Em nenhum outro lugar. Se aparecer em um quarto lugar, perdeu o significado.

**Texto primário:** `#f0ede6` — creme levemente amarelado, não branco. Contra `#1a1a1a` tem contraste suficiente sem a tensão de branco puro.

**Texto secundário / metadado:** `#787878` — cinza médio, claramente subordinado.

**Acento de alerta / erro:** `#ff6b35` — laranja queimado, reservado para estado de erro, rejeição, interrupção. Não aparece em estado neutro.

**Nunca:** gradientes, sombras de caixa decorativas, glassmorphism, blur de fundo.

---

## Tipografia

**Família única:** `JetBrains Mono` ou `IBM Plex Mono` — monoespaçada, com personalidade, disponível como fonte do sistema em muitos ambientes. Se nenhuma estiver disponível: `Courier New` como fallback honesto, não envergonhado.

**Escala hierárquica (não negociável):**

- **Título de destino / título de etapa:** `2.4rem`, peso `700`, uppercase, letter-spacing `0.08em`. Ocupa espaço. Não cabe em uma linha em mobile — isso é intencional.
- **Corpo de conversa / corpo de resultado:** `1rem`, peso `400`, line-height `1.7`. Legível, não comprimido.
- **Metadado / badge / status:** `0.75rem`, peso `400`, uppercase, letter-spacing `0.12em`, cor secundária.
- **Input de chat:** `1rem`, peso `400`, mesmo tamanho do corpo — Ryan e Apollo falam na mesma escala.

A tipografia carrega a voz antes do ornamento (Vignelli, por postura): o Apollo não tem ícones decorativos, não tem emojis de sistema, não tem ilustrações de estado vazio. O vazio é texto em tamanho certo na cor certa.

---

## O globo pixel art

O globo não é logotipo. Não é mascote. É **âncora de orientação** (Mijksenaar/PANYNJ: o farol visual que conecta pessoas a destinos).

**Composição:** O globo aparece **uma única vez** — no cabeçalho global, cortado pela borda superior e lateral direita, com aproximadamente `160px` de diâmetro visível de um globo que seria `240px` completo. A metáfora é literal: o Apollo opera no mundo, mas o enquadramento é a janela de trabalho de Ryan.

**Renderização:** Pixel art genuína — cada "pixel" do globo tem `4px × 4px`, grade visível entre blocos. Paleta restrita: azul oceano `#2d6a9f`, verde continente `#4a8c5c`, creme terra `#d4c89a`, fundo espacial transparente. Nenhum anti-aliasing. A qualidade pixel art não é nostalgia — é uma escolha de não fingir que o Apollo é uma coisa orgânica.

**O globo não se repete dentro dos painéis.** Não aparece como ícone de seção, não aparece em loading states, não aparece no rodapé. Uma vez, no cabeçalho, cortado. Isso é tudo.

---

## Estrutura global

```
┌─────────────────────────────────────────────┐
│  [GLOBO cortado, canto sup-dir]             │
│  APOLLO          [projeto ativo]  [status]  │
│─────────────────────────────────────────────│
│  CHAT  |  PLANO  |  RESULTADO  |  MAIS…     │  ← barra de destinos
│─────────────────────────────────────────────│
│                                             │
│           painel ativo                      │
│                                             │
└─────────────────────────────────────────────┘
```

**Barra de destinos:** quatro botões em linha horizontal, largura igual, sem ícones. O destino ativo tem o rótulo na cor lime `#c8f135` e uma barra de `2px` lime sob o texto — não uma aba preenchida. Os outros: cor secundária `#787878`. Hover: cor primária `#f0ede6`. Sem transições de mais de `150ms`.

**Cabeçalho:** altura fixa `56px`. À esquerda: "APOLLO" em título grande + nome do projeto ativo em metadado. À direita: `#status` em metadado. O globo pixel art se posiciona no canto superior direito, parcialmente sobreposto ao cabeçalho, com `z-index` abaixo do texto.

---

## Destino: Chat

**Assinatura espacial:** fluxo vertical contínuo. Não há "caixas de mensagem" com bordas arredondadas. As falas de Ryan e as respostas do Apollo se distinguem por **indentação e cor**, não por balões.

- Fala de Ryan: alinhada à direita, cor primária `#f0ede6`, sem prefixo.
- Resposta do Apollo: alinhada à esquerda, `padding-left: 1.5rem`, cor primária, precedida por `> ` em lime antes do primeiro parágrafo — um único caractere de marcação, não um avatar.
- Entre turnos: `margin-bottom: 1.5rem`. Sem separador visual.

**Input:** `textarea#chatInput` em largura total, altura mínima `56px`, fundo `#242424`, borda `1px solid #333`, sem borda-radius. Quando focado: borda lime. `button#sendChat`: texto "ENVIAR", uppercase, sem ícone, fundo lime, texto carvão — o único botão com fundo preenchido no Chat.

**Voz:** `button#voice` ao lado do input, texto "MIC", fundo transparente, borda `1px solid #333`. Quando ativo: borda lime, texto lime. Sem ícone de microfone.

---

## Destino: Plano

**Assinatura espacial:** progressão linear explícita. O Plano é uma lista ordenada com posição sempre visível.

**`#stepPosition`:** número da etapa atual sobre total — `"03 / 07"` — em tipografia `2.4rem` peso `700`, canto superior direito do painel. Esta é a informação de orientação primária. Ryan volta da outra aba e vê imediatamente onde está.

**`#planTitle`:** título do plano em `1.6rem` uppercase abaixo do cabeçalho. `#planBadge` ao lado: badge em texto metadado, sem cor especial — só informa.

**`#planGoal`:** parágrafo de objetivo em corpo normal, `color: #787878`. Não compete com o título da etapa.

**`#stepTitle`:** título da etapa ativa em `1.6rem`, peso `700`. Abaixo: `#stepDetails` em corpo normal.

**`#approvalStatus`:** exibido como bloco horizontal de largura total, `padding: 0.75rem 1rem`. Estados:
- Aguardando aprovação: fundo `#2a2a2a`, texto metadado "AGUARDANDO APROVAÇÃO".
- Aprovado: fundo `#c8f135`, texto carvão `#1a1a1a`, peso `700` — "APROVADO". Este é o único estado em que o lime preenche um bloco inteiro. Legível em atenção dividida.
- Rejeitado: fundo `#ff6b35`, texto carvão — "REJEITADO".

**`button#approve` e `button#run`:** botões de largura total, empilhados verticalmente. `#approve`: borda lime, texto lime, fundo transparente. `#run`: fundo lime, texto carvão — ação primária.

**`ol#steps`:** lista de etapas compacta, visível no painel como contexto. Etapa ativa: highlight lime à esquerda (`border-left: 3px solid #c8f135`). Etapas concluídas: texto metadado. Etapas futuras: texto metadado mais claro.

**O que excluir:** barras de progresso decorativas, animações de "loading" com spinner, estados de celebração ao concluir etapa. O som ao terminar etapa (funcional, já implementado) substitui a animação — audível sem sequestrar a tela.

---

## Destino: Resultado

**Assinatura espacial:** documento. Não é uma tela de sucesso. É uma entrega.

**`#resultTitle`:** título em `2.4rem` uppercase, peso `700`. Abaixo: `#resultHint` em metadado.

**`div#results`:** largura total, sem colunas, sem cards. Cada resultado é um bloco de texto com título em `1rem` uppercase lime e corpo em texto primário. Entre resultados: linha `1px solid #2a2a2a`. Sem bordas de card, sem sombra.

**ZIP entregue:** quando há ZIP de site para entregar, aparece como bloco destacado — fundo `#242424`, borda `1px solid #c8f135`, texto "DOWNLOAD ZIP" em lime uppercase. Não é um botão estilizado: é um bloco de texto clicável.

**`button#continuePlan`:** no rodapé do painel, borda cinza, texto cinza — disponível mas não urgente.

---

## Destino: Mais…

**`button#tab-more` e `section#panel-more`:** este destino é o bastidor. Configurações, histórico, chave de API, rotas, modelos.

**Assinatura espacial:** formulário técnico. Sem tentativa de tornar bonito o que é funcional. Labels em metadado uppercase, inputs em fundo `#242424`, sem borda-radius. Grupos separados por título de seção em `1rem` uppercase com `border-bottom: 1px solid #2a2a2a`.

**`#keyStatus`, `#voiceStatus`, `p#voiceNotice`:** textos de status em metadado. Nenhum ícone de status (✓ ✗) — só texto: "CONFIGURADO", "AUSENTE", "INDISPONÍVEL".

---

## Visualização circular de voz

`canvas#voiceWave` renderiza um círculo real — não uma onda horizontal.

**Composição:** círculo centrado no canvas, raio base `40px`. Quando há áudio: raio oscila entre `36px` e `68px` proporcionalmente à amplitude, com `~60` pontos na circunferência, cada ponto deslocado radialmente pelo valor da frequência correspondente. Resultado: um círculo que respira e distorce, não uma onda retilínea.

**Cor:** traço lime `#c8f135`, espessura `1.5px`, fundo canvas transparente (o carvão do fundo aparece). Quando silencioso: círculo perfeito em cor secundária `#444`. Quando processando (Apollo respondendo): círculo em cor primária `#f0ede6` com oscilação lenta e regular — sinaliza "processando", não "ouvindo".

**`button#autoListen`:** texto "ESCUTA AUTO", uppercase. Ativo: texto lime, borda lime. Inativo: texto cinza, borda cinza. Sem ícone.

**`#captureStatus`:** linha de metadado acima do canvas — "OUVINDO", "PROCESSANDO", "PARADO". Não usa ícones.

---

## Som e permissão

O som ao terminar etapa é **um único tom curto** — não uma notificação de sistema, não uma melodia. Duração máxima `400ms`, frequência em torno de `880Hz`, envelope com attack rápido e decay longo. Gerado por Web Audio API (já presente no `app.js`).

A permissão antes do resumo falado aparece como bloco no painel Chat — texto "O Apollo quer falar o resumo. Permitir?" com dois botões inline: "PERMITIR" (borda lime, texto lime) e "IGNORAR" (texto cinza). Não é um modal. Não bloqueia a interface. Se Ryan não responder, nada acontece.

**Rejeição da voz Windows:** o seletor `select#ttsEngine` em Mais… jamais apresenta a opção de voz nativa do Windows como padrão. Se a única opção disponível no ambiente for a voz nativa Windows, o campo mostra "INDISPONÍVEL — configure API de voz" em metadado laranja. Não usa `window.speechSynthesis` com vozes do sistema sem verificação explícita.

---

## O que excluir explicitamente

- **Gradientes em qualquer superfície.** O carvão é plano.
- **Bordas arredondadas acima de `2px`.** O Apollo é angular.
- **Ícones SVG decorativos.** Texto resolve tudo nesta interface.
- **Animações de entrada de painel** (slide, fade de mais de `100ms`). O painel aparece; não performa.
- **Cores de estado além das definidas.** Não inventar azul para "informação", roxo para "especial".
- **O globo em qualquer lugar que não seja o cabeçalho.**
- **Celebrações de conclusão de etapa.** O som é suficiente.
- **Tooltips.** Se um elemento precisa de tooltip para ser compreendido, o problema é o rótulo, não a ausência de tooltip.
- **Scrollbar customizada.** A scrollbar padrão do sistema é a correta aqui.

---

## Relação explícita com a pesquisa

| Decisão | Fundamento |
|---|---|
| Tipografia única, escala forte, ritmo sobre ornamento | Vignelli: contenção tipográfica como voz |
| Quatro destinos com assinatura espacial distinta | Mijksenaar/PANYNJ: clareza funcional + senso de lugar |
| Globo como âncora única, não textura | Mijksenaar: farol visual, não papel de parede |
| `#stepPosition` em `2.4rem` legível ao retornar | NASA HIDH: orientação como requisito de arquitetura |
| `#approvalStatus` em bloco de largura total com cor de preenchimento | NASA HIDH: estado crítico legível em atenção dividida |
| Resultado como documento, ZIP como artefato | Bauhaus por analogia: entrega é documento, não tela |
| Som curto, permissão inline sem modal | NASA HIDH: sinalização suficiente, sem protocolo de cockpit |

---

Esta direção é implementável diretamente: cada elemento tem cor, tipografia, tamanho e comportamento definidos. O que a implementação precisará inventar são detalhes de espaçamento entre componentes — tudo o que define identidade já está aqui.