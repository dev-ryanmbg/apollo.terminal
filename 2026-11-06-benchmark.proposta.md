# Piloto de comparação — qualidade e consumo

Data: 2026-11-06. Estado: proposta, sem chamadas executadas. Não autoriza gasto, instalação ou acesso a contas.

## Pergunta

Qual modelo produz uma entrega aceita por Ryan com menor custo total em tarefas representativas? Avaliar modelos individualmente antes de acrescentar orquestração. Não misturar o efeito de trocar modelo com o efeito de distribuir tarefas ou de alterar memória.

## Primeira rodada proposta

Selecionar duas tarefas pequenas: uma criativa e outra de pesquisa. Para cada tarefa, comparar os dois candidatos mais pertinentes conforme os acessos existentes. Total inicial: quatro execuções. Rodar cada modelo em contexto novo, com o mesmo briefing, materiais, limites, formato e critério de conclusão. Registrar modelo e configuração exatos.

Criativa: roteiro curto e direção visual para uma aula de programação, com público e duração definidos. Pesquisa: questão técnica delimitada, com fontes autorizadas iguais e exigência de referências que sustentem as afirmações. Na pesquisa, registrar diferenças de ferramentas, fontes e acesso à web: se forem diferentes, comparar o sistema completo e não atribuir todo resultado ao modelo.

## Métricas

- Aceitação: entrega aceita, precisa de revisão ou rejeitada; Ryan avalia sem rótulo do modelo quando possível.
- Rubrica criativa: atendimento ao briefing, clareza, originalidade útil e viabilidade visual.
- Rubrica de pesquisa: correção de afirmações verificáveis, adequação e suporte das fontes, cobertura da pergunta e utilidade.
- Uso: tokens de entrada, saída e cache quando expostos; custo informado ou estimativa identificada separadamente; cota quando mensurável.
- Tempo: duração da execução e tempo de revisão de Ryan, separados.
- Retrabalho: correções necessárias, gravidade e esforço; não chamar custo inicial de custo final se a entrega exigir revisão.

Não comparar tokens isoladamente entre provedores como se fossem a mesma unidade de cobrança. Ausência de métrica é desconhecido, não zero. Não inferir custo pelo tamanho da resposta nem converter assinatura em cobrança por execução sem base verificável. Registrar a origem de cada medida.

## Limites e encerramento

Definir acesso, orçamento e limites de cada execução com Ryan antes de começar. Sem retry ou fallback pago automático. Primeira rodada sem instalação de Alethe e sem workers. Encerrar após as quatro execuções; repetir apenas se a diferença observada puder alterar a decisão e Ryan aprovar a ampliação. Uma execução por combinação é triagem, não benchmark estatisticamente conclusivo.

Depois de escolher candidatos adequados, comparar execução direta e fluxo coordenado na mesma tarefa. Incluir coordenador, executores, verificação e correções no custo. Avaliação da memória deve ter rodada separada, comparando o mesmo modelo com e sem contexto recuperado.

## Dependências pendentes

Ryan precisa informar quais acessos possui: Claude, Gemini e Codex; uso gratuito, assinatura, CLI ou API. Não solicitar chaves em mensagens. Confirmar métricas efetivamente expostas e escolher tarefas antes de executar.

## Registro

Proposta registrada no índice. Não foi realizado teste, medição ou pesquisa externa nesta etapa. Nenhum aprendizado foi incorporado a skill.
