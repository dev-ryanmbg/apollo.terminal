import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import http from 'node:http';
import {spawn} from 'node:child_process';
import {DatabaseSync} from 'node:sqlite';
import {preferencesFrom,enforcePreferences,verifyExclusiveRoute,readCoordinatorReply,conversationContext,coordinationContext} from './workflow.mjs';
import {validateSteps} from 'file:///C:/Users/Ryan/Documents/Codex/2026-11-07/oq-x20/outputs/apollo-jarvis/core.mjs';
const routes=[{id:'jarvis-programacao',label:'Programação Codex'},{id:'jarvis-criatividade',label:'Design Claude'},{id:'jarvis-conversa',label:'Conversa Groq'}];
test('esclarecimentos em texto e JSON quebrado não criam propostas executáveis',()=>{
 const plain=readCoordinatorReply('Para garantir o resultado: qual é o público?',validateSteps,routes,'jarvis-programacao',[]);
 assert.equal(plain.reply,'Para garantir o resultado: qual é o público?');assert.equal(plain.proposal,null);
 const broken=readCoordinatorReply('{"reply":"Precisamos definir o público.","proposal":{"goal":"teste" sem virgula}}',validateSteps,routes,'jarvis-programacao',[]);
 assert.match(broken.reply,/Precisamos definir o público/);assert.equal(broken.proposal,null);assert.ok(broken.formatIssue);
 const invalid=readCoordinatorReply(JSON.stringify({reply:'Proposta',proposal:{goal:'Teste',steps:[{title:'Teste',instruction:'Teste',expected:'Teste',executor:'nao-autorizado'}]}}),validateSteps,routes,'jarvis-programacao',[]);
 assert.equal(invalid.proposal,null);
});
test('retomada inclui plano e pedido recente longo; filtra erros técnicos antigos',()=>{
 const latest='X'.repeat(6000)+' FIM DO PEDIDO';
 const project={name:'Projeto',chat:[{role:'assistant',content:'Não consegui montar uma proposta válida: JSON error'},{role:'user',content:latest}],plan:{task:'Melhorar terminal',next:0,steps:['a'],details:[{title:'Design',executor:'jarvis-criatividade',expected:'Layout'}]}};
 assert.equal(conversationContext(project).length,1);assert.ok(conversationContext(project)[0].content.endsWith('FIM DO PEDIDO'));
 assert.match(coordinationContext(project),/Melhorar terminal/);
});
test('escolha explícita de Claude prevalece e exige etapa identificável',()=>{
 const prefs=preferencesFrom('Use o Claude para o design.',routes);
 assert.equal(prefs[0].executor,'jarvis-criatividade');
 assert.equal(enforcePreferences([{title:'Design',instruction:'Criar visual',expected:'Layout',executor:'jarvis-programacao'}],prefs)[0].executor,'jarvis-criatividade');
 assert.throws(()=>enforcePreferences([{title:'Código',instruction:'Programar',expected:'HTML',executor:'jarvis-programacao'}],prefs),/Falta uma etapa/);
 assert.equal(preferencesFrom('Não use Claude para o design.',routes).length,0);
 assert.throws(()=>preferencesFrom('Use Gemini para pesquisa.',routes),/não há uma rota/);
});
test('proposta não executa; versão e exclusividade são verificadas antes de chamar o provedor',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'apollo-workflow-')),dbPath=path.join(dir,'router.sqlite');
 const db=new DatabaseSync(dbPath);db.exec('CREATE TABLE combos(name TEXT PRIMARY KEY, data TEXT)');
 const setCombo=mixed=>db.prepare('INSERT OR REPLACE INTO combos VALUES (?,?)').run('jarvis-criatividade',JSON.stringify({models:[{kind:'model',providerId:'claude-web'},...(mixed?[{kind:'model',providerId:'codex'}]:[])],config:{handoffModel:''}}));setCombo(false);
 const calls=[];let fail=false;
 const provider=http.createServer(async(req,res)=>{let raw='';for await(const c of req)raw+=c;const body=JSON.parse(raw);calls.push(body.model);
  if(body.model==='jarvis-criatividade'&&fail){res.writeHead(429);res.end('{}');return;}
  const content=body.model==='jarvis-conversa'?JSON.stringify({reply:'Proponho uma etapa de design.',proposal:{goal:'Criar design',steps:[{title:'Design da página',instruction:'Descreva o layout e as cores.',expected:'Direção visual',executor:'jarvis-programacao'}]}}):'Direção visual entregue pelo Claude.';
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify({model:body.model,choices:[{message:{content}}]}));});
 await new Promise(r=>provider.listen(0,'127.0.0.1',r));
 await writeFile(path.join(dir,'settings.json'),JSON.stringify({demo:false,baseUrl:`http://127.0.0.1:${provider.address().port}/v1`,planner:'jarvis-programacao',worker:'jarvis-programacao',chatModel:'jarvis-conversa',routes}));
 const child=spawn(process.execPath,['C:/Users/Ryan/Documents/Codex/2026-11-07/oq-x20/outputs/apollo-jarvis/server.mjs'],{env:{...process.env,APOLLO_DATA_DIR:dir,APOLLO_ROUTER_DB:dbPath,APOLLO_PORT:'0',OMNIROUTE_API_KEY:'test-only'},stdio:['ignore','pipe','pipe']});
 try{
  const base=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(new Error('Servidor não iniciou')),10000);child.stdout.on('data',b=>{out+=b;const m=out.match(/http:\/\/127\.0\.0\.1:\d+/);if(m){clearTimeout(timer);resolve(m[0]);}});});
  const token=(await(await fetch(base)).text()).match(/name="apollo-token" content="([a-f0-9]+)"/)[1];
  const call=async(route,body)=>{const r=await fetch(base+'/api/'+route,{method:body?'POST':'GET',headers:{'X-Apollo-Token':token,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};};
  assert.equal((await call('chat',{message:'Use o Claude para o design.'})).status,200);
  let state=(await call('state')).data,draft=state.project.proposal;
  assert.equal(state.active,null);assert.deepEqual(calls,['jarvis-conversa']);assert.equal(draft.details[0].executor,'jarvis-criatividade');
  assert.equal((await call('proposal/accept',{id:draft.id,version:draft.version+1})).status,400);
  let plan=(await call('proposal/accept',{id:draft.id,version:draft.version})).data.active;
  assert.equal(plan.approvedVersion,1);assert.equal(calls.length,1);
  setCombo(true);const params={id:plan.id,version:plan.version,index:0};
  assert.equal((await call('step',params)).status,400);assert.equal(calls.length,1);
  await assert.rejects(verifyExclusiveRoute('jarvis-criatividade','claude',{dbPath}),/outra família/);
  setCombo(false);fail=true;assert.equal((await call('step',params)).status,400);assert.deepEqual(calls,['jarvis-conversa','jarvis-criatividade']);
  assert.equal((await call('state')).data.active.next,0);
  fail=false;assert.equal((await call('step',params)).status,200);assert.deepEqual(calls,['jarvis-conversa','jarvis-criatividade','jarvis-criatividade']);
 }finally{child.kill();db.close();await new Promise(r=>provider.close(r));}
});
