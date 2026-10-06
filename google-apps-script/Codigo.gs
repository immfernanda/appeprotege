/**
 * Leads da LP App eProtege → Planilha Google (+ CRM)
 *
 * Instalação: na planilha, Extensões > Apps Script, cole este código,
 * rode "configurarPlanilha" uma vez e publique como App da Web.
 */

const ABA = '';          // nome da aba dos leads; vazio = primeira aba
const CRM_WEBHOOK = '';  // URL do webhook do CRM (opcional)
const FUSO = 'America/Sao_Paulo';

// Colunas (1 = A)
const COL = {
  data: 1, campanha: 2, criativo: 3, nome: 4, telefone: 5, email: 6, cargo: 7,
  empresa: 8, tamanho: 9, interesse: 10, icp: 11, qualificado: 12, tempo: 13,
  status: 14, tentativas: 15, retornou: 16, agendou: 17, motivoPerda: 18
};

const SIM_NAO = ['Sim', 'Não'];
const STATUS = ['Novo lead', 'Entramos em contato', 'Sem resposta', 'Reunião agendada',
  'Reunião realizada', 'Proposta enviada', 'Em negociação', 'Ganho', 'Perdido'];
const TENTATIVAS = ['1', '2', '3', '4', '5 ou mais'];
const MOTIVOS_PERDA = ['Sem orçamento', 'Preço', 'Fechou com concorrente', 'Sem interesse',
  'Não respondeu', 'Fora do perfil (ICP)', 'Adiou a decisão', 'Outro'];

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return ABA ? ss.getSheetByName(ABA) : ss.getSheets()[0];
}

/** Recebe o lead enviado pela LP. */
function doPost(e) {
  let lead;
  try { lead = JSON.parse(e.postData.contents); } catch (err) { return resposta_({ ok: false, erro: 'json' }); }
  if (lead.website) return resposta_({ ok: true }); // robô (campo invisível preenchido)

  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = aba_();
    const linha = Math.max(sh.getLastRow(), 1) + 1;
    const valores = new Array(COL.motivoPerda).fill('');
    valores[COL.data - 1] = new Date();
    valores[COL.campanha - 1] = lead.campanha || (lead.origem ? lead.origem : 'Orgânico / direto');
    valores[COL.criativo - 1] = lead.criativo || '';
    valores[COL.nome - 1] = lead.nome || '';
    valores[COL.telefone - 1] = lead.telefone || '';
    valores[COL.email - 1] = lead.email || '';
    valores[COL.cargo - 1] = lead.cargo || '';
    valores[COL.empresa - 1] = lead.empresa || '';
    valores[COL.tamanho - 1] = lead.tamanho || '';
    valores[COL.interesse - 1] = lead.interesse || 'Demonstração do App';
    valores[COL.status - 1] = 'Novo lead';

    sh.getRange(linha, COL.telefone).setNumberFormat('@');
    sh.getRange(linha, 1, 1, valores.length).setValues([valores]);
    sh.getRange(linha, COL.data).setNumberFormat('dd/MM/yyyy HH:mm');
  } finally {
    lock.releaseLock();
  }

  enviarCRM_(lead);
  return resposta_({ ok: true });
}

function doGet() {
  return resposta_({ ok: true, info: 'Endpoint de leads da LP App eProtege ativo.' });
}

function enviarCRM_(lead) {
  if (!CRM_WEBHOOK) return;
  try {
    UrlFetchApp.fetch(CRM_WEBHOOK, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ ...lead, website: undefined, origem_lead: 'LP App eProtege', data: new Date().toISOString() }),
      muteHttpExceptions: true
    });
  } catch (err) {
    console.error('Falha ao enviar ao CRM: ' + err);
  }
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Preenche sozinho "Tempo entre cadastro e primeiro contato" (coluna M)
 * na primeira vez que o Status sai de "Novo lead".
 */
function onEdit(e) {
  const r = e.range, sh = r.getSheet();
  if (sh.getSheetId() !== aba_().getSheetId() || r.getRow() < 2 || r.getColumn() !== COL.status) return;
  const status = r.getValue();
  const celTempo = sh.getRange(r.getRow(), COL.tempo);
  const cadastro = sh.getRange(r.getRow(), COL.data).getValue();
  if (!status || status === 'Novo lead' || celTempo.getValue() !== '' || !(cadastro instanceof Date)) return;

  const min = Math.max(0, Math.round((new Date() - cadastro) / 60000));
  const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
  celTempo.setValue(d ? `${d}d ${h}h` : h ? `${h}h ${m}min` : `${m}min`);
}

/** Rode uma vez: cria as caixinhas de seleção e as cores das colunas K a R. */
function configurarPlanilha() {
  const sh = aba_();
  const linhas = sh.getMaxRows() - 1;
  const lista = (col, opcoes, rigido) => sh.getRange(2, col, linhas, 1).setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(opcoes, true).setAllowInvalid(!rigido).build());

  [COL.icp, COL.qualificado, COL.retornou, COL.agendou].forEach(c => lista(c, SIM_NAO, true));
  lista(COL.status, STATUS, true);
  lista(COL.tentativas, TENTATIVAS, true);
  lista(COL.motivoPerda, MOTIVOS_PERDA, false); // aceita outro texto, com aviso

  sh.getRange(2, COL.tempo, linhas, 1).setNote('').setBackground('#F5F9FC');
  sh.getRange(1, COL.tempo).setNote('Preenchido automaticamente quando o Status sai de "Novo lead".');
  sh.getRange(2, COL.telefone, linhas, 1).setNumberFormat('@');
  sh.getRange(2, COL.data, linhas, 1).setNumberFormat('dd/MM/yyyy HH:mm');
  sh.setFrozenRows(1);

  const regra = (col, texto, fundo, cor) => SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo(texto).setBackground(fundo).setFontColor(cor)
    .setRanges([sh.getRange(2, col, linhas, 1)]).build();
  const regras = [];
  [COL.icp, COL.qualificado, COL.retornou, COL.agendou].forEach(c => {
    regras.push(regra(c, 'Sim', '#D9F5E5', '#0B6B3A'), regra(c, 'Não', '#FDE2E4', '#9F1239'));
  });
  [['Novo lead', '#DCEBFF', '#1E4E8C'], ['Entramos em contato', '#D9F3F4', '#0B6E72'],
   ['Sem resposta', '#EEF0F3', '#4B5563'], ['Reunião agendada', '#E9E3FF', '#5B21B6'],
   ['Reunião realizada', '#E9E3FF', '#5B21B6'], ['Proposta enviada', '#FFF4CC', '#8A6100'],
   ['Em negociação', '#FFF4CC', '#8A6100'], ['Ganho', '#D9F5E5', '#0B6B3A'], ['Perdido', '#FDE2E4', '#9F1239']]
    .forEach(([t, f, c]) => regras.push(regra(COL.status, t, f, c)));
  const outras = sh.getConditionalFormatRules().filter(r => !r.getRanges().some(g => g.getColumn() >= COL.icp && g.getColumn() <= COL.motivoPerda));
  sh.setConditionalFormatRules(outras.concat(regras));

  SpreadsheetApp.getActiveSpreadsheet().toast('Planilha configurada!', 'eProtege', 5);
}
