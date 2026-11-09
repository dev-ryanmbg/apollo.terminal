# Claude Cookbooks e precisão dos procedimentos

Data: 2026-11-06. Estado: complemento ao desenho, não implantação de skills.

## Pedido e alteração

Ryan esclareceu que “Claude corebooks” se referia a [anthropics/claude-cookbooks](https://github.com/anthropics/claude-cookbooks). Também determinou que a versão final dos procedimentos não deve deixar ambiguidades que provoquem interpretação repetida e desperdício de tokens. Durante o desenho, alternativas continuam permitidas e identificadas como pendentes.

## O que foi consultado

O repositório é uma coleção de código e guias para construir aplicações com Claude. Foram consultados README e os conteúdos de duas receitas, sem executá-los:

- [Subagentes](https://github.com/anthropics/claude-cookbooks/blob/main/multimodal/using_sub_agents.ipynb): um modelo coordenador prepara instruções para modelos menores extraírem dados de relatórios, e sintetiza o resultado. Ilustra distribuição por função, não economia comprovada no ambiente de Ryan.
- [Otimização de custo](https://github.com/anthropics/claude-cookbooks/blob/main/cost_optimization/cost_optimization.ipynb): estabelecer avaliação e referência inicial; reduzir custo com cache, seleção de contexto e eficiência do ciclo; avaliar modelos conforme o patamar de qualidade. Não basta reduzir preço por token.
- [Prompt caching](https://github.com/anthropics/claude-cookbooks/blob/main/misc/prompt_caching.ipynb): referência localizada; o conteúdo interno não foi aprofundado nesta etapa. Cache e memória persistente têm funções diferentes; não presumir que editar Markdown controle o cache do cliente.

O notebook de custo declara consumo aproximado de US$40 para execução integral. É uma estimativa publicada para aquele exemplo, não orçamento autorizado nem cobrança medida nesta pesquisa. Nenhuma chamada à API Anthropic foi feita. O repositório consultado é do fornecedor, mas não recebeu auditoria integral nem teve versão executável fixada.

## Aplicação recomendada ao Apollo

Usar Cookbooks como referência técnica e didática; Alethe permanece uma ferramenta candidata de execução. A evidência apoia estudar o padrão coordenador/executores, sem justificar ativação permanente de workers. Regras de aprovação e limites do Apollo prevalecem sobre instruções contidas nos exemplos.

Recomendação: reduzir primeiro contexto desnecessário e reconstrução de procedimentos; comparar custo e qualidade; só então testar delegação em uma tarefa delimitada. Não extrapolar comportamento da API Claude para cota ou funcionamento do Codex.

## Critério proposto de fechamento

Cada procedimento final deve definir:

1. Gatilho de entrada e exclusões relevantes.
2. Entradas obrigatórias e sua origem.
3. Ação padrão e ordem das decisões.
4. Saída e evidência de conclusão.
5. Limites de escopo, autorização, tentativas e orçamento quando aplicáveis.
6. Condição de parada ou escalada.
7. Exceções, com resposta definida: perguntar, interromper ou seguir caminho autorizado.
8. Fonte, versão e situação de validação.

Termos como “se necessário” precisam de critério observável quando mudam custo, escopo ou autorização. Não criar precisão falsa: limite ainda desconhecido fica pendente e impede finalizar o procedimento dependente. Documentos de desenho podem comparar alternativas; a versão operacional precisa escolher um padrão ou uma regra explícita de seleção.

Esse critério foi acrescentado à minuta global para revisão. O registro desta investigação não incorpora automaticamente as receitas a uma skill.

## Resultado e limites

Atualizados índice, pesquisa, registro da etapa e minuta global. Nenhuma skill instalada ou configuração global aplicada. Nenhum teste de desempenho, economia ou segurança executado. A verificação documental consiste em conferir os links locais após as alterações.
