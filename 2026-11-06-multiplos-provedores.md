# Apollo e execução entre provedores

Data: 2026-11-06. Estado: esclarecimento e hipótese de arquitetura, sem configuração aplicada.

## Correção de objetivo

Ryan destacou que usar Claude e Gemini deve ser avaliado pelo ganho de qualidade e adequação à tarefa, além da economia. Considera Claude especialmente adequado ao seu trabalho criativo e Gemini à pesquisa. Essas preferências orientam um piloto; não são prova de superioridade universal nem de menor cobrança por resultado.

O parecer anterior concentrou-se demais em redução de custo e gestão de sessões. A investigação passa a considerar também o acesso a capacidades complementares. Isso não obriga manter o modelo deste chat como coordenador de toda tarefa.

## Capacidade verificada nesta sessão

Não foi encontrada ferramenta direta para chamar os modelos Claude ou Gemini. A consulta Get-Command encontrou `codex` no PATH, mas não `claude`, `gemini` ou `alethe`. Isso não comprova ausência desses programas fora do PATH nem informa o estado de assinatura/autenticação de Ryan. Nenhuma credencial foi lida ou testada.

Uma integração futura pode usar CLIs ou APIs configuradas. [Gemini CLI](https://github.com/google-gemini/gemini-cli) é uma opção oficial de interface por terminal; [Alethe Orchestrate](https://github.com/Kc1t/alethe-orchestrate-skill) é candidato a coordenação de CLIs. Não foi testado adaptador Gemini nesta etapa. Subagentes nativos disponíveis aqui não fornecem seleção direta de Claude ou Gemini.

## Hipótese para avaliar

Apollo deve ser a identidade e os acordos do sistema; o executor ou coordenador pode variar. Avaliar Claude em criação, Gemini em pesquisa e Codex em implementação, com tarefas representativas e critérios de Ryan. Esses papéis são candidatos, não restrições permanentes. Contabilizar também o custo de handoff e evitar que um segundo modelo repita integralmente um trabalho já aceito.

Antes de implementação, identificar contas, planos, limites e acesso por CLI/API; assinatura web não deve ser presumida equivalente a autorização ou créditos de API. Nenhum programa instalado, pesquisa fora das fontes pertinentes, worker executado ou aprendizado incorporado a skill.
