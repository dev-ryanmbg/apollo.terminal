# Alethe — segurança, relatos e hipótese de fraude

Data: 2026-11-06. Escopo autorizado: investigação com ênfase em problemas, segurança e relatos. Método: buscas públicas, documentação e inspeção estática pontual. Sem baixar instalador, executar código, enviar arquivos a scanners ou contatar terceiros.

## Parecer

Não foi encontrada evidência verificável suficiente para afirmar golpe, roubo intencional de credenciais ou malware confirmado. Também não foi estabelecida segurança do produto. Recomendo não o instalar agora no computador principal com contas e projetos pessoais. A decisão decorre dos riscos e incertezas abaixo, não da aparência da página.

## Evidências e interpretação

| Achado | Evidência e estado | Consequência |
|---|---|---|
| Executável Windows sem assinatura e instrução de exclusão no Defender | [README](https://github.com/Kc1t/alethe-agents#install) informa detecção possível e sugere restaurar/excluir diretório | Não adotar essa orientação como padrão; a explicação do autor não valida o artefato |
| Proxy opcional pode ficar exposto na LAN | [Issue #362](https://github.com/Kc1t/alethe-agents/issues/362), aberta na consulta, relata v1.7.0 e bind em 0.0.0.0 | Relato reproduzível apresentado por usuário, não teste nosso; não ativar esse componente com dados reais sem validação |
| Plugins sem isolamento forte | [PLUGINS.md](https://raw.githubusercontent.com/Kc1t/alethe-agents/main/docs/PLUGINS.md), seção Capabilities, admite que a barreira é consultiva e plugins executam na mesma webview | Manifesto de permissões não equivale a sandbox; confiar em plugin implica confiar em seu código |
| Credenciais e dados sensíveis | [PRIVACY.md](https://raw.githubusercontent.com/Kc1t/alethe-agents/main/docs/PRIVACY.md) diferencia segredos migrados para keyring, chaves ainda em texto claro e arquivos de terceiros acessados | Avaliar exposição por recurso e versão; não presumir criptografia integral |
| Acesso remoto opcional sem TLS | Mesmo guia documenta HTTP/WebSocket na LAN | Pareamento não resolve ausência de criptografia; recurso vem desligado e exige opt-in |
| Perda de dados ao trocar perfil | [Issue #345](https://github.com/Kc1t/alethe-agents/issues/345), fechada como concluída em 31/10/2026 | Houve resposta ao problema; inclusão da correção no instalador não foi confirmada |

## Divergência de documentação

[SECURITY.md](https://raw.githubusercontent.com/Kc1t/alethe-agents/main/SECURITY.md) afirma csp:null. Porém [tauri.conf.json consultado](https://raw.githubusercontent.com/Kc1t/alethe-agents/main/src-tauri/tauri.conf.json) contém uma CSP de produção e devCsp:null. Não afirmar ausência atual de CSP. Não foi recuperada a configuração do tag v1.7.0 para comparação. Esta inspeção não prova que a política basta para conter conteúdo hostil.

A [página comercial](https://alethe-agents.kc1t.com/) ainda exibe v1.2, enquanto a [página de releases](https://github.com/Kc1t/alethe-agents/releases) consultada marca v1.7.0. Sua promessa de continuidade deve ser interpretada à luz dos bugs registrados. Divergência de versão e linguagem promocional sustentam cautela, não intenção fraudulenta.

## Independência dos relatos

Foram buscadas críticas, malware, trojans, fraude, discussões no Reddit e o hash publicado do instalador Windows. Não foi localizado um laudo independente verificável do binário nem um conjunto robusto de avaliações independentes. Muitos resultados eram espelhos do README ou catálogos automáticos. Resultados de outras empresas chamadas Alethe foram excluídos por identidade incompatível.

Dois catálogos automáticos apareceram com pareceres diferentes; sem versão verificável e metodologia validada nesta etapa, não foram tratados como auditoria. A busca pelo hash retornou a própria distribuição, sem estabelecer um resultado antivírus. Não afirmar que o instalador passou ou falhou em análise independente.

Vídeo destacado pelo produto é demonstração escolhida pelo produto. Não é, por si, teste independente, prova de remuneração ou evidência de fraude. Design visual e tamanho da comunidade têm baixo valor para decidir segurança. Bugs reproduzíveis, limites de isolamento e integridade do artefato têm valor maior.

## Limites e mudança no parecer

O parecer anterior de candidato a piloto permanece apenas para avaliação isolada, sem segredos reais. Não há endosso para uso principal. A skill independente também não herda segurança por ter menos interface: precisa de revisão própria e não foi considerada automaticamente segura.

As páginas foram consultadas em momentos de atualização diferentes. Relatos não são provas de exploração efetiva. Não foi testada exploração, correspondência entre fonte e binário, dependências completas, assinatura Authenticode ou tráfego real.

Tentativas sem resultado: recuperação dos relatos #306, #308 e #309 e do tag de configuração; busca de análise independente por hash. Não ampliado para executar ou enviar o binário a terceiros.

## Aprendizado candidato, ainda não incorporado

Destino: proposta apollo-pesquisar, avaliação de ferramentas. Critério: avaliar documentação, código atual, release e binário separadamente; identificar relato, correção e versão que a contém. Acerto: uma conclusão inicial sobre CSP foi evitada ao consultar configuração. Brecha: sem artefato examinado e sem teste local. Aprovação necessária antes de promover o critério à skill; este arquivo é registro factual da investigação.
