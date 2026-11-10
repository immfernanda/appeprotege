/* Celular interativo do App eProtege (identidade "Noite Azul", espelho do Portal do Cliente).
   Usado pela LP (index.html) e pelo celular.html: mude só aqui. */
const MODULES = [
  {id:'ponto', name:'Cartão Ponto', icon:'clock', tag:'Mais usado',
   desc:'Registro de ponto pelo celular, com horário e localização, e espelho de ponto sempre disponível para o colaborador e o RH.',
   items:['Marcação em um toque','Validação por localização','Espelho de ponto digital','Banco de horas e ajustes']},
  {id:'rh', name:'Recursos Humanos', icon:'folder-lock',
   desc:'Cadastro dos colaboradores, documentos pessoais, relógio ponto, folha de ponto e controle de férias em um só lugar.',
   items:['Cadastro de colaboradores','Documentos pessoais pelo app','Relógio e folha de ponto','Controle de férias e prazos']},
  {id:'seguranca', name:'Documentos SST', icon:'shield-check', tag:'eProtege',
   desc:'Todos os documentos de Saúde e Segurança do Trabalho arquivados pela eProtege para a sua empresa, organizados por tipo e sempre à mão.',
   items:['PGR, PCMSO e LTCAT','ASO dos colaboradores','AEP e LIP','Contrato e outros documentos']},
  {id:'terceiros', name:'Gestão de Terceiros', icon:'building-2',
   desc:'Empresas terceirizadas que prestam serviço na sua empresa, com o checklist de documentos de SST de cada uma e alertas de vencimento.',
   items:['Cadastro de terceirizadas','Checklist de PGR, PCMSO, LTCAT e ASO','Documentos dos funcionários terceiros','Alertas em 15, 30 e 60 dias']},
  {id:'atestados', name:'Atestados / Declarações', icon:'clipboard-check',
   desc:'O colaborador escolhe Atestado ou Declaração, fotografa e envia direto ao RH. Fim dos atestados perdidos no WhatsApp do gestor.',
   items:['Atestado ou declaração','Envio por foto','Acompanhamento do status','Histórico organizado']},
  {id:'epi', name:'EPI', icon:'hard-hat',
   desc:'O colaborador vê os EPIs da função, solicita novos ou trocas e assina a retirada pelo próprio celular.',
   items:['Solicitação de EPI pelo app','Assinatura digital da retirada','Alertas de troca e validade','Ficha de EPI e controle por CA']},
  {id:'ideias', name:'Ideias', icon:'lightbulb',
   desc:'Sugestões de melhoria e projetos estruturados, acompanhados do início ao fim para a ideia virar resultado.',
   items:['Sugestões e melhorias','Envio anônimo','Projeto estruturado com etapas','Histórico auditável']},
  {id:'pedidos', name:'Pedido de Materiais', icon:'package',
   desc:'O colaborador pede materiais de trabalho pelo app e acompanha a separação e a entrega.',
   items:['Pedido em poucos toques','Quantidade por item','Status da separação','Histórico de entregas']},
  {id:'comunicados', name:'Comunicados', icon:'megaphone',
   desc:'Avisos para toda a empresa, por setor ou individuais, com confirmação de leitura de cada colaborador.',
   items:['Comunicados gerais','Por setor','Individuais','Confirmação de leitura']},
  {id:'psicossocial', name:'Risco Psicossocial', icon:'brain', tag:'NR-1',
   desc:'Questionários confidenciais, indicadores organizacionais, perfil, análise de cargo, feedback e gameficação, apoiando a gestão de riscos psicossociais exigida pela NR-1.',
   items:['Questionários anônimos','Indicadores organizacionais','Perfil pessoal e análise de cargo','Feedback e gameficação']},
  {id:'denuncias', name:'Canal de Denúncias', icon:'shield-alert', tag:'Anônimo',
   desc:'Canal 100% anônimo e seguro para relatos de assédio, conduta e segurança, com acompanhamento por protocolo.',
   items:['Denúncia anônima','Protocolo de acompanhamento','Apoio à Lei 14.457/22','Sigilo das informações']},
  {id:'cursos', name:'Integração e Cursos', icon:'graduation-cap',
   desc:'Integração de novos colaboradores, cursos e treinamentos com acompanhamento de progresso e certificados.',
   items:['Integração digital','Cursos e trilhas de NRs','Treinamentos com presença','Certificados']},
  {id:'resultados', name:'Painel de Resultados', icon:'layout-grid',
   desc:'Os números de SST da sua empresa em um painel: colaboradores, ASOs, EPIs, treinamentos e pendências por área.',
   items:['Indicadores da empresa','ASOs e exames em dia','EPIs e treinamentos','Pendências por área']}
];
const $ = s => document.querySelector(s);
const icons = () => lucide.createIcons();
const pad = n => String(n).padStart(2,'0');
const nowHM = () => {const d=new Date();return pad(d.getHours())+':'+pad(d.getMinutes())};
const esc = t => String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtD = d => pad(d.getDate())+'/'+pad(d.getMonth()+1);
const addDays = (n,d=new Date()) => {const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()+n);return x};
const cap = s => s.charAt(0).toUpperCase()+s.slice(1);

// Nome de quem usa o celular de demonstração
let NOME_USUARIO = 'Ana Souza';
const primeiroNome = () => NOME_USUARIO.split(' ')[0];

/* ---------- Estado ---------- */
const state = {punches:[], epiSigned:false, read:new Set(), face:null, anon:true, protocol:null,
  epiModal:false, epiSolic:[], pedidos:[], melhorias:[], feedbacks:[], perfil:false, denForm:false, pontos:1240,
  docAberto:null, docsPessoais:{'RG ou CNH':'enviado','Comprovante de residência':'pendente','Certificado de reservista':'pendente'},
  atModal:false, atTipo:null, atestados:[], busca:'', treinos:new Set(), terceiroDocs:2};
const PUNCHES = [['Entrada','entrada'],['Almoço','almoço'],['Volta','volta'],['Saída','saída']];

function toast(msg){const t=$('#toast');t.querySelector('span').textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(()=>t.classList.remove('show'),2200)}
function confetti(){
  const s=document.querySelector('.screen'), cores=['#4FD1D6','#2864B0','#F4BB0E','#ffffff','#12B0B6'];
  for(let i=0;i<34;i++){const c=document.createElement('i');c.className='confetti';
    c.style.left=Math.random()*100+'%';c.style.background=cores[i%cores.length];
    c.style.setProperty('--dx',(Math.random()*120-60)+'px');c.style.setProperty('--r',(Math.random()*720-360)+'deg');
    c.style.animationDelay=(Math.random()*.25)+'s';s.appendChild(c);setTimeout(()=>c.remove(),2000)}
}
const topBar = (title, back='home', crumb='Início') => `<div class="app-top"><button data-go="${back}" aria-label="Voltar"><i data-lucide="chevron-left"></i></button><div>${crumb?`<small class="crumb">${crumb}</small>`:''}<h4>${title}</h4></div></div>`;
const PARENT = {}; // subtela -> módulo
const tilesGrid = tiles => `<div class="app-grid">${tiles.map(t=>`<button class="area" data-go="${t.id}"><span class="ic"><i data-lucide="${t.icon}"></i></span>${t.name}</button>`).join('')}</div>`;
const sub = (parent,tiles) => {tiles.forEach(t=>PARENT[t.id]=parent);return tiles};
const intro = t => `<p class="s-muted" style="margin:-4px 0 12px">${t}</p>`;

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
const COMUNICADOS = {
  gerais:()=>[...proximosFeriados(2).map(h=>[`${h.fac?'Ponto facultativo':'Feriado'}: ${h.n}`,`${cap(h.d.toLocaleDateString('pt-BR',{weekday:'long'}))}, ${fmtD(h.d)}. ${h.fac?'Confira a escala com seu gestor.':'Não haverá expediente.'}`]),['Exames periódicos','Agende seu exame com a eProtege até o fim do mês.']],
  setor:()=>[['Produção: treinamento de NR-12','Sexta às 9h no refeitório. Presença obrigatória.'],['Manutenção: parada programada','Sábado das 7h às 12h na linha 2.']],
  indiv:()=>[[`${primeiroNome()}, seu ASO periódico vence em 15 dias`,'Agende o exame pelo app ou com o RH.'],['Férias aprovadas','O RH aprovou suas férias. Confira as datas em Recursos Humanos.']]
};
const unreadTotal = () => Object.entries(COMUNICADOS).reduce((n,[k,f])=>n+f().filter((_,i)=>!state.read.has(k+i)).length,0);
function comunicadosHTML(k){
  const list=COMUNICADOS[k](), unread=list.filter((_,i)=>!state.read.has(k+i)).length;
  return `<div class="s-muted" style="margin-bottom:10px">${unread?unread+' não lido(s) · toque para confirmar leitura':'Tudo lido ✓'}</div>`+list.map((c,i)=>`<div class="s-card" data-act="read" data-k="${k+i}" style="cursor:pointer"><div class="s-row"><b>${c[0]}</b>${state.read.has(k+i)?'<span class="pill p-ok">Lido</span>':'<span class="dot"></span>'}</div><div class="s-muted" style="margin-top:4px">${c[1]}</div></div>`).join('');
}

/* ---------- Dados de exemplo ---------- */
const RH_TILES = sub('rh',[{id:'rh_colab',name:'Colaborador',icon:'users'},{id:'rh_docpessoais',name:'Documentos Pessoais',icon:'file-user'},{id:'rh_relogio',name:'Relógio Ponto',icon:'clock'},{id:'rh_folha',name:'Folha Ponto',icon:'file-text'},{id:'rh_ferias',name:'Férias',icon:'plane'}]);
const IDEIAS_TILES = sub('ideias',[{id:'id_melhoria',name:'Sugestões / Melhoria',icon:'lightbulb'},{id:'id_projeto',name:'Projeto Estruturado',icon:'layers'}]);
const COM_TILES = sub('comunicados',[{id:'com_gerais',name:'Gerais',icon:'megaphone'},{id:'com_setor',name:'Setorizado',icon:'network'},{id:'com_indiv',name:'Individual',icon:'user-round'}]);
const PSICO_TILES = sub('psicossocial',[{id:'ps_riscos',name:'Riscos Psicossociais',icon:'circle-alert'},{id:'ps_org',name:'Organizacional',icon:'building'},{id:'ps_dev',name:'Desenvolvimento Pessoal e Liderança',icon:'trending-up'},{id:'ps_perfil',name:'Análise Perfil Pessoal',icon:'user-search'},{id:'ps_cargo',name:'Análise de Cargo',icon:'briefcase'},{id:'ps_feedback',name:'Feedback',icon:'message-square'},{id:'ps_game',name:'Gameficação',icon:'trophy'}]);
const CURSOS_TILES = sub('cursos',[{id:'cu_integracao',name:'Integração',icon:'door-open'},{id:'cu_cursos',name:'Cursos',icon:'graduation-cap'},{id:'cu_treinos',name:'Treinamentos',icon:'presentation'}]);
const RES_TILES = sub('resultados',[{id:'re_empresa',name:'Empresa',icon:'building-2'},{id:'re_dash',name:'Dashboard',icon:'chart-column'}]);
const EPIS = ['Capacete de segurança','Óculos de proteção','Protetor facial','Protetor auricular tipo plug','Protetor auricular tipo concha','Máscara PFF2','Respirador semifacial com filtro','Luva de vaqueta','Luva nitrílica','Luva de látex','Luva isolante (eletricista)','Mangote de proteção','Avental de PVC','Botina de segurança','Bota de PVC (borracha)','Cinto de segurança tipo paraquedista','Talabarte duplo','Colete refletivo','Creme de proteção para as mãos','Vestimenta antichama'];
const EPI_MOTIVOS = ['Primeira solicitação','Troca por desgaste','Perda ou extravio','Dano ou defeito','Fim da validade'];
const EPI_PILL = {'Aguardando aprovação':'p-warn','Aprovado':'p-info','Retirado':'p-ok'};
const DOCS_SST = [['AEP','activity',1],['ASO','stethoscope',3],['Contrato','file-pen-line',1],['LIP','flask-conical',1],['LTCAT','wind',1],['Outros','file-question',2],['PCMSO','heart-pulse',1],['PGR','shield-alert',1]];
const DOCS_SST_DESC = {AEP:'Avaliação Ergonômica Preliminar',ASO:'Atestados de Saúde Ocupacional',Contrato:'Contrato de prestação de serviços',LIP:'Laudo de Insalubridade e Periculosidade',LTCAT:'Laudo Técnico das Condições Ambientais',Outros:'Documentos complementares',PCMSO:'Programa de Controle Médico de Saúde Ocupacional',PGR:'Programa de Gerenciamento de Riscos'};
const FUNCIONARIOS = [['Ana Souza','Operadora · Produção','Ativo','p-ok'],['Carlos Lima','Técnico de Segurança','Ativo','p-ok'],['Juliana Prado','Assistente de RH','Ativa','p-ok'],['Marcos Alves','Motorista','Afastado','p-warn'],['Patrícia Reis','Analista Comercial','Ativa','p-ok']];
const TERCEIROS = [['Elétrica Silva Ltda','Manutenção elétrica · 4 funcionários',100,'Documentos em dia','p-ok'],['Limpeza Brilho','Limpeza · 6 funcionários',80,'ASO vence em 12 dias','p-warn'],['Construtora Alfa','Obra · 9 funcionários',55,'NR-35 não enviada','p-bad']];

/* ---------- Cartão de ponto (início e Relógio Ponto) ---------- */
function workedMin(){
  const p=state.punches; if(!p.length) return 0;
  const t=x=>x.getTime(), now=Date.now();
  let m=(p[1]?t(p[1]):now)-t(p[0]);
  if(p[2]) m+=(p[3]?t(p[3]):now)-t(p[2]);
  return Math.max(0,Math.round(m/60000));
}
function pontoCard(){
  const n=state.punches.length, w=workedMin(), C=2*Math.PI*28, frac=Math.min(w/480,1);
  const [h,m]=nowHM().split(':');
  return `<div class="pc"><div class="pc-lbl">REGISTRAR PONTO</div>
  <div class="pc-top"><div class="pc-clock" id="liveClock">${h}<i>:</i>${m}</div>
  <div class="ring"><svg viewBox="0 0 66 66"><circle class="bg" cx="33" cy="33" r="28"/><circle class="fg" cx="33" cy="33" r="28" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-Math.max(frac,n?.04:0))}"/></svg><div><b>${Math.floor(w/60)}h${pad(w%60)}</b><small>de 8h trabalhadas</small></div></div></div>
  <div class="punches">${PUNCHES.map((p,i)=>`<div class="${i===n?'next':''}"><span>${p[0].toUpperCase()}</span><b>${state.punches[i]?pad(state.punches[i].getHours())+':'+pad(state.punches[i].getMinutes()):'--:--'}</b></div>`).join('')}</div>
  ${n<4?`<button class="pc-btn" data-act="punch">Registrar ${PUNCHES[n][1]} <i data-lucide="arrow-right"></i></button>`:`<span class="pc-done">Jornada completa ✓ Bom descanso!</span>`}</div>`;
}
function atencao(){
  const it=[];
  if(!state.epiSigned) it.push(['hard-hat','Assinar o recebimento do protetor auricular','epi']);
  if(state.docsPessoais['Comprovante de residência']==='pendente') it.push(['file-user','Enviar comprovante de residência','rh_docpessoais']);
  const u=unreadTotal(); if(u) it.push(['megaphone',`${u} comunicado${u>1?'s':''} sem leitura`,'comunicados']);
  return `<div class="att"><b>Precisa da sua atenção</b>${it.length?it.map(x=>`<button class="att-it" data-go="${x[2]}"><span class="ai"><i data-lucide="${x[0]}"></i></span>${x[1]}<i data-lucide="chevron-right"></i></button>`).join('')
    :`<div class="att-ok"><i data-lucide="circle-check"></i><b>Tudo em dia por aqui</b><span>Nenhuma pendência no momento.</span></div>`}</div>`;
}

const SCREENS = {
  home(){
    const d=new Date(), hr=d.getHours(), noite=hr<6||hr>=18;
    const saud=hr<12&&hr>=5?'Bom dia':hr<18&&hr>=12?'Boa tarde':'Boa noite';
    return `<div class="hi"><span class="sky ${noite?'night':''}"><i data-lucide="${noite?'moon':'sun'}"></i></span><div><h4>${saud}, <span>${esc(primeiroNome())}</span></h4><small>${cap(d.toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long'}))}</small></div></div>
    ${pontoCard()}${atencao()}
    <div class="sec">Áreas</div>
    <div class="areas">${MODULES.filter(m=>m.id!=='ponto').map(m=>`<button class="area" data-go="${m.id}"><span class="ic"><i data-lucide="${m.icon}"></i></span>${m.name}</button>`).join('')}</div>`;
  },
  ponto(back='home',title='Relógio Ponto',crumb='Início'){
    return topBar(title,back,crumb)+intro('Bata seu ponto e acompanhe seus registros do dia.')+pontoCard()+
    `<div style="text-align:center;margin:-2px 0 12px"><span class="geo"><i data-lucide="map-pin"></i> Localização validada</span></div>
    <b style="font-size:.76rem;display:block;margin-bottom:8px">Registros de hoje</b>
    ${state.punches.map((p,i)=>`<div class="s-card s-row fade-in"><span>${PUNCHES[i][0]}</span><span class="pill p-ok">${pad(p.getHours())}:${pad(p.getMinutes())}</span></div>`).join('')||'<div class="s-muted" style="text-align:center;margin-bottom:12px">Nenhum registro hoje</div>'}
    <button class="s-btn ghost" data-go="rh_folha"><i data-lucide="file-text"></i> Ver folha de ponto</button>`;
  },
  rh_relogio(){ return SCREENS.ponto('rh','Relógio Ponto','Recursos Humanos'); },
  perfil(){
    const ini=NOME_USUARIO.split(' ').map(p=>p[0]).join('').slice(0,2);
    return topBar('Perfil','home','Início')+`<div class="prof"><span class="av-mini">${esc(ini)}</span><b style="font-size:.9rem">${esc(NOME_USUARIO)}</b><div class="s-muted">Operadora de Produção</div></div>
    <div class="s-card"><div class="streak"><span class="ic"><i data-lucide="flame"></i></span><div><b>5 dias seguidos no horário</b><div class="s-muted">Continue assim! Sua sequência aparece aqui.</div></div></div><div class="days">${[1,1,1,1,1,0,0].map(o=>`<i class="${o?'on':''}"></i>`).join('')}</div></div>
    ${[['file-user','Meus documentos','rh_docpessoais'],['hard-hat','Meus EPIs','epi'],['clipboard-check','Meus atestados','atestados'],['file-text','Minha folha de ponto','rh_folha']].map(x=>`<button class="link-row" data-go="${x[2]}"><i data-lucide="${x[0]}" class="ic-t"></i>${x[1]}<i data-lucide="chevron-right"></i></button>`).join('')}`;
  },

  /* Recursos Humanos */
  rh(){ return topBar('Recursos Humanos')+tilesGrid(RH_TILES); },
  rh_colab(){
    const q=state.busca.toLowerCase(), list=FUNCIONARIOS.filter(f=>f[0].toLowerCase().includes(q)||f[1].toLowerCase().includes(q));
    return topBar('Colaborador','rh','Recursos Humanos')+`<div class="kpis"><div class="s-card"><b>5</b><span class="s-muted">Total</span></div><div class="s-card"><b>4</b><span class="s-muted">Ativos</span></div><div class="s-card"><b style="color:#F4BB0E">1</b><span class="s-muted">Afastados</span></div><div class="s-card"><b>0</b><span class="s-muted">Desligados ou suspensos</span></div></div>
    <input class="s-input" id="buscaFunc" placeholder="Buscar colaborador..." value="${esc(state.busca)}">
    ${list.map(f=>`<div class="s-card s-row" style="justify-content:flex-start;gap:10px"><span class="av-mini">${f[0].split(' ').map(p=>p[0]).join('')}</span><div style="flex:1;min-width:0"><b>${f[0]}</b><div class="s-muted">${f[1]}</div></div><span class="pill ${f[3]}">${f[2]}</span></div>`).join('')||'<div class="empty">Nenhum colaborador encontrado.</div>'}
    <button class="s-btn" data-act="novoFunc"><i data-lucide="user-plus"></i> Novo funcionário</button>`;
  },
  rh_docpessoais(){
    const docs=Object.entries(state.docsPessoais);
    return topBar('Documentos Pessoais','rh','Recursos Humanos')+intro('Documentos solicitados pela gestão para o seu cadastro. Anexe os pendentes tocando em "Enviar".')+
      docs.map(([n,st])=>`<div class="s-card s-row"><span><b>${n}</b><div class="s-muted">${st==='pendente'?'Solicitado pela gestão':'Recebido pela gestão'}</div></span>${st==='pendente'?`<button class="s-btn s-btn-sm" data-act="docEnviar" data-d="${n}"><i data-lucide="upload"></i> Enviar</button>`:'<span class="pill p-ok">Enviado</span>'}</div>`).join('');
  },
  rh_folha(){
    const hoje=addDays(0), dias=[];
    for(let i=1;dias.length<6&&i<20;i++){const d=addDays(-i,hoje);if(d.getDay()%6)dias.push(d)}
    const sem=['dom','seg','ter','qua','qui','sex','sáb'];
    const linhas=dias.map((d,i)=>`<tr><td>${fmtD(d)} <span>${sem[d.getDay()]}</span></td><td>${['07:58','08:02','07:55','08:10','08:00','07:57'][i]}</td><td>12:00</td><td>13:00</td><td>${['17:04','17:00','17:12','17:30','17:01','16:58'][i]}</td></tr>`).join('');
    return topBar('Folha Ponto','rh','Recursos Humanos')+`<div class="s-row" style="margin-bottom:10px"><b style="font-size:.78rem">${cap(hoje.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}))}</b><span class="pill p-ok">Banco +06:30</span></div>
    <div class="s-card" style="padding:8px"><table class="folha"><thead><tr><th>Dia</th><th>Ent.</th><th>Alm.</th><th>Volta</th><th>Saída</th></tr></thead><tbody>${linhas}</tbody></table></div>
    <button class="s-btn" data-act="folhaPdf"><i data-lucide="download"></i> Baixar espelho de ponto</button>`;
  },
  rh_ferias(){
    const f=[['Marcos Alves',addDays(24),'p-bad'],['Juliana Prado',addDays(52),'p-warn'],['Carlos Lima',addDays(130),'p-info']];
    const dias=d=>Math.round((d-addDays(0))/864e5);
    return topBar('Férias','rh','Recursos Humanos')+intro('Férias pendentes de programar, da mais urgente para a menos urgente. Prazo limite de 24 meses a partir da contratação.')+
    `<div class="kpis"><div class="s-card"><b>3</b><span class="s-muted">Pendentes de programar</span></div><div class="s-card"><b style="color:#F4BB0E">1</b><span class="s-muted">Faltando 60 dias ou menos</span></div><div class="s-card"><b style="color:#fb7185">1</b><span class="s-muted">Faltando 30 dias ou menos</span></div><div class="s-card"><b style="color:#6FD6DA">2</b><span class="s-muted">Já agendadas neste ciclo</span></div></div>
    ${f.map(x=>`<div class="s-card s-row"><span><b>${x[0]}</b><div class="s-muted">Prazo limite ${fmtD(x[1])}</div></span><span class="pill ${x[2]}">Faltam ${dias(x[1])} dias</span></div>`).join('')}`;
  },

  /* Documentos SST */
  seguranca(){
    if(state.docAberto){
      const d=DOCS_SST.find(x=>x[0]===state.docAberto);
      return `<div class="app-top"><button data-act="docFechar" aria-label="Voltar"><i data-lucide="chevron-left"></i></button><div><small class="crumb">Documentos SST</small><h4>${d[0]}</h4></div></div>`+intro(DOCS_SST_DESC[d[0]])+
        Array.from({length:d[2]},(_,i)=>`<div class="s-card s-row" data-act="docVer" style="cursor:pointer"><span style="display:flex;gap:10px;align-items:center"><i data-lucide="file-text" class="ic-t"></i><span><b>${d[0]}${d[2]>1?' '+(i+1):''} · ${new Date().getFullYear()}</b><div class="s-muted">PDF · arquivado pela eProtege</div></span></span><i data-lucide="eye" style="width:17px;color:#8b98b8"></i></div>`).join('');
    }
    return topBar('Documentos SST')+intro('Documentos arquivados pela eProtege para a sua empresa, organizados por tipo. Somente visualização.')+
    `<div class="doc-grid">${DOCS_SST.map(d=>`<button class="doc-card" data-act="docAbrir" data-d="${d[0]}"><span class="ic"><i data-lucide="${d[1]}"></i></span><b>${d[0]}</b><small>${d[2]} documento${d[2]>1?'s':''}</small></button>`).join('')}</div>`;
  },

  /* Gestão de Terceiros */
  terceiros(){
    return topBar('Gestão de Terceiros')+intro('Empresas terceirizadas que prestam serviço aqui, com o checklist de documentos de SST de cada uma.')+
    `<div class="kpis"><div class="s-card"><b style="color:${state.terceiroDocs?'#F4BB0E':'#6FD6DA'}">${state.terceiroDocs}</b><span class="s-muted">Documentos para validar</span></div><div class="s-card"><b>3</b><span class="s-muted">Empresas terceiras</span></div></div>
    ${TERCEIROS.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill ${x[4]}">${x[3]}</span></div><div class="s-muted" style="margin-top:3px">${x[1]}</div><div class="s-row" style="margin-top:2px"><div class="bar" style="flex:1"><i style="width:${x[2]}%"></i></div><span class="s-muted" style="margin-top:8px">${x[2]}%</span></div></div>`).join('')}
    ${state.terceiroDocs?`<button class="s-btn" data-act="validar"><i data-lucide="badge-check"></i> Validar ${state.terceiroDocs} documentos</button>`:`<button class="s-btn ghost" data-act="novaEmpresa"><i data-lucide="plus"></i> Nova empresa</button>`}`;
  },

  /* Atestados */
  atestados(){
    const modal=!state.atModal?'':`<div class="ph-modal fade-in"><div class="ph-sheet">
      <div class="s-row" style="margin-bottom:12px"><b>${state.atTipo?'Enviar '+state.atTipo:'Enviar Atestado / Declaração'}</b><button class="ph-x" data-act="atFechar" aria-label="Fechar"><i data-lucide="x"></i></button></div>
      ${!state.atTipo?`<div class="kpis" style="margin:0"><button class="opt" data-act="atTipo" data-t="Atestado"><i data-lucide="stethoscope"></i>Atestado</button><button class="opt" data-act="atTipo" data-t="Declaração"><i data-lucide="file-text"></i>Declaração</button></div>`
      :`<div class="drop" data-act="upload"><i data-lucide="camera"></i><b>Toque para fotografar</b><div class="s-muted">ou escolher um arquivo</div><div class="bar"><i id="upBar" style="width:0%"></i></div></div>`}
    </div></div>`;
    return topBar('Atestados / Declarações')+intro('Envie seu atestado ou declaração e acompanhe os que você já enviou.')+
    `<button class="s-btn" data-act="atAbrir"><i data-lucide="plus"></i> Enviar Atestado / Declaração</button>
    <div style="margin-top:14px">${state.atestados.map(a=>`<div class="s-card s-row fade-in"><span><b>${a.t}</b><div class="s-muted">Enviado hoje às ${a.h}</div></span><span class="pill p-warn">Em análise</span></div>`).join('')}
    <div class="s-card s-row"><span><b>Declaração</b><div class="s-muted">Comparecimento · ${fmtD(addDays(-20))}</div></span><span class="pill p-ok">Aprovado</span></div>
    <div class="s-card s-row"><span><b>Atestado</b><div class="s-muted">Consulta médica · ${fmtD(addDays(-48))}</div></span><span class="pill p-ok">Aprovado</span></div></div>${modal}`;
  },

  /* EPI */
  epi(){
    const modal=!state.epiModal?'':`<div class="ph-modal fade-in"><div class="ph-sheet">
      <div class="s-row" style="margin-bottom:10px"><b>Solicitar EPI</b><button class="ph-x" data-act="epiFechar" aria-label="Fechar"><i data-lucide="x"></i></button></div>
      <label class="s-lbl">EPI</label><select class="s-input" id="epiItem"><option value="">Selecione...</option>${EPIS.map(e=>`<option>${e}</option>`).join('')}</select>
      <div style="display:grid;grid-template-columns:1fr 52px;gap:6px"><div><label class="s-lbl">Motivo</label><select class="s-input" id="epiMotivo">${EPI_MOTIVOS.map(m=>`<option>${m}</option>`).join('')}</select></div><div><label class="s-lbl">Qtd.</label><input class="s-input" id="epiQtd" type="number" min="1" value="1"></div></div>
      <label class="s-lbl">Observação (opcional)</label><textarea class="s-input" id="epiObs" rows="2" maxlength="150"></textarea>
      <div class="s-row"><button class="ph-x" data-act="epiFechar" style="font-size:.72rem">Cancelar</button><button class="s-btn s-btn-sm" data-act="epiEnviar">Enviar solicitação</button></div>
    </div></div>`;
    return topBar('EPI')+`<div class="s-row" style="margin:-4px 0 12px;align-items:flex-start"><p class="s-muted" style="flex:1">Veja o que você precisa, solicite e assine a retirada dos seus EPIs.</p><button class="s-btn s-btn-sm" data-act="epiAbrir"><i data-lucide="send"></i> Solicitar EPI</button></div>
    <b style="font-size:.78rem;display:block;margin-bottom:8px">Minhas solicitações</b>
    ${state.epiSolic.map((s,i)=>`<div class="s-card fade-in"><div class="s-row"><b>${s.q}x ${s.e}</b><span class="pill ${EPI_PILL[s.st]}">${s.st}</span></div><div class="s-muted" style="margin-top:3px">${s.m}${s.o?' · '+esc(s.o):''}</div>${s.st==='Aprovado'?`<button class="s-btn s-btn-sm" data-act="epiAssinar" data-i="${i}" style="margin-top:8px"><i data-lucide="pen-line"></i> Assinar retirada</button>`:''}</div>`).join('')||'<div class="s-muted" style="margin-bottom:12px">Nenhuma solicitação ainda.</div>'}
    <b style="font-size:.78rem;display:block;margin:12px 0 8px">Meus EPIs</b>
    <div class="s-card"><div class="s-row"><b>Capacete de segurança</b><span class="pill p-ok">Em uso</span></div><div class="s-muted">CA 31469 · Entregue em ${fmtD(addDays(-85))}</div></div>
    <div class="s-card"><div class="s-row"><b>Luva nitrílica</b><span class="pill p-warn">Troca em 5 dias</span></div><div class="s-muted">CA 28011 · Entregue em ${fmtD(addDays(-25))}</div></div>
    <div class="s-card"><div class="s-row"><b>Protetor auricular</b><span class="pill ${state.epiSigned?'p-ok':'p-bad'}">${state.epiSigned?'Recebido':'Aguardando assinatura'}</span></div><div class="s-muted">CA 5745 · Nova entrega</div></div>
    ${state.epiSigned?'':`<button class="s-btn" data-act="epi"><i data-lucide="pen-line"></i> Confirmar recebimento</button>`}${modal}`;
  },

  /* Ideias */
  ideias(){ return topBar('Ideias')+tilesGrid(IDEIAS_TILES); },
  id_melhoria(){
    return topBar('Sugestões / Melhoria','ideias','Ideias')+intro('Aponte melhorias no ambiente e nos processos de trabalho.')+
    `<select class="s-input" id="melArea"><option>Segurança</option><option>Ergonomia</option><option>Processos</option><option>Ambiente de trabalho</option><option>Outros</option></select>
    <textarea class="s-input" id="melTexto" rows="3" placeholder="Descreva sua ideia..." maxlength="300"></textarea>
    <label class="s-check"><input type="checkbox" id="melAnon"> Enviar anonimamente</label>
    <button class="s-btn" data-act="melhoria"><i data-lucide="send"></i> Enviar</button>
    <div style="margin-top:12px">${state.melhorias.map(m=>`<div class="s-card fade-in"><div class="s-row"><b>${m.a}</b><span class="pill p-info">Em avaliação</span></div><div class="s-muted" style="margin-top:4px">${esc(m.t)}</div><div class="s-muted" style="margin-top:6px">${m.anon?'Anônimo':esc(NOME_USUARIO)} · agora</div></div>`).join('')||'<div class="empty"><i data-lucide="lightbulb"></i>Nenhuma ideia enviada ainda.</div>'}</div>`;
  },
  id_projeto(){
    return topBar('Projeto Estruturado','ideias','Ideias')+`<div class="s-card"><div class="s-row"><b>Ocorrência #0142</b><span class="pill p-warn">Em andamento</span></div><div class="s-muted">Piso escorregadio · Setor de expedição</div></div>
    <div class="s-card tl"><div class="done"><b>Ocorrência registrada</b><div class="s-muted">${fmtD(addDays(-8))} · Supervisor</div></div><div class="done"><b>Análise de causa</b><div class="s-muted">${fmtD(addDays(-7))} · Téc. Segurança</div></div><div class="now"><b>Plano de ação</b><div class="s-muted">Sinalização + piso antiderrapante</div></div><div><b>Concluída</b><div class="s-muted">Prazo: ${fmtD(addDays(5))}</div></div></div>`;
  },

  /* Pedido de Materiais */
  pedidos(){
    return topBar('Pedido de Materiais')+intro('Peça materiais de trabalho e acompanhe a entrega.')+
    `<div style="display:grid;grid-template-columns:1fr 54px;gap:6px"><input class="s-input" id="pedItem" placeholder="Material (ex.: fita zebrada)" maxlength="50"><input class="s-input" id="pedQtd" type="number" min="1" value="1"></div>
    <button class="s-btn" data-act="pedir"><i data-lucide="package"></i> Fazer pedido</button>
    <div style="margin-top:12px">${state.pedidos.map(p=>`<div class="s-card s-row fade-in"><span><b>${p.q}x ${esc(p.i)}</b><div class="s-muted">Pedido hoje às ${p.h}</div></span><span class="pill p-warn">Em separação</span></div>`).join('')}
    <div class="s-card s-row"><span><b>2x Cone de sinalização</b><div class="s-muted">Pedido em ${fmtD(addDays(-6))}</div></span><span class="pill p-ok">Entregue</span></div></div>`;
  },

  /* Comunicados */
  comunicados(){ return topBar('Comunicados')+tilesGrid(COM_TILES); },
  com_gerais(){ return topBar('Comunicados gerais','comunicados','Comunicados')+intro('Avisos para toda a empresa.')+comunicadosHTML('gerais'); },
  com_setor(){ return topBar('Comunicados por setor','comunicados','Comunicados')+intro('Avisos do seu setor.')+comunicadosHTML('setor'); },
  com_indiv(){ return topBar('Comunicados individuais','comunicados','Comunicados')+intro('Avisos só para você.')+comunicadosHTML('indiv'); },

  /* Risco Psicossocial */
  psicossocial(){ return topBar('Risco Psicossocial')+tilesGrid(PSICO_TILES); },
  ps_riscos(){
    return topBar('Riscos Psicossociais','psicossocial','Risco Psicossocial')+`<div class="s-card"><span class="s-muted">Pergunta 3 de 10</span><div class="bar"><i style="width:30%"></i></div><p style="margin-top:14px;font-size:.84rem;font-weight:600">Como você avalia sua carga de trabalho nas últimas semanas?</p>
    <div class="faces">${['😣','🙁','😐','🙂','😄'].map((f,i)=>`<button data-act="face" data-i="${i}" class="${state.face===i?'sel':''}">${f}</button>`).join('')}</div>
    <div class="s-row s-muted"><span>Muito pesada</span><span>Tranquila</span></div></div>
    <div class="s-card s-row" style="gap:10px"><i data-lucide="lock" class="ic-t"></i><span class="s-muted">Respostas anônimas e confidenciais. Só resultados agregados são analisados.</span></div>`;
  },
  ps_org(){
    const ind=[['Clima organizacional',78],['Comunicação interna',64],['Reconhecimento',58],['Equilíbrio vida e trabalho',71]];
    return topBar('Organizacional','psicossocial','Risco Psicossocial')+intro('Indicadores agregados da empresa. Nenhuma resposta individual é exibida.')+
      ind.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill ${x[1]>=70?'p-ok':x[1]>=60?'p-warn':'p-bad'}">${x[1]}%</span></div><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('');
  },
  ps_dev(){
    const t=[['Comunicação assertiva',80],['Gestão do tempo',45],['Liderança de equipes',20]];
    return topBar('Desenvolvimento Pessoal e Liderança','psicossocial','Risco Psicossocial')+intro('Trilhas para desenvolver competências e formar novas lideranças.')+
      t.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill p-info">${x[1]}%</span></div><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('')+
      `<button class="s-btn" data-act="trilha"><i data-lucide="play"></i> Continuar trilha</button>`;
  },
  ps_perfil(){
    const p=[['Executor',72],['Comunicador',58],['Planejador',81],['Analista',64]];
    return topBar('Análise Perfil Pessoal','psicossocial','Risco Psicossocial')+(state.perfil?
      `<div class="s-card" style="text-align:center"><b>Seu perfil predominante: Planejador</b><div class="s-muted" style="margin-top:4px">Organizado, constante e cuidadoso com os processos.</div></div>`+p.map(x=>`<div class="s-card"><div class="s-row"><span>${x[0]}</span><b>${x[1]}%</b></div><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('')
      :`<div class="s-card" style="text-align:center;padding:22px 12px"><i data-lucide="user-search" style="display:block;width:34px;height:34px;color:#4FD1D6;margin:0 auto 10px"></i><b>Descubra seu perfil comportamental</b><p class="s-muted" style="margin:6px 0 14px">São 24 perguntas rápidas, cerca de 5 minutos.</p><button class="s-btn" data-act="perfil"><i data-lucide="play"></i> Iniciar análise</button></div>`);
  },
  ps_cargo(){
    return topBar('Análise de Cargo','psicossocial','Risco Psicossocial')+`<div class="s-card"><span class="s-muted">Cargo</span><b style="display:block;font-size:.84rem">Operadora de Produção</b><span class="s-muted">Setor de Produção · CBO 7841-05</span></div>
    <div class="s-card"><b>Principais atividades</b><ul class="s-list"><li>Operar máquinas da linha de produção</li><li>Conferir a qualidade das peças</li><li>Manter o posto de trabalho organizado</li></ul></div>
    <div class="s-card"><b>Exigências do cargo</b><div class="s-row" style="margin-top:6px"><span class="s-muted">Esforço físico</span><span class="pill p-warn">Moderado</span></div><div class="s-row" style="margin-top:4px"><span class="s-muted">Ritmo de trabalho</span><span class="pill p-warn">Alto</span></div><div class="s-row" style="margin-top:4px"><span class="s-muted">Autonomia</span><span class="pill p-info">Média</span></div></div>`;
  },
  ps_feedback(){
    return topBar('Feedback','psicossocial','Risco Psicossocial')+`<label class="s-lbl">Para quem?</label><select class="s-input" id="fbPara"><option>Meu gestor</option><option>Minha equipe</option><option>RH</option><option>Empresa</option></select>
    <textarea class="s-input" id="fbTexto" rows="3" placeholder="Escreva seu feedback..." maxlength="300"></textarea>
    <label class="s-check"><input type="checkbox" id="fbAnon" checked> Enviar anonimamente</label>
    <button class="s-btn" data-act="feedback"><i data-lucide="send"></i> Enviar feedback</button>
    <div style="margin-top:12px">${state.feedbacks.map(f=>`<div class="s-card fade-in"><div class="s-row"><b>Para: ${f.p}</b><span class="pill p-ok">Enviado</span></div><div class="s-muted" style="margin-top:4px">${esc(f.t)}</div></div>`).join('')}</div>`;
  },
  ps_game(){
    const r=[[NOME_USUARIO,state.pontos],['Carlos Lima',1180],['Juliana Prado',990]].sort((a,b)=>b[1]-a[1]);
    return topBar('Gameficação','psicossocial','Risco Psicossocial')+`<div class="s-card" style="text-align:center"><span class="s-muted">Seus pontos</span><b style="display:block;font-size:1.6rem;font-weight:300;color:#4FD1D6">${state.pontos}</b><span class="pill p-info">Nível 5 · Guardião da Segurança</span></div>
    <div class="s-card"><b>Desafio da semana</b><div class="s-muted" style="margin:4px 0 8px">Responda o questionário de bem-estar e ganhe 50 pontos.</div><button class="s-btn s-btn-sm" data-act="desafio"><i data-lucide="zap"></i> Fazer agora</button></div>
    <div class="s-card"><b>Ranking da equipe</b>${r.map((x,i)=>`<div class="s-row" style="margin-top:6px"><span>${i+1}º ${esc(x[0])}</span><b>${x[1]}</b></div>`).join('')}</div>`;
  },

  /* Canal de Denúncias */
  denuncias(){
    if(!state.denForm&&!state.protocol) return topBar('Canal de Denúncias')+intro('Registre uma denúncia de forma anônima e segura.')+
    `<div class="s-card" style="text-align:center;padding:26px 14px"><i data-lucide="shield-alert" style="display:block;width:34px;height:34px;color:#4FD1D6;margin:0 auto 12px"></i><b style="font-size:.84rem">Precisa relatar algo?</b>
    <p class="s-muted" style="margin:8px 0 16px;line-height:1.5">O canal de denúncias é anônimo e seguro. Você não precisa se identificar, e ninguém no Portal do Cliente tem acesso a casos individuais.</p>
    <button class="s-btn" data-act="denAbrir">Registrar uma denúncia <i data-lucide="arrow-right"></i></button></div>`;
    if(state.protocol) return topBar('Canal de Denúncias')+`<div class="s-card" style="text-align:center;padding:24px 12px"><i data-lucide="shield-check" style="display:block;width:40px;height:40px;color:#4FD1D6;margin:0 auto 10px"></i><b>Denúncia enviada com sigilo</b><p class="s-muted" style="margin:6px 0 12px">Guarde seu protocolo para acompanhar:</p><span class="pill p-info" style="font-size:.85rem;padding:6px 14px">${state.protocol}</span></div><button class="s-btn ghost" data-act="newden">Nova denúncia</button>`;
    return topBar('Canal de Denúncias')+`<div class="toggle"><span><b>Enviar anonimamente</b><br><span class="s-muted">Sua identidade não será revelada</span></span><button class="switch ${state.anon?'':'off'}" data-act="anon" aria-label="Anônimo"></button></div>
    <select class="s-input"><option>Assédio moral</option><option>Assédio sexual</option><option>Segurança do trabalho</option><option>Conduta antiética</option><option>Outros</option></select>
    <textarea class="s-input" rows="4" placeholder="Descreva o ocorrido..."></textarea>
    <button class="s-btn" data-act="denunciar"><i data-lucide="send"></i> Enviar denúncia</button>`;
  },

  /* Integração e Cursos */
  cursos(){ return topBar('Integração e Cursos')+tilesGrid(CURSOS_TILES); },
  cu_integracao(){
    const e=[['Boas vindas à empresa',1],['Normas internas e conduta',1],['Riscos do seu setor',1],['Uso correto de EPI',0],['Termo de ciência assinado',0]];
    return topBar('Integração','cursos','Integração e Cursos')+`<div class="s-card"><div class="s-row"><b>Sua integração</b><span class="pill p-info">60%</span></div><div class="bar"><i style="width:60%"></i></div></div>
    <div class="s-card tl">${e.map((x,i)=>`<div class="${x[1]?'done':i===3?'now':''}"><b>${x[0]}</b><div class="s-muted">${x[1]?'Concluído':i===3?'Em andamento':'Pendente'}</div></div>`).join('')}</div>
    <button class="s-btn" data-act="curso"><i data-lucide="play"></i> Continuar integração</button>`;
  },
  cu_cursos(){
    const c=[['Integração eProtege',100],['NR-35 · Trabalho em altura',60],['NR-06 · Uso de EPI',20]];
    return topBar('Cursos','cursos','Integração e Cursos')+c.map(x=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b><span class="pill ${x[1]===100?'p-ok':'p-info'}">${x[1]===100?'Concluído':x[1]+'%'}</span></div><div class="bar"><i style="width:${x[1]}%"></i></div></div>`).join('')+`<button class="s-btn" data-act="curso"><i data-lucide="play"></i> Continuar curso</button>`;
  },
  cu_treinos(){
    const t=[['NR-12 · Máquinas e equipamentos',addDays(3),'09:00','Refeitório'],['Brigada de incêndio',addDays(9),'14:00','Pátio externo']];
    return topBar('Treinamentos','cursos','Integração e Cursos')+intro('Treinamentos presenciais agendados para você.')+
    t.map((x,i)=>`<div class="s-card"><div class="s-row"><b>${x[0]}</b>${state.treinos.has(i)?'<span class="pill p-ok">Presença confirmada</span>':''}</div><div class="s-muted" style="margin:4px 0 8px">${cap(x[1].toLocaleDateString('pt-BR',{weekday:'long'}))}, ${fmtD(x[1])} às ${x[2]} · ${x[3]}</div>${state.treinos.has(i)?'':`<button class="s-btn s-btn-sm" data-act="treino" data-i="${i}"><i data-lucide="calendar-check"></i> Confirmar presença</button>`}</div>`).join('')+
    `<div class="s-card s-row"><span><b>NR-06 · Uso de EPI</b><div class="s-muted">${fmtD(addDays(-30))} · certificado disponível</div></span><span class="pill p-ok">Concluído</span></div>`;
  },

  /* Painel de Resultados */
  resultados(){ return topBar('Painel de Resultados')+tilesGrid(RES_TILES); },
  re_empresa(){
    return topBar('Empresa','resultados','Painel de Resultados')+intro('Visão geral de Saúde e Segurança do Trabalho da sua empresa.')+
    `<div class="kpis"><div class="s-card"><span class="s-muted">Colaboradores ativos</span><b>48</b></div><div class="s-card"><span class="s-muted">ASO em dia</span><b style="color:#6FD6DA">92%</b></div><div class="s-card"><span class="s-muted">EPIs entregues no mês</span><b>36</b></div><div class="s-card"><span class="s-muted">Treinamentos concluídos</span><b>81%</b></div></div>
    <div class="s-card"><b>Documentos SST</b>${[['PGR','Em dia','p-ok'],['PCMSO','Em dia','p-ok'],['LTCAT','Revisão em 40 dias','p-warn']].map(x=>`<div class="s-row" style="margin-top:7px"><span class="s-muted">${x[0]}</span><span class="pill ${x[2]}">${x[1]}</span></div>`).join('')}</div>`;
  },
  re_dash(){
    const p=[['RH',4],['EPI',3],['Treinamentos',6],['Terceiros',2],['Atestados',1]], mx=6;
    return topBar('Dashboard','resultados','Painel de Resultados')+`<div class="s-card"><b>Atestados nos últimos meses</b><div class="chart">${[30,45,38,60,42,35,28].map((h,i)=>`<i style="height:${h}%;animation-delay:${i*.07}s"></i>`).join('')}</div></div>
    <div class="s-card"><b>Pendências por área</b>${p.map(x=>`<div class="hbar"><span class="s-muted">${x[0]}</span><div class="bar"><i style="width:${x[1]/mx*100}%"></i></div><b style="font-size:.66rem;text-align:right">${x[1]}</b></div>`).join('')}</div>`;
  }
};

/* ---------- Navegação ---------- */
const TABS = [['home','house','Início'],['seguranca','file-text','Documentos'],['ponto','clock','Ponto'],['perfil','user-round','Perfil']];
const screenEl = document.querySelector('.screen');
if(screenEl && !screenEl.querySelector('.tabbar')){
  $('#appBody').insertAdjacentHTML('afterend',`<nav class="tabbar" aria-label="Navegação do app"><span class="tabpill"></span>${TABS.map(t=>`<button data-go="${t[0]}"><i data-lucide="${t[1]}"></i>${t[2]}</button>`).join('')}</nav>`);
}
function syncTabbar(id){
  let i=TABS.findIndex(t=>t[0]===id);
  if(id==='rh_relogio') i=2;
  if(i<0) i=0;
  document.querySelectorAll('.tabbar button').forEach((b,j)=>b.classList.toggle('on',j===i));
  const p=$('.tabpill'); if(p) p.style.transform=`translateX(calc(${i*100}% + ${i*12}px))`;
}
$('.tabbar')?.addEventListener('click',e=>{const b=e.target.closest('[data-go]');if(b)go(b.dataset.go)});

let current='home';
function go(id){
  if(!SCREENS[id]) id='home';
  current=id; state.docAberto=null; state.atModal=false; state.epiModal=false;
  if(id==='denuncias'&&!state.protocol) state.denForm=false;
  const body=$('#appBody');
  body.innerHTML=`<div class="${id==='home'?'fade-in':'open'}">${SCREENS[id]()}</div>`;
  body.scrollTop=0;
  icons(); syncTabbar(id);
  const mod=PARENT[id]||id;
  if(id!=='home'&&MODULES.some(m=>m.id===mod)) selectTab(mod,false);
}
function rerender(){const b=$('#appBody'),st=b.scrollTop;b.innerHTML=`<div>${SCREENS[current]()}</div>`;b.scrollTop=st;icons()}

$('#appBody').addEventListener('click',e=>{
  const g=e.target.closest('[data-go]'); if(g){go(g.dataset.go);return}
  const a=e.target.closest('[data-act]'); if(!a) return;
  const act=a.dataset.act;
  if(act==='punch'){const n=state.punches.length;if(n>=4)return;state.punches.push(new Date());rerender();confetti();toast(`${PUNCHES[n][0]} registrada às ${nowHM()}`)}
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
  if(act==='novoFunc')toast('Cadastro de novo funcionário aberto');
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
  if(act==='validar'){state.terceiroDocs=0;rerender();toast('Documentos validados')}
  if(act==='novaEmpresa')toast('Cadastro de nova empresa aberto');
  if(act==='pedir'){const i=$('#pedItem').value.trim();if(!i){toast('Informe o material');return}state.pedidos.unshift({i,q:Math.max(1,+$('#pedQtd').value||1),h:nowHM()});rerender();toast('Pedido enviado')}
  if(act==='melhoria'){const t=$('#melTexto').value.trim();if(!t){toast('Descreva sua ideia');return}state.melhorias.unshift({a:$('#melArea').value,t,anon:$('#melAnon').checked});rerender();toast('Ideia enviada!')}
  if(act==='feedback'){const t=$('#fbTexto').value.trim();if(!t){toast('Escreva seu feedback');return}state.feedbacks.unshift({p:$('#fbPara').value,t});rerender();toast($('#fbAnon')?.checked===false?'Feedback enviado':'Feedback enviado com sigilo')}
  if(act==='perfil'){state.perfil=true;rerender();toast('Análise concluída')}
  if(act==='trilha')toast('Retomando: Gestão do tempo');
  if(act==='desafio'){state.pontos+=50;rerender();toast('+50 pontos!')}
  if(act==='read'){state.read.add(a.dataset.k);rerender()}
  if(act==='face'){state.face=+a.dataset.i;rerender();toast('Resposta registrada com sigilo')}
  if(act==='curso')toast('Retomando de onde você parou');
  if(act==='treino'){state.treinos.add(+a.dataset.i);rerender();toast('Presença confirmada')}
});
$('#appBody').addEventListener('input',e=>{
  if(e.target.id==='buscaFunc'){state.busca=e.target.value;const pos=e.target.selectionStart;rerender();const i=$('#buscaFunc');i.focus();i.setSelectionRange(pos,pos)}
});
setInterval(()=>{const t=nowHM();$('#phoneTime').textContent=t;const c=$('#liveClock');if(c){const [h,m]=t.split(':');const s=`${h}<i>:</i>${m}`;if(c.innerHTML!==s)c.innerHTML=s}},1000);

/* ---------- Módulos ao lado do celular ---------- */
$('#modTabs').innerHTML=MODULES.map(m=>`<button class="mod-tab" data-tab="${m.id}"><span class="ic"><i data-lucide="${m.icon}"></i></span>${m.name}</button>`).join('');
function selectTab(id,syncPhone=true){
  const m=MODULES.find(x=>x.id===id); if(!m) return;
  document.querySelectorAll('.mod-tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===id));
  $('#modDetail').innerHTML=`<div class="fade-in"><h3>${m.name}${m.tag?`<span class="tag">${m.tag}</span>`:''}</h3><p>${m.desc}</p><ul>${m.items.map(i=>`<li><i data-lucide="check-circle-2"></i>${i}</li>`).join('')}</ul></div>`;
  icons();
  if(syncPhone&&current!==id) go(id);
}
$('#modTabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t)selectTab(t.dataset.tab)});
go('home'); selectTab('ponto',false);
