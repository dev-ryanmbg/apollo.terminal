import {createInterface,emitKeypressEvents} from 'node:readline';

// Only this renderer emits ANSI. Application/model text is cleaned by the caller.
export function createTerminalUI(input,output,clean){
 const interactive=Boolean(input.isTTY&&output.isTTY),color=interactive&&!process.env.NO_COLOR&&process.env.TERM!=='dumb';
 const paint=(code,text)=>color?`\x1b[${code}m${text}\x1b[0m`:text;
 const width=()=>Math.max(24,Math.min(100,(output.columns||80)-2));
 const rule=()=>paint('90','─'.repeat(width()));
 const write=text=>output.write(text);
 const say=text=>{const safe=clean(text);write((/^Erro:/.test(safe)?paint('31',safe):/^Apollo ·/.test(safe)?paint('38;5;192',safe):safe)+'\n');};
 let pending,closed=false,lastRows=0,history=[],historyAt=0;
 let rl,iterator;
 if(!interactive){rl=createInterface({input,output,crlfDelay:Infinity,terminal:false});iterator=rl[Symbol.asyncIterator]();}
 const clearRows=()=>{if(lastRows){write(`\x1b[${lastRows}A\r\x1b[J`);lastRows=0;}};
 const draw=()=>{
  if(!pending)return;
  clearRows();
  if(pending.kind==='menu'){
   write(paint('1',clean(pending.title))+'\n');
   pending.items.forEach((item,i)=>write((i===pending.index?paint('38;5;192','  › '+clean(item.label)):'    '+clean(item.label))+'\n'));
   write(paint('90','↑/↓ escolher · Enter abrir · Esc voltar')+'\n');lastRows=pending.items.length+2;
  }else{
   // Redraw only this input line. Keep long prompts on a single terminal row.
   const chars=pending.chars,limit=Math.max(4,width()-pending.prompt.length-1),start=Math.max(0,pending.cursor-limit+1);
   const visible=chars.slice(start,start+limit).join('');
   write('\r\x1b[2K'+pending.prompt+visible);
   const position=pending.prompt.length+pending.cursor-start;
   write(`\r\x1b[${position+1}G`);
  }
 };
 const finish=value=>{const p=pending;if(!p)return;pending=null;if(p.kind==='menu'){clearRows();write(`${paint('38;5;192','›')} ${value?clean(p.items[p.index].label):'Voltar'}\n`);}else write('\n');p.resolve(value);};
 const onKey=(text,key={})=>{
  if(key.ctrl&&key.name==='c'){closed=true;if(!pending)say('\nEncerrando após a solicitação em andamento. Ela pode consumir cota; não a repita automaticamente.');finish(null);return;}
  if(!pending)return;
  if(pending.kind==='menu'){
   if(key.name==='escape'){finish('');return;}
   if(key.name==='up'||key.name==='down'){pending.index=(pending.index+(key.name==='down'?1:pending.items.length-1))%pending.items.length;draw();}
   else if(key.name==='return')finish(pending.items[pending.index].value);
   return;
  }
  const p=pending;
  if(key.name==='return'){
   const line=p.chars.join('');if(line.trim()&&p.remember){history.push(line);history=history.slice(-100);}historyAt=history.length;
   finish(line);return;
  }
  if(key.ctrl&&key.name==='d'&&!p.chars.length){finish(null);return;}
  if(key.ctrl&&key.name==='u'){p.chars=[];p.cursor=0;}
  else if(key.name==='backspace'&&p.cursor){p.chars.splice(--p.cursor,1);}
  else if(key.name==='delete')p.chars.splice(p.cursor,1);
  else if(key.name==='left')p.cursor=Math.max(0,p.cursor-1);
  else if(key.name==='right')p.cursor=Math.min(p.chars.length,p.cursor+1);
  else if(key.name==='home'||key.ctrl&&key.name==='a')p.cursor=0;
  else if(key.name==='end'||key.ctrl&&key.name==='e')p.cursor=p.chars.length;
  else if((key.name==='up'||key.name==='down')&&p.remember){historyAt=Math.max(0,Math.min(history.length,historyAt+(key.name==='up'?-1:1)));p.chars=Array.from(history[historyAt]||'');p.cursor=p.chars.length;}
  else if(text&&!key.ctrl&&!key.meta&&!/^[\x00-\x1f\x7f]/.test(text)){const chars=Array.from(clean(text));if(p.chars.length+chars.length<=8000){p.chars.splice(p.cursor,0,...chars);p.cursor+=chars.length;}}
  draw();
 };
 const onEnd=()=>{closed=true;finish(null);};
 if(interactive){emitKeypressEvents(input);input.setRawMode?.(true);input.on('keypress',onKey);input.on('end',onEnd);input.resume();output.on('resize',draw);}
 const read=async(prompt,{remember=false}={})=>{
  if(closed)return null;
  if(!interactive){write(clean(prompt));const item=await iterator.next();return item.done?null:item.value;}
  if(pending)throw new Error('Já existe uma entrada aberta.');
  if(clean(prompt).length>width()-8){say(prompt);prompt='› ';}
  return new Promise(resolve=>{pending={kind:'line',prompt:clean(prompt),chars:[],cursor:0,remember,resolve};draw();});
 };
 return {
  interactive,say,
  isClosed:()=>closed,
  header(state){
   const mode=state.settings.demo?'DEMONSTRAÇÃO · sem inferência':'LOCAL · via OmniRoute';
   write('\n'+paint('38;5;192','      .     *\n   .    _..._\n       / .-. \\\n   *   | ( ) |   .\n        \\___/\n')+'\n');
   write(paint('1','  A P O L L O')+'   '+paint('90','TERMINAL / 01')+'\n');
   say(`  ${mode}`);say(`  Projeto: ${state.project.name}`);write(rule()+'\n');
   say('  Escreva para conversar. /menu abre os destinos; /ajuda mostra tudo.');
  },
  async prompt(state){
   if(interactive){const p=state.active;write('\n'+rule()+'\n');const status=`${state.project.name} · ${state.settings.chatModel||'conversa'} · ${state.busy?'ocupado':p?`${p.next}/${p.steps.length} etapas`:'pronto'}`;write(paint('90',clean(status).slice(0,width()))+'\n');}
   return read(interactive?'› ':'\napollo> ',{remember:true});
  },
  read,
  async choose(title,items){if(!interactive)return null;return new Promise(resolve=>{pending={kind:'menu',title,items,index:0,resolve};draw();});},
  close(){closed=true;if(interactive){finish(null);input.off('keypress',onKey);input.off('end',onEnd);output.off('resize',draw);input.setRawMode?.(false);input.pause();write('\x1b[0m');}else rl.close();},
 };
}
