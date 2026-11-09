# Teste pequeno — contador

2026-11-09 · Autorizado por Ryan. Estado: preparado, aguardando inicialização autenticada do Apollo; nenhum modelo chamado e nenhum resultado simulado contado como sucesso.

## Objetivo

Validar coordenação pelo Apollo Terminal/núcleo compartilhado e entrega local pelo Codex. Produzir um único `contador.html` nesta pasta, sem bibliotecas, instalação, publicação ou acesso a outros projetos. Este artefato de teste não é o Apollo HTML nem uma alteração de interface do Apollo.

## Pedido a enviar

Crie um contador em um único arquivo HTML, com CSS e JavaScript embutidos. Mostrar o valor inicial 0 e três botões: aumentar, diminuir e zerar. Permitir números negativos. Os botões devem funcionar por mouse e teclado usando elementos button nativos. A atualização do valor deve ser anunciada com aria-live. Não usar bibliotecas, rede, fontes externas, armazenamento persistente ou serviços. Retorne o conteúdo completo do arquivo, delimitado claramente. O Codex deste chat salvará e verificará o arquivo localmente. Proponha somente uma etapa de geração pelo jarvis-programacao. Não prometa que o executor textual já gravou ou abriu arquivos. Entrega esperada: contador.html funcional.

## Fluxo delimitado

1. Confirmar Apollo em modo real, com chave e sem operação em andamento; não ler ou imprimir a chave.
2. Criar projeto isolado de teste e preservar o ID do projeto anteriormente selecionado.
3. Enviar o pedido ao coordenador e conferir a proposta: uma etapa pequena, executor jarvis-programacao, sem tarefas externas ao pedido.
4. Executar a proposta somente se corresponder ao escopo autorizado. Se ampliar escopo ou trocar executor de forma inesperada, parar para revisão.
5. Codex recebe a entrega textual, salva `contador.html` nesta pasta e verifica o comportamento. Registrar eventuais correções locais separadamente da saída original do modelo.
6. Preservar resultado e métricas fornecidas; restaurar seleção anterior quando seguro. Não trocar configurações globais nem acionar voz.

## Critérios de sucesso

- Projeto, proposta, executor real identificado e resultado recuperáveis.
- Inicial 0; aumentar → 1; diminuir duas vezes → -1; zerar → 0.
- Arquivo independente, sem chamadas de rede e sem dependências externas.
- Entrega gravada no disco e comportamento verificado; descrever o método de verificação real.
- Não confundir geração textual com execução local ou teste visual.

## Limites e parada

Na leitura da configuração salva em 2026-11-09, jarvis-programacao está identificado como Codex. Kimi/Gemini/Mistral ainda são candidatos; nenhuma troca será feita neste teste sem instrução aplicável. A configuração efetiva da rota deve ser conferida antes de atribuir o resultado a um provedor.

Sem chave/servidor disponível, parar antes de chamar modelo. Não obter credenciais por arquivos, clipboard ou histórico. Em falha de inferência, registrar erro e não repetir automaticamente. Não usar demonstração nem escrever a solução neste chat como se tivesse sido produzida pelo Apollo.
