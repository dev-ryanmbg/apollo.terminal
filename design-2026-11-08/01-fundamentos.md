Found 13 web pages## Cinco fundamentos de design para o Apollo, com evidência e aplicação

A pesquisa priorizou fontes primárias e institucionais disponíveis nos resultados. O limite mais importante: não foi possível acessar diretamente os livros originais de Tufte, Norman ou Tschichold; o que se segue distingue explicitamente **princípio documentado**, **preferência interpretativa** e **inferência aplicada ao Apollo**.

---

### Fundamento 1 — Contraste não é intensidade: é limiar de percepção

**Evidência.** Estudo revisado por pares no arXiv (2024), baseado em dados psicofísicos de sensibilidade ao contraste, conclui que visualizações universalmente usáveis devem usar contraste de pelo menos **0,02** e evitar frequências espaciais acima de **8 ciclos por grau** para acomodar todas as idades; abaixo do limiar, parte da informação simplesmente não é vista pelo olho envelhecido . A WCAG AAA exige **7:1** para texto normal, contra 4,5:1 do nível AA [7][14].

**Tipo:** Princípio (evidência psicofísica e norma de acessibilidade).

**Aplicação ao Apollo.** O verde-lima elétrico sobre carvão deve ser reservado para **um único significado por tela** (ex.: estado ativo ou aprovação pendente), não como decoração. O contraste do texto deve ser medido contra o fundo carvão real, não contra uma intenção estética. Se o lime não atingir 7:1 sobre o carvão escolhido, ele não pode carregar texto; pode carregar apenas indicadores visuais com redundância textual.

---

### Fundamento 2 — Espaço vazio é estrutura, não ausência

**Evidência.** Tufte (1990), citado em tese institucional da UFPR, sustenta que o uso estratégico de espaços em branco **separa e destaca grupos de dados**, e que regiões comuns reduzem sobrecarga cognitiva ao permitir processamento mais rápido [1]. Em estudo sobre Tschichold no repositório da Universidade do Porto, o espaço em branco é descrito como agente de **hierarquia visual**, dando ênfase a alguns elementos em detrimento de outros [11].

**Tipo:** Princípio (documentado em literatura de design, via fontes secundárias acadêmicas).

**Aplicação ao Apollo.** O Apollo tem quatro destinos (Chat, Plano, Resultado, Mais). O erro comum seria preencher a tela com cards e bordas. O princípio sugere o oposto: **o vazio entre grupos é o que diz ao olho onde começa uma etapa e termina outra**. No Plano, a separação entre “etapa atual” e “etapas futuras” deve ser feita por espaço e escala, não por caixas adicionais. No Chat, a distinção entre mensagem do usuário e resposta do Apollo deve usar alinhamento e vazio, não balões decorados.

---

### Fundamento 3 — Wayfinding: orientação sem padronização cega

**Evidência.** Paul Mijksenaar, designer responsável pela sinalização de aeroportos como Schiphol e JFK, é citado em dissertação no DUMAS: seu sistema é elogiado pela orientação eficaz, mas criticado por **apagar a especificidade do lugar**, tornando aeroportos intercambiáveis e “não-lugares” [3]. Em projeto posterior para ciclovias holandesas, a mesma abordagem foi adaptada: mantiveram-se cor de fundo e tipografia, mas o texto passou a preto para **melhorar contraste e legibilidade**, e o formato foi ampliado para reconhecimento rápido em movimento [10].

**Tipo:** Princípio (wayfinding como disciplina) + inferência sobre limites da padronização.

**Aplicação ao Apollo.** Os quatro destinos não devem parecer quatro cópias do mesmo painel. Cada destino precisa de uma **assinatura espacial própria**: Chat é fluxo vertical contínuo; Plano é progressão linear com posição explícita; Resultado é entrega consolidada com hierarquia de leitura; Mais é configuração, não vitrine. A navegação entre eles deve ser previsível (mesma posição, mesmo rótulo), mas o conteúdo interno não deve ser homogeneizado.

---

### Fundamento 4 — Montagem editorial: a margem guia o olho antes do texto

**Evidência.** Tschichold, citado em dissertação no repositório da Universidade do Porto, afirma que “é preciso um espaço para que nosso olho alcance a linha a ler”; as margens não são sobra, são **orientação do olhar** [4]. O mesmo estudo observa que a verificação de uma boa composição se faz “diante do livro aberto”, ou seja, no contexto real de uso, não no arquivo isolado [4].

**Tipo:** Princípio (tipografia editorial clássica, via fonte acadêmica).

**Aplicação ao Apollo.** O Apollo é lido em uma aba enquanto Ryan trabalha em outra. A margem esquerda do Chat e do Plano deve ser estável e generosa o bastante para ancorar o olhar ao retornar. O `#stepPosition` e o `#planBadge` não são ornamentos: são **folio e título corrente** — dizem onde o leitor está sem exigir que ele releia tudo. A tipografia expressiva deve concentrar-se nos títulos de etapa e no estado de aprovação; o corpo do texto deve priorizar leitura rápida e retomada.

---

### Fundamento 5 — Controles de instrumento: informação vital não pode estar escondida

**Evidência.** O AIChE, em guia de fatores humanos para lideranças de linha de frente, relata o incidente de Buncefield: o display do tanque que transbordou estava **oculto atrás de uma pilha de outros displays**, e os operadores não tinham situação consciente do processo [5]. O mesmo documento associa alarmes mal projetados a incidentes em que trabalhadores os ignoraram por falta de significado confiável [5].

**Tipo:** Princípio (fatores humanos em controle de processos).

**Aplicação ao Apollo.** O estado de aprovação (`#approvalStatus`) e a etapa atual (`#stepPosition`) não podem competir com outros elementos por atenção. Eles são o equivalente ao nível do tanque: se não estiverem visíveis no momento da decisão, o sistema falha. O botão `#approve` deve estar espacialmente acoplado ao estado que ele altera. O som ao terminar etapa e a permissão antes de resumo falado são extensões desse princípio: **o sistema sinaliza sem sequestrar a atenção**, e a confirmação humana permanece explícita.

---

### Limites da pesquisa e distinções

- **Não acessei** os textos originais de Tufte, Norman, Tschichold ou Mijksenaar; as citações vêm de fontes acadêmicas que os discutem. Isso é suficiente para fundamentar decisões, mas não substitui a leitura primária se Ryan quiser verificação mais dura.
- **Não há evidência direta** nos resultados sobre “globo pixel art” ou “som ao terminar etapa” como fundamentos de design. São **preferências autorais** de Ryan, não princípios universais. Devem ser tratados como restrições do projeto, não como conclusões da pesquisa.
- **Inferência, não fato:** a ligação entre wayfinding e os quatro destinos do Apollo é analógica. Mijksenaar projeta para espaços físicos; o Apollo é uma interface de uma pessoa. A transferência é útil, mas não é identidade.
- **A busca não retornou** fontes primárias sobre “visualização circular real da voz” ou sobre som como feedback de etapa em interfaces conversacionais. Esses elementos permanecem como decisão de produto, sem base empírica coletada aqui.

**Entrega para a próxima etapa:** estes cinco fundamentos estão prontos para alimentar a direção autoral de Claude, com a distinção explícita entre o que é princípio documentado, preferência de Ryan e inferência de aplicação.