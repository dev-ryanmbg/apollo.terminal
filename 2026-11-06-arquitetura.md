# Apollo — proposta de arquitetura

Data: 2026-11-06. Estado: desenho pronto para revisão; configuração global e novas skills não aplicadas.

## Decisão recomendada

Apollo será a identidade única de conversa: formal, franco, pragmático, disposto a discordar e orientado ao menor custo total para alcançar um resultado verificável. Especializações serão modos de trabalho do mesmo assistente. Orquestração é uma opção posterior, condicionada à autorização e a evidência de benefício.

Eficiência considera créditos, tempo de Ryan, qualidade, manutenção e retrabalho. Não significa escolher sempre o menor modelo ou a menor quantidade de tokens. Os modelos efetivamente disponíveis precisam ser conferidos no ambiente antes de um piloto.

## Contexto recuperado e limites

Além deste chat, foram consultados trechos dos chats “Defina um projeto de TI rentável”, “Retomar hábitos saudáveis e estudos” e “Escrever aula básica de Rust”, e os relatórios locais do Jarvis. Não houve revisão completa de todo o histórico.

Sinais relevantes: prioridade profissional em desenvolvimento de software e produtos próprios; interesse em jogos e criação; equilíbrio Corpo, Mente e Alma; preferência por preservar autonomia e aprender o processo. A correção sobre o desvio jornalístico do projeto de vídeos deve ser preservada como decisão com contexto, sem proibir todo trabalho futuro com notícias.

Esses itens são candidatos à memória pessoal. Sua consolidação permanente depende da revisão do registro; esta proposta não converte cada afirmação histórica em preferência atual.

## Camadas e arquivos recomendados

| Arquivo/local | Função | Consulta |
|---|---|---|
| `~/.codex/AGENTS.md` | Identidade, acordos e rota para o índice central | Orientação global reconhecida pelo Codex |
| `INDEX.md` | Mapa curto: assuntos, caminhos e estado | Quando precisar de contexto anterior |
| `memoria/perfil/AAAA-MM-DD-preferencias.md` | Preferências e restrições confirmadas, com fonte | Quando alterarem uma decisão |
| `memoria/decisoes/AAAA-MM-DD-assunto.md` | Decisão, justificativa, validade e substituição | Quando o assunto reaparecer |
| `memoria/registros/AAAA-MM-DD-assunto.md` | O que foi feito, resultado, falhas, pendências e próximos passos | Retomada ou investigação |
| `memoria/aprendizados/AAAA-MM-DD-assunto.proposta.md` | Aprendizado aguardando aprovação, com destino proposto | Revisão; não aplicar como regra vigente |
| `projetos/<projeto>/INDEX.md` | Mapa dos documentos e estado do projeto | Somente no projeto relevante |
| `projetos/<projeto>/AAAA-MM-DD-estado.md` | Estado factual da execução, evidências e próxima ação | Retomar o projeto |
| `skills/<nome>/SKILL.md` no local de descoberta escolhido | Procedimento curto com gatilho preciso | Quando o procedimento se aplicar |
| `skills/<nome>/references/INDEX.md` | Mapa de fontes e detalhes volumosos | Quando necessário àquela skill |

Os caminhos de memória são proposta, não diretórios já criados. Um arquivo genérico de memória não é carregado automaticamente apenas pelo nome. O AGENTS deve orientar sua localização sem exigir leitura completa. [Documentação oficial](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

Arquivos estáveis de entrada, como INDEX.md e SKILL.md, mantêm nome fixo e data interna; registros de eventos e versões usam data no nome. Dar uma data nova ao nome de cada índice quebraria links e criaria múltiplas entradas concorrentes. Esta é uma escolha explícita para revisão.

## Especializações recomendadas

| Especialização | Responsabilidade | Implementação recomendada |
|---|---|---|
| Pesquisa | Definir pergunta e fontes, comparar alternativas, avaliar repositórios | Nova skill enxuta proposta |
| Memória e processos | Preparar aprendizado, revisar conflitos, registrar após aprovação | Nova skill enxuta proposta |
| Ensino de IA | Explicar escolhas, limites, custos e verificação durante o trabalho | Nova skill enxuta proposta |
| Engenharia | Código, depuração e validação proporcional | Reutilizar capacidades existentes; criar procedimento específico após repetição comprovada |
| Organização e projetos | Prioridades, estado e retomada | Documentos de projeto; skill apenas quando houver um fluxo repetível |
| Criação e vídeo | Direção criativa e produção | Reutilizar as skills de vídeo existentes, evitando duplicação |
| Orquestração | Distribuição de trabalho entre modelos | Candidato a piloto; não habilitar permanentemente agora |

Recomendação estética: Apollo permanece como interlocutor. Nomes funcionais tornam as responsabilidades localizáveis. Se Ryan quiser nomes próprios adicionais, as opções são Mnemosine (memória), Atena (pesquisa), Quíron (ensino) e Hefesto (engenharia). São sugestões pendentes, sem agentes separados ou biografias fictícias.

## Como economizar contexto

1. Consultar o índice e selecionar apenas o ramo relevante.
2. Procurar um procedimento aprovado antes de improvisar um novo.
3. Abrir a fonte detalhada apenas se o resumo não resolver a tarefa.
4. Registrar o resultado operacional uma vez e atualizar os índices correspondentes.
5. Propor aprendizado reutilizável em separado; Ryan decide se vira skill.

O registro operacional autorizado não precisa da mesma aprovação de um novo procedimento. Ele documenta fatos da execução. Regras permanentes, interpretações pessoais e novos procedimentos passam pelo fluxo de revisão. Essa distinção evita uma confirmação por cada linha e preserva a aprovação de aprendizados exigida por Ryan.

## Ensino durante a execução

Em decisões relevantes, explicar: conceito → escolha → alternativa → impacto → forma de conferir. Usar exemplos do trabalho e pequenas práticas quando agregarem compreensão. Não transformar cada operação de arquivo em aula. A skill específica mencionada no projeto Professor não foi localizada; não alegar que foi reutilizada.

## Critérios de aceitação

- Retomar uma tarefa consultando índice, estado e procedimento, sem reabrir todo o histórico.
- Resolver qual decisão está vigente com fonte e relação de substituição explícitas.
- Distinguir fato confirmado, hipótese, proposta e registro histórico.
- Localizar o procedimento de uma tarefa repetida e reproduzir seu resultado.
- Não acessar Notion ou ampliar pesquisa sem autorização de escopo.
- Demonstrar o que Ryan aprendeu em uma decisão prática.
- Tratar tokens, custo monetário, cota de assinatura e tempo como medidas diferentes.

Antes de medir economia, executar as mesmas tarefas representativas com e sem a nova estrutura. Uma amostra pequena indica viabilidade, não prova superioridade geral.
