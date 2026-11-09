import {test} from 'node:test';
import assert from 'node:assert/strict';
import {safeText,wrapText,drawBox,showSpinner,stopAllSpinners,state,getAutocompleteSuggestions,readInput} from './terminal-ui.mjs';
import {PassThrough,Writable} from 'node:stream';
import {createDemoAPI} from './demo-api.mjs';
import {apiCall,appState} from './terminal.mjs';

test('respostas não preservam sequências de controle de tela ou clipboard',()=>{
 assert.equal(safeText('\x1b[2JTexto\x1b]52;c;abc\x07\n'), 'Texto\n');
 assert.deepEqual(wrapText('123456789',4),['1234','5678','9']);
});
test('caixas em terminal estreito não ultrapassam a largura da janela',()=>{
 const original=process.stdout.write,columns=process.stdout.columns;let rendered='';
 try{process.stdout.columns=40;process.stdout.write=chunk=>{rendered+=chunk;return true;};drawBox('Uma entrega longa','A'.repeat(110));}
 finally{process.stdout.write=original;if(columns===undefined)delete process.stdout.columns;else process.stdout.columns=columns;}
 for(const line of safeText(rendered).trimEnd().split('\n'))assert.ok(Array.from(line).length<=40,line);
 assert.ok(safeText(rendered).includes('A'.repeat(36)));
});
test('autocomplete contém os comandos funcionais sem enviar ações',()=>{
 for(const cmd of ['/proposta','/confirmar','/executar','/aprovar','/salvar','/zip','/novo'])assert.ok(getAutocompleteSuggestions('/').includes(cmd));
 assert.deepEqual(getAutocompleteSuggestions('mensagem comum'),[]);
});
test('entrada ecoa digitação e Tab completa sem enviar, inclusive com stdout em pipe',{timeout:2000},async(t)=>{
 const originalTerm=process.env.TERM;process.env.TERM='xterm-256color';
 t.after(()=>{if(originalTerm===undefined)delete process.env.TERM;else process.env.TERM=originalTerm;});
 const input=new PassThrough();input.isTTY=true;input.setRawMode=()=>{};
 let rendered='',finished=false;const output=new Writable({write(chunk,encoding,done){rendered+=chunk;done();}});output.isTTY=false;
 const pending=readInput('>',{input,output}).then(value=>{finished=true;return value;});
 for(const char of '/confir')input.write(char);input.write('\t');await new Promise(r=>setImmediate(r));
 assert.equal(finished,false);assert.match(safeText(rendered),/confirmar/);
 input.write('\r');assert.equal(await pending,'/confirmar');input.destroy();
});
test('colar texto multilinha não envia nem executa comandos',{timeout:2000},async()=>{
 const input=new PassThrough();input.isTTY=true;input.setRawMode=()=>{};
 const output=new Writable({write(chunk,encoding,done){done();}});let finished=false;
 const pending=readInput('>',{input,output,readClipboard:async()=> 'ação\n/confirmar\x1b[2J'}).then(value=>{finished=true;return value;});
 input.write('\x16');await new Promise(r=>setImmediate(r));assert.equal(finished,false);
 input.write('\r');assert.equal(await pending,'ação /confirmar');input.destroy();
});
test('demonstração aceita proposta apenas na versão correta e não executa antes de aceitar',async()=>{
 const api=createDemoAPI();const r=await api('chat','POST',{message:'Teste'});
 assert.equal((await api('state')).active,null);
 await assert.rejects(api('step','POST',{id:'plan-demo',version:1,index:0}));
 await assert.rejects(api('proposal/accept','POST',{id:r.proposal.id,version:99}));
 const p=(await api('proposal/accept','POST',{id:r.proposal.id,version:r.proposal.version})).active;
 await api('step','POST',{id:p.id,version:p.version,index:0});
 const end=await api('state');assert.equal(end.active.next,1);assert.equal(end.active.results.length,1);
 await assert.rejects(api('step','POST',{id:p.id,version:p.version,index:0}));
});
test('cliente envia token, mapeia resposta e encerra spinner inclusive em erro',async()=>{
 const original=globalThis.fetch;const requests=[];let failure=false;
 globalThis.fetch=async(url,options={})=>{
  requests.push({url,options});
  if(!url.includes('/api/'))return new Response('<meta name="apollo-token" content="abc123">');
  assert.equal(options.headers['X-Apollo-Token'],'abc123');
  if(failure)return Response.json({error:'Limite temporario'},{status:429});
  if(url.endsWith('/export/site'))return new Response(new Uint8Array([80,75,3,4]));
  return Response.json({project:{id:'one',name:'Teste',chat:[{role:'assistant',content:'Resposta recebida'}]},settings:{chatModel:'groq'},active:{id:'plan',next:0,steps:['a'],details:[{executor:'claude'}]}});
 };
 try{
  await apiCall('state');assert.equal(appState.currentProject.id,'one');assert.equal(appState.chat[0].content,'Resposta recebida');
  const zip=await apiCall('export/site','POST',{},true);assert.equal(zip.subarray(0,2).toString(),'PK');
  failure=true;showSpinner('Teste');await assert.rejects(apiCall('state'),/Limite temporario/);assert.equal(state.busy,false);
  assert.equal(requests.filter(r=>r.url.endsWith('/api/state')).length,2,'sem repetição automática');
 }finally{globalThis.fetch=original;stopAllSpinners();}
});
