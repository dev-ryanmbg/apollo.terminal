# Pesquisa — orquestração para Apollo

Data de consulta: 2026-11-06. Escopo: materiais citados, repositórios públicos e documentação relacionada. Somente leitura; nenhum código de terceiros executado ou instalado.

## Identificação dos nomes

Foi identificado [Kc1t/alethe-orchestrate-skill](https://github.com/Kc1t/alethe-orchestrate-skill). Após a primeira pesquisa, Ryan esclareceu o nome “Claude corebooks” com o link de [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks). A identificação está resolvida: é uma coleção de exemplos técnicos, não um orquestrador pronto. Ver [complemento de pesquisa](2026-11-06-cookbooks-e-precisao.md).

[Claude Code Workflow](https://github.com/catlog22/Claude-Code-Workflow) apareceu nas buscas, mas não era o projeto pretendido. [Claude Squad](https://github.com/smtg-ai/claude-squad) está na imagem fornecida e é outro produto.

## Comparação

| Opção | Capacidade documentada | Avaliação para Apollo |
|---|---|---|
| Especializações no mesmo contexto | Reutilizar procedimentos sem iniciar outro processo | Base inicial: pouco custo de integração e retomada simples |
| Subagentes nativos do Codex | Configurar modelos e esforço, com herança quando não especificados | Avaliar antes de introduzir infraestrutura externa; acesso depende do ambiente |
| Alethe | Coordenar CLIs de agentes, playbooks, resultados resumidos e relatórios | Candidato a piloto de economia, sem ativação passiva inicial |
| Claude Cookbooks | Exemplos de subagentes, cache e otimização de custo | Referência de arquitetura e ensino; adaptar apenas receitas pertinentes após revisão |
| Claude Squad | Gerenciar sessões em tmux e separar alterações com Git worktrees | Mais pertinente à gestão de sessões paralelas; não comprova economia de créditos |
| Claude Code Workflow | Framework JSON para fluxos e múltiplas CLIs | Parece uma adoção mais ampla; priorizar uma base menor no cenário atual |

Fontes primárias: [subagentes do Codex](https://learn.chatgpt.com/docs/agent-configuration/subagents), [Alethe](https://github.com/Kc1t/alethe-orchestrate-skill), [Claude Squad](https://github.com/smtg-ai/claude-squad), [CCW](https://github.com/catlog22/Claude-Code-Workflow). As avaliações de adequação são nossas, não benchmarks independentes.

## Alethe — triagem técnica limitada

A skill publicada traz instruções de delegação proativa e modo passivo. Isso conflita com o padrão de especializações e aprovação de novos gastos acordado com Ryan. Seus limites locais devem prevalecer sobre qualquer skill importada. [SKILL.md examinado, versão declarada 24](https://raw.githubusercontent.com/Kc1t/alethe-orchestrate-skill/main/skills/alethe/SKILL.md).

O arquivo [hooks.json](https://raw.githubusercontent.com/Kc1t/alethe-orchestrate-skill/main/hooks/hooks.json) consultado registra comando no evento UserPromptSubmit. A documentação mais ampla descreve observação de históricos locais. Não presumir que todas as variantes de instalação tenham exatamente os mesmos hooks.

No [runner Python](https://raw.githubusercontent.com/Kc1t/alethe-orchestrate-skill/main/skills/alethe/scripts/orchestrate.py), foram examinados imports, criação de processos e trechos de validação: chamada de subprocessos com argumentos em lista e `shell=False`; tratamento de processos no Windows; rejeição de algumas configurações que desabilitam aprovações ou ampliam acesso. São sinais positivos de implementação, não uma auditoria completa. Executar CLIs continua podendo enviar dados aos provedores que essas CLIs usam.

A página pública mostrou 123 estrelas, 14 forks e 30 commits na consulta: sinal de alguma adoção, insuficiente para validar segurança ou economia. A página de issues acessada não forneceu evidência bastante de satisfação dos usuários, problemas resolvidos ou qualidade de suporte. Não atribuir nota positiva de feedback com base nessa ausência.

Não foi possível obter metadados via API GitHub pelo shell devido a falha de resolução de rede. Algumas páginas de histórico e testes também não foram recuperadas pelo navegador de pesquisa. Não foram confirmados SHA fixo, resultados de testes, dependências completas ou integridade de uma versão instalável. Nenhuma conclusão de ausência de trojans é sustentada por esta triagem.

## Condições para um piloto

1. Confirmar CLIs, autenticação, modelos acessíveis e modo de cobrança, sem exibir credenciais.
2. Fixar uma revisão e examinar os arquivos executáveis e de instalação correspondentes, dependências e permissões.
3. Começar sem hooks, modo passivo ou habilitação global; uma tarefa autorizada e poucos workers.
4. Usar cópia descartável ou isolamento adequado. Restringir os arquivos entregues ao worker.
5. Definir orçamento, tempo máximo, tentativas e critérios de parada antes de executar.
6. Comparar tarefas equivalentes: execução direta, delegação simples e Alethe.
7. Registrar custo informado, tokens reportados, tempo, qualidade aceita, correções e resultados descartados. Ausência de métrica fica como desconhecida, nunca como zero.
8. Só recomendar adoção se houver benefício consistente e custo de manutenção aceitável.

O custo de orquestração inclui planejamento, contexto inicial de cada worker, execução, revisão e retrabalho. Tarefas volumosas e repetíveis são candidatas; tarefas pequenas ou fortemente interdependentes podem perder eficiência. Assinatura não equivale a uso ilimitado nem a uma conta monetária por chamada. Não usar estimativa de preço de tabela como gasto efetivamente cobrado.

## Referências de arquitetura pessoal

[Daniel Miessler descreve Kai e PAI/LifeOS](https://danielmiessler.com/blog/personal-ai-infrastructure) separando intenção pessoal, contexto e verificação. [AI Dev Tasks](https://github.com/snarktank/ai-dev-tasks) usa requisitos e tarefas em Markdown. São referências de estrutura, não dependências recomendadas para instalar.

O [skill-creator público da Anthropic](https://github.com/anthropics/skills/tree/main/skills/skill-creator) foi localizado como referência candidata; seu conteúdo não recebeu revisão suficiente nesta etapa. A skill-creator local já disponível tem instruções de descoberta econômica e referências sob demanda. Não precisamos instalar uma segunda ferramenta para redigir propostas.

## Parecer

Aplicar primeiro a base de memória e os procedimentos aprovados. Manter Alethe como candidato promissor com aprovação condicionada a revisão e piloto. Não instalar CCW ou Claude Squad apenas por aparecerem no mesmo tema. Usar Claude Cookbooks como referência de desenho e avaliação, sem executar notebooks automaticamente.
