import {createTerminalUI} from './terminal-ui.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Model output is data: strip terminal control sequences before displaying it.
export function safeText(value) {
 return String(value??'').replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'').replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g,'');
}
export function isConnectionQuestion(text){
 const normalized=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 return /^(?:(?:voce|vc|apollo)[, ]+)?(?:consegue|pode|esta|ta|tem)\s+(?:acessar\s+(?:o\s+)?|conectado\s+(?:ao?\s+)?|acesso\s+(?:ao?\s+)?)(?:omniroute|omnirouter)(?:\s+(?:agora|agr))?[?.!]*$/.test(normalized);
}
export class Client {
 constructor(port=3210){if(!Number.isInteger(port)||port<1024||port>65535)throw new Error('Porta inválida.');this.base=`http://127.0.0.1:${port}`;}
 async connect(){const r=await fetch(this.base,{signal:AbortSignal.timeout(10000),redirect:'error'});if(!r.ok)throw new Error(`Apollo HTTP ${r.status}`);const html=await r.text();this.token=html.match(/name=["']apollo-token["']\s+content=["']([a-f0-9]+)["']/)?.[1];if(!this.token)throw new Error('Servidor não reconhecido como Apollo.');return this;}
 async call(route,body,binary=false){
  const r=await fetch(`${this.base}/api/${route}`,{method:body===undefined?'GET':'POST',headers:{'X-Apollo-Token':this.token,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)}),signal:AbortSignal.timeout(body===undefined?15000:240000),redirect:'error'});
  if(!r.ok){const data=await r.json().catch(()=>({}));throw new Error(data.error||`HTTP ${r.status}`);}
  return binary?Buffer.from(await r.arrayBuffer()):r.json();
 }
}
const HELP=`
Texto sem / envia mensagem ao chat. Cada envio usa o combo de conversa.
/chat                 Mostrar conversa do projeto
/projetos             Listar projetos
/projeto N            Abrir projeto pelo número da lista
/novo Nome            Criar e abrir projeto
/plano [objetivo]      Ver plano; com objetivo, pedir planejamento
/proposta             Revisar proposta montada na conversa
/confirmar            Confirmar proposta e executar suas etapas em sequência
/direto Objetivo      Preparar uma entrega única, sem chamada de planejamento
/etapa N              Ler instruções, executor e resultado esperado
/editar N             Editar uma etapa pendente; invalida aprovação anterior
/aprovar              Aprovar a versão atual do plano
/executar             Confirmar e executar somente a próxima etapa
/resultado [N]        Ler última saída, ou saída N
/salvar [caminho]     Salvar última saída em Markdown (não sobrescreve)
/zip [caminho]        Exportar site concluído (não sobrescreve)
/status               Ver serviços, combos e consumo informado
/omniroute            Verificar conexão local sem perguntar ao modelo
/menu                 Abrir menu por setas (terminal interativo)
/ajuda                Mostrar comandos
/sair                 Fechar terminal; servidores continuam ativos

Voz continua disponível no site. Terminal não executa código das entregas.
`;
export async function run(client,{input=process.stdin,output=process.stdout}={}){
 const ui=createTerminalUI(input,output,safeText),say=ui.say;
 let cancelled=false;
 const ask=async prompt=>{const value=await ui.read(prompt);if(value===null){cancelled=true;throw new Error('Entrada encerrada; ação cancelada.');}return value.trim();};
 let state;
 const refresh=async()=>{state=await client.call('state');return state;};
 const args=()=>{if(!state.active)throw new Error('Este projeto não tem plano.');return {projectId:state.project.id,id:state.active.id,version:state.active.version};};
 const numbered=(value,count)=>{if(!/^\d+$/.test(value))throw new Error('Informe o número.');const index=Number(value)-1;if(index<0||index>=count)throw new Error('Número fora da lista.');return index;};
 const showPlan=()=>{const p=state.active;if(!p){say('Nenhum plano. Use /plano seu objetivo.');return;}say(`\nPLANO v${p.version} | ${p.next}/${p.steps.length} concluídas | ${p.approvedVersion===p.version?'aprovado':'aguarda aprovação'}`);say(p.task);for(const [i,s]of p.details.entries())say(`${i+1}. ${i<p.next?'[feito]':i===p.next?'[próxima]':'[pendente]'} ${s.title} | ${s.executor}`);say('Use /etapa N para detalhes.');};
 const checkConfirmation=async exact=>(await ask(`Digite "${exact}" para confirmar (Enter cancela): `))===exact;
 const showProposal=()=>{const p=state.project.proposal;if(!p){say('Nenhuma proposta pendente. Explique o projeto na conversa.');return;}say(`\nPROPOSTA v${p.version} · aguardando sua confirmação\n${p.goal}`);for(const [i,s]of p.details.entries())say(`\n${i+1}. ${s.title}\nExecutor: ${s.executor}${s.requiredProvider?' · obrigatório: '+s.requiredProvider:''}\n${s.instruction}\nEntrega: ${s.expected}`);say('\n/confirmar inicia estas etapas após confirmação escrita. Nenhuma foi executada ainda.');};
 try {
  await client.connect();await refresh();
  ui.header(state);
  while(!cancelled){
   const entered=await ui.prompt(state);if(entered===null)break;let line=entered.trim();if(!line)continue;
   if(line==='/menu'){
    if(!ui.interactive){say(HELP);continue;}
    line=await ui.choose('Para onde vamos?',[
     {label:'Chat · ver conversa',value:'/chat'},{label:'Plano · revisar etapas',value:'/plano'},
     {label:'Proposta · conferir projeto',value:'/proposta'},{label:'Confirmar proposta e iniciar',value:'/confirmar'},
     {label:'Resultado · última entrega',value:'/resultado'},{label:'Projetos · escolher projeto',value:'/projetos'},
     {label:'Novo projeto',value:'/novo'},{label:'Aprovar versão do plano',value:'/aprovar'},
     {label:'Executar próxima etapa',value:'/executar'},{label:'Status · serviços e combos',value:'/status'},
     {label:'Ajuda · comandos',value:'/ajuda'},{label:'Sair do terminal',value:'/sair'}]);
    if(line===null)break;if(!line)continue;
    if(line==='/novo'){const name=await ui.read('Nome do projeto: ');if(name===null)break;if(!name.trim())continue;line+=" "+name.trim();}
   }
   const match=line.match(/^(\/\S+)(?:\s+([\s\S]*))?$/),command=match?.[1]?.toLowerCase(),value=match?.[2]?.trim()||'';
   if(command==='/sair')break;
   try {
    const previous=state.project.id;await refresh();if(previous!==state.project.id){say(`Projeto alterado por outra sessão: ${state.project.name}. Repita o comando após conferir.`);continue;}
    if(command==='/ajuda'){say(HELP);continue;}
    if(command==='/proposta'){showProposal();continue;}
    if(command==='/confirmar'||(!command&&/^(?:confirmo|aprovo a proposta|confirmo a proposta|pode executar)[.!]*$/i.test(line))){
     const draft=state.project.proposal;if(!draft)throw new Error('Não há proposta pendente. Use /proposta ou explique o projeto.');
     showProposal();say(`A confirmação executará até ${draft.details.length} etapas, com os executores mostrados. Pode consumir cota. Erros interrompem a sequência; não há substituição automática.`);
     if(!await checkConfirmation(`executar proposta v${draft.version}`)){say('Cancelado.');continue;}
     await client.call('proposal/accept',{projectId:state.project.id,id:draft.id,version:draft.version});await refresh();
     const planId=state.active.id,version=state.active.version,projectId=state.project.id;
     while(state.active?.id===planId&&state.active.next<state.active.steps.length&&!ui.isClosed()){
      const p=state.active,index=p.next,s=p.details[index];say(`\nExecutando ${index+1}/${p.steps.length}: ${s.title} | ${s.executor}`);
      await client.call('step',{projectId,id:planId,version,index});await refresh();
      if(state.project.id!==projectId||state.active?.id!==planId)throw new Error('Projeto ou plano alterado por outra sessão. Sequência interrompida.');
      say(state.active.results[index].output);
     }
     say(ui.isClosed()?'Sequência interrompida; confira /plano antes de retomar.':'Projeto concluído. Confira /resultado, /salvar ou /zip.');continue;
    }
    if(command==='/status'||command==='/omniroute'||(!command&&isConnectionQuestion(line))){
     say('A integração é feita pelo servidor Apollo: terminal → Apollo → OmniRoute → combo. O modelo de conversa não administra o painel nem cria conexões sozinho. /plano separa o trabalho; /aprovar e /executar controlam as etapas.');
     say(`Projeto: ${state.project.name}\nServidor: ${client.base}\nModo: ${state.settings.demo?'demo':'real'} | chave: ${state.hasKey?'presente no processo':'ausente'} | ocupado: ${state.busy?'sim':'não'}\nApollo: ${state.memoryMB} MB de RAM\nConversa: ${state.settings.chatModel}\nPlanejamento: ${state.settings.planner}\nExecução padrão: ${state.settings.worker}`);
     for(const r of state.settings.routes)say(`  ${r.id}: ${r.label}`);
     for(const [name,port]of [['OmniRoute',20128],['VoiceStudio',3900]]){try{const r=await fetch(`http://127.0.0.1:${port}/${name==='VoiceStudio'?'health':'api/monitoring/health'}`,{signal:AbortSignal.timeout(3000)});say(`${name}: HTTP ${r.status}`);}catch{say(`${name}: não respondeu em 3 segundos`);}}
     const last=state.active?.results.at(-1)||state.project.chat.filter(m=>m.role==='assistant').at(-1);say(`Uso da última saída: ${last?.metrics?.usage?JSON.stringify(last.metrics.usage):'não informado; não significa consumo zero'}`);continue;
    }
    if(command==='/projetos'){
     if(ui.interactive){const id=await ui.choose('Escolha o projeto',state.projects.map(p=>({label:(p.id===state.project.id?'● ':'  ')+p.name,value:p.id})));if(id===null){cancelled=true;continue;}if(id){await client.call('projects/select',{id});await refresh();say(`Projeto: ${state.project.name}`);}}
     else state.projects.forEach((p,i)=>say(`${i+1}. ${p.id===state.project.id?'* ':''}${p.name}`));continue;
    }
    if(command==='/projeto'){const p=state.projects[numbered(value,state.projects.length)];await client.call('projects/select',{id:p.id});await refresh();say(`Projeto: ${state.project.name}`);continue;}
    if(command==='/novo'){if(!value)throw new Error('Use /novo Nome do projeto.');await client.call('projects/create',{name:value});await refresh();say(`Projeto criado: ${state.project.name}`);continue;}
    if(command==='/chat'){for(const m of state.project.chat)say(`\n${m.role==='user'?'Você':`Apollo · ${m.model}`}${m.error?' [envio sem resposta]':''}\n${m.content}`);continue;}
    if(command==='/plano'||command==='/direto'){
     if(!value){showPlan();continue;}
     if(state.active&&state.active.next<state.active.steps.length)throw new Error('Já existe plano pendente. Termine ou use outro projeto.');
     say(command==='/direto'?'Preparando entrega única...':'Planejando pelo combo configurado...');
     await client.call('plan',{projectId:state.project.id,task:value,strategy:command==='/direto'?'direct':'plan-small'});await refresh();showPlan();continue;
    }
    if(command==='/etapa'){const p=state.active;args();const i=numbered(value,p.details.length),s=p.details[i];say(`ETAPA ${i+1}: ${s.title}\nExecutor: ${s.executor}\nInstruções: ${s.instruction}\nEsperado: ${s.expected}`);continue;}
    if(command==='/editar'){
     const payload=args(),p=state.active,i=numbered(value,p.details.length);if(i<p.next)throw new Error('Etapa concluída não pode ser editada.');
     const s=p.details[i],steps=p.details.map(x=>({...x}));say(`Editando etapa ${i+1}. Enter mantém o valor. /cancelar interrompe sem salvar.`);
     for(const [field,label]of [['title','Título'],['executor','Executor'],['instruction','Instruções'],['expected','Resultado esperado']]){say(`Atual: ${s[field]}`);const answer=await ask(`${label}: `);if(answer==='/cancelar')throw new Error('Edição cancelada.');if(answer)steps[i][field]=answer;}
     if(!await checkConfirmation(`salvar ${i+1}`)){say('Cancelado.');continue;}
     await client.call('plan/review',{...payload,steps});await refresh();say('Revisão salva. Aprove a nova versão.');showPlan();continue;
    }
    if(command==='/aprovar'){
     const payload=args();if(state.active.next>=state.active.steps.length)throw new Error('Plano já concluído.');showPlan();
     if(!await checkConfirmation(`aprovar v${payload.version}`)){say('Cancelado.');continue;}
     await client.call('plan/approve',payload);await refresh();say('Versão aprovada. /executar confirma uma etapa por vez.');continue;
    }
    if(command==='/executar'){
     const payload=args(),p=state.active;if(p.next>=p.steps.length)throw new Error('Plano concluído.');if(p.approvedVersion!==p.version)throw new Error('Aprove a versão atual com /aprovar.');
     const index=p.next,s=p.details[index];say(`Etapa ${index+1}: ${s.title}\nExecutor: ${s.executor}\n${s.instruction}\nEsperado: ${s.expected}\nUma chamada pode consumir cota. Não há repetição automática.`);
     if(!await checkConfirmation(`executar ${index+1}`)){say('Cancelado.');continue;}
     say('Executando. Aguarde...');await client.call('step',{...payload,index});await refresh();say(state.active.results[index].output);say('\nEtapa concluída. Revise antes de executar a próxima.');continue;
    }
    if(command==='/resultado'){const results=state.active?.results||[];if(!results.length)throw new Error('Nenhum resultado neste projeto.');const r=results[value?numbered(value,results.length):results.length-1];say(`${r.title} | ${r.executor}\n${r.output}`);continue;}
    if(command==='/salvar'||command==='/zip'){
     const destination=path.resolve(value||path.join(path.dirname(fileURLToPath(import.meta.url)),'entregas',`apollo-${Date.now()}.${command==='/zip'?'zip':'md'}`));
     let content;if(command==='/zip')content=await client.call('export/site',args(),true);else{const r=state.active?.results.at(-1);if(!r)throw new Error('Nenhum resultado para salvar.');content=r.output;}
     await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,content,{flag:'wx'});say(`Salvo: ${destination}`);continue;
    }
    if(command)throw new Error('Comando desconhecido. Use /ajuda.');
    say('Apollo está respondendo...');await client.call('chat',{projectId:state.project.id,message:line});await refresh();const answer=state.project.chat.filter(m=>m.role==='assistant').at(-1);if(answer)say(`\nApollo · ${answer.model}\n${answer.content}`);
   } catch(e){say(`Erro: ${e.message}`);if(e.name==='TimeoutError'||e.name==='AbortError')say('Não repita automaticamente. Consulte /plano e /chat: a solicitação pode ter chegado ao servidor.');}
  }
 } finally {ui.close();}
 say('Terminal encerrado. Servidores continuam ativos.');
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const argv=process.argv.slice(2);if(argv.includes('--help')){console.log(HELP);process.exit(0);}
 const index=argv.indexOf('--port');
 try{await run(new Client(index<0?3210:Number(argv[index+1])));}catch(e){console.error(safeText(`Não foi possível abrir o terminal: ${e.message}\nUse o atalho Apollo Terminal para iniciar os serviços.`));process.exitCode=1;}
}
