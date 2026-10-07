/* Celular interativo do App eProtege: copiado da LP (C:\Users\Fernanda Lima\Lp\index.html). Ao mudar uma tela do app, mude nos dois. */
const MODULES = [
  {id:'ponto', name:'Cartão Ponto', icon:'clock', g:['#10b981','#16a34a'], tag:'Mais usado',
   desc:'Registro de ponto pelo celular, com horário e localização, e espelho de ponto sempre disponível para o colaborador e o RH.',
   items:['Marcação em um toque','Validação por localização','Espelho de ponto digital','Banco de horas e ajustes']},
  {id:'colaborador', name:'Gestão do Colaborador', icon:'users', g:['#3b82f6','#6366f1'],
   desc:'Cadastro, sugestões, solicitações, comunicados e férias dos colaboradores da sua empresa, tudo em um só lugar.',
   items:['Cadastro de funcionários','Sugestões, inclusive anônimas','Solicitações com acompanhamento','Controle de férias e prazos']},
  {id:'rh', name:'Recursos Humanos', icon:'folder-lock', g:['#f59e0b','#d97706'],
   desc:'Documentos pessoais do colaborador, relógio ponto e folha de ponto em um só lugar, com acesso seguro.',
   items:['Documentos pessoais solicitados','Envio de documentos pelo app','Relógio ponto','Folha ponto (espelho)']},
  {id:'atestados', name:'Atestados / Declarações', icon:'clipboard-check', g:['#d946ef','#db2777'],
   desc:'O colaborador escolhe Atestado ou Declaração, fotografa e envia direto ao RH. Fim dos atestados perdidos no WhatsApp do gestor.',
   items:['Atestado ou declaração','Envio por foto','Acompanhamento do status','Histórico organizado']},
  {id:'epi', name:'EPI', icon:'hard-hat', g:['#f97316','#dc2626'],
   desc:'O colaborador vê os EPIs da função, solicita novos ou trocas e assina a retirada pelo próprio celular.',
   items:['Solicitação de EPI pelo app','Assinatura digital da retirada','Alertas de troca e validade','Ficha de EPI e controle por CA']},
  {id:'tratativas', name:'Tratativas', icon:'handshake', g:['#22c55e','#16a34a'],
   desc:'Pedidos de materiais, sugestões de melhoria e projetos estruturados, acompanhados do início ao fim.',
   items:['Pedidos de materiais','Sugestões e melhorias','Projeto estruturado com etapas','Histórico auditável']},
  {id:'comunicados', name:'Comunicados', icon:'megaphone', g:['#a855f7','#7c3aed'],
   desc:'Envie avisos para toda a empresa ou por setor e saiba exatamente quem leu.',
   items:['Envio por setor','Confirmação de leitura','Anexos e imagens','Notificações no celular']},
  {id:'psicossocial', name:'Risco Psicossocial', icon:'brain', g:['#fb923c','#ea580c'], tag:'NR-1',
   desc:'Questionários confidenciais, indicadores organizacionais, perfil, análise de cargo, feedback e gameficação, apoiando a gestão de riscos psicossociais exigida pela NR-1.',
   items:['Questionários anônimos','Indicadores organizacionais','Perfil pessoal e análise de cargo','Feedback e gameficação']},
  {id:'denuncias', name:'Canal de Denúncias', icon:'shield-alert', g:['#f43f5e','#e11d48'], tag:'Anônimo',
   desc:'Canal 100% anônimo e seguro para relatos de assédio, conduta e segurança, com acompanhamento por protocolo.',
   items:['Denúncia anônima','Protocolo de acompanhamento','Apoio à Lei 14.457/22','Sigilo das informações']},
  {id:'cursos', name:'Integração e Cursos', icon:'graduation-cap', g:['#14b8a6','#0891b2'],
   desc:'Integração de novos colaboradores e trilhas de cursos e treinamentos com acompanhamento de progresso.',
   items:['Integração digital','Trilhas de NRs','Progresso por colaborador','Certificados']},
  {id:'comercial', name:'Área Comercial', icon:'briefcase', g:['#38bdf8','#2563eb'],
   desc:'Acompanhe leads, propostas e metas da equipe comercial com indicadores em tempo real.',
   items:['Funil de vendas','Propostas e metas','Indicadores em tempo real','Relatórios da equipe']},
  {id:'seguranca', name:'Segurança do Trabalho', icon:'shield-check', g:['#12B0B6','#2864B0'], tag:'eProtege',
   desc:'Todos os documentos de Segurança do Trabalho arquivados pela eProtege para a sua empresa, organizados por tipo e sempre à mão.',
   items:['PGR, PCMSO e LTCAT','ASO dos colaboradores','AEP e LIP','Contrato e outros documentos']}
];
const SIZES = ['Até 20','21 a 50','51 a 100','101 a 250','251 a 500','501 a 1000','Mais de 1000'];
const gradOf = m => `linear-gradient(135deg,${m.g[0]},${m.g[1]})`;
const $ = s => document.querySelector(s);
const icons = () => lucide.createIcons();

/* ---------- Phone app ---------- */
const state = {punches:[], epiSigned:false, read:new Set(), face:null, anon:true, protocol:null, uploaded:false};
const PUNCH_LABELS = ['Entrada','Saída almoço','Volta almoço','Saída'];
const pad = n => String(n).padStart(2,'0');
const nowHM = () => {const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};

function toast(msg){const t=$('#toast');t.querySelector('span').textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2200)}
const topBar = (title, back='home', crumb='') => `<div class="app-top"><button data-go="${back}" aria-label="Voltar"><i data-lucide="chevron-left"></i></button><div>${crumb?`<small class="crumb">${crumb}</small>`:''}<h4>${title}</h4></div></div>`;
const PARENT = {}; // subtela -> módulo
const esc = t => String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtD = d => pad(d.getDate())+'/'+pad(d.getMonth()+1);
const addDays = (n,d=new Date()) => {const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()+n);return x};

/* Próximos feriados nacionais, calculados a partir da data de hoje */
function pascoa(y){const a=y%19,b=Math.floor(y/100),c=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
function feriados(y){
  const p=pascoa(y), f=(m,d,n,fac)=>({d:new Date(y,m-1,d),n,fac});
  return [f(1,1,'Confraternização Universal'),{d:addDays(-48,p),n:'Carnaval',fac:1},{d:addDays(-47,p),n:'Carnaval',fac:1},{d:addDays(-2,p),n:'Sexta-feira Santa'},
    f(4,21,'Tiradentes'),f(5,1,'Dia do Trabalho'),{d:addDays(60,p),n:'Corpus Christi',fac:1},f(9,7,'Independência do Brasil'),
    f(10,12,'Nossa Senhora Aparecida'),f(11,2,'Finados'),f(11,15,'Proclamação da República'),f(11,20,'Dia Nacional de Zumbi e da Consciência Negra'),f(12,25,'Natal')];
}
function proximosFeriados(n=3){
  const hoje=addDays(0), y=hoje.getFullYear();
  return [...feriados(y),...feriados(y+1)].filter(h=>h.d>=hoje).sort((a,b)=>a.d-b.d)
    .filter((h,i,arr)=>!(h.n==='Carnaval'&&arr[i-1]&&arr[i-1].n==='Carnaval')).slice(0,n);
}
function comunicadosFeriados(){
  return proximosFeriados(3).map(h=>{
    const dia=h.d.toLocaleDateString('pt-BR',{weekday:'long'});
    return [`${h.fac?'Ponto facultativo':'Feriado'}: ${h.n}`, `${dia.charAt(0).toUpperCase()+dia.slice(1)}, ${fmtD(h.d)}. ${h.fac?'Confira a escala com seu gestor.':'Não haverá expediente.'}`];
  });
}

const COL_TILES = [
  {id:'col_funcionarios', name:'Funcionários', icon:'users', g:['#3b82f6','#6366f1']},
  {id:'col_sugestoes', name:'Sugestões', icon:'lightbulb', g:['#f59e0b','#ea580c']},
  {id:'col_solicitacoes', name:'Solicitações', icon:'clipboard-list', g:['#a855f7','#7c3aed']},
  {id:'col_comunicados', name:'Comunicados', icon:'megaphone', g:['#14b8a6','#0891b2']},
  {id:'col_ferias', name:'Férias', icon:'plane', g:['#84cc16','#16a34a']}
];
COL_TILES.forEach(t=>PARENT[t.id]='colaborador');
const RH_TILES = [
  {id:'rh_docpessoais', name:'Documentos Pessoais', icon:'file-user'},
  {id:'rh_relogio', name:'Relógio Ponto', icon:'clock'},
  {id:'rh_folha', name:'Folha Ponto', icon:'file-text'}
].map(t=>({...t,g:['#f59e0b','#d97706']}));
RH_TILES.forEach(t=>PARENT[t.id]='rh');
const TRAT_TILES = [
  {id:'tr_pedidos', name:'Pedidos de Materiais', icon:'package'},
  {id:'tr_melhoria', name:'Sugestões / Melhoria', icon:'lightbulb'},
  {id:'tr_projeto', name:'Projeto Estruturado', icon:'layers'}
].map(t=>({...t,g:['#22c55e','#16a34a']}));
TRAT_TILES.forEach(t=>PARENT[t.id]='tratativas');
const PSICO_TILES = [
  {id:'ps_riscos', name:'Riscos Psicossociais', icon:'circle-alert'},
  {id:'ps_org', name:'Organizacional', icon:'network'},
  {id:'ps_dev', name:'Desenvolvimento Pessoal e Liderança', icon:'trending-up'},
  {id:'ps_perfil', name:'Análise Perfil Pessoal', icon:'user-search'},
  {id:'ps_cargo', name:'Análise de Cargo', icon:'briefcase', g:['#3b82f6','#4f46e5']},
  {id:'ps_feedback', name:'Feedback', icon:'message-square'},
  {id:'ps_game', name:'Gameficação', icon:'trophy'}
].map(t=>({g:['#fb923c','#ea580c'],...t}));
PSICO_TILES.forEach(t=>PARENT[t.id]='psicossocial');
const tilesGrid = (tiles,cols=3) => `<div class="app-grid" style="grid-template-columns:repeat(${cols},1fr)">${tiles.map(t=>`<button class="app-ic" data-go="${t.id}"><span class="ic" style="background:${gradOf(t)};--c:${t.g[0]}"><i data-lucide="${t.icon}"></i></span>${t.name}</button>`).join('')}</div>`;
const EPIS = ['Capacete de segurança','Óculos de proteção','Protetor facial','Protetor auricular tipo plug','Protetor auricular tipo concha','Máscara PFF2','Respirador semifacial com filtro','Luva de vaqueta','Luva nitrílica','Luva de látex','Luva isolante (eletricista)','Mangote de proteção','Avental de PVC','Botina de segurança','Bota de PVC (borracha)','Cinto de segurança tipo paraquedista','Talabarte duplo','Colete refletivo','Creme de proteção para as mãos','Vestimenta antichama'];
const EPI_MOTIVOS = ['Primeira solicitação','Troca por desgaste','Perda ou extravio','Dano ou defeito','Fim da validade'];
const EPI_PILL = {'Aguardando aprovação':'p-warn','Aprovado':'p-info','Retirado':'p-ok'};
Object.assign(state,{epiModal:false, epiSolic:[], pedidos:[], melhorias:[], feedbacks:[], perfil:false, denForm:false, pontos:1240});
const DOCS_SST = [['AEP','activity',1],['ASO','stethoscope',3],['Contrato','file-pen-line',1],['LIP','brain',1],['LTCAT','flask-conical',1],['Outros','file-question',2],['PCMSO','heart-pulse',1],['PGR','shield-alert',1]];
const DOCS_SST_DESC = {AEP:'Avaliação Ergonômica Preliminar',ASO:'Atestados de Saúde Ocupacional',Contrato:'Contrato de prestação de serviços',LIP:'Laudo de Insalubridade e Periculosidade',LTCAT:'Laudo Técnico das Condições Ambientais',Outros:'Documentos complementares',PCMSO:'Programa de Controle Médico de Saúde Ocupacional',PGR:'Programa de Gerenciamento de Riscos'};
Object.assign(state,{docAberto:null, docsPessoais:{'RG ou CNH':'enviado','Comprovante de residência':'pendente','Certificado de reservista':'pendente'}, atModal:false, atTipo:null, atestados:[]});
Object.assign(state,{sugestoes:[], solicitacoes:[], novaSolic:false, busca:''});
const SOLIC_STEPS = ['Aberto','Em Análise','Aprovado','Finalizado'];
const SOLIC_PILL = {'Aberto':'p-info','Em Análise':'p-warn','Aprovado':'p-ok','Finalizado':'p-ok','Rejeitado':'p-bad'};
const FUNCIONARIOS = [['Ana Souza','Operadora · Produção','ASO em dia','p-ok'],['Carlos Lima','Técnico de Segurança','ASO em dia','p-ok'],['Juliana Prado','Assistente de RH','ASO vence em 20 dias','p-warn'],['Marcos Alves','Motorista','ASO vencido','p-bad'],['Patrícia Reis','Analista Comercial','ASO em dia','p-ok']];
const comunicadosList = () => [...comunicadosFeriados(),['Exames periódicos','Agende seu exame com a eProtege até o fim do mês.']];
function comunicadosHTML(){
  const list=comunicadosList(), unread=list.filter((_,i)=>!state.read.has(i)).length;
  return `<div class="s-muted" style="margin-bottom:10px">${unread?unread+' não lido(s) · toque para confirmar leitura':'Tudo lido ✓'}</div>`+list.map((c,i)=>`<div class="s-card" data-act="read" data-i="${i}" style="cursor:pointer"><div class="s-row"><b>${c[0]}</b>${state.read.has(i)?'<span class="pill p-ok">Lido</span>':'<span class="dot"></span>'}</div><div class="s-muted" style="margin-top:4px">${c[1]}</div></div>`).join('');
}

const SCREENS = {
  home(){
    return `<div class="hello"><h4>Bem-vindo(a), Ana!</h4><p>Escolha uma área para começar.</p></div>
    <button class="ponto-bar" data-go="ponto"><span class="ic"><i data-lucide="clock"></i></span>Registrar Ponto<i data-lucide="chevron-right" class="chev"></i></button>
    <div class="app-grid">${MODULES.filter(m=>m.id!=='ponto').map(m=>`<button class="app-ic" data-go="${m.id}"><span class="ic" style="background:${gradOf(m)};--c:${m.g[0]}"><i data-lucide="${m.icon}"></i></span>${m.name}</button>`).join('')}</div>`;
  },
  rh_relogio(){ return SCREENS.ponto('rh','Relógio Ponto','Recursos Humanos'); },
  ponto(back='home',title='Registrar Ponto',crumb=''){
    const next = PUNCH_LABELS[state.punches.length];
    return topBar(title,back,crumb)+`<div class="clock"><b id="liveClock">${nowHM()}</b><div class="s-muted">${new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'})}</div><span class="geo"><i data-lucide="map-pin"></i> Localização validada</span></div>
    ${next?`<button class="s-btn" data-act="punch"><i data-lucide="fingerprint"></i> Registrar ${next}</button>`:`<div class="s-card" style="text-align:center"><b>Jornada completa ✓</b><div class="s-muted">Bom descanso!</div></div>`}
    <div style="margin-top:14px">${state.punches.map((p,i)=>`<div class="s-card s-row"><span>${PUNCH_LABELS[i]}</span><span class="pill p-ok">${p}</span></div>`).join('')||'<div class="s-muted" style="text-align:center">Nenhum registro hoje</div>'}</div>`;
  },
  denuncias(){
    if(!state.denForm&&!state.protocol) return topBar('Canal de Denúncias')+`<p class="s-muted" style="margin:-4px 0 14px">Registre uma denúncia de forma anônima e segura.</p>
    <div class="s-card" style="text-align:center;padding:26px 14px"><i data-lucide="shield-alert" style="display:block;width:34px;height:34px;color:#8b93b0;margin:0 auto 12px"></i><b style="font-size:.86rem">Precisa relatar algo?</b>
    <p class="s-muted" style="margin:8px 0 16px;line-height:1.5">O canal de denúncias é anônimo e seguro. Você não precisa se identificar, e ninguém no Portal do Cliente tem acesso a casos individuais.</p>
    <button class="s-btn" data-act="denAbrir" style="--g:linear-gradient(90deg,#059669,#047857)">Registrar uma denúncia <i data-lucide="external-link"></i></button></div>`;
    if(state.protocol) return topBar('Canal de Denúncias')+`<div class="s-card" style="text-align:center;padding:24px 12px"><i data-lucide="shield-check" style="display:block;width:40px;height:40px;color:#34d399;margin:0 auto 10px"></i><b>Denúncia enviada com sigilo</b><p class="s-muted" style="margin:6px 0 12px">Guarde seu protocolo para acompanhar:</p><span class="pill p-info" style="font-size:.85rem;padding:6px 14px">${state.protocol}</span></div><button class="s-btn" style="--g:#1a2347" data-act="newden">Nova denúncia</button>`;
    return topBar('Canal de Denúncias')+`<div class="toggle"><span><b>Enviar anonimamente</b><br><span class="s-muted">Sua identidade não será revelada</span></span><button class="switch ${state.anon?'':'off'}" data-act="anon" aria-label="Anônimo"></button></div>
    <select class="s-input"><option>Assédio moral</option><option>Assédio sexual</option><option>Segurança do trabalho</option><option>Conduta antiética</option><option>Outros</option></select>
    <textarea class="s-input" rows="4" placeholder="Descreva o ocorrido..."></textarea>
    <button class="s-btn" style="--g:linear-gradient(90deg,#f43f5e,#e11d48)" data-act="denunciar"><i data-lucide="send"></i> Enviar denúncia</button>`;
  },
  epi(){
    const modal=!state.epiModal?'':`<div class="ph-modal fade-in"><div class="ph-sheet">
      <div class="s-row" style="margin-bottom:10px"><b>Solicitar EPI</b><button class="ph-x" data-act="epiFechar" aria-label="Fechar"><i data-lucide="x"></i></button></div>
      <label class="s-lbl">EPI</label><select class="s-input" id="epiItem"><option value="">Selecione...</option>${EPIS.map(e=>`<option>${e}</option>`).join('')}</select>
      <div style="display:grid;grid-template-columns:1fr 52px;gap:6px"><div><label class="s-lbl">Motivo</label><select class="s-input" id="epiMotivo">${EPI_MOTIVOS.map(m=>`<option>${m}</option>`).join('')}</select></div><div><label class="s-lbl">Qtd.</label><input class="s-input" id="epiQtd" type="number" min="1" value="1"></div></div>
      <label class="s-lbl">Observação (opcional)</label><textarea class="s-input" id="epiObs" rows="2" maxlength="150"></textarea>
      <div class="s-row"><button class="ph-x" data-act="epiFechar" style="font-size:.72rem">Cancelar</button><button class="s-btn s-btn-sm" data-act="epiEnviar" style="--g:linear-gradient(90deg,#f97316,#ea580c)">Enviar solicitação</button></div>
    </div></div>`;
    return topBar('EPI')+`<div class="s-row" style="margin:-4px 0 12px;align-items:flex-start"><p class="s-muted" style="flex:1">Veja o que você precisa, solicite e assine a retirada dos seus EPIs.</p><button class="s-btn s-btn-sm" data-act="epiAbrir" style="--g:linear-gradient(90deg,#f97316,#ea580c)"><i data-lucide="send"></i> Solicitar EPI</button></div>
    <b style="font-size:.8rem;display:block;margin-bottom:8px">Minhas solicitações</b>
    ${state.epiSolic.map((s,i)=>`<div class="s-card fade-in"><div class="s-row"><b>${s.q}x ${s.e}</b><span class="pill ${EPI_PILL[s.st]}">${s.st}</span></div><div class="s-muted" style="margin-top:3px">${s.m}${s.o?' · '+esc(s.o):''}</div>${s.st==='Aprovado'?`<button class="s-btn s-btn-sm" data-act="epiAssinar" data-i="${i}" style="margin-top:8px;--g:linear-gradient(90deg,#f97316,#ea580c)"><i data-lucide="pen-line"></i> Assinar retirada</button>`:''}</div>`).join('')||'<div class="s-muted" style="margin-bottom:12px">Nenhuma solicitação ainda.</div>'}
    <b style="font-size:.8rem;display:block;margin:12px 0 8px">Meus EPIs</b>
    <div class="s-card"><div class="s-row"><b>Capacete de segurança</b><span class="pill p-ok">Em uso</span></div><div class="s-muted">CA 31469 · Entregue em 12/08</div></div>
    <div class="s-card"><div class="s-row"><b>Luva nitrílica</b><span class="pill p-warn">Troca em 5 dias</span></div><div class="s-muted">CA 28011 · Entregue em 01/09</div></div>
    <div class="s-card"><div class="s-row"><b>Protetor auricular</b><span class="pill ${state.epiSigned?'p-ok':'p-bad'}">${state.epiSigned?'Recebido':'Aguardando assinatura'}</span></div><div class="s-muted">CA 5745 · Nova entrega</div></div>
    ${state.epiSigned?'':`<button class="s-btn" style="--g:linear-gradient(90deg,#f97316,#dc2626)" data-act="epi"><i data-lucide="pen-line"></i> Confirmar recebimento</button>`}${modal}`;
  },
  atestados(){
    const modal=!state.atModal?'':`<div class="ph-modal fade-in"><div class="ph-sheet">
      <div class="s-row" style="margin-bottom:12px"><b>${state.atTipo?'Enviar '+state.atTipo:'Enviar Atestado / Declaração'}</b><button class="ph-x" data-act="atFechar" aria-label="Fechar"><i data-lucide="x"></i></button></div>
      ${!state.atTipo?`<div class="kpis" style="margin:0"><button class="opt" data-act="atTipo" data-t="Atestado"><i data-lucide="stethoscope" style="color:#f9a8d4"></i>Atestado</button><button class="opt" data-act="atTipo" data-t="Declaração"><i data-lucide="file-text" style="color:#7dd3fc"></i>Declaração</button></div>`
      :`<div class="drop" data-act="upload"><i data-lucide="camera"></i><b>Toque para fotografar</b><div class="s-muted">ou escolher um arquivo</div><div class="bar" style="--g:linear-gradient(90deg,#d946ef,#db2777)"><i id="upBar" style="width:0%"></i></div></div>`}
    </div></div>`;
    return topBar('Atestado / Declarações')+`<p class="s-muted" style="margin:-4px 0 12px">Envie seu atestado ou declaração e acompanhe os que você já enviou.</p>
    <button class="s-btn" data-act="atAbrir"><i data-lucide="plus"></i> Enviar Atestado / Declaração</button>
    <div style="margin-top:14px">${state.atestados.map(a=>`<div class="s-card s-row fade-in"><span><b>${a.t}</b><div class="s-muted">Enviado hoje às ${a.h}</div></span><span class="pill p-warn">Em análise</span></div>`).join('')}
    <div class="s-card s-row"><span><b>Declaração</b><div class="s-muted">Comparecimento · 14/08</div></span><span class="pill p-ok">Aprovado</span></div>
    <div class="s-card s-row"><span><b>Atestado</b><div class="s-muted">Consulta médica · 02/07</div></span><span class="pill p-ok">Aprovado</span></div></div>${modal}`;
  },
  comunicados(){
    return topBar('Comunicados')+comunicadosHTML();
  },
  psicossocial(){
    return topBar('Risco Psicossocial','home','Início')+tilesGrid(PSICO_TILES);
  },
  ps_org(){
    const ind=[['Clima organizacional',78],['Comunicação interna',64],['Reconhecimento',58],['Equilíbrio vida e trabalho',71]];
    return topBar('Organizacional','psicossocial','Risco Psicossocial')+`<p class="s-muted" style="margin:-4px 0 12px">Indicadores agregados da empresa. Nenhuma resposta individual é exibida.</p>`+
      ind.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill ${x[1]>=70?'p-ok':x[1]>=60?'p-warn':'p-bad'}">${x[1]}%</span></div><div class="bar" style="--g:linear-gradient(90deg,#fb923c,#ea580c)"><i style="width:${x[1]}%"></i></div></div>`).join('');
  },
  ps_dev(){
    const t=[['Comunicação assertiva',80],['Gestão do tempo',45],['Liderança de equipes',20]];
    return topBar('Desenvolvimento Pessoal e Liderança','psicossocial','Risco Psicossocial')+`<p class="s-muted" style="margin:-4px 0 12px">Trilhas para desenvolver competências e formar novas lideranças.</p>`+
      t.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill p-info">${x[1]}%</span></div><div class="bar" style="--g:linear-gradient(90deg,#fb923c,#ea580c)"><i style="width:${x[1]}%"></i></div></div>`).join('')+
      `<button class="s-btn" style="--g:linear-gradient(90deg,#fb923c,#ea580c)" data-act="trilha"><i data-lucide="play"></i> Continuar trilha</button>`;
  },
  ps_perfil(){
    const p=[['Executor',72],['Comunicador',58],['Planejador',81],['Analista',64]];
    return topBar('Análise Perfil Pessoal','psicossocial','Risco Psicossocial')+(state.perfil?
      `<div class="s-card" style="text-align:center"><b>Seu perfil predominante: Planejador</b><div class="s-muted" style="margin-top:4px">Organizado, constante e cuidadoso com os processos.</div></div>`+p.map(x=>`<div class="s-card"><div class="s-row"><span>${x[0]}</span><b>${x[1]}%</b></div><div class="bar" style="--g:linear-gradient(90deg,#fb923c,#ea580c)"><i style="width:${x[1]}%"></i></div></div>`).join('')
      :`<div class="s-card" style="text-align:center;padding:22px 12px"><i data-lucide="user-search" style="display:block;width:34px;height:34px;color:#fb923c;margin:0 auto 10px"></i><b>Descubra seu perfil comportamental</b><p class="s-muted" style="margin:6px 0 14px">São 24 perguntas rápidas, cerca de 5 minutos.</p><button class="s-btn" style="--g:linear-gradient(90deg,#fb923c,#ea580c)" data-act="perfil"><i data-lucide="play"></i> Iniciar análise</button></div>`);
  },
  ps_cargo(){
    return topBar('Análise de Cargo','psicossocial','Risco Psicossocial')+`<div class="s-card"><span class="s-muted">Cargo</span><b style="display:block;font-size:.86rem">Operadora de Produção</b><span class="s-muted">Setor de Produção · CBO 7841-05</span></div>
    <div class="s-card"><b>Principais atividades</b><ul class="s-list"><li>Operar máquinas da linha de produção</li><li>Conferir a qualidade das peças</li><li>Manter o posto de trabalho organizado</li></ul></div>
    <div class="s-card"><b>Exigências do cargo</b><div class="s-row" style="margin-top:6px"><span class="s-muted">Esforço físico</span><span class="pill p-warn">Moderado</span></div><div class="s-row" style="margin-top:4px"><span class="s-muted">Ritmo de trabalho</span><span class="pill p-warn">Alto</span></div><div class="s-row" style="margin-top:4px"><span class="s-muted">Autonomia</span><span class="pill p-info">Média</span></div></div>`;
  },
  ps_feedback(){
    return topBar('Feedback','psicossocial','Risco Psicossocial')+`<label class="s-lbl">Para quem?</label><select class="s-input" id="fbPara"><option>Meu gestor</option><option>Minha equipe</option><option>RH</option><option>Empresa</option></select>
    <textarea class="s-input" id="fbTexto" rows="3" placeholder="Escreva seu feedback..." maxlength="300"></textarea>
    <label class="s-check"><input type="checkbox" id="fbAnon" checked> Enviar anonimamente</label>
    <button class="s-btn" style="--g:linear-gradient(90deg,#fb923c,#ea580c)" data-act="feedback"><i data-lucide="send"></i> Enviar feedback</button>
    <div style="margin-top:12px">${state.feedbacks.map(f=>`<div class="s-card fade-in"><div class="s-row"><b>Para: ${f.p}</b><span class="pill p-ok">Enviado</span></div><div class="s-muted" style="margin-top:4px">${esc(f.t)}</div></div>`).join('')}</div>`;
  },
  ps_game(){
    const r=[['Ana Souza',state.pontos],['Carlos Lima',1180],['Juliana Prado',990]].sort((a,b)=>b[1]-a[1]);
    return topBar('Gameficação','psicossocial','Risco Psicossocial')+`<div class="s-card" style="text-align:center"><span class="s-muted">Seus pontos</span><b style="display:block;font-size:1.6rem;color:#fb923c">${state.pontos}</b><span class="pill p-info">Nível 5 · Guardião da Segurança</span></div>
    <div class="s-card"><b>Desafio da semana</b><div class="s-muted" style="margin:4px 0 8px">Responda o questionário de bem-estar e ganhe 50 pontos.</div><button class="s-btn s-btn-sm" data-act="desafio" style="--g:linear-gradient(90deg,#fb923c,#ea580c)"><i data-lucide="zap"></i> Fazer agora</button></div>
    <div class="s-card"><b>Ranking da equipe</b>${r.map((x,i)=>`<div class="s-row" style="margin-top:6px"><span>${['🥇','🥈','🥉'][i]} ${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div>`;
  },
  ps_riscos(){
    return topBar('Riscos Psicossociais','psicossocial','Risco Psicossocial')+`<div class="s-card"><span class="s-muted">Pergunta 3 de 10</span><div class="bar" style="--g:linear-gradient(90deg,#fb923c,#ea580c)"><i style="width:30%"></i></div><p style="margin-top:14px;font-size:.85rem;font-weight:600">Como você avalia sua carga de trabalho nas últimas semanas?</p>
    <div class="faces">${['😣','🙁','😐','🙂','😄'].map((f,i)=>`<button data-act="face" data-i="${i}" class="${state.face===i?'sel':''}">${f}</button>`).join('')}</div>
    <div class="s-row s-muted"><span>Muito pesada</span><span>Tranquila</span></div></div>
    <div class="s-card s-row" style="gap:10px"><i data-lucide="lock" style="width:18px;color:#fb923c;flex:none"></i><span class="s-muted">Respostas anônimas e confidenciais. Só resultados agregados são analisados.</span></div>`;
  },
  cursos(){
    const c=[['Integração eProtege',100],['NR-35 · Trabalho em altura',60],['NR-06 · Uso de EPI',20]];
    return topBar('Integração e Cursos')+c.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill ${x[1]===100?'p-ok':'p-info'}">${x[1]===100?'Concluído':x[1]+'%'}</span></div><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('')+`<button class="s-btn" style="--g:linear-gradient(90deg,#14b8a6,#0891b2)" data-act="curso"><i data-lucide="play"></i> Continuar curso</button>`;
  },
  colaborador(){
    return topBar('Gestão do Colaborador')+`<p class="s-muted" style="margin:-4px 0 16px">Cadastro, sugestões, solicitações e comunicados dos colaboradores da sua empresa.</p>
    <div class="app-grid">${COL_TILES.map(t=>`<button class="app-ic" data-go="${t.id}"><span class="ic" style="background:${gradOf(t)};--c:${t.g[0]}"><i data-lucide="${t.icon}"></i></span>${t.name}</button>`).join('')}</div>`;
  },
  col_funcionarios(){
    const q=state.busca.toLowerCase(), list=FUNCIONARIOS.filter(f=>f[0].toLowerCase().includes(q)||f[1].toLowerCase().includes(q));
    return topBar('Funcionários','colaborador','Gestão do Colaborador')+`<input class="s-input" id="buscaFunc" placeholder="Buscar funcionário..." value="${esc(state.busca)}">
    ${list.map(f=>`<div class="s-card s-row" style="justify-content:flex-start;gap:10px"><span class="av-mini">${f[0].split(' ').map(p=>p[0]).join('')}</span><div style="flex:1;min-width:0"><b>${f[0]}</b><div class="s-muted">${f[1]}</div></div><span class="pill ${f[3]}">${f[2]}</span></div>`).join('')||'<div class="s-muted" style="text-align:center;padding:20px">Nenhum funcionário encontrado.</div>'}`;
  },
  col_sugestoes(){
    return topBar('Sugestões','colaborador','Gestão do Colaborador')+`<p style="color:#f43f5e;font-weight:700;font-size:.8rem;margin-bottom:10px">Envie ideias e melhorias para a organização.</p>
    <input class="s-input" id="sugTitulo" placeholder="Título" maxlength="60">
    <textarea class="s-input" id="sugTexto" rows="3" placeholder="Descreva sua sugestão..." maxlength="300"></textarea>
    <label class="s-check"><input type="checkbox" id="sugAnon"> Enviar anonimamente</label>
    <button class="s-btn" data-act="sugerir"><i data-lucide="send"></i> Enviar</button>
    <div style="margin-top:14px">${state.sugestoes.map(s=>`<div class="s-card fade-in"><div class="s-row"><b>${esc(s.t)}</b><span class="pill p-info">Recebida</span></div><div class="s-muted" style="margin-top:4px">${esc(s.x)}</div><div class="s-muted" style="margin-top:6px">${s.a?'Anônimo':'Ana Souza'} · agora</div></div>`).join('')||'<div class="empty"><i data-lucide="lightbulb"></i>Nenhuma sugestão ainda.</div>'}</div>`;
  },
  col_solicitacoes(){
    const steps=`<div class="steps-mini">${SOLIC_STEPS.map(s=>`<span>${s}</span>`).join('<i>›</i>')}<i>ou</i><span class="rej">Rejeitado</span></div>`;
    const form=state.novaSolic?`<div class="s-card fade-in"><select class="s-input" id="solTipo"><option>Declaração</option><option>Alteração de dados cadastrais</option><option>Adiantamento salarial</option><option>Troca de horário</option><option>Outros</option></select><textarea class="s-input" id="solTexto" rows="2" placeholder="Detalhe sua solicitação..." maxlength="200"></textarea><button class="s-btn" data-act="solicitar"><i data-lucide="send"></i> Enviar solicitação</button></div>`:'';
    return topBar('Solicitações','colaborador','Gestão do Colaborador')+`<div class="s-row" style="margin-bottom:10px"><span class="s-muted">Suas solicitações</span><button class="s-btn s-btn-sm" data-act="novaSolic"><i data-lucide="${state.novaSolic?'x':'plus'}"></i> ${state.novaSolic?'Cancelar':'Nova solicitação'}</button></div>
    ${steps}${form}${state.solicitacoes.map(s=>`<div class="s-card"><div class="s-row"><b>${esc(s.t)}</b><span class="pill ${SOLIC_PILL[s.st]}">${s.st}</span></div>${s.x?`<div class="s-muted" style="margin-top:4px">${esc(s.x)}</div>`:''}</div>`).join('')||(state.novaSolic?'':'<div class="empty"><i data-lucide="clipboard-list"></i>Nenhuma solicitação encontrada.</div>')}`;
  },
  col_comunicados(){
    return topBar('Comunicados','colaborador','Gestão do Colaborador')+comunicadosHTML();
  },
  col_ferias(){
    const f=[['Marcos Alves',addDays(24),'p-bad'],['Juliana Prado',addDays(52),'p-warn'],['Carlos Lima',addDays(130),'p-info']];
    const dias=d=>Math.round((d-addDays(0))/864e5);
    return topBar('Férias','colaborador','Gestão do Colaborador')+`<p class="s-muted" style="margin-bottom:10px">Férias pendentes de programar, ordenadas pela mais urgente. Prazo limite de 24 meses a partir da contratação.</p>
    <div class="kpis"><div class="s-card"><b>3</b><span class="s-muted">Pendentes de programar</span></div><div class="s-card" style="border-color:#5c4513"><b style="color:#F4BB0E">1</b><span class="s-muted">Faltando 60 dias ou menos</span></div><div class="s-card" style="border-color:#5c1a2a"><b style="color:#fb7185">1</b><span class="s-muted">Faltando 30 dias ou menos</span></div><div class="s-card" style="border-color:#173a5c"><b style="color:#64C6CC">2</b><span class="s-muted">Já agendadas neste ciclo</span></div></div>
    ${f.map(x=>`<div class="s-card s-row"><span><b>${x[0]}</b><div class="s-muted">Prazo limite ${fmtD(x[1])}</div></span><span class="pill ${x[2]}">Faltam ${dias(x[1])} dias</span></div>`).join('')}`;
  },
  rh(){
    return topBar('Recursos Humanos','home','Início')+`<div class="app-grid" style="margin-top:8px">${RH_TILES.map(t=>`<button class="app-ic" data-go="${t.id}"><span class="ic" style="background:${gradOf(t)};--c:${t.g[0]}"><i data-lucide="${t.icon}"></i></span>${t.name}</button>`).join('')}</div>`;
  },
  seguranca(){
    const back='home', crumb='Início';
    if(state.docAberto){
      const d=DOCS_SST.find(x=>x[0]===state.docAberto);
      return `<div class="app-top"><button data-act="docFechar" aria-label="Voltar"><i data-lucide="chevron-left"></i></button><div><small class="crumb">Segurança do Trabalho</small><h4>${d[0]}</h4></div></div><p class="s-muted" style="margin:-4px 0 12px">${DOCS_SST_DESC[d[0]]}</p>`+
        Array.from({length:d[2]},(_,i)=>`<div class="s-card s-row" data-act="docVer" style="cursor:pointer"><span style="display:flex;gap:10px;align-items:center"><i data-lucide="file-text" style="width:20px;color:#64C6CC"></i><span><b>${d[0]}${d[2]>1?' '+(i+1):''} · ${new Date().getFullYear()}</b><div class="s-muted">PDF · arquivado pela eProtege</div></span></span><i data-lucide="eye" style="width:17px;color:#8b93b0"></i></div>`).join('');
    }
    return topBar('Segurança do Trabalho',back,crumb)+`<p class="s-muted" style="margin:-4px 0 12px">Documentos arquivados pela eProtege para a sua empresa, organizados por tipo. Somente visualização.</p>
    <div class="doc-grid">${DOCS_SST.map(d=>`<button class="doc-card" data-act="docAbrir" data-d="${d[0]}"><span class="ic"><i data-lucide="${d[1]}"></i></span><b>${d[0]}</b><small>${d[2]} documento${d[2]>1?'s':''}</small></button>`).join('')}</div>`;
  },
  rh_docpessoais(){
    const docs=Object.entries(state.docsPessoais);
    return topBar('Documentos Pessoais','rh','Recursos Humanos')+`<p class="s-muted" style="margin:-4px 0 12px">Documentos solicitados pela gestão para o seu cadastro. Anexe os pendentes clicando em "Enviar".</p>`+
      docs.map(([n,st])=>`<div class="s-card s-row"><span><b>${n}</b><div class="s-muted">${st==='pendente'?'Solicitado pela gestão':'Recebido pela gestão'}</div></span>${st==='pendente'?`<button class="s-btn s-btn-sm" data-act="docEnviar" data-d="${n}"><i data-lucide="upload"></i> Enviar</button>`:'<span class="pill p-ok">Enviado</span>'}</div>`).join('');
  },
  rh_folha(){
    const hoje=addDays(0), dias=[];
    for(let i=1;dias.length<6&&i<20;i++){const d=addDays(-i,hoje);if(d.getDay()%6)dias.push(d)}
    const sem=['dom','seg','ter','qua','qui','sex','sáb'];
    let mes=hoje.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});mes=mes.charAt(0).toUpperCase()+mes.slice(1);
    const linhas=dias.map((d,i)=>{const e=['07:58','08:02','07:55','08:10','08:00','07:57'][i],s=['17:04','17:00','17:12','17:30','17:01','16:58'][i];return `<tr><td>${fmtD(d)} <span>${sem[d.getDay()]}</span></td><td>${e}</td><td>12:00</td><td>13:00</td><td>${s}</td></tr>`}).join('');
    return topBar('Folha Ponto','rh','Recursos Humanos')+`<div class="s-row" style="margin-bottom:10px"><b style="font-size:.8rem">${mes}</b><span class="pill p-ok">Banco +06:30</span></div>
    <div class="s-card" style="padding:8px"><table class="folha"><thead><tr><th>Dia</th><th>Ent.</th><th>Alm.</th><th>Volta</th><th>Saída</th></tr></thead><tbody>${linhas}</tbody></table></div>
    <button class="s-btn" style="--g:linear-gradient(90deg,#f59e0b,#d97706)" data-act="folhaPdf"><i data-lucide="download"></i> Baixar espelho de ponto</button>`;
  },
  tratativas(){
    return topBar('Tratativas','home','Início')+tilesGrid(TRAT_TILES);
  },
  tr_pedidos(){
    return topBar('Pedidos de Materiais','tratativas','Tratativas')+`<p class="s-muted" style="margin:-4px 0 12px">Peça materiais de trabalho e acompanhe a entrega.</p>
    <div style="display:grid;grid-template-columns:1fr 54px;gap:6px"><input class="s-input" id="pedItem" placeholder="Material (ex.: fita zebrada)" maxlength="50"><input class="s-input" id="pedQtd" type="number" min="1" value="1"></div>
    <button class="s-btn" data-act="pedir"><i data-lucide="package"></i> Fazer pedido</button>
    <div style="margin-top:12px">${state.pedidos.map(p=>`<div class="s-card s-row fade-in"><span><b>${p.q}x ${esc(p.i)}</b><div class="s-muted">Pedido hoje às ${p.h}</div></span><span class="pill p-warn">Em separação</span></div>`).join('')}
    <div class="s-card s-row"><span><b>2x Cone de sinalização</b><div class="s-muted">Pedido em 29/09</div></span><span class="pill p-ok">Entregue</span></div></div>`;
  },
  tr_melhoria(){
    return topBar('Sugestões / Melhoria','tratativas','Tratativas')+`<p class="s-muted" style="margin:-4px 0 12px">Aponte melhorias no ambiente e nos processos de trabalho.</p>
    <select class="s-input" id="melArea"><option>Segurança</option><option>Ergonomia</option><option>Processos</option><option>Ambiente de trabalho</option><option>Outros</option></select>
    <textarea class="s-input" id="melTexto" rows="3" placeholder="Descreva a melhoria..." maxlength="300"></textarea>
    <button class="s-btn" data-act="melhoria"><i data-lucide="send"></i> Enviar</button>
    <div style="margin-top:12px">${state.melhorias.map(m=>`<div class="s-card fade-in"><div class="s-row"><b>${m.a}</b><span class="pill p-info">Em avaliação</span></div><div class="s-muted" style="margin-top:4px">${esc(m.t)}</div></div>`).join('')}</div>`;
  },
  tr_projeto(){
    return topBar('Projeto Estruturado','tratativas','Tratativas')+`<div class="s-card"><div class="s-row"><b>Ocorrência #0142</b><span class="pill p-warn">Em andamento</span></div><div class="s-muted">Piso escorregadio · Setor de expedição</div></div>
    <div class="s-card tl"><div class="done"><b>Ocorrência registrada</b><div class="s-muted">02/10 · Supervisor</div></div><div class="done"><b>Análise de causa</b><div class="s-muted">03/10 · Téc. Segurança</div></div><div class="now"><b>Plano de ação</b><div class="s-muted">Sinalização + piso antiderrapante</div></div><div><b>Concluída</b><div class="s-muted">Prazo: 15/10</div></div></div>`;
  },
  comercial(){
    const bars=[40,55,48,70,62,85,92];
    return topBar('Área Comercial')+`<div class="kpis"><div class="s-card"><span class="s-muted">Leads no mês</span><b>128</b><span class="pill p-ok">+18%</span></div><div class="s-card"><span class="s-muted">Propostas</span><b>34</b><span class="pill p-info">R$ 212 mil</span></div></div>
    <div class="s-card"><b>Vendas · últimas semanas</b><div class="chart">${bars.map((h,i)=>`<i style="height:${h}%;animation-delay:${i*.07}s"></i>`).join('')}</div></div>
    <div class="s-card"><div class="s-row"><span>Meta do mês</span><b>78%</b></div><div class="bar" style="--g:linear-gradient(90deg,#38bdf8,#2563eb)"><i style="width:78%"></i></div></div>`;
  }
};

let current='home';
function go(id){
  current=id; state.docAberto=null; state.atModal=false; state.epiModal=false;
  if(id==='denuncias'&&!state.protocol) state.denForm=false;
  const body=$('#appBody');
  body.innerHTML=`<div class="fade-in">${SCREENS[id]()}</div>`;
  body.scrollTop=0;
  icons();
  if(id!=='home') selectTab(PARENT[id]||id,false);
}
function rerender(){const b=$('#appBody'),st=b.scrollTop;b.innerHTML=`<div>${SCREENS[current]()}</div>`;b.scrollTop=st;icons()}

$('#appBody').addEventListener('click',e=>{
  const g=e.target.closest('[data-go]'); if(g){go(g.dataset.go);return}
  const a=e.target.closest('[data-act]'); if(!a) return;
  const act=a.dataset.act;
  if(act==='punch'){state.punches.push(nowHM());rerender();toast(PUNCH_LABELS[state.punches.length-1]+' registrada às '+nowHM())}
  if(act==='anon'){state.anon=!state.anon;rerender()}
  if(act==='denunciar'){state.protocol='#'+Math.random().toString(36).slice(2,6).toUpperCase()+'-'+Math.floor(1000+Math.random()*9000);rerender()}
  if(act==='newden'){state.protocol=null;rerender()}
  if(act==='epi'){state.epiSigned=true;rerender();toast('Recebimento do EPI confirmado')}
  if(act==='atAbrir'){state.atModal=true;state.atTipo=null;rerender()}
  if(act==='atFechar'){state.atModal=false;rerender()}
  if(act==='atTipo'){state.atTipo=a.dataset.t;rerender()}
  if(act==='upload'){const bar=$('#upBar');if(bar)bar.style.width='100%';const t=state.atTipo;setTimeout(()=>{state.atestados.unshift({t,h:nowHM()});state.atModal=false;rerender();toast(t+' enviado ao RH')},700)}
  if(act==='docAbrir'){state.docAberto=a.dataset.d;rerender()}
  if(act==='docFechar'){state.docAberto=null;rerender()}
  if(act==='docVer')toast('Abrindo documento para visualização');
  if(act==='docEnviar'){state.docsPessoais[a.dataset.d]='enviado';rerender();toast('Documento enviado à gestão')}
  if(act==='folhaPdf')toast('Espelho de ponto baixado');
  if(act==='denAbrir'){state.denForm=true;rerender()}
  if(act==='epiAbrir'){state.epiModal=true;rerender()}
  if(act==='epiFechar'){state.epiModal=false;rerender()}
  if(act==='epiEnviar'){
    const e=$('#epiItem').value; if(!e){toast('Selecione o EPI');return}
    const s={e,m:$('#epiMotivo').value,q:Math.max(1,+$('#epiQtd').value||1),o:$('#epiObs').value.trim(),st:'Aguardando aprovação'};
    state.epiSolic.unshift(s);state.epiModal=false;rerender();toast('Solicitação de EPI enviada');
    setTimeout(()=>{s.st='Aprovado';if(current==='epi'&&!state.epiModal)rerender()},2500);
  }
  if(act==='epiAssinar'){state.epiSolic[+a.dataset.i].st='Retirado';rerender();toast('Retirada assinada')}
  if(act==='pedir'){const i=$('#pedItem').value.trim();if(!i){toast('Informe o material');return}state.pedidos.unshift({i,q:Math.max(1,+$('#pedQtd').value||1),h:nowHM()});rerender();toast('Pedido enviado')}
  if(act==='melhoria'){const t=$('#melTexto').value.trim();if(!t){toast('Descreva a melhoria');return}state.melhorias.unshift({a:$('#melArea').value,t});rerender();toast('Melhoria enviada')}
  if(act==='feedback'){const t=$('#fbTexto').value.trim();if(!t){toast('Escreva seu feedback');return}state.feedbacks.unshift({p:$('#fbPara').value,t});rerender();toast($('#fbAnon')?.checked===false?'Feedback enviado':'Feedback enviado com sigilo')}
  if(act==='perfil'){state.perfil=true;rerender();toast('Análise concluída')}
  if(act==='trilha')toast('Retomando: Gestão do tempo');
  if(act==='desafio'){state.pontos+=50;rerender();toast('+50 pontos!')}
  if(act==='read'){state.read.add(+a.dataset.i);rerender()}
  if(act==='face'){state.face=+a.dataset.i;rerender();toast('Resposta registrada com sigilo')}
  if(act==='curso')toast('Retomando NR-35 · Aula 4');
  if(act==='holerite')toast('Holerite de setembro baixado');
  if(act==='ferias')toast('Solicitação enviada ao RH');
  if(act==='sugerir'){
    const t=$('#sugTitulo').value.trim(), x=$('#sugTexto').value.trim();
    if(!t||!x){toast('Preencha o título e a sugestão');return}
    state.sugestoes.unshift({t,x,a:$('#sugAnon').checked});rerender();toast('Sugestão enviada!');
  }
  if(act==='novaSolic'){state.novaSolic=!state.novaSolic;rerender()}
  if(act==='solicitar'){
    const s={t:$('#solTipo').value,x:$('#solTexto').value.trim(),st:'Aberto'};
    state.solicitacoes.unshift(s);state.novaSolic=false;rerender();toast('Solicitação aberta');
    setTimeout(()=>{s.st='Em Análise';if(current==='col_solicitacoes')rerender()},2500);
  }
});
$('#appBody').addEventListener('input',e=>{
  if(e.target.id==='buscaFunc'){state.busca=e.target.value;const pos=e.target.selectionStart;rerender();const i=$('#buscaFunc');i.focus();i.setSelectionRange(pos,pos)}
});
setInterval(()=>{const t=nowHM();$('#phoneTime').textContent=t;const c=$('#liveClock');if(c)c.textContent=t},1000);

/* ---------- Module tabs ---------- */
$('#modTabs').innerHTML=MODULES.map(m=>`<button class="mod-tab" data-tab="${m.id}"><span class="ic" style="background:${gradOf(m)};--c:${m.g[0]}"><i data-lucide="${m.icon}"></i></span>${m.name}</button>`).join('');
function selectTab(id,syncPhone=true){
  const m=MODULES.find(x=>x.id===id);
  document.querySelectorAll('.mod-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));
  $('#modDetail').innerHTML=`<div class="fade-in"><h3>${m.name}${m.tag?`<span class="tag">${m.tag}</span>`:''}</h3><p>${m.desc}</p><ul>${m.items.map(i=>`<li><i data-lucide="check-circle-2"></i>${i}</li>`).join('')}</ul></div>`;
  icons();
  if(syncPhone&&current!==id) go(id);
}
$('#modTabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t)selectTab(t.dataset.tab)});
go('home'); selectTab('ponto',false);
