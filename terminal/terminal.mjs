/**
 * Apollo Terminal - Comandos e Fluxo da Interface
 *
 * Comunicacao: HTTP/REST com Apollo em 127.0.0.1:3210
 * OmniRoute: 127.0.0.1:20128/v1
 * Node.js v26.13.0, Windows
 */

import {
  drawHeader,
  drawMenu,
  drawBox,
  drawInput,
  clearScreen,
  showMessage,
  showSpinner,
  stopAllSpinners,
  readInput,
  navigateMenu,
  confirmAction,
  state,
  COMMANDS,
  color,
  amber,
  blue,
  success,
  error,
  warning,
  muted,
  primary,
  safeText,
} from './terminal-ui.mjs';

import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {mkdir,writeFile} from 'node:fs/promises';
import {createDemoAPI} from './demo-api.mjs';

// ===================================================================
// CONFIGURACAO
// ===================================================================

const CONFIG = {
  APOLLO_URL: 'http://127.0.0.1:3210',
  OMNIROUTE_URL: 'http://127.0.0.1:20128/v1',
  TIMEOUT: 90000, // 90 segundos
  MAX_RETRIES: 0, // Sem retry automatico
};

// ===================================================================
// ESTADO DA APLICACAO
// ===================================================================

const appState = {
  ...state,
  settings: {
    demo: true,
    baseUrl: CONFIG.APOLLO_URL,
    planner: 'jarvis-programacao',
    worker: 'jarvis-programacao',
    chatModel: 'jarvis-conversa',
    voice: 'M1',
  },
  projects: [],
  currentProjectIndex: 0,
  chat: [],
  plan: null,
  proposal: null,
};

// ===================================================================
// FUNCOES DE API
// ===================================================================

const demoAPI = process.argv.includes('--demo') ? createDemoAPI() : null;
let sessionToken = null;
async function bootstrapSession() {
  const response = await fetch(CONFIG.APOLLO_URL, {signal:AbortSignal.timeout(10000)});
  const html = await response.text();
  sessionToken = html.match(/name="apollo-token" content="([a-f0-9]+)"/)?.[1];
  if (!sessionToken) throw new Error('Servidor Apollo nao reconhecido.');
}
async function apiCall(endpoint, method = 'GET', body = null, binary = false) {
  if (demoAPI) { try { const data = await demoAPI(endpoint,method,body); if(endpoint==='state') updateState(data); return data; } finally { stopAllSpinners(); } }
  if (!sessionToken) await bootstrapSession();
  const url = `${CONFIG.APOLLO_URL}/api/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    'X-Apollo-Token': sessionToken,
  };

  const options = {
    method,
    headers,
    redirect: 'error',
    signal: AbortSignal.timeout(CONFIG.TIMEOUT),
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    if (binary && response.ok) return Buffer.from(await response.arrayBuffer());
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}`);
    }

    if (endpoint === "state") updateState(data);
    return data;
  } catch (err) {
    throw new Error(`Erro na chamada: ${err.message}`);
  } finally { stopAllSpinners(); }
}

// ===================================================================
// FUNCOES DE ESTADO
// ===================================================================

function updateState(newState) {
  Object.assign(appState, newState);
  appState.plan = newState.active ?? null;
  appState.currentProject = newState.project ?? null;
  appState.chat = newState.project?.chat ?? [];
  appState.proposal = newState.project?.proposal ?? null;
  const plan = appState.plan;
  appState.currentStep = plan ? Math.min(plan.next + 1, plan.steps.length) : null;
  appState.currentExecutor = plan?.details[plan.next]?.executor ?? null;
  appState.currentCombo = newState.settings?.chatModel ?? null;
  Object.assign(state, appState);
}

// ===================================================================
// TELA DE MENU PRINCIPAL
// ===================================================================

const MAIN_MENU = [
  { label: 'CHAT - Conversar sobre o projeto', value: 'chat' },
  { label: 'PLANO - Criar e gerenciar plano', value: 'plan' },
  { label: 'RESULTADOS - Ver resultados das etapas', value: 'results' },
  { label: 'PROJETOS - Gerenciar projetos', value: 'projects' },
  { label: 'STATUS - Ver status do sistema', value: 'status' },
  { label: 'AJUDA - Mostrar ajuda', value: 'help' },
  { label: 'SAIR - Sair do Apollo', value: 'exit' },
];

// ===================================================================
// TELA DE CHAT
// ===================================================================

async function chatScreen() {
  await apiCall('state');
  clearScreen();
  drawHeader();

  showMessage('info', 'DIGITE SUA MENSAGEM OU UM COMANDO');
  showMessage('info', 'Comandos disponiveis: /proposta, /confirmar, /ajuda, /limpar, /sair');
  console.log();

  while (true) {
    const input = await readInput();

    if (!input) {
      continue;
    }

    // Processar comandos
    if (input.startsWith('/')) {
      try {if (await processCommand(input) === 'back') return;} catch(err){stopAllSpinners();showMessage('error','ACAO INTERROMPIDA',err.message);}
      continue;
    }

    // Enviar mensagem para o Apollo
    try {
      const stopSpinner = showSpinner('Enviando mensagem...');
      const response = await apiCall('chat', 'POST', {
        message: input,
        projectId: appState.currentProject?.id,
      });
      stopSpinner();

      await apiCall('state');
      const answer = appState.chat.filter(m => m.role === 'assistant').at(-1);
      if (answer) console.log('\n' + primary(safeText(answer.content)) + '\n');
      if (response.proposal) {
        showMessage('success', 'PROPOSTA RECEBIDA');
        appState.proposal = response.proposal;
        showMessage('info', 'Use /proposta para revisar e /confirmar para iniciar.');
      } else {
        showMessage('success', 'RESPOSTA RECEBIDA');
      }
    } catch (err) {
      showMessage('error', 'ERRO AO ENVIAR MENSAGEM', err.message);
    }
  }
}

// ===================================================================
// TELA DE PLANO
// ===================================================================

async function planScreen() {
  clearScreen();
  drawHeader();

  // Verificar se ha um plano ativo
  if (!appState.plan) {
    showMessage('info', 'NENHUM PLANO ATIVO');
    showMessage('info', 'Use /chat para criar uma proposta primeiro');
    await readInput();
    return;
  }

  // Mostrar plano
  drawBox('PLANO ATUAL', `\n${amber('Objetivo:')} ${primary(appState.plan.task)}\n\n${amber('Progresso:')} ${appState.plan.next}/${appState.plan.steps.length} etapas concluidas\n`);

  // Mostrar etapas
  console.log(amber('\nETAPAS:'));
  for (let i = 0; i < appState.plan.details.length; i++) {
    const step = appState.plan.details[i];
    const status = i < appState.plan.next ? success('✓ CONCLUIDA') : i === appState.plan.next ? blue('▶ ATUAL') : muted('⏸ PENDENTE');
    console.log(`  ${i + 1}. ${primary(step.title)} ${status}`);
    console.log(`     ${muted('Executor:')} ${step.executor}`);
  }

  console.log();
  showMessage('info', 'Comandos: /proposta, /confirmar, /sair');

  const input = await readInput();
  try {await processCommand(input);} catch(err){stopAllSpinners();showMessage('error','ACAO INTERROMPIDA',err.message);}
}

// ===================================================================
// TELA DE PROJETOS
// ===================================================================

async function projectsScreen() {
  clearScreen();
  drawHeader();

  try {
    const stopSpinner = showSpinner('Carregando projetos...');
    const response = await apiCall('state');
    stopSpinner();

    appState.projects = response.projects || [];
    appState.currentProject = response.project;

    if (appState.projects.length === 0) {
      showMessage('info', 'NENHUM PROJETO ENCONTRADO');
      await readInput();
      return;
    }

    // Mostrar lista de projetos
    const projectItems = appState.projects.map((p, i) => ({
      label: `${p.name} ${p.id === appState.currentProject?.id ? blue('(ATIVO)') : ''}`,
      value: p.id,
    }));

    const selected = await navigateMenu(projectItems);

    if (selected) {
      appState.currentProject = appState.projects.find(p => p.id === selected.value);
      const stopSpinner = showSpinner('Selecionando projeto...');
      await apiCall('projects/select', 'POST', { id: selected.value });
      await apiCall('state');
      stopSpinner();
      showMessage('success', 'PROJETO SELECIONADO');
    }
  } catch (err) {
    showMessage('error', 'ERRO AO CARREGAR PROJETOS', err.message);
  }

  await readInput();
}

// ===================================================================
// TELA DE RESULTADOS
// ===================================================================

async function resultsScreen() {
  clearScreen();
  drawHeader();

  if (!appState.plan || !appState.plan.results?.length) {
    showMessage('info', 'NENHUM RESULTADO DISPONIVEL');
    showMessage('info', 'Execute etapas do plano para ver resultados');
    await readInput();
    return;
  }

  // Mostrar resultados
  for (let i = 0; i < appState.plan.results.length; i++) {
    const result = appState.plan.results[i];
    const isFinal = i === appState.plan.results.length - 1 && appState.plan.next >= appState.plan.steps.length;

    drawBox(
      `ETAPA ${i + 1}: ${result.title} ${isFinal ? amber('(ENTREGA FINAL)') : ''}`,
      `${blue('Executor:')} ${result.executor}\n${blue('Modelo:')} ${result.model}\n\n${result.output.slice(0, 500)}${result.output.length > 500 ? '...' : ''}`
    );
    console.log();
  }

  await readInput();
}

// ===================================================================
// TELA DE STATUS
// ===================================================================

async function statusScreen() {
  clearScreen();
  drawHeader();

  try {
    const stopSpinner = showSpinner('Carregando status...');
    const response = await apiCall('state');
    stopSpinner();

    const statusLines = [
      `MODO: ${response.settings.demo ? warning('DEMONSTRACAO') : success('REAL')}`,
      `PROJETOS: ${response.projects?.length || 0}`,
      `PROJETO ATUAL: ${response.project?.name || 'NENHUM'}`,
      `PLANO ATIVO: ${response.active ? success('SIM') : muted('NAO')}`,
      `MEMORIA: ${response.memoryMB || 0} MB`,
      `CHAVE: ${response.hasKey ? success('DISPONIVEL') : error('AUSENTE')}`,
    ];

    drawBox('STATUS DO SISTEMA', statusLines.join('\n'));
  } catch (err) {
    showMessage('error', 'ERRO AO CARREGAR STATUS', err.message);
  }

  await readInput();
}

// ===================================================================
// TELA DE AJUDA
// ===================================================================

async function helpScreen() {
  clearScreen();
  drawHeader();

  const helpText = `COMANDOS DISPONIVEIS:\n\n` +
    COMMANDS.map(cmd => `  ${amber(cmd.name.padEnd(15))} - ${primary(cmd.description)}`).join('\n') +
    `\n\nNAVEGACAO:\n` +
    `  ${amber('↑/↓'.padEnd(15))} - Navegar entre itens\n` +
    `  ${amber('Enter'.padEnd(15))} - Selecionar item\n` +
    `  ${amber('Esc'.padEnd(15))} - Voltar\n` +
    `  ${amber('Tab'.padEnd(15))} - Autocomplete\n` +
    `  ${amber('/sair'.padEnd(15))} - Voltar ao menu\n\n` +
    `DESIGN: ${amber('Retrofuturista - Star Wars / Terminal de Nave')}\n` +
    `EXECUTOR OBRIGATORIO PARA DESIGN: ${amber('Claude (jarvis-criatividade)')}`;

  drawBox('AJUDA', helpText);

  await readInput();
}

// ===================================================================
// PROCESSAMENTO DE COMANDOS
// ===================================================================

async function processCommand(input) {
  const [verb,...parts] = input.trim().split(/\s+/);
  const command = verb.toLowerCase(), value = parts.join(' ');
  if(command==='/novo'){if(!value){showMessage('warning','Use /novo Nome do projeto');return;}await apiCall('projects/create','POST',{name:value});await apiCall('state');showMessage('success','PROJETO CRIADO',appState.currentProject.name);return;}
  if(command==='/executar'){await executePlan(false);return;}
  if(command==='/aprovar'){const p=appState.plan;if(!p){showMessage('warning','NENHUM PLANO');return;}if(await confirmAction('APROVAR PLANO',{Versao:p.version,Etapas:p.details.map(s=>s.title+' | '+s.executor).join(' / ')})){await apiCall('plan/approve','POST',{projectId:appState.currentProject.id,id:p.id,version:p.version});await apiCall('state');showMessage('success','PLANO APROVADO');}return;}
  if(command==='/zip'){const p=appState.plan;if(!p||p.next<p.steps.length)throw new Error('Conclua o plano antes de exportar ZIP.');const bytes=await apiCall('export/site','POST',{projectId:appState.currentProject.id,id:p.id,version:p.version},true);const destination=path.resolve(value||path.join(path.dirname(fileURLToPath(import.meta.url)),'entregas',`apollo-${Date.now()}.zip`));await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,bytes,{flag:'wx'});showMessage('success','ZIP SALVO',destination);return;}
  if(command==='/salvar'){const r=appState.plan?.results.at(-1);if(!r){showMessage('warning','NENHUM RESULTADO');return;}const destination=path.resolve(value||path.join(path.dirname(fileURLToPath(import.meta.url)),'entregas',`apollo-${Date.now()}.md`));await mkdir(path.dirname(destination),{recursive:true});await writeFile(destination,r.output,{flag:'wx'});showMessage('success','SALVO',destination);return;}

  switch (command) {
    case '/proposta':
    case '/prop':
    case '/p':
      await showProposal();
      break;

    case '/confirmar':
    case '/conf':
    case '/c':
      await confirmProposal();
      break;

    case '/ajuda':
    case '/help':
    case '/h':
    case '/?':
      await helpScreen();
      break;

    case '/limpar':
    case '/clear':
    case '/cls':
      clearScreen();
      drawHeader();
      break;

    case '/sair':
    case '/exit':
    case '/quit':
    case '/q':
      return 'back';

    case '/status':
    case '/s':
      await statusScreen();
      break;

    case '/chat':
      await chatScreen();
      break;

    case '/plano':
      await planScreen();
      break;

    case '/projetos':
      await projectsScreen();
      break;

    default:
      showMessage('warning', `COMANDO DESCONHECIDO: ${input}`);
      showMessage('info', 'Digite /ajuda para ver os comandos disponiveis');
  }

  return null;
}

// ===================================================================
// FUNCOES DE PROPOSTA
// ===================================================================

async function showProposal() {
  clearScreen();
  drawHeader();

  if (!appState.proposal) {
    showMessage('warning', 'NENHUMA PROPOSTA DISPONIVEL');
    showMessage('info', 'Converse no chat para gerar uma proposta');
    await readInput();
    return;
  }

  const proposalLines = [
    `OBJETIVO: ${primary(appState.proposal.goal)}`,
    ``,
    amber('ETAPAS:'),
    ...appState.proposal.details.map((step, i) => `  ${i + 1}. ${primary(step.title)} (Executor: ${step.executor})`),
    ``,
    muted('Digite /confirmar para aprovar ou /sair para voltar'),
  ];

  drawBox(`PROPOSTA v${appState.proposal.version}`, proposalLines.join('\n'));

  const input = await readInput();
  try {await processCommand(input);} catch(err){stopAllSpinners();showMessage('error','ACAO INTERROMPIDA',err.message);}
}

async function executePlan(all=false) {
  await apiCall('state');const p=appState.plan;
  if(!p||p.next>=p.steps.length){showMessage('info','NENHUMA ETAPA PENDENTE');return;}
  if(p.approvedVersion!==p.version){showMessage('warning','APROVE A VERSAO ATUAL COM /aprovar');return;}
  const projectId=appState.currentProject.id,id=p.id,version=p.version;
  if(!all&&!await confirmAction('EXECUTAR ETAPA',{Etapa:p.next+1,Executor:p.details[p.next].executor,Instrucao:p.details[p.next].instruction}))return;
  do {
    const index=appState.plan.next;
    showSpinner(`Executando etapa ${index+1} | ${appState.plan.details[index].executor}`);
    try {await apiCall('step','POST',{projectId,id,version,index});await apiCall('state');}
    catch(err){stopAllSpinners();showMessage('error','EXECUCAO INTERROMPIDA',err.message);return;}
    if(appState.currentProject.id!==projectId||appState.plan?.id!==id||appState.plan.version!==version){showMessage('warning','PROJETO OU PLANO ALTERADO. SEQUENCIA INTERROMPIDA.');return;}
    console.log(primary(safeText(appState.plan.results[index].output)));
  } while(all&&appState.plan.next<appState.plan.steps.length);
  showMessage('success',appState.plan.next===appState.plan.steps.length?'ENTREGA CONCLUIDA':'ETAPA CONCLUIDA');
}

async function confirmProposal() {
  clearScreen();
  drawHeader();

  if (!appState.proposal) {
    showMessage('warning', 'NENHUMA PROPOSTA PARA CONFIRMAR');
    await readInput();
    return;
  }

  const confirmed = await confirmAction('CONFIRMAR PROPOSTA', {
    'Objetivo': appState.proposal.goal,
    'Etapas': appState.proposal.details.length,
    'Executores': appState.proposal.details.map(s=>s.title+' | '+s.executor).join(' / '),
    'Acao': 'Aprovar e executar todas as etapas. Pode consumir cota.',
  });

  if (confirmed) {
    try {
      const stopSpinner = showSpinner('Aprovando proposta...');
      const response = await apiCall('proposal/accept', 'POST', {
        projectId: appState.currentProject.id,
        id: appState.proposal.id,
        version: appState.proposal.version,
      });
      stopSpinner();

      appState.plan = response.active;
      appState.proposal = null;
      showMessage('success', 'PROPOSTA APROVADA');
      await apiCall('state');
      showMessage('info', `Plano criado com ${appState.plan.steps.length} etapas`);
      await executePlan(true);
    } catch (err) {
      showMessage('error', 'ERRO AO APROVAR PROPOSTA', err.message);
    }
  } else {
    showMessage('info', 'PROPOSTA NAO CONFIRMADA');
  }

  await readInput();
}

// ===================================================================
// FUNCAO PRINCIPAL
// ===================================================================

async function main() {
  if (!process.stdin.isTTY) throw new Error('Abra o Apollo Terminal em uma janela interativa.');
  await apiCall('state');
  if(demoAPI)state.currentCombo='DEMO · SEM CHAMADAS';
  console.log('\x1b[?25l'); // Esconde cursor

  // Loop principal
  while (true) {
    const selected = await navigateMenu(MAIN_MENU);

    if (!selected) {
      // Sair
      break;
    }

    switch (selected.value) {
      case 'chat':
        await chatScreen();
        break;
      case 'plan':
        await planScreen();
        break;
      case 'results':
        await resultsScreen();
        break;
      case 'projects':
        await projectsScreen();
        break;
      case 'status':
        await statusScreen();
        break;
      case 'help':
        await helpScreen();
        break;
      case 'exit':
        console.log('\n' + muted('SAINDO DO APOLLO TERMINAL...'));
        console.log('\x1b[?25h'); // Mostra cursor
        process.exit(0);
    }
  }

  console.log('\x1b[?25h'); // Mostra cursor
}

// ===================================================================
// INICIAR
// ===================================================================

// Tratar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n' + muted('SAINDO DO APOLLO TERMINAL...'));
  console.log('\x1b[?25h');
  process.exit(0);
});

// Iniciar o terminal
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch(err => {
  console.error('\x1b[?25h'); // Mostra cursor
  console.error(error('ERRO FATAL:') + ' ' + err.message);
  process.exit(1);
});

export { main, appState, CONFIG, COMMANDS, apiCall };