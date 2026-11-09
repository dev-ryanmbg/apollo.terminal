// Explicit offline demonstration. Never contacts a backend or a provider.
export function createDemoAPI(){
 const settings={demo:true,chatModel:'DEMONSTRACAO',planner:'jarvis-programacao',worker:'jarvis-programacao',routes:[{id:'jarvis-criatividade',label:'Design Claude'},{id:'jarvis-programacao',label:'Implementacao Codex'}]};
 const projects=[{id:'demo',name:'Estudio Apollo · demonstracao',chat:[],plan:null,proposal:null}];let selected=projects[0];
 return async(endpoint,method,body)=>{
  if(endpoint==='state')return structuredClone({settings,project:selected,projects:projects.map(p=>({id:p.id,name:p.name})),active:selected.plan,hasKey:false,memoryMB:0});
  if(endpoint==='projects/create'){selected={id:'demo-'+projects.length,name:body.name,chat:[],plan:null,proposal:null};projects.push(selected);return {ok:true};}
  if(endpoint==='projects/select'){const p=projects.find(p=>p.id===body.id);if(!p)throw new Error('Projeto inexistente.');selected=p;return {ok:true};}
  if(body?.projectId&&body.projectId!==selected.id)throw new Error('Projeto desatualizado.');
  if(endpoint==='chat'){
   selected.chat.push({role:'user',content:body.message});
   const reply='Recebi sua mensagem. Esta janela esta em demonstracao: nenhum provedor foi chamado. Podemos revisar uma proposta de exemplo com Claude no design.';
   selected.proposal={id:'proposal-demo',version:(selected.proposal?.version||0)+1,goal:'Refinar o terminal Apollo',details:[{title:'Direcao visual',instruction:'Descrever um terminal retrofuturista acessivel.',expected:'Direcao visual em texto.',executor:'jarvis-criatividade'}]};
   selected.chat.push({role:'assistant',content:reply,model:'DEMO'});return {ok:true,proposal:structuredClone(selected.proposal)};
  }
  if(endpoint==='proposal/accept'){const p=selected.proposal;if(!p||body.id!==p.id||body.version!==p.version)throw new Error('Proposta desatualizada.');selected.plan={id:'plan-demo',version:1,approvedVersion:1,task:p.goal,steps:p.details.map(s=>s.instruction),details:p.details,next:0,results:[]};selected.proposal=null;return {active:structuredClone(selected.plan)};}
  if(endpoint==='plan/approve'){if(!selected.plan||body.id!==selected.plan.id||body.version!==selected.plan.version)throw new Error('Plano desatualizado.');selected.plan.approvedVersion=selected.plan.version;return {active:structuredClone(selected.plan)};}
  if(endpoint==='step'){const p=selected.plan;if(!p||p.approvedVersion!==p.version||body.id!==p.id||body.version!==p.version||body.index!==p.next||p.next>=p.steps.length)throw new Error('Etapa nao aprovada ou desatualizada.');const s=p.details[p.next];p.results.push({...s,model:'DEMO',output:'[DEMONSTRACAO] Layout de exemplo: carvao, ambar e azul, hierarquia clara e entrada destacada. Nenhuma IA foi chamada.'});p.next++;return {active:structuredClone(p)};}
  throw new Error('Esta acao nao esta disponivel na demonstracao.');
 };
}
