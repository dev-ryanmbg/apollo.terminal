# Alternativas ao Alethe — adequação ao Apollo

Data: 2026-11-06. Estado: pesquisa documental; sem instalação, autenticação, chamadas de modelos ou benchmark. Pedido: encontrar opções mais promissoras para uso de modelos complementares, mantendo atenção à segurança e Windows.

## Conclusão

Há caminhos viáveis para investigar antes de Alethe. Mais promissor significa melhor encaixe potencial e configuração examinável, não segurança comprovada. A classificação depende de distinguir acesso a modelos por API e coordenação de CLIs já autenticadas.

## OpenCode — primeiro candidato para perfis por modelo

As [instruções oficiais de agentes](https://opencode.ai/docs/agents/) documentam perfis Markdown com modelo, instruções e permissões próprios, execução de subagentes e controle de quais perfis o coordenador pode lançar. Isso corresponde ao desenho do Apollo com especializações, mantendo memória legível em arquivos.

A [documentação de provedores](https://docs.opencode.ai/docs/providers/) apresenta conexão Anthropic por API e alerta que plugins de uso da assinatura Claude Pro/Max são proibidos pelo fornecedor. Não recomendar esses plugins como economia. Há suporte ao ecossistema de provedores Google; o endpoint, modelo e forma de autenticação precisam ser definidos no piloto.

Limites: o agente Build documentado tem permissões amplas por padrão. Antes de usar dados reais, estabelecer regras restritivas, sem plugins externos ou servidor exposto. Não foi realizada auditoria de código nem validado instalador Windows. Usar um modelo Anthropic em OpenCode não equivale a usar a experiência completa do Claude Code.

## Maestro, de RunMaestro — candidato visual para CLIs

O [README examinado](https://raw.githubusercontent.com/RunMaestro/Maestro/main/README.md) descreve coordenação de Claude Code, Codex e OpenCode, tarefas em Markdown, CLI de controle e consultas entre agentes. Gemini CLI aparece como integração planejada, portanto não declarar suporte direto pronto. Há vários produtos chamados Maestro: esta investigação se refere exclusivamente a RunMaestro/Maestro.

A [política de segurança](https://raw.githubusercontent.com/RunMaestro/Maestro/main/SECURITY.md) foi localizada. Não foi completada a revisão de permissões, isolamento, assinatura ou acesso remoto. Auto Run, retomadas e fallback exigem atenção para não criar consumo automático contrário aos acordos de Ryan. Um piloto deve começar manual e com orçamento definido.

Parecer: boa segunda opção se a prioridade for coordenar CLIs oficiais e trabalhar com Claude Code/Codex. Para Gemini, verificar caminho suportado, sem assumir integração por nome ou imagem de divulgação.

## CLI Agent Orchestrator — candidato técnico

O [CAO do AWS Labs](https://raw.githubusercontent.com/awslabs/cli-agent-orchestrator/main/README.md) coordena CLIs completas com supervisor, workers e interfaces de operação. Exige Python, uv e tmux. Isso implica maior preparo no Windows; WSL ou outro ambiente compatível precisaria ser validado. Estar no AWS Labs não implica suporte comercial ou segurança garantida pela AWS.

Sua [política](https://raw.githubusercontent.com/awslabs/cli-agent-orchestrator/main/SECURITY.md) descreve versões suportadas, prazos e controles. As [releases](https://github.com/awslabs/cli-agent-orchestrator/releases) também registram correções de vulnerabilidades relevantes, incluindo escrita fora do diretório de perfis e controles de requisições/autenticação. Uma governança mais explícita não dispensa confirmar a versão corrigida e a força real das restrições para cada provedor.

Parecer: melhor candidato para estudar coordenação técnica e políticas por papel, com mais custo de implantação que o necessário para o primeiro piloto. Não selecionar apenas pela marca.

## Integração mínima com CLIs oficiais — alternativa de arquitetura

Também é possível projetar um executor pequeno que envia um briefing a uma CLI autorizada, captura resultado e métricas, e encerra. É uma proposta nossa, não ferramenta já instalada ou validada. O benefício potencial é reduzir componentes antes do benchmark; o custo é desenvolver e manter a ponte. Não seria criado um framework próprio amplo. A autenticação, cobrança e capacidade de execução não interativa continuam precisando ser verificadas.

## Ordem de investigação recomendada

1. Validar se API é uma forma de acesso aceitável. Se for, desenhar um perfil mínimo OpenCode com uma execução e sem extras.
2. Se a prioridade for reutilizar CLIs oficiais existentes, avaliar Maestro para Claude/Codex ou uma ponte mínima antes de um cockpit completo.
3. Reservar CAO para necessidade comprovada de coordenação mais técnica; manter Alethe como candidato separado, sem adoção automática por eliminação.

O piloto encerra após uma tarefa e avalia resultado, permissões e métrica disponível. Não habilitar execução ilimitada, fallback pago ou loops automáticos sem autorização. Não importar credenciais nem instalar ferramentas no escopo desta pesquisa.

## Limitações e registro

Foram consultados repositórios originais, documentos de agentes e políticas. Uma página de subagentes Goose não foi localizada; Goose não recebeu revisão suficiente para entrar na classificação. Duas chamadas posteriores de navegação falharam por conexão, incluindo aprofundamento em permissões e histórico de problemas. Não foram repetidas indefinidamente nem interpretadas como ausência de problemas. Triagem de feedback comunitário e comparação de artefatos das alternativas permanecem incompletas.

Resultado: lista curta fundamentada, sem benchmark ou atestado de segurança. Atualizado o índice; nenhuma skill ou instrução global alterada.
