import path from 'node:path';
import {homedir} from 'node:os';

const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const families={claude:['claude','anthropic'],codex:['codex'],gemini:['gemini'],deepseek:['deepseek'],groq:['groq']};
const scopeWords={design:/\b(design|visual|interface|layout|estetica|tipografia|cores)\b/,roteiro:/\b(roteiro|narrativa|historia|criatividade)\b/,programacao:/\b(programacao|codigo|implementar|implementacao|desenvolver)\b/,pesquisa:/\b(pesquisa|pesquisar|fontes|investigar)\b/};
export function preferencesFrom(message,routes,previous=[]){
 const preferences=previous.map(x=>({...x})),source=normalize(message);
 const expression=/(?:^|[.!?;:\n]|\be\s+)\s*(?:use|utilize|usar|quero(?:\s+usar)?|prefiro)\s+(?:o\s+|a\s+)?(claude|codex|gemini|deepseek|groq)\b(?:\s+(?:para|pra|no|na|em)\s+([^.!?;\n]+))?/g;
 for(const match of source.matchAll(expression)){
  const provider=match[1],scope=Object.entries(scopeWords).find(([,regex])=>regex.test(match[2]||''))?.[0]||'geral';
  const candidates=routes.filter(r=>families[provider].some(word=>normalize(r.id+' '+r.label).includes(word)));
  if(candidates.length!==1)throw new Error(`Escolha explícita de ${provider}: não há uma rota única cadastrada. Defina o combo antes de planejar; nenhuma substituição foi feita.`);
  const item={provider,scope,executor:candidates[0].id};
  const at=preferences.findIndex(p=>p.scope===scope);if(at<0)preferences.push(item);else preferences[at]=item;
 }
 return preferences;
}
export function enforcePreferences(steps,preferences=[]){
 const seen=new Set();
 const result=steps.map(step=>{
  const text=normalize(`${step.title} ${step.instruction} ${step.expected}`);
  const scoped=preferences.filter(p=>p.scope!=='geral'&&scopeWords[p.scope]?.test(text));
  const matches=scoped.length?scoped:preferences.filter(p=>p.scope==='geral');
  if(new Set(matches.map(p=>p.executor)).size>1)throw new Error('Uma etapa mistura funções com IAs obrigatórias diferentes. Separe as etapas.');
  const rule=matches[0];if(!rule)return {...step};seen.add(rule.scope);
  return {...step,executor:rule.executor,requiredProvider:rule.provider};
 });
 for(const rule of preferences)if(rule.scope!=='geral'&&!seen.has(rule.scope))throw new Error(`Falta uma etapa explícita de ${rule.scope}, solicitada para ${rule.provider}. Revise a proposta.`);
 return result;
}
export function parseProposal(output,validateSteps,routes,worker,preferences){
 const value=JSON.parse(output.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
 if(typeof value.reply!=='string'||!value.reply.trim()||value.reply.length>3000)throw new Error('O coordenador não devolveu uma resposta válida.');
 if(value.proposal===null)return {reply:value.reply,proposal:null};
 const p=value.proposal;
 if(!p||typeof p.goal!=='string'||!p.goal.trim()||p.goal.length>8000)throw new Error('Proposta sem objetivo válido.');
 return {reply:value.reply,proposal:{goal:p.goal.trim(),details:enforcePreferences(validateSteps(p.steps,routes,worker),preferences)}};
}
export function readCoordinatorReply(output,validateSteps,routes,worker,preferences){
 const raw=output.trim();
 // Clarification is ordinary text. Only a validated object can create a proposal.
 if(!/^(?:\{|```(?:json)?\s*\{)/i.test(raw))return {reply:raw,proposal:null};
 try{return parseProposal(raw,validateSteps,routes,worker,preferences);}
 catch(error){
  // Recover only a complete JSON string, never repair or execute broken steps.
  const quoted=raw.match(/"reply"\s*:\s*("(?:\\.|[^"\\])*")/s)?.[1];
  let reply='';try{reply=quoted?JSON.parse(quoted):'';}catch{}
  if(typeof reply!=='string')reply='';
  return {reply:(reply.trim()?reply.trim()+'\n\n':'')+'A proposta técnica veio incompleta e não está disponível para aprovação. A conversa foi preservada; nenhuma etapa foi iniciada.',proposal:null,formatIssue:error.message};
 }
}
export function coordinationContext(project){
 return JSON.stringify({projeto:project.name,planoAtual:project.plan?{objetivo:project.plan.task.slice(0,6000),progresso:`${project.plan.next}/${project.plan.steps.length}`,etapas:project.plan.details.map(s=>({titulo:s.title,executor:s.executor,entrega:s.expected}))}:null});
}
export function conversationContext(project){
 const selected=[];let remaining=22000;
 for(let i=project.chat.length-1;i>=0&&selected.length<16;i--){
  const m=project.chat[i];if(m.error||m.content.startsWith('Não consegui montar uma proposta válida:'))continue;
  const limit=i===project.chat.length-1?8000:m.role==='user'?3500:2200;
  const content=m.content.slice(0,Math.min(limit,remaining));if(!content)break;
  selected.unshift({role:m.role,content});remaining-=content.length;if(remaining<=0)break;
 }
 return selected;
}
export async function verifyExclusiveRoute(executor,provider,{dbPath=process.env.APOLLO_ROUTER_DB||path.join(homedir(),'.omniroute','storage.sqlite')}={}){
 // Inspect only combo routing data, never provider credentials. Fail closed.
 const {DatabaseSync}=await import('node:sqlite');let db;
 try{
  db=new DatabaseSync(dbPath,{readOnly:true});const row=db.prepare('SELECT data FROM combos WHERE name = ?').get(executor);
  if(!row)throw new Error('Combo não encontrado.');const combo=JSON.parse(row.data);
  if(!Array.isArray(combo.models)||!combo.models.length||combo.config?.handoffModel)throw new Error('Combo vazio ou com encaminhamento adicional.');
  if(!combo.models.every(m=>m.kind==='model'&&families[provider]?.some(alias=>String(m.providerId||'').toLowerCase().startsWith(alias))))throw new Error('O combo permite outra família de IA.');
 }catch(e){throw new Error(`Rota exclusiva ${provider}/${executor} não verificada: ${e.message} Execução bloqueada; não houve substituição.`);}finally{db?.close();}
}
export function coordinatorPrompt(settings,preferences){
 return `Você é Apollo, coordenador do projeto de Ryan. Converse em português de forma breve. Sua função é entender necessidades e montar uma proposta, NUNCA resolver o trabalho, escrever código, pesquisar ou produzir a entrega final no chat. Use o contexto e plano existentes; não peça para repetir informações já fornecidas. Se faltam decisões indispensáveis, liste as perguntas concretas na MESMA resposta: não diga apenas que precisa de detalhes. Para conversar e esclarecer dúvidas, responda em TEXTO NORMAL. Quando houver informação suficiente para propor o projeto, retorne SOMENTE JSON válido {"reply":"seu resumo real, sem placeholders","proposal":{"goal":"objetivo completo","steps":[{"title":"até 90 caracteres","instruction":"até 400 caracteres","expected":"até 160 caracteres","executor":"ID cadastrado"}]}}. Prefira 1 a 3 etapas; máximo 6. Escape aspas dentro de strings JSON. Cada etapa deve ter entrega verificável e executor cadastrado. Não execute nem diga que executou: a execução exige confirmação explícita no aplicativo. Não decida o design ou escreva a implementação no chat; esses trabalhos cabem aos executores. Preserve escolhas obrigatórias de IA. Integração: aplicativo -> OmniRoute -> ${settings.chatModel}. Você não administra o painel. Planejador formal opcional: ${settings.planner}. Não prometa ferramentas de arquivos, shell ou mídia. Propostas não são aprovação. Rotas: ${JSON.stringify(settings.routes)}. Restrições: ${JSON.stringify(preferences)}.`;
}
