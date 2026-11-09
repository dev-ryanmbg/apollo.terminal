/**
 * Apollo Terminal - Interface Retrofuturista
 * Design: Claude (jarvis-criatividade)
 * Implementacao: Vibe Code (jarvis-programacao)
 *
 * Estilo: Star Wars / Terminal de Nave
 * Cores: Void Black, Amber Core, Hyperdrive Blue
 * Navegacao: Setas, Enter, Esc, Tab
 */

import readline from 'node:readline';
import {stripVTControlCharacters,promisify} from 'node:util';
import {execFile} from 'node:child_process';
import { stdin as input, stdout as output } from 'node:process';

// ===================================================================
// CONFIGURACAO DO DESIGN (Claude)
// ===================================================================

const COLORS = {
  // Cores do tema retrofuturista
  RESET: '\x1b[0m',

  // Fundo
  BG_DARK: '\x1b[48;2;10;12;16m',      // Void Black #0A0C10
  BG_SURFACE: '\x1b[48;2;17;21;32m',  // Deep Space #111520
  BG_GUNMETAL: '\x1b[48;2;28;32;48m', // Gunmetal #1C2030

  // Texto
  TEXT_PRIMARY: '\x1b[38;2;232;234;240m',  // Star White #E8EAF0
  TEXT_SECONDARY: '\x1b[38;2;138;145;168m', // Nebula Gray #8A91A8
  TEXT_MUTED: '\x1b[38;2;150;160;180m',       // Asteroid #454B5E

  // Acentos
  AMBER: '\x1b[38;2;245;166;35m',        // Amber Core #F5A623
  AMBER_GLOW: '\x1b[38;2;212;120;10m',     // Amber Glow #D4780A
  HYPERDRIVE: '\x1b[38;2;74;158;255m',     // Hyperdrive Blue #4A9EFF
  DEEP_BLUE: '\x1b[38;2;30;95;168m',       // Deep Blue #1E5FA8

  // Status
  SUCCESS: '\x1b[38;2;91;191;122m',        // Rebel Green #5BBF7A
  ERROR: '\x1b[38;2;232;64;87m',           // Sith Red #E84057
  WARNING: '\x1b[38;2;232;134;58m',       // Dune Orange #E8863A

  // Estilos
  BOLD: '\x1b[1m',
  DIM: '\x1b[2m',
  UNDERLINE: '\x1b[4m',
};

// Spinner frames
const SPINNER_FRAMES = ['◐', '◓', '◑', '◒'];
let spinnerIndex = 0;

// ===================================================================
// ESTADO DO TERMINAL
// ===================================================================

const state = {
  currentScreen: 'menu',
  currentProject: null,
  currentCombo: null,
  currentStep: null,
  currentExecutor: null,
  projects: [],
  chatHistory: [],
  plan: null,
  busy: false,
  lastError: null,
  lastSuccess: null,
  inputBuffer: '',
  autocompleteIndex: -1,
  autocompleteItems: [],
};

// ===================================================================
// COMANDOS DISPONIVEIS
// ===================================================================

const COMMANDS = [
  {name:'/zip',description:'Exportar site completo em ZIP',alias:[]},
  {name:'/novo',description:'Criar projeto: /novo Nome',alias:[]},
  {name:'/aprovar',description:'Aprovar a versao atual do plano',alias:[]},
  {name:'/executar',description:'Confirmar e executar a proxima etapa',alias:[]},
  {name:'/salvar',description:'Salvar ultima entrega em Markdown',alias:[]},
  { name: '/proposta', description: 'Revisar proposta atual', alias: ['/prop', '/p'] },
  { name: '/confirmar', description: 'Aprovar e iniciar execucao', alias: ['/conf', '/c'] },
  { name: '/ajuda', description: 'Mostrar ajuda', alias: ['/help', '/h', '/?'] },
  { name: '/limpar', description: 'Limpar tela', alias: ['/clear', '/cls'] },
  { name: '/sair', description: 'Voltar ao menu', alias: ['/exit', '/quit', '/q'] },
  { name: '/status', description: 'Mostrar status do sistema', alias: ['/s'] },
  { name: '/chat', description: 'Iniciar conversa', alias: [] },
  { name: '/plano', description: 'Ver plano atual', alias: [] },
  { name: '/projetos', description: 'Listar projetos', alias: [] },
];

// ===================================================================
// ARTE ASCII (Claude)
// ===================================================================

const ASCII_ART = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║      ██████╗  ██████╗  ██████╗  ██╗      ██╗    ██████╗     ║
║      ██╔══██╗ ██╔══██╗██╔═══██╗ ██║      ██║   ██╔═══██╗    ║
║      ███████║ ██████╔╝██║   ██║ ██║      ██║   ██║   ██║    ║
║      ██╔══██║ ██╔═══╝ ██║   ██║ ██║      ██║   ██║   ██║    ║
║      ██║  ██║ ██║     ╚██████╔╝ ███████╗ ███████╗╚██████╔╝  ║
║      ╚═╝  ╚═╝ ╚═╝      ╚═════╝  ╚══════╝ ╚══════╝ ╚═════╝  ║
║                                                              ║
║            [ SISTEMA DE COMANDO CENTRAL v2.4 ]               ║
║                   ── EXECUTOR OPERACIONAL ──                  ║
╚══════════════════════════════════════════════════════════════╝
`;

// ===================================================================
// FUNCOES DE COR
// ===================================================================

function color(text, colorCode) {
  if (process.env.NO_COLOR || process.env.TERM === 'dumb') {
    return text;
  }
  return `${colorCode}${text}${COLORS.RESET}`;
}

function amber(text) { return color(text, COLORS.AMBER); }
function blue(text) { return color(text, COLORS.HYPERDRIVE); }
function success(text) { return color(text, COLORS.SUCCESS); }
function error(text) { return color(text, COLORS.ERROR); }
function warning(text) { return color(text, COLORS.WARNING); }
function muted(text) { return color(text, COLORS.TEXT_MUTED); }
function primary(text) { return color(text, COLORS.TEXT_PRIMARY); }
function secondary(text) { return color(text, COLORS.TEXT_SECONDARY); }

// ===================================================================
// FUNCOES DE DESENHO
// ===================================================================

function drawHeader() {
  const width = Math.max(20,Math.min(100,(process.stdout.columns||80)-2));
  console.log(amber('  A P O L L O  /  COMANDO CENTRAL'));
  console.log(muted('  Conversar  ·  Planejar  ·  Revisar  ·  Executar'));
  drawStatusBar();
  drawSeparator();
}

function drawStatusBar() {
  const width = Math.max(20,Math.min(100,(process.stdout.columns||80)-2));
  const project = typeof state.currentProject === 'object' ? state.currentProject?.name : state.currentProject;
  const progress = state.plan ? `${state.plan.next}/${state.plan.steps.length}` : 'sem plano';
  const text = `${project||'Nenhum projeto'} | ${state.currentCombo||'-'} | ${progress}`;
  for(const line of wrapText(text,width))console.log(muted(line));
}

function drawSeparator() {
  const width = Math.max(20, Math.min(100,(process.stdout.columns||80)-2));
  console.log('─'.repeat(width));
}

function safeText(text) {return stripVTControlCharacters(String(text)).replace(/[\x00-\x08\x0b-\x1f\x7f-\x9f]/g,'');}
function wrapText(text,width){
 const result=[];for(const line of safeText(text).split('\n')){const chars=Array.from(line);if(!chars.length)result.push('');while(chars.length)result.push(chars.splice(0,width).join(''));}return result;
}
function drawBox(title,content,colorCode=COLORS.HYPERDRIVE){
 const inner=Math.max(12,Math.min(100,(process.stdout.columns||80)-4));
 console.log('╭'+'─'.repeat(inner+2)+'╮');
 for(const line of wrapText(title,inner))console.log('│ '+color(line.padEnd(inner),colorCode)+' │');
 console.log('├'+'─'.repeat(inner+2)+'┤');
 for(const line of wrapText(content,inner))console.log('│ '+line.padEnd(inner)+' │');
 console.log('╰'+'─'.repeat(inner+2)+'╯');
}

function drawMenu(title, items, selectedIndex) {
  const width = Math.max(20, Math.min(100,(process.stdout.columns||80)-2));

  console.log('\n'+amber(title)+'\n');

  for (let i = 0; i < items.length; i++) {
    const prefix = i === selectedIndex ? '▸' : ' ';
    const itemText = items[i].label || items[i];
    const colorCode = i === selectedIndex ? COLORS.AMBER : COLORS.TEXT_PRIMARY;

    for(const line of wrapText(`${prefix}  ${itemText}`,width))console.log(color(line,colorCode));
  }

  console.log(muted('─'.repeat(width)));
}

function drawInput(prompt = '>') {
  const prefix = state.busy ? SPINNER_FRAMES[spinnerIndex] + ' ' : prompt + ' ';
  process.stdout.write(color(prefix, COLORS.AMBER));
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function showMessage(type, message, details = '') {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };

  const colors = {
    success: COLORS.SUCCESS,
    error: COLORS.ERROR,
    warning: COLORS.WARNING,
    info: COLORS.HYPERDRIVE
  };

  message = safeText(message); details = safeText(details);
  const icon = icons[type] || '·';
  const colorCode = colors[type] || COLORS.TEXT_PRIMARY;

  console.log(`\n${color(icon + ' ' + message, colorCode)}`);
  if (details) {
    console.log(muted(`  ${details}`));
  }
  console.log();
}

const activeSpinners = new Set();
function stopAllSpinners() { for (const stop of [...activeSpinners]) stop(); }
function showSpinner(message) {
  state.busy = true;
  spinnerIndex = 0;
  const interval = setInterval(() => {
    spinnerIndex = (spinnerIndex + 1) % SPINNER_FRAMES.length;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(color(SPINNER_FRAMES[spinnerIndex] + ' ' + message, COLORS.AMBER));
  }, 250);

  const stop = () => {
    activeSpinners.delete(stop);
    clearInterval(interval);
    state.busy = false;
    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);
  };
  activeSpinners.add(stop);
  return stop;
}

// ===================================================================
// FUNCOES DE AUTOCOMPLETE
// ===================================================================

function getAutocompleteSuggestions(input) {
  if (!input.startsWith('/')) {
    return [];
  }

  const prefix = input.slice(1).toLowerCase();
  const suggestions = [];

  for (const cmd of COMMANDS) {
    if (cmd.name.slice(1).toLowerCase().startsWith(prefix)) {
      suggestions.push(cmd.name);
    }
    for (const alias of cmd.alias) {
      if (alias.slice(1).toLowerCase().startsWith(prefix)) {
        suggestions.push(alias);
      }
    }
  }

  return [...new Set(suggestions)].sort();
}

function showAutocomplete(input, suggestions, selectedIndex) {
  if (suggestions.length === 0) return;

  console.log('');
  for (let i = 0; i < suggestions.length; i++) {
    const prefix = i === selectedIndex ? '▸' : ' ';
    const colorCode = i === selectedIndex ? COLORS.AMBER : COLORS.TEXT_SECONDARY;
    console.log(color(`${prefix}  ${suggestions[i]}`, colorCode));
  }

  // Move cursor back to input line
  readline.moveCursor(process.stdout, 0, -suggestions.length - 1);
}

// ===================================================================
// FUNCOES DE NAVEGACAO
// ===================================================================

function navigateMenu(items, actionHandler) {
  return new Promise((resolve) => {
    let selectedIndex = 0;

    process.stdout.write('\x1b[?25l');
    // Desenha o menu
    clearScreen();
    drawHeader();
    drawMenu('MENU PRINCIPAL', items, selectedIndex);

    // Configura o readline
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }

    process.stdin.resume();

    const onKeyPress = (str, key) => {
      if (!key) return;
      if ((key.ctrl && key.name === 'c') || key.name === 'escape' || key.name === 'q') {
        cleanup();
        resolve(null);
        return;
      }

      if (key.name === 'up') {
        selectedIndex = Math.max(0, selectedIndex - 1);
      } else if (key.name === 'down') {
        selectedIndex = Math.min(items.length - 1, selectedIndex + 1);
      } else if (key.name === 'return') {
        cleanup();
        resolve(items[selectedIndex]);
        return;
      }

      if (!['up', 'down'].includes(key.name)) return;
      // Redesenha o menu
      clearScreen();
      drawHeader();
      drawMenu('MENU PRINCIPAL', items, selectedIndex);
      drawInput('>');
    };

    const cleanup = () => {
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(false);
      }
      process.stdin.removeListener('keypress', onKeyPress);
      process.stdin.pause();
      process.stdout.write('\x1b[?25h');
    };

    process.stdin.on('keypress', onKeyPress);
  });
}

// ===================================================================
// FUNCOES DE ENTRADA
// ===================================================================

const inputHistory = [];
async function systemClipboard(){
  if(process.platform!=='win32')return '';
  const {stdout}=await promisify(execFile)(`${process.env.SystemRoot||'C:\\Windows'}\\System32\\WindowsPowerShell\\v1.0\\powershell.exe`,['-NoLogo','-NoProfile','-NonInteractive','-Command','[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false); Get-Clipboard -Raw'],{windowsHide:true,timeout:5000,maxBuffer:65536,encoding:'utf8'});
  return stdout;
}
function readInput(prompt = '>', {input = process.stdin, output = process.stdout, readClipboard = systemClipboard} = {}) {
  if (!input.isTTY) return new Promise(resolve => {
    const rl=readline.createInterface({input,output,terminal:false});
    output.write(prompt+' ');rl.once('line',line=>{rl.close();resolve(line.trim());});rl.once('close',()=>resolve(''));
  });
  return new Promise(resolve => {
    let chars=[],cursor=0,historyIndex=inputHistory.length,done=false;
    const prefix=safeText(prompt)+' ';
    const render=()=>{
      const room=Math.max(8,(output.columns||80)-Array.from(prefix).length-2);
      const start=Math.max(0,cursor-room+1),visible=chars.slice(start,start+room).join('');
      output.write('\r\x1b[2K'+prefix+visible+'\r\x1b['+(Array.from(prefix).length+cursor-start+1)+'G');
    };
    const finish=value=>{
      if(done)return;done=true;input.off('keypress',onKey);input.off('end',onEnd);output.off('resize',render);
      input.setRawMode?.(false);input.pause();output.write('\n');
      if(value&&value!=='/sair'){inputHistory.push(value);if(inputHistory.length>100)inputHistory.shift();}
      resolve(value);
    };
    const onEnd=()=>finish('/sair');
    const onKey=(text,key={})=>{
      if(key.ctrl&&key.name==='v'){
        void readClipboard().then(value=>{if(done)return;const pasted=Array.from(safeText(value).trimEnd().replace(/[\r\n\t]+/g,' '));if(chars.length+pasted.length<=8000){chars.splice(cursor,0,...pasted);cursor+=pasted.length;}render();}).catch(()=>{if(!done){output.write('\nColagem indisponivel. Tente novamente.\n');render();}});return;
      }
      if(key.ctrl&&key.name==='c'){finish('/sair');return;}
      if(key.name==='escape'){finish('/sair');return;}
      if(key.name==='return'||key.name==='enter'){finish(chars.join('').trim());return;}
      if(key.name==='tab'){
        const line=chars.join(''),matches=getAutocompleteSuggestions(line);
        if(matches.length===1){chars=Array.from(matches[0]);cursor=chars.length;}
        else if(matches.length>1){output.write('\n'+matches.join('   ')+'\n');}
      }else if(key.name==='backspace'&&cursor){chars.splice(--cursor,1);}
      else if(key.name==='delete')chars.splice(cursor,1);
      else if(key.name==='left')cursor=Math.max(0,cursor-1);
      else if(key.name==='right')cursor=Math.min(chars.length,cursor+1);
      else if(key.name==='home'||key.ctrl&&key.name==='a')cursor=0;
      else if(key.name==='end'||key.ctrl&&key.name==='e')cursor=chars.length;
      else if(key.ctrl&&key.name==='u'){chars=[];cursor=0;}
      else if(key.name==='up'||key.name==='down'){historyIndex=Math.max(0,Math.min(inputHistory.length,historyIndex+(key.name==='up'?-1:1)));chars=Array.from(inputHistory[historyIndex]||'');cursor=chars.length;}
      else if(text&&(!key.ctrl&&!key.meta||key.ctrl&&key.meta)){const value=Array.from(safeText(text).replace(/[\r\n\t]/g,' '));if(chars.length+value.length<=8000){chars.splice(cursor,0,...value);cursor+=value.length;}}
      render();
    };
    readline.emitKeypressEvents(input);input.on('keypress',onKey);input.on('end',onEnd);output.on('resize',render);
    input.setRawMode?.(true);input.resume();output.write('\x1b[?25h');render();
  });
}

// ===================================================================
// FUNCOES DE CONFIRMACAO
// ===================================================================

async function confirmAction(title, details) {
  clearScreen();
  drawHeader();

  const lines = [];
  for (const [key, value] of Object.entries(details)) {
    lines.push(`${blue('  ' + key + ':')} ${primary(value)}`);
  }

  drawBox(title, lines.join('\n'));
  console.log(warning('\n  DIGITE "SIM" PARA CONFIRMAR OU ENTER VAZIO PARA CANCELAR'));

  const response = await readInput('>');
  return response.toLowerCase().trim() === 'sim';
}

// ===================================================================
// EXPORTACOES
// ===================================================================

export {
  COLORS,
  color,
  amber,
  blue,
  success,
  error,
  warning,
  muted,
  primary,
  secondary,
  drawHeader,
  drawStatusBar,
  drawSeparator,
  drawBox,
  drawMenu,
  drawInput,
  clearScreen,
  showMessage,
  showSpinner,
  stopAllSpinners,
  getAutocompleteSuggestions,
  safeText,
  wrapText,
  readInput,
  navigateMenu,
  confirmAction,
  state,
  COMMANDS,
};