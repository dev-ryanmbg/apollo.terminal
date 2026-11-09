# Apollo Terminal

Fluxo de projeto: descreva o pedido na conversa; Groq esclarece e monta uma proposta em vez de produzir a entrega. `/proposta` mostra etapas e executores. `/confirmar` exige `executar proposta vN` e inicia a sequência aprovada; erro interrompe, sem repetição automática. `/executar` retoma uma etapa após conferência. Escolhas como “Use o Claude para o design” são restrições, verificadas no servidor e no combo. Se a rota permitir outra família, estiver ambígua ou não puder ser verificada, a execução é bloqueada. Confira sempre os executores exibidos. `/plano objetivo` continua usando o planejador formal configurado, atualmente Codex. Reabra o terminal após atualizar o servidor; os projetos permanecem salvos.

Interface visual atualizada: cabeçalho com arte ASCII própria, cores quando o terminal suporta, faixa de projeto/combo/progresso e campo de digitação. Use `/menu` e as setas para Chat, Plano, Resultado, Projetos, aprovação, execução e status. Enter escolhe e Esc volta. O histórico de mensagens digitadas usa ↑/↓ no campo de entrada. Home/End e ←/→ movem o cursor; Ctrl+U limpa a linha. Aprovação e execução mantêm confirmação escrita, mesmo quando abertas pelo menu.

O atalho existente carrega a versão nova ao reabrir. Não é necessário reiniciar os servidores. Não abre outra janela automaticamente. Em redirecionamento de entrada/saída, mantém o modo simples por comandos. `NO_COLOR` ou `TERM=dumb` desativa cores. Voz continua disponível no site.

2026-11-08. Primeira interface por texto; reaproveita servidor, projetos, histórico e combos existentes. Não instala dependências.

Abra **Apollo Terminal** na Área de Trabalho. Alternativa: execute `Apollo Terminal.cmd` nesta pasta. O iniciador sobe os serviços e pede a chave somente se o Apollo estiver desligado. Chave não é gravada. O terminal não abre o navegador.

- Escreva normalmente para conversar.
- `/novo Meu projeto` cria um espaço separado.
- `/plano Criar uma página simples` pede um plano ao combo configurado.
- `/etapa 1` mostra instruções e executor; `/editar 1` permite alterações.
- `/aprovar` pede confirmação da versão, por exemplo `aprovar v1`.
- `/executar` pede confirmação da etapa, por exemplo `executar 1`. Executa uma por vez; não repete falhas automaticamente.
- `/resultado` mostra a última saída. `/salvar` grava Markdown e `/zip` exporta site concluído. Nenhum sobrescreve arquivos.
- `/projetos`, `/projeto N`, `/chat`, `/status`, `/ajuda`, `/sair` completam a navegação.

Voz continua pelo site. Código e mídia entregues pelos combos não são executados pelo terminal. Texto gerado não vira comando de shell; controles de terminal são filtrados. Mudar projeto no site pode mudar a seleção compartilhada: o terminal detecta e exige repetir o comando. Versão e projeto continuam validados pelo servidor.

Testado com servidor de demonstração isolado: chat, aprovação obrigatória, cancelamento, execução única e recusa de sobrescrita. Dois testes passaram, sem API externa. Consulta de status no servidor real confirmou chave presente e HTTP 200 para OmniRoute e VoiceStudio; nenhuma inferência real disparada pelo agente. Arquivos de demonstração dos testes permanecem no diretório temporário do Windows.

Limites: esta é uma CLI de comandos, sem painel de tela inteira nem voz no terminal. Em timeout, consulte estado e conversa antes de repetir. Não altera o design do site.

Correção em 2026-11-08: o primeiro leitor interativo não exibia a digitação por falta de output no readline. Corrigido e coberto por teste específico. Três testes passam. Feche sessões antigas e abra uma única vez o atalho para carregar a correção.
