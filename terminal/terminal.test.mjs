import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {Readable,Writable,PassThrough} from 'node:stream';
import {Client,run,safeText,isConnectionQuestion} from './terminal.mjs';
import {createTerminalUI} from './terminal-ui.mjs';

test('saídas não executam controles do terminal; endpoint restrito ao loopback',()=>{
 assert.equal(safeText('\x1b[2Jtexto\x1b]0;título\x07\x00\n'), 'texto\n');
 assert.throws(()=>new Client(0),/Porta/);assert.throws(()=>new Client('https://evil.test'),/Porta/);
 assert.equal(isConnectionQuestion('Consegue acessar o omnirouter agr?'),true);
 assert.equal(isConnectionQuestion('Você está conectado ao OmniRoute?'),true);
 assert.equal(isConnectionQuestion('Consegue acessar o OmniRoute e mudar os combos?'),false);
});
test('sessão interativa mostra os caracteres digitados',{timeout:2000},async()=>{
 const input=new PassThrough();input.isTTY=true;input.setRawMode=()=>{};
 let out='',sent=false;
 const output=new Writable({write(chunk,encoding,done){out+=chunk;if(!sent&&out.includes('› ')){sent=true;setImmediate(()=>input.write('/sair\r'));}done();}});
 output.isTTY=true;output.columns=100;
 const client={connect:async()=>{},call:async()=>({project:{id:'one',name:'Teste'},settings:{demo:true}})};
 await run(client,{input,output});input.destroy();
 assert.match(out,/\/sair/,'a digitação deve aparecer na saída do terminal');
});
test('menu por setas escolhe um destino e Esc cancela',{timeout:2000},async()=>{
 const input=new PassThrough();input.isTTY=true;let raw;
 input.setRawMode=value=>{raw=value;};
 let out='';const output=new Writable({write(chunk,encoding,done){out+=chunk;done();}});output.isTTY=true;output.columns=42;
 const ui=createTerminalUI(input,output,safeText);
 try{
  const choice=ui.choose('Destinos',[{label:'Chat',value:'/chat'},{label:'Plano',value:'/plano'}]);
  input.write('\x1b[B\r');assert.equal(await choice,'/plano');
  const cancelled=ui.choose('Destinos',[{label:'Chat',value:'/chat'}]);input.write('\x1b');assert.equal(await cancelled,'');
  assert.match(out,/↑\/↓ escolher/);
 }finally{ui.close();input.destroy();}assert.equal(raw,false);
});
test('terminal real contra servidor demo: chat, aprovação, cancelamento, execução e arquivo sem sobrescrever',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'apollo-terminal-'));
 const server='C:/Users/Ryan/Documents/Codex/2026-11-07/oq-x20/outputs/apollo-jarvis/server.mjs';
 const child=spawn(process.execPath,[server],{env:{...process.env,APOLLO_PORT:'0',APOLLO_DATA_DIR:dir,OMNIROUTE_API_KEY:''},stdio:['ignore','pipe','pipe']});
 try{
  const port=await new Promise((resolve,reject)=>{let out='';const timer=setTimeout(()=>reject(new Error('Servidor não iniciou.')),12000);child.stdout.on('data',b=>{out+=b;const match=out.match(/127\.0\.0\.1:(\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});child.once('exit',()=>{clearTimeout(timer);reject(new Error('Servidor encerrou.'));});});
  const file=path.join(dir,'resultado.md');
  const script=['/novo Teste terminal','Olá, Apollo','/direto Criar uma entrega curta','/executar','/aprovar','aprovar v1','/executar','','/executar','executar 1','/resultado',`/salvar ${file}`,`/salvar ${file}`,'/sair'].join('\n')+'\n';
  let out='';const output=new Writable({write(chunk,encoding,done){out+=chunk;done();}});
  const client=new Client(port);await run(client,{input:Readable.from([script]),output});
  const state=await client.call('state');
  assert.equal(state.project.name,'Teste terminal');assert.equal(state.project.chat.length,2);
  assert.equal(state.active.next,1);assert.equal(state.active.results.length,1);
  assert.match(out,/Aprove a versão atual/);assert.match(out,/Cancelado/);assert.match(out,/EEXIST/);
  assert.match(await readFile(file,'utf8'),/DEMONSTRAÇÃO/);
  const proposalScript=['/novo Projeto por proposta','Quero organizar uma entrega curta','/confirmar','executar proposta v1','/sair'].join('\n')+'\n';
  await run(client,{input:Readable.from([proposalScript]),output});
  const completed=await client.call('state');
  assert.equal(completed.project.name,'Projeto por proposta');assert.equal(completed.project.proposal,null);
  assert.equal(completed.active.strategy,'proposal');assert.equal(completed.active.next,completed.active.steps.length);
 }finally{child.kill();}
});
