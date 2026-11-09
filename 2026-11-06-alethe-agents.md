# Alethe Agents — investigação documental

Data: 2026-11-06. Origem: link fornecido por Ryan. Escopo: repositório, documentação, releases e relatos públicos do próprio projeto. Nenhum executável baixado ou executado.

Complemento posterior: [investigação com ênfase em segurança e relatos](2026-11-06-alethe-seguranca.md). Para decisão de instalação, usar o parecer mais cauteloso desse complemento; esta página preserva o levantamento inicial.

## Identificação e relação com a pesquisa anterior

[Alethe Agents](https://github.com/Kc1t/alethe-agents) é o aplicativo visual para gerenciar agentes e terminais. A [skill de orquestração](https://github.com/Kc1t/alethe-orchestrate-skill) funciona separadamente. Apollo continua sendo nossa identidade e conjunto de acordos; adotar uma interface não substitui sua memória ou procedimentos.

## Evidências complementares

- A [página de releases](https://github.com/Kc1t/alethe-agents/releases) consultada marca v1.7.0 como latest, com publicação em 20/09/2026 e referência curta 80e44a3. O estado do ramo main pode ser posterior ao instalador.
- O [guia de privacidade](https://github.com/Kc1t/alethe-agents/blob/main/docs/PRIVACY.md) explicita armazenamento local, fluxos de rede, credenciais, logs e limites de remoção de dados. Foi encontrada divergência entre descrições do README e esse guia sobre sincronização e tratamento de credenciais: confirmar comportamento na versão escolhida, não combinar afirmações de versões diferentes.
- A [política de segurança](https://github.com/Kc1t/alethe-agents/blob/main/SECURITY.md) não oferece janela fixa de suporte para versões antigas.
- O [relato #345](https://github.com/Kc1t/alethe-agents/issues/345) descreveu sobrescrita de dados de plugin ao trocar perfis; está fechado como concluído, associado a 889cece em 31/10/2026. Não foi confirmada inclusão dessa correção no instalador publicado.
- A listagem de issues também mostrou o [relato #314](https://github.com/Kc1t/alethe-agents/issues/314), sobre divergência de indicadores de cota. O conteúdo/estado não foi recuperado de forma suficiente para afirmar correção ou persistência. A página do #306 não foi recuperada. A listagem estava desatualizada em relação ao estado individual do #345: não usar a listagem sozinha como diagnóstico atual.

## Avaliação para Apollo

O ganho potencial é organização de sessões e observação de delegações. O aplicativo, por si só, não demonstra redução de créditos. A economia precisa ser medida em tarefas equivalentes, com custo do coordenador, workers, revisão e correções incluídos. Seu valor cresce se Ryan efetivamente operar vários agentes ou provedores; para testar um procedimento de delegação, avaliar primeiro se a skill independente é suficiente.

Antes de adotar: escolher versão exata, revisar alterações relevantes e assinatura do artefato, verificar correções incluídas, preservar cópia dos arquivos de trabalho e manter o piloto isolado. Não tratar estrelas, checksum ou explicação do autor para alertas de antivírus como prova de ausência de malware. Não recomendar exclusões permanentes no antivírus como passo padrão.

## Limites, registro e próxima decisão

Esta pesquisa não é auditoria de código ou binário. Não houve medição de RAM, comparação de custo ou execução. Registrados os achados e atualizado o índice; sem mudanças em skills, AGENTS global, ferramentas ou contas.

Aprendizado candidato à futura skill de pesquisa: distinguir aplicativo de skill; separar documentação do ramo principal de comportamento da release; verificar estado individual e versão da correção de um bug. Acerto: consultar relatos e correções. Brecha: ausência de validação do artefato instalável. Incorporação à skill depende de autorização de Ryan.
