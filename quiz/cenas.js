/* Motor do Quiz da Boa Convivência: bonecos, cenários, sons e as 8 cenas.
   Usado pela TV (tv.html) e pelo celular (celular.html). */
/* ============ CONFIG ============ */
const W = 240, H = 135, TOTAL_PLAYERS = 25, QUESTION_TIME = 20;
const cv = document.getElementById('stage'), mainCtx = cv.getContext('2d'); let ctx = mainCtx;
const off = document.createElement('canvas'); off.width = 48; off.height = 64; const offCtx = off.getContext('2d'); offCtx.imageSmoothingEnabled = false;
ctx.imageSmoothingEnabled = false;
const overlay = document.getElementById('overlay');

/* ============ PERSONAGENS ============ */
const CHARS = {
  amauri:  {name:'Amauri',  skin:'#f6c9a0', skinD:'#e0a77c', hair:'#2e2e33', hairHi:'#d9d9de', style:'messy', grey:true,
            outfit:'stripes', top:'#c3c7cf', topD:'#8e949f', shirt:'#eceef1', pants:'#3a3f4a', shoes:'#151515', voice:250, prop:'mug'},
  brenda:  {name:'Brenda',  skin:'#eebf98', skinD:'#d69f78', hair:'#5a321a', hairHi:'#8a5532', style:'ponytail',
            outfit:'tee', top:'#e2574c', topD:'#b63f37', pants:'#4a72ad', pantsD:'#365a8e', shoes:'#2a2220', voice:400, tallTorso:2, tallLegs:3},
  fernanda:{name:'Fernanda',skin:'#fde0bc', skinD:'#e9c39b', hair:'#141418', hairHi:'#34343e', style:'straight',
            outfit:'jacket', top:'#2b2b33', topD:'#1b1b21', shirt:'#f4f1ea', shirtD:'#ddd7cb', pants:'#40619a', shoes:'#f2f2f2', voice:470},
  flavia:  {name:'Flávia',  skin:'#f8d9c0', skinD:'#e8bfa0', hair:'#e2b84c', hairHi:'#f7e08e', style:'straight', eyeCol:'#3d8fe0',
            outfit:'tee', top:'#64C6CC', topD:'#3fa7ae', pants:'#2b2b33', pantsD:'#1b1b21', shoes:'#1b1b21', voice:430},
  wagner:  {name:'Wagner',  skin:'#f1c89e', skinD:'#d9a97c', hair:'#101016', hairHi:'#30333f', style:'sleek', eyes:'narrow',
            outfit:'suit', top:'#2b5bb8', topD:'#1f4388', shirt:'#f2f4f8', tie:'#14203f', pants:'#1f3a74', shoes:'#121212', voice:190},
};

/* Desenha um boneco 20x32 num canvas 22x34 (1px de margem) e aplica contorno automático */
const spriteCache = {};
function sprite(c, st){
  const key = c.name+st.frame+st.mouth+(st.blink?1:0)+st.look;
  if (spriteCache[key]) return spriteCache[key];
  const s = document.createElement('canvas'); s.width = 22; s.height = 34;
  const g = s.getContext('2d');
  const P = (x,y,w,h,col)=>{ g.fillStyle = col; g.fillRect(x+1,y+1,w,h); };
  const lx = st.look;

  // cabelo de trás
  if (c.style==='ponytail'){ P(13,0,4,3,c.hair); P(16,0,3,3,c.hair); P(18,2,2,4,c.hair); P(18,6,2,6,c.hair); P(19,12,1,3,c.hair); P(17,1,1,1,c.hairHi); P(19,4,1,6,c.hairHi); }
  if (c.style==='curly'){ P(2,6,16,16,c.hair); for(let y=6;y<22;y+=2){P(1,y,1,1,c.hair);P(18,y+1,1,1,c.hair);} P(3,22,3,1,c.hair);P(14,22,3,1,c.hair); }
  if (c.style==='straight'){ P(2,5,16,19,c.hair); P(3,24,2,1,c.hair); P(15,24,2,1,c.hair); }

  // pernas (frame 1 e 2 = andando)
  const legTop = c.outfit==='dress' ? 28 : 27;
  const legCol = c.outfit==='dress' ? c.skin : c.pants;
  const leg = (x,lift)=>{ P(x,legTop,3,30-legTop-lift,legCol); P(x-(x<10?1:0),30-lift,4,2,c.shoes); };
  leg(6, st.frame===1?1:0); leg(11, st.frame===2?1:0);

  // corpo
  if (c.outfit==='stripes'){ P(5,18,10,9,c.top); for(let x=6;x<15;x+=2) P(x,18,1,8,c.topD);
    P(8,18,1,2,c.shirt); P(11,18,1,2,c.shirt); P(9,19,2,1,c.shirt); P(10,21,1,1,'#ffffff'); P(10,23,1,1,'#ffffff'); P(5,26,10,1,'#2a2e36'); }
  if (c.outfit==='sweater'){ P(5,18,10,9,c.top); P(13,18,2,9,c.topD); P(5,26,10,1,c.topD); P(8,18,4,1,c.topD); }
  if (c.outfit==='tee'){ P(5,18,10,8,c.top); P(13,18,2,8,c.topD); P(8,18,4,1,c.skin); P(5,25,10,2,c.pants); P(5,25,10,1,c.pantsD); P(9,26,2,1,'#c9a34a'); }
  if (c.outfit==='dress'){ P(5,18,10,5,c.top); P(4,23,12,5,c.top); P(13,18,2,5,c.topD); P(4,27,12,1,c.topD); P(8,18,4,1,c.skin); P(5,22,10,1,c.topD); }
  if (c.outfit==='jacket'){ P(5,18,10,8,c.top); P(13,18,2,8,c.topD); P(7,18,6,6,c.shirt); P(12,18,1,6,c.shirtD); P(7,18,1,2,c.top); P(12,18,1,2,c.topD);
    P(9,20,1,1,c.shirtD); P(9,22,1,1,c.shirtD); P(5,24,10,3,c.pants); P(5,24,2,2,c.top); P(13,24,2,2,c.topD); P(7,24,6,1,'#2a3550'); }
  if (c.outfit==='suit'){ P(5,18,10,9,c.top); P(13,18,2,9,c.topD); P(8,18,4,3,c.shirt); P(9,21,2,1,c.shirt); P(9,19,2,5,c.tie); P(9,24,1,1,c.topD); P(10,25,1,1,c.topD); P(5,26,10,1,c.pants); }

  // braços e mãos
  const sleeve = (c.outfit==='dress'||c.outfit==='tee') ? c.skin : (c.outfit==='jacket'? c.top : c.top);
  P(3,18,2,7,sleeve); P(15,18,2,7,c.outfit==='suit'||c.outfit==='sweater'||c.outfit==='stripes'?c.topD:sleeve);
  if (c.outfit==='stripes'){ P(3,20,2,1,c.topD); P(15,22,2,1,c.top); P(3,23,2,1,c.topD); }
  if (c.outfit==='dress'||c.outfit==='tee'){ P(3,18,2,2,c.top); P(15,18,2,2,c.topD); }
  if (c.outfit==='suit'){ P(3,24,2,1,c.shirt); P(15,24,2,1,c.shirt); }
  P(3,25,2,2,c.skin); P(15,25,2,2,c.skin);

  // cabeça
  P(9,17,2,1,c.skinD);
  P(4,5,12,12,c.skin); P(4,5,1,1,'rgba(0,0,0,0)');
  g.clearRect(5,6,1,1); g.clearRect(16,6,1,1); g.clearRect(5,17,1,1); g.clearRect(16,17,1,1);
  P(3,10,1,3,c.skin); P(16,10,1,3,c.skin); P(5,16,10,1,c.skinD);

  // rosto
  if (c.eyes==='narrow'){
    P(6,9,2,1,c.hair); P(12,9,2,1,c.hair);
    if (st.blink){ P(6+lx,12,2,1,'#2a1a14'); P(12+lx,12,2,1,'#2a1a14'); }
    else { P(6+lx,11,2,2,'#1a1010'); P(12+lx,11,2,2,'#1a1010'); P(5+lx,11,1,1,'#1a1010'); P(14+lx,11,1,1,'#1a1010'); P(7+lx,11,1,1,'#ffffff'); P(13+lx,11,1,1,'#ffffff'); }
  } else if (st.blink){ P(6+lx,12,2,1,'#2a1a14'); P(12+lx,12,2,1,'#2a1a14'); }
  else if (c.eyeCol){ P(6+lx,10,2,3,'#1d3768'); P(12+lx,10,2,3,'#1d3768'); P(6+lx,11,2,2,c.eyeCol); P(12+lx,11,2,2,c.eyeCol); P(6+lx,10,1,1,'#ffffff'); P(12+lx,10,1,1,'#ffffff'); }
  else { P(6+lx,10,2,3,'#2a1a14'); P(12+lx,10,2,3,'#2a1a14'); P(6+lx,10,1,1,'#ffffff'); P(12+lx,10,1,1,'#ffffff'); }
  P(5,13,1,1,'#f0978a'); P(14,13,1,1,'#f0978a');
  if (st.mouth){ P(9,14,2,2,'#5a1a1a'); P(9,15,1,1,'#d9666a'); } else { P(9,14,2,1,'#9a4b38'); }

  // cabelo da frente
  const h=c.hair, hi=c.hairHi;
  if (c.style==='messy'){ P(4,2,12,3,h); P(3,4,14,4,h); P(4,8,3,1,h); P(8,8,3,1,h); P(12,8,4,1,h); P(3,8,2,3,h); P(15,8,2,3,h);
    P(5,1,1,1,h); P(9,0,1,2,h); P(12,1,1,1,h); P(14,2,2,1,h); P(2,5,1,2,h); P(17,5,1,2,h); P(6,3,3,1,hi); P(11,4,2,1,hi); P(7,6,1,1,hi);
    if (c.grey){ P(4,5,2,1,hi); P(13,6,3,1,hi); P(9,2,1,1,hi); P(3,9,1,2,hi); P(16,9,1,2,hi); P(5,8,1,1,hi); P(12,8,2,1,hi); P(14,3,1,1,hi); } }
  if (c.style==='ponytail'){ P(4,2,12,2,h); P(3,4,14,4,h); P(3,8,1,2,h); P(16,8,1,2,h);
    P(5,8,5,1,h); P(5,9,2,1,h); P(13,8,2,1,h); P(14,1,2,2,'#e8706f');
    P(5,3,4,1,hi); P(4,5,3,1,hi); P(10,2,3,1,hi); P(12,4,2,1,hi); }
  if (c.style==='curly'){ P(4,2,12,2,h); P(3,4,14,4,h); P(2,6,3,12,h); P(15,6,3,12,h); P(4,8,3,1,h); P(13,8,3,1,h);
    P(9,3,2,1,hi); P(5,4,2,1,hi); P(13,4,2,1,hi); P(3,10,1,2,hi); P(16,12,1,2,hi); P(3,15,1,1,hi); }
  if (c.style==='straight'){ P(4,2,12,2,h); P(3,4,14,4,h); P(3,8,2,11,h); P(15,7,2,12,h);
    P(5,8,5,1,h); P(5,9,2,1,h); P(14,8,1,1,h);            /* franja de lado, acima dos olhos */
    P(10,3,1,2,'#2a2a32'); P(6,3,3,1,hi); P(12,4,2,1,hi); P(3,12,1,4,hi); P(16,11,1,4,hi); }
  if (c.style==='sleek'){ P(4,2,12,2,h); P(3,4,14,4,h); P(3,8,1,4,h); P(16,8,1,4,h);
    P(4,8,8,1,h); P(4,9,3,1,h); P(15,8,1,1,h);              /* liso, franja de lado */
    P(6,3,6,1,hi); P(5,5,3,1,hi); P(12,5,2,1,hi); }
  if (c.style==='volume'){ P(4,0,12,2,h); P(2,2,16,6,h); P(1,3,1,4,h); P(18,3,1,4,h); P(3,1,1,1,h); P(16,1,1,1,h);
    P(4,8,4,1,h); P(9,8,2,1,h); P(13,8,3,1,h); P(3,8,1,3,h); P(16,8,1,3,h);
    P(5,1,1,1,hi); P(8,2,2,1,hi); P(12,1,1,1,hi); P(14,3,2,1,hi); P(4,4,1,1,hi); P(10,5,1,1,hi); P(7,6,1,1,hi); P(15,6,1,1,hi); }

  // personagem mais alto: repete uma linha do tronco e uma das pernas
  let S = s, SH = 34;
  const tt = c.tallTorso||0, tl = c.tallLegs||0;
  if (tt||tl){
    SH = 34+tt+tl; S = document.createElement('canvas'); S.width = 22; S.height = SH;
    const t = S.getContext('2d'), tr = 21, lr = 29;   // linhas (já com margem) que são repetidas
    t.drawImage(s,0,0,22,tr,0,0,22,tr);
    for (let i=0;i<=tt;i++) t.drawImage(s,0,tr,22,1,0,tr+i,22,1);
    t.drawImage(s,0,tr+1,22,lr-tr-1,0,tr+1+tt,22,lr-tr-1);
    for (let i=0;i<=tl;i++) t.drawImage(s,0,lr,22,1,0,lr+tt+i,22,1);
    t.drawImage(s,0,lr+1,22,34-lr-1,0,lr+1+tt+tl,22,34-lr-1);
  }
  // contorno automático
  const G = S.getContext('2d');
  const id = G.getImageData(0,0,22,SH), d = id.data, out = new Uint8ClampedArray(d);
  const A = (x,y)=> (x<0||y<0||x>21||y>SH-1) ? 0 : d[(y*22+x)*4+3];
  for (let y=0;y<SH;y++) for (let x=0;x<22;x++){
    if (A(x,y)) continue;
    if (A(x-1,y)||A(x+1,y)||A(x,y-1)||A(x,y+1)){ const i=(y*22+x)*4; out[i]=38; out[i+1]=26; out[i+2]=30; out[i+3]=255; }
  }
  id.data.set(out); G.putImageData(id,0,0);
  return spriteCache[key] = S;
}

/* ============ CENÁRIOS ============ */
function makeBg(fn){ const b=document.createElement('canvas'); b.width=W; b.height=H; const g=b.getContext('2d'); g.imageSmoothingEnabled=false; fn(g); return b; }
const R = (g,x,y,w,h,c)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };

const officeBg = makeBg(g=>{
  // parede
  R(g,0,0,W,84,'#d6e6ea'); for(let x=0;x<W;x+=12) R(g,x,0,1,62,'#cddfe4');
  R(g,0,60,W,3,'#eef5f6'); R(g,0,63,W,21,'#9fc0c9'); for(let x=3;x<W;x+=8) R(g,x,63,1,21,'#8db1bb'); R(g,0,82,W,2,'#6f94a0');
  // piso
  R(g,0,84,W,51,'#c79361');
  for(let y=84;y<H;y+=7){ R(g,0,y,W,1,'#a9774a'); const off=((y-84)/7)%2?14:0; for(let x=off;x<W;x+=28) R(g,x,y,1,7,'#b1804f'); }
  R(g,0,85,W,2,'#d6a574');
  // janela
  R(g,12,10,52,42,'#f4f4f0'); R(g,15,13,46,36,'#8fd3f0'); R(g,15,13,46,8,'#a6ddf3');
  R(g,20,22,12,4,'#ffffff'); R(g,24,19,6,3,'#ffffff'); R(g,42,30,14,4,'#ffffff'); R(g,46,27,6,3,'#ffffff');
  R(g,37,13,2,36,'#f4f4f0'); R(g,15,30,46,2,'#f4f4f0'); R(g,10,52,56,3,'#dcdcd4');
  // quadro de metas
  R(g,86,12,62,38,'#7f8f9b'); R(g,88,14,58,33,'#fbfbf7'); R(g,88,14,58,4,'#12B0B6');
  R(g,94,36,6,8,'#64C6CC'); R(g,104,31,6,13,'#2864B0'); R(g,114,27,6,17,'#12B0B6'); R(g,124,23,6,21,'#F4BB0E');
  R(g,134,40,8,1,'#e8706f'); R(g,140,38,1,5,'#e8706f'); R(g,92,44,52,1,'#9aa7b0');
  R(g,96,48,42,2,'#7f8f9b'); R(g,100,50,2,6,'#7f8f9b'); R(g,132,50,2,6,'#7f8f9b');
  // pôster marca (capacete)
  R(g,158,14,22,30,'#001B4A'); R(g,160,16,18,26,'#0b2a63');
  R(g,163,26,12,7,'#F4BB0E'); R(g,165,23,8,3,'#F4BB0E'); R(g,161,32,16,2,'#d9a10a'); R(g,168,24,2,7,'#ffffff'); R(g,166,26,6,2,'#ffffff');
  R(g,163,37,12,2,'#12B0B6');
  // relógio
  R(g,196,14,14,14,'#3a4b58'); R(g,198,16,10,10,'#ffffff'); R(g,202,18,1,4,'#222'); R(g,202,21,3,1,'#222');
  // bebedouro
  R(g,72,40,10,10,'#7cc6ea'); R(g,73,41,3,6,'#b9e4f6'); R(g,70,50,14,32,'#e9eef0'); R(g,70,50,14,2,'#c9d2d6'); R(g,75,56,4,2,'#2864B0'); R(g,72,80,10,3,'#9aa7b0');
  // mesas + monitores
  for (const dx of [8,168]){
    R(g,dx+12,52,26,18,'#1d2330'); R(g,dx+14,54,22,13,'#2864B0'); R(g,dx+16,56,12,1,'#64C6CC'); R(g,dx+16,59,16,1,'#a6ddf3'); R(g,dx+16,62,9,1,'#64C6CC');
    R(g,dx+23,70,4,4,'#1d2330'); R(g,dx+19,73,12,2,'#1d2330');
    R(g,dx+44,62,8,12,'#ffffff'); R(g,dx+45,63,6,3,'#c79361');
    R(g,dx,74,64,4,'#9a643a'); R(g,dx,78,64,2,'#6e4526'); R(g,dx+2,80,4,14,'#6e4526'); R(g,dx+58,80,4,14,'#6e4526');
    R(g,dx+4,80,56,10,'#8a5a36');
  }
  // planta
  R(g,224,70,12,14,'#c0643a'); R(g,224,70,12,2,'#d77d50');
  [[226,58,3,12],[230,52,3,18],[233,60,3,10],[222,62,4,3],[234,56,4,3],[228,54,3,3]].forEach(p=>R(g,p[0],p[1],p[2],p[3],'#3f9a55'));
  R(g,231,53,1,10,'#5dbb6f');
});

const bathBg = makeBg(g=>{
  // azulejo
  R(g,0,0,W,84,'#dff1f0'); for(let x=0;x<W;x+=10) R(g,x,0,1,84,'#c6e2e0'); for(let y=0;y<84;y+=10) R(g,0,y,W,1,'#c6e2e0');
  R(g,0,58,W,4,'#12B0B6'); R(g,0,82,W,2,'#9fc6c4');
  // piso xadrez
  for(let y=84;y<H;y+=8) for(let x=0;x<W;x+=8) R(g,x,y,8,8,((x+y)/8)%2?'#e3eaee':'#a9bcc8');
  // cabines
  for (const sx of [8,62]){
    R(g,sx,8,52,72,'#3e5a70'); R(g,sx+2,10,48,70,'#6f8ea6'); R(g,sx+2,10,48,3,'#8aa8bd');
    R(g,sx+42,44,4,8,'#F4BB0E'); R(g,sx+20,18,12,8,'#ffffff'); R(g,sx+23,20,6,4,'#12B0B6');
  }
  R(g,6,80,110,4,'#2e4556');
  // lixo
  R(g,120,68,12,16,'#9aa7b0'); R(g,119,66,14,3,'#7f8f9b');
  // espelho e pias
  R(g,150,12,82,36,'#7f8f9b'); R(g,152,14,78,32,'#bfe6f2'); R(g,160,18,10,2,'#ffffff'); R(g,158,22,6,2,'#ffffff'); R(g,200,30,14,2,'#ffffff');
  R(g,148,56,86,6,'#f4f4f0'); R(g,148,62,86,3,'#c9d2d6');
  for (const px of [162,200]){ R(g,px,57,20,3,'#9fc6c4'); R(g,px+9,50,2,7,'#9aa7b0'); R(g,px+7,50,6,2,'#9aa7b0'); }
  R(g,152,65,4,19,'#c9d2d6'); R(g,226,65,4,19,'#c9d2d6');
  // porta-papel toalha
  R(g,236,20,4,0,'#fff');
});

function imgBg(src, sx, sy, sw, sh){
  const holder = {c:null}; const im = new Image();
  im.onload = ()=>{ holder.c = makeBg(g=>{ g.imageSmoothingEnabled = true; g.drawImage(im, sx, sy, sw, sh, 0, 0, W, H); }); };
  im.src = src; return holder;
}
const bathImg   = imgBg('img/banheiro-certo.jpg', 0, 300, 322, 181);
const escImg    = imgBg('img/escritorio.jpg', 0, 75, 400, 225);
const kitchenImg = new Image(); kitchenImg.src = 'img/cozinha.jpg';
let kitchenBg = null;
kitchenImg.onload = ()=>{ kitchenBg = makeBg(g=>{
  g.imageSmoothingEnabled = true;
  const sw = kitchenImg.width, sh = kitchenImg.height, ratio = W/H;
  const cw = Math.min(sw, sh*ratio), ch = cw/ratio;
  g.drawImage(kitchenImg, (sw-cw)/2, sh-ch, cw, ch, 0, 0, W, H);
  // piso extra para os bonecos
  R(g,0,118,W,17,'#5a6fa8'); for(let x=0;x<W;x+=8){ R(g,x,118,1,17,'#4b5e93'); } R(g,0,126,W,1,'#4b5e93'); R(g,0,118,W,1,'#3a4a7a');
}); };

/* ============ SOM (8-bit, gerado na hora) ============ */
let AC = null, muted = false;
function tone(freq, dur=0.05, type='square', vol=0.06, slide=0){
  if (!AC || muted) return;
  const t = AC.currentTime, o = AC.createOscillator(), v = AC.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.linearRampToValueAtTime(freq+slide, t+dur);
  v.gain.setValueAtTime(vol, t); v.gain.exponentialRampToValueAtTime(0.0001, t+dur);
  o.connect(v).connect(AC.destination); o.start(t); o.stop(t+dur+0.02);
}
let noiseBuf = null;
function noise(dur=0.05, vol=0.15, freq=1800, q=1){
  if (!AC || muted) return;
  if (!noiseBuf){ noiseBuf = AC.createBuffer(1, AC.sampleRate*0.5, AC.sampleRate); const d=noiseBuf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=Math.random()*2-1; }
  const t = AC.currentTime, src = AC.createBufferSource(), f = AC.createBiquadFilter(), v = AC.createGain();
  src.buffer = noiseBuf; f.type='bandpass'; f.frequency.value=freq; f.Q.value=q;
  v.gain.setValueAtTime(vol,t); v.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  src.connect(f).connect(v).connect(AC.destination); src.start(t); src.stop(t+dur+0.02);
}
/* música de fundo bem baixinha (chiptune em loop) */
let musicOn = true, musicTimer = null;
const MELODY = [523,0,659,0,784,659,0,587, 523,0,440,0,494,523,0,0, 587,0,698,0,880,698,0,659, 587,0,494,0,523,587,0,0];
const BASS   = [131,131,165,165,196,196,147,147];
function startMusic(){
  let i = 0; clearInterval(musicTimer);
  musicTimer = setInterval(()=>{
    if (!musicOn || muted) { i++; return; }
    const n = MELODY[i % MELODY.length]; if (n) tone(n,0.16,'square',0.012);
    if (i % 4 === 0) tone(BASS[(i/4) % BASS.length],0.3,'triangle',0.035);
    if (i % 2 === 1) noise(0.02,0.02,6000,0.7);
    i++;
  }, 170);
}
const SFX = {
  step:(alt)=>{ noise(0.05,0.22,alt?900:1200,1.4); tone(alt?80:95,0.05,'sine',0.08); },
  door:(close)=>{ if(close){ noise(0.12,0.3,300,0.8); tone(110,0.1,'square',0.05); } else { noise(0.25,0.08,2500,0.5); tone(220,0.15,'triangle',0.05,120); } },
  water:()=>noise(1.2,0.08,3000,0.4),
  flush:()=>{ noise(1.4,0.12,800,0.5); setTimeout(()=>noise(0.8,0.08,1600,0.5),500); },
  click:()=>{ noise(0.04,0.3,5000,1); setTimeout(()=>noise(0.03,0.2,3000,1),60); },
  loud:()=>{ [196,0,247,294].forEach((f,i)=>f&&setTimeout(()=>tone(f,0.12,'sawtooth',0.035),i*95)); noise(0.06,0.12,200,1); },
  ring:()=>{ for(let i=0;i<4;i++) setTimeout(()=>tone(i%2?1320:1046,0.07,'square',0.04),i*80); },
  angry:()=>{ tone(160,0.12,'sawtooth',0.05,-40); },
  pick:()=>{ tone(660,0.06,'square',0.05); setTimeout(()=>tone(990,0.09,'square',0.05),70); },
  blip:(f)=>tone(f*(0.9+Math.random()*0.25),0.045,'square',0.035),
  pop:()=>tone(380,0.08,'sine',0.12,520),
  tick:()=>tone(880,0.03,'square',0.03),
  reveal:()=>{[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,0.12,'square',0.05),i*90));},
  emote:()=>{tone(700,0.05,'square',0.05); setTimeout(()=>tone(1050,0.07,'square',0.05),60);},
};

/* ============ ATORES E LOOP ============ */
let actors = {}, bg = officeBg, fx = {}, curScene = null;
function addActor(id, x, look=0){
  actors[id] = {id, c:CHARS[id], x, y:86, look, frame:0, mouth:0, blink:false, walking:false, talking:false,
    nextBlink: performance.now()+1000+Math.random()*3000, stepT:0, mouthT:0, bubble:null, emote:null};
}
const OL = '#261a1e';
function drawMug(x,y,now){
  R(ctx,x-1,y-1,7,7,OL); R(ctx,x,y,5,5,'#f7f7f2'); R(ctx,x,y,5,1,'#6b3b22'); R(ctx,x+4,y+1,1,4,'#d8d8d0');
  R(ctx,x+5,y+1,2,3,OL); R(ctx,x+5,y+2,1,1,'#f7f7f2');
  if (now < 0) return;                                  // caneca sem fumaça
  const f = Math.floor(now/260)%3;                       // fumacinha do café
  ctx.fillStyle='rgba(255,255,255,.75)';
  ctx.fillRect(x+1+(f===1?1:0), y-3-f, 1, 1); ctx.fillRect(x+3-(f===2?1:0), y-5+f%2, 1, 1); ctx.fillRect(x+2, y-7+f, 1, 1);
}
function drawLunch(x,y){
  R(ctx,x-1,y-2,13,8,OL); R(ctx,x,y,11,5,'#F4BB0E'); R(ctx,x,y-1,11,2,'#12B0B6'); R(ctx,x+1,y+2,9,1,'#d9a10a');
}
let fridgeOpen = 0;   // 0 fechada → 1 aberta (animado)
let fridgeTarget = 0;
function drawFridge(){
  fridgeOpen += (fridgeTarget-fridgeOpen)*0.2;
  if (fridgeTarget===0 && fridgeOpen < 0.1) fridgeOpen = 0;
  if (fridgeOpen === 0) return;
  const x0=24, y0=47, w=62, h=72, k=fridgeOpen;
  // interior
  R(ctx,x0,y0,w,h,OL); R(ctx,x0+2,y0+2,w-4,h-4,'#eaf7f5'); R(ctx,x0+2,y0+2,w-4,4,'#ffffff');
  for (const sy of [24,44]) R(ctx,x0+3,y0+sy,w-6,2,'#a9d6d6');
  // itens
  R(ctx,x0+6,y0+12,6,12,'#e8706f'); R(ctx,x0+7,y0+10,4,2,'#bf4f50');           // garrafa
  R(ctx,x0+16,y0+16,10,8,'#F4BB0E'); R(ctx,x0+16,y0+16,10,2,'#d9a10a');         // queijo
  R(ctx,x0+34,y0+15,8,9,'#64C6CC');                                               // pote
  R(ctx,x0+8,y0+36,12,8,'#9fd36e'); R(ctx,x0+28,y0+38,10,6,'#ffffff');           // salada, leite
  if (!window.lunchTaken){ R(ctx,x0+18,y0+57,15,8,OL); R(ctx,x0+19,y0+58,13,6,'#F4BB0E'); R(ctx,x0+19,y0+58,13,2,'#12B0B6'); }  // marmita
  R(ctx,x0+40,y0+56,10,8,'#c0643a');
  // luz da geladeira
  ctx.fillStyle = `rgba(255,255,220,${0.18*k})`; ctx.fillRect(x0+2,y0+2,w-4,h-4);
  // parte da porta que ainda cobre o interior enquanto abre/fecha
  const cov = Math.round((w)*(1-k));
  if (cov>0){ R(ctx,x0,y0,cov,h,'#97d3c4'); R(ctx,x0+cov-2,y0,2,h,OL); }
  // porta aberta (dobradiça à esquerda)
  const dw = Math.round(16*k);
  R(ctx,x0-dw-2,y0-2,dw+2,h+4,OL); R(ctx,x0-dw,y0,dw,h,'#7fc4b4'); R(ctx,x0-dw,y0,Math.max(1,dw-3),h,'#97d3c4');
  if (dw>6){ R(ctx,x0-dw+2,y0+18,dw-4,2,'#5f9f92'); R(ctx,x0-dw+2,y0+40,dw-4,2,'#5f9f92'); }
}
function placeBubbles(a, cxPx, topPx){
  const cx = cxPx/W*100;
  if (a.bubble){
    const box = overlay.clientWidth || 1, bw = a.bubble.offsetWidth, margin = 6;
    let px = cx/100*box; px = Math.min(box - bw/2 - margin, Math.max(bw/2 + margin, px));
    // e também não sai por cima: se a cabeça está muito no alto, o balão desce
    const boxH = overlay.clientHeight || 1, bh = a.bubble.offsetHeight + 22;
    const py = Math.max(bh, (topPx-4)/H*boxH);
    a.bubble.style.left = (px/box*100)+'%'; a.bubble.style.top = (py/boxH*100)+'%';
  }
  if (a.emote){ a.emote.style.left = cx+'%'; a.emote.style.top = ((topPx-3)/H*100)+'%'; }
}
function drawPlain(a, now){                       // boneco em tamanho normal + objetos na mão
  const bob = a.walking && a.frame===1 ? -1 : 0;
  const T = (a.c.tallTorso||0)+(a.c.tallLegs||0), top = a.y - T;
  ctx.fillStyle='rgba(0,0,0,.18)'; ctx.fillRect(Math.round(a.x)+3, a.y+31, 16, 2);
  ctx.drawImage(sprite(a.c,{frame:a.frame,mouth:a.mouth,blink:a.blink,look:a.look}), Math.round(a.x), top+bob);
  const hx = Math.round(a.x)+16, hy = a.y+bob+22;   // mão direita (lado direito da tela)
  if (a.c.prop==='mug' && !a.holding) drawMug(hx, hy, now);
  if (a.holding==='marmita') drawLunch(Math.round(a.x)+5, hy+1);
  if (a.holding==='phone'){ R(ctx,hx-1,hy-6,6,9,OL); R(ctx,hx,hy-5,4,7,'#2864B0'); R(ctx,hx+1,hy-4,2,1,'#a6ddf3'); }
  if (a.holding==='roll'){ R(ctx,hx-1,hy-1,6,6,OL); R(ctx,hx,hy,4,4,'#ffffff'); R(ctx,hx+1,hy+1,2,1,'#d8dde2'); }
  if (a.holding==='mugEmpty') drawMug(hx, hy, -1);
  if (a.holding==='phoneEar'){ const hxE = Math.round(a.x)+15, hyE = top+bob+9; R(ctx,hxE-1,hyE-1,5,9,OL); R(ctx,hxE,hyE,3,7,'#2864B0'); R(ctx,hxE+2,hyE+8,2,3,a.c.skin); }
  if (a.holding==='paper'){ R(ctx,hx-1,hy-1,6,6,OL); R(ctx,hx,hy,4,4,'#ffffff'); R(ctx,hx+1,hy+1,1,1,'#c9ced4'); R(ctx,hx+3,hy+2,1,1,'#c9ced4'); }
  if (a.headphones){ const t2 = top+bob; R(ctx,Math.round(a.x)+3,t2+2,16,2,OL); R(ctx,Math.round(a.x)+2,t2+10,3,5,OL); R(ctx,Math.round(a.x)+17,t2+10,3,5,OL); R(ctx,Math.round(a.x)+3,t2+11,1,3,'#e8706f'); R(ctx,Math.round(a.x)+18,t2+11,1,3,'#e8706f'); }
  return top+bob;
}
function loop(now){
  ctx.clearRect(0,0,W,H);
  if (bg) ctx.drawImage(bg,0,0);
  if (bg===kitchenBg) drawFridge();
  if (curScene && curScene.draw) curScene.draw(now);
  const list = Object.values(actors).sort((a,b)=>(a.y+(a.scale?200:0))-(b.y+(b.scale?200:0)));
  for (const a of list){
    if (a.hidden){ placeBubbles(a, a.x+11*(a.scale||1), a.y); continue; }
    if (now > a.nextBlink){ a.blink = true; if (now > a.nextBlink+130){ a.blink=false; a.nextBlink = now+1800+Math.random()*3200; } }
    if (a.walking && now-a.stepT>150){ a.frame = a.frame===1?2:1; a.stepT=now; SFX.step(a.frame===1); }
    if (!a.walking) a.frame = 0;
    if (a.dance){ a.frame = Math.floor(now/180)%2 + 1; a.look = Math.floor(now/360)%2 ? 1 : -1; }
    if (a.talking && now-a.mouthT>110){ a.mouth = a.mouth?0:1; a.mouthT=now; }
    if (!a.talking) a.mouth = 0;
    const s = a.scale || 1;
    if (a.seated){                                  // sentado atrás da mesa (cena do filme)
      const spr = sprite(a.c,{frame:0,mouth:a.mouth,blink:a.blink,look:a.look});
      const x = Math.round(a.x), y = Math.round(a.y);
      ctx.drawImage(spr, 0, 0, 22, 28, x, y, 22*s, 28*s);
      if (fx.front && fx.front.complete) ctx.drawImage(fx.front, 0, 0, W, H);   // tampo e notebook na frente
      // frente da mesa fechada: não aparecem as pernas
      R(ctx, 14, 91, 106, 44, '#1b1416'); R(ctx, 16, 92, 102, 43, '#7a5849'); R(ctx, 16, 92, 102, 3, '#93705f');
      R(ctx, 20, 100, 94, 1, '#5e4337'); R(ctx, 20, 116, 94, 1, '#5e4337'); R(ctx, 62, 105, 10, 3, '#c9b09a');
      placeBubbles(a, a.x+11*s, y); continue;
    }
    if (s !== 1){                                   // em close: desenha no tamanho normal e amplia
      const T = (a.c.tallTorso||0)+(a.c.tallLegs||0);
      const sx = a.x, sy = a.y; offCtx.clearRect(0,0,off.width,off.height);
      ctx = offCtx; a.x = 10; a.y = 14 + T; drawPlain(a, now); a.x = sx; a.y = sy; ctx = mainCtx;
      const bob = (a.walking || a.dance) && a.frame===1 ? -s : 0;
      const dx = Math.round(a.x - 10*s), dy = Math.round(a.y - 14*s + bob);
      ctx.drawImage(off, dx, dy, off.width*s, off.height*s);
      placeBubbles(a, a.x+11*s, a.y+bob); continue;
    }
    const top = drawPlain(a, now);
    placeBubbles(a, a.x+11, top);
  }
  requestAnimationFrame(loop);
}

/* ============ AÇÕES DO ROTEIRO ============ */
let PACE = 1;          // ritmo das cenas (o celular usa mais devagar, para dar tempo de ler)
const wait = ms => new Promise(r=>setTimeout(r,ms*PACE));
function walk(id, toX, speed=42){
  const a = actors[id]; if (!a) return Promise.resolve(); a.walking = true; a.look = toX > a.x ? 1 : -1;
  return new Promise(res=>{
    let last = performance.now();
    (function step(now){
      const dt = (now-last)/1000; last = now;
      const dir = Math.sign(toX-a.x); a.x += dir*speed*dt;
      if ((dir>0 && a.x>=toX) || (dir<0 && a.x<=toX) || dir===0){ a.x = toX; a.walking=false; res(); }
      else setTimeout(()=>step(performance.now()), 16);   // relógio, não depende da tela estar visível
    })(last);
  });
}
function look(id, dir){ if (actors[id]) actors[id].look = dir; }
function clearBubble(id){ const a=actors[id]; if(a.bubble){a.bubble.remove(); a.bubble=null;} }
function clearAll(){ Object.keys(actors).forEach(id=>{ clearBubble(id); if(actors[id].emote){actors[id].emote.remove(); actors[id].emote=null;} }); }
async function say(id, text, {hold=1200, speed=32}={}){
  Object.keys(actors).forEach(k=>{ clearBubble(k); if(actors[k].emote){actors[k].emote.remove(); actors[k].emote=null;} });
  const a = actors[id]; if (!a) return;
  const b = document.createElement('div'); b.className='bubble';
  b.innerHTML = `<span class="name">${a.c.name}</span><span class="t"></span>`;
  overlay.appendChild(b); a.bubble = b; SFX.pop();
  const t = b.querySelector('.t'); a.talking = true;
  for (let i=0;i<text.length;i++){
    t.textContent += text[i];
    if (i%2===0 && text[i]!==' ') SFX.blip(a.c.voice);
    await wait(/[.,!?…]/.test(text[i]) ? speed*5 : speed);
  }
  a.talking = false;
  await wait(PACE > 1 ? Math.max(hold, 900 + text.length*28) : hold);   // tempo de leitura
}
async function emote(id, txt, ms=1000){
  const a = actors[id]; if (!a) return; if (a.emote) a.emote.remove();
  const e = document.createElement('div'); e.className='emote'; e.textContent = txt;
  overlay.appendChild(e); a.emote = e; SFX.emote(); await wait(ms); e.remove(); if(a.emote===e) a.emote=null;
}

/* vídeo do filme e cenas de corte (GIF) */
const vid = document.getElementById('vid'); let musicWas = true;
function startVideo(showWindow=true){
  const seek = ()=>{ try { vid.currentTime = 75; } catch(e){} };
  if (vid.readyState >= 1) seek(); else vid.addEventListener('loadedmetadata', seek, {once:true});
  vid.volume = 0.6; musicWas = musicOn; musicOn = false; vid.muted = muted;
  vid.dataset.on = '1'; if (showWindow) document.getElementById('pip').classList.remove('hidden');
  const p = vid.play(); if (p && p.catch) p.catch(()=>{ vid.muted = true; vid.play().catch(()=>{}); });
}
function stopVideo(){ if (vid.dataset.on !== '1') return; vid.dataset.on = ''; vid.pause(); document.getElementById('pip').classList.add('hidden'); musicOn = musicWas; }
async function cutaway(src, caption, ms){
  const c = document.getElementById('cut'), im = document.getElementById('cutImg');
  im.src = src + '?t=' + Date.now(); document.getElementById('cutCap').textContent = caption || '';
  c.classList.remove('hidden'); SFX.pop(); await wait(ms); c.classList.add('hidden');
}

const filmSheet = new Image(); filmSheet.src = 'img/filme-sheet.png';
const filmFront = new Image(); filmFront.src = 'img/filme-mesa.png';
const CRT = {x:179, y:25, w:34, h:28};

/* desenhos extras usados nas cenas */
function drawStream(now){            // tela de filme no monitor da esquerda
  R(ctx,22,54,22,13,'#141418'); R(ctx,22,54,22,4,'#c0262d');
  R(ctx,31,59,1,5,'#fff'); R(ctx,32,60,1,3,'#fff'); R(ctx,33,61,1,1,'#fff');
  const p = Math.floor(now/400)%14; R(ctx,24,65,18,1,'#555'); R(ctx,24,65,4+p,1,'#c0262d');
}
function drawSpreadsheet(){          // planilha de clientes no monitor da direita
  R(ctx,182,54,22,13,'#ffffff'); R(ctx,182,54,22,2,'#118191');
  for(let y=57;y<66;y+=2){ R(ctx,183,y,6,1,'#9aa7b0'); R(ctx,190,y,7,1,'#c9d2d6'); R(ctx,198,y,5,1,'#9aa7b0'); }
}
function drawSink(){                  // pia na bancada da cozinha
  R(ctx,160,63,50,8,OL); R(ctx,161,64,48,6,'#c9d2d6'); R(ctx,164,65,42,4,'#9aa7b0');
  R(ctx,183,54,3,10,OL); R(ctx,183,54,9,3,OL); R(ctx,184,55,2,8,'#e9eef0'); R(ctx,184,55,7,1,'#e9eef0');
  const n = fx.dishes||0;
  for (let i=0;i<n;i++){ R(ctx,166+(i%2)*2,61-i*3,16,3,OL); R(ctx,167+(i%2)*2,61-i*3,14,2,i%3?'#ffffff':'#64C6CC'); }
  if (fx.mugInSink){ R(ctx,194,57,7,7,OL); R(ctx,195,58,5,5,'#e8706f'); R(ctx,200,59,2,3,OL); }
  if (fx.washing){ ctx.fillStyle='rgba(166,221,243,.85)'; for(let i=0;i<5;i++) ctx.fillRect(186+((performance.now()/60+i*7)%12)-6, 57+i, 1, 1); }
}
function drawStall(){                 // porta da cabine aberta
  if (fx.stallOpen){ R(ctx,10,10,48,70,'#2e4556'); R(ctx,24,52,20,10,'#ffffff'); R(ctx,26,46,16,7,'#e9eef0'); R(ctx,30,62,8,10,'#e9eef0'); R(ctx,2,8,8,72,'#6f8ea6'); }
}

/* ============ CENAS ============ */
function drawFight(now){               // nuvem de briga estilo desenho animado
  const cx = fx.fightX, cy = fx.fightY, t = now/90;
  ctx.save(); ctx.imageSmoothingEnabled = false;
  // bolas de poeira
  for (let k=0;k<9;k++){
    const a = k/9*Math.PI*2 + t*0.35, j = (Math.floor(t*1.7)+k)%3;
    const x = cx + Math.cos(a)*(18+j*2), y = cy + Math.sin(a)*(11+j), r = 14 + ((k+Math.floor(t))%3)*2;
    ctx.fillStyle = OL; ctx.beginPath(); ctx.arc(x, y, r+1.5, 0, 7); ctx.fill();
  }
  for (let k=0;k<9;k++){
    const a = k/9*Math.PI*2 + t*0.35, j = (Math.floor(t*1.7)+k)%3;
    const x = cx + Math.cos(a)*(18+j*2), y = cy + Math.sin(a)*(11+j), r = 14 + ((k+Math.floor(t))%3)*2;
    ctx.fillStyle = k%2 ? '#f4f1ea' : '#e2ddd2'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  }
  ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.ellipse(cx, cy, 30, 18, 0, 0, 7); ctx.fill();
  // braços e pernas saindo da nuvem
  const limbs = [['#2b5bb8',0],['#2b2b33',1.3],['#1f3a74',2.5],['#40619a',3.6],['#f1c89e',4.6],['#fde0bc',5.5]];
  limbs.forEach(([col,a0],k)=>{ const a = a0 + Math.sin(t*0.9+k)*0.6, r = 40 + (Math.floor(t+k)%2)*5;
    const x = cx + Math.cos(a)*r, y = cy + Math.sin(a)*r*0.7;
    R(ctx, Math.round(x)-4, Math.round(y)-4, 9, 9, OL); R(ctx, Math.round(x)-3, Math.round(y)-3, 7, 7, col); });
  // estrelinhas e cabeças aparecendo
  const f = Math.floor(t)%4;
  [[cx-22,cy-20],[cx+20,cy-16],[cx-6,cy+16],[cx+26,cy+10]].forEach(([x,y],k)=>{ if ((k+f)%2) return;
    R(ctx,x-1,y-4,3,9,'#F4BB0E'); R(ctx,x-4,y-1,9,3,'#F4BB0E'); R(ctx,x,y,1,1,'#fff'); });
  ctx.font = '700 11px "Pixelify Sans", sans-serif'; ctx.textAlign = 'center';
  const words = ['POW!','#@!','PAF!','!!'], w = words[Math.floor(t/3)%4];
  ctx.lineWidth = 3; ctx.strokeStyle = OL; ctx.strokeText(w, cx + (f%2? -18:16), cy - 24); ctx.fillStyle = '#e8706f'; ctx.fillText(w, cx + (f%2? -18:16), cy - 24);
  ctx.restore();
}
async function startFight(ids, x, y){
  fx.fight = true; fx.fightX = x; fx.fightY = y; ids.forEach(id=>actors[id].hidden = true);
  (async()=>{ while(fx.fight){ noise(0.06,0.3,300+Math.random()*700,1.2); tone(90+Math.random()*60,0.05,'square',0.05); await wait(130+Math.random()*120); } })();
}
function stopFight(ids){ fx.fight = false; ids.forEach(id=>{ if (actors[id]) actors[id].hidden = false; }); SFX.pop(); }

function drawBoombox(now){             // caixinha de som na mesa do Wagner, com notas voando
  const x = 210, y = 61, on = fx.loud, pulse = on && Math.floor(now/120)%2 ? 1 : 0;
  R(ctx,x-1,y-1,24,15,OL); R(ctx,x,y,22,13,'#3a3f4a'); R(ctx,x+7,y+2,8,3,'#64C6CC');
  R(ctx,x+5,y-4,12,2,OL); R(ctx,x+5,y-4,1,4,OL); R(ctx,x+16,y-4,1,4,OL);
  [[x+4,y+8],[x+18,y+8]].forEach(([cx,cy])=>{ const r = 3 + pulse; R(ctx,cx-r,cy-r,2*r+1,2*r+1,'#1b1416'); R(ctx,cx-1,cy-1,3,3,'#9aa0aa'); });
  if (!on) return;
  for (let k=0;k<6;k++){
    const t = ((now/1400) + k/6) % 1, nx = x + 8 + Math.sin(t*7 + k)*16 - t*40*(k%2?1:-0.4), ny = y - 4 - t*48;
    const col = ['#F4BB0E','#e8706f','#12B0B6'][k%3];
    R(ctx,Math.round(nx),Math.round(ny),3,3,col); R(ctx,Math.round(nx)+2,Math.round(ny)-7,1,8,col); R(ctx,Math.round(nx)+2,Math.round(ny)-7,3,1,col);
  }
}
function drawBin(now){                 // lixo ao lado do vaso (banheiro) + papel voando
  const x = 92, y = 96, open = fx.binOpen;
  if (fx.paper){
    const p = Math.min(1, (now - fx.paper.t0) / 650);
    const px = fx.paper.x0 + (x+6 - fx.paper.x0)*p, py = fx.paper.y0 + (y-2 - fx.paper.y0)*p - Math.sin(Math.PI*p)*34;
    if (p < 1){ R(ctx,Math.round(px)-3,Math.round(py)-3,8,8,OL); R(ctx,Math.round(px)-2,Math.round(py)-2,6,6,'#ffffff'); R(ctx,Math.round(px),Math.round(py),1,1,'#c9ced4'); }
  }
  R(ctx,x-1,y-1,18,26,OL); R(ctx,x,y,16,24,'#b7bcc2'); R(ctx,x+2,y+2,3,20,'#d3d7db'); R(ctx,x,y+21,16,3,'#8e949b');
  if (open){ R(ctx,x-2,y-9,20,3,OL); R(ctx,x-1,y-8,18,1,'#9aa0a6'); R(ctx,x+2,y-3,12,3,'#f4f4f0'); }
  else { R(ctx,x-2,y-3,20,4,OL); R(ctx,x-1,y-2,18,2,'#9aa0a6'); }
}
const BIG = (id, y)=>Object.assign(actors[id], {scale:2, y});   // boneco em close (copa e banheiro)
const KY = 68, KY_B = 58;              // altura na copa: normal / Brenda (mais alta)

const SCENES = [
  { // 1. FOFOCA
    name:'Fofoca', clock:'QUA<br>10:15', bg:()=>officeBg,
    intro:'Quarta-feira, 10h15.<br>Todo mundo focado… quase todo mundo.',
    setup(){ addActor('amauri',34,1); addActor('fernanda',178,-1); addActor('wagner',-24,1); },
    async play(){
      await wait(400);
      await walk('wagner',150); look('fernanda',-1); look('wagner',1);
      await say('wagner','Psiu, Fê! Você não vai acreditar no que eu ouvi no corredor…');
      await say('wagner','Blá, blá, blá… e o pior: blá, blá, blá!', {hold:600, speed:26});
      clearAll(); emote('amauri','…',1400); await emote('fernanda','!!',1400);
    },
    q:'O Wagner chegou com uma fofoca sobre um colega. O que a Fernanda faz?',
    opts:['Puxa uma cadeira: “conta tudo!”','Repassa no grupo do WhatsApp','Corta com educação e muda de assunto','Conta só pra uma pessoa de confiança'],
    right:2,
    async react(){
      await say('fernanda','Wagner, isso não é assunto nosso. Bora focar na meta?',{hold:900});
      emote('wagner','^^;',1200); await say('wagner','É verdade… foi mal!',{hold:700});
      clearAll(); await walk('wagner',70);
    }
  },
  { // 2. FILME NO HORÁRIO DE TRABALHO (quarto do GIF, Amauri sentado, filme na TV)
    name:'Filme na meta', clock:'SEG<br>15:40', bg:()=>null,
    intro:'Último dia do mês.<br>A meta do comercial ainda não foi batida…',
    setup(){
      addActor('amauri',27,1); Object.assign(actors.amauri,{scale:2.5, seated:true, y:20});
      addActor('brenda',262,-1); Object.assign(actors.brenda,{scale:2.5, y:44});
      fx.front = filmFront;
    },
    draw(now){
      if (filmSheet.complete){
        const i = Math.floor(now/70) % 48;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(filmSheet, (i%8)*360, Math.floor(i/8)*203, 360, 203, 0, 0, W, H);
        if (fx.video && !vid.paused) ctx.drawImage(vid, 80, 0, 480, 360, CRT.x, CRT.y, CRT.w, CRT.h);
        ctx.imageSmoothingEnabled = false;
      }
    },
    async play(){
      startVideo(false); fx.video = true;
      await wait(2200);
      await emote('amauri','♥',900);
      await say('amauri','Só mais um pouquinho… o filme tá na melhor parte!',{hold:600});
      clearAll(); await walk('brenda',112,60); look('amauri',1);
      await emote('brenda','?!',1300);
    },
    q:'Fim de mês e a meta ainda aberta. O que o Amauri deveria estar fazendo?',
    opts:['Terminando o filme, falta pouco','Ligando pros clientes e levantando os dados da meta','Escolhendo o filme do fim de semana','Esperando o mês que vem'],
    right:1,
    async react(){
      await say('amauri','Opa! Desligando agora, Brenda!',{hold:300});
      stopVideo(); fx.video = false; SFX.click();
      await wait(500);
      await say('amauri','Pronto, já tô ligando pros clientes.',{hold:500});
      await say('brenda','Isso! Filme é em casa. Aqui a gente bate meta!',{hold:1000});
      clearAll();
    }
  },
  { // 3. POLÍTICA (copa)
    name:'Política', clock:'TER<br>12:30', bg:()=>kitchenBg,
    intro:'Hora do almoço na copa.<br>E o clima esquentou…',
    setup(){ addActor('fernanda',58,1); addActor('wagner',110,-1); addActor('amauri',262,-1);
      BIG('fernanda',KY); BIG('wagner',KY); BIG('amauri',KY); fridgeOpen = fridgeTarget = 0; window.lunchTaken = false; },
    draw(now){ if (fx.fight) drawFight(now); },
    async play(){
      await wait(300);
      await say('wagner','Não dá pra defender o seu candidato!',{hold:300,speed:26});
      SFX.angry(); emote('wagner','#@!',700); await wait(400);
      await say('fernanda','O seu é que não dá! Vocês acabaram com tudo!',{hold:300,speed:26});
      SFX.angry(); emote('fernanda','#@!',700); await wait(400);
      clearAll(); startFight(['fernanda','wagner'], 106, 98);
      await wait(2200);
      await walk('amauri',176,50); look('amauri',-1);
      await emote('amauri','!!',700);
      await say('amauri','Ei, ei, ei! Parou, parou!',{hold:400,speed:26});
      stopFight(['fernanda','wagner']); look('fernanda',1); look('wagner',-1);
      clearAll(); emote('fernanda','^^;',1200); await emote('wagner','^^;',1200);
    },
    q:'O Amauri encontra a Fernanda e o Wagner discutindo política aos gritos. O que isso pode causar?',
    opts:['Nada, é só uma conversa','Um debate produtivo pra empresa','Clima pesado, conflito na equipe e até advertência','Uma amizade mais forte'],
    right:2,
    async react(){
      await say('amauri','Gente, política a gente deixa da porta pra fora, combinado?',{hold:700});
      look('fernanda',1); look('wagner',-1);
      await say('wagner','Combinado. Desculpa, Fê.',{hold:400});
      await say('fernanda','Tudo certo! Vamos de café?',{hold:900});
      clearAll();
    }
  },
  { // 4. LOUÇA NA PIA (copa)
    name:'Louça na pia', clock:'QUI<br>14:05', bg:()=>kitchenBg,
    intro:'Depois do almoço…<br>a pia da copa começou a encher.',
    setup(){ addActor('brenda',40,1); addActor('amauri',262,-1); BIG('brenda',KY_B); BIG('amauri',KY);
      fx.dishes = 3; fridgeOpen = fridgeTarget = 0; window.lunchTaken = false; actors.brenda.holding = 'mugEmpty'; },
    draw(){ drawSink(); },
    async play(){
      await wait(300);
      await walk('brenda',112,50);
      actors.brenda.holding = null; fx.mugInSink = true; SFX.click();
      await say('brenda','Deixa de molho… depois alguém lava!',{hold:400});
      clearAll(); await walk('brenda',30,56);
      await walk('amauri',196,50); look('amauri',-1);
      await emote('amauri','…',1300);
    },
    q:'A Brenda deixou a caneca na pia “pra depois”. Qual é a atitude certa?',
    opts:['Deixar de molho até sexta','Esperar a equipe da limpeza','Lavar, secar e guardar na hora','Esconder atrás das outras louças'],
    right:2,
    async react(){
      look('brenda',1); await emote('brenda','!',700);
      await walk('brenda',112,56);
      fx.washing = true; SFX.water(); await wait(1300);
      fx.washing = false; fx.mugInSink = false; fx.dishes = 0; actors.brenda.holding = 'mugEmpty'; SFX.pick();
      await say('brenda','Usou, lavou, guardou! Pia limpa é de todo mundo.',{hold:1000});
      clearAll();
    }
  },
  { // 5. COMUNICAÇÃO DE AUSÊNCIA (Flávia)
    name:'Avisar ausência', clock:'TER<br>08:30', bg:()=>officeBg,
    intro:'Terça-feira, 8h30.<br>Todo mundo chegou… quase todo mundo.',
    setup(){ addActor('amauri',14,1); addActor('wagner',96,1); addActor('flavia',178,-1);
      BIG('amauri',KY); BIG('wagner',KY); BIG('flavia',KY); },
    async play(){
      await wait(400);
      look('wagner',1); await emote('wagner','?',800);
      await say('wagner','Ué, cadê a Fernanda? Ela não veio hoje?',{hold:500});
      look('flavia',-1);
      await say('flavia','Não sei… ninguém me avisou nada.',{hold:500});
      look('amauri',1); look('wagner',-1);
      await say('amauri','Ah, ela me mandou mensagem. Disse que ia se atrasar.',{hold:600});
      clearAll(); emote('flavia','…',1200); await emote('wagner','…',1200);
      const c = document.createElement('div'); c.className = 'caption';
      c.innerHTML = '<small>NA VERDADE…</small>A Fernanda foi ao médico e vai trazer um atestado.<br>E só avisou o Amauri.';
      overlay.appendChild(c); SFX.pop(); await wait(4200); c.remove();
    },
    q:'A Fernanda foi ao médico e vai trazer atestado, mas só mandou mensagem pro Amauri. O que ela deveria ter feito?',
    opts:['Avisar um colega já resolve','Não avisar ninguém e entregar o atestado depois','Avisar a liderança o quanto antes e enviar o atestado pelo canal certo','Postar nos stories que está doente'],
    right:2,
    async react(){
      await say('flavia','Ah, então ela foi ao médico! E a liderança nem sabia…',{hold:500});
      await say('amauri','Pois é, ela só falou comigo.',{hold:400});
      look('wagner',1);
      await say('wagner','Ausência e atestado: avisa a liderança e manda pelo canal certo!',{hold:1100});
      clearAll();
    }
  },
  { // 8. CONFLITO
    name:'Conflito', clock:'QUI<br>10:30', bg:()=>officeBg,
    intro:'O ar-condicionado está em 16 °C.<br>E alguém não gostou nada disso…',
    setup(){ addActor('fernanda',178,-1); addActor('amauri',30,1); addActor('wagner',80,-1); },
    async play(){
      await wait(300);
      await emote('amauri','brrr',1000);
      await say('amauri','A Fernanda só pensa nela! E eu aqui congelando…',{hold:400});
      await say('wagner','Sério? Conta mais…',{hold:400});
      clearAll(); await emote('fernanda','?',1000);
    },
    q:'O Amauri ficou incomodado com a Fernanda. Qual é o melhor caminho?',
    opts:['Reclamar dela pelos corredores','Ficar de cara feia e não falar nada','Mandar indireta no status do WhatsApp','Conversar direto com ela, com respeito'],
    right:3,
    async react(){
      await walk('amauri',150,46); look('fernanda',-1);
      await say('amauri','Fê, posso falar com você? Estou congelando. Dá pra subir um pouco o ar?',{hold:400});
      await say('fernanda','Claro! Nem tinha percebido. 23 °C está bom?',{hold:400});
      await say('amauri','Perfeito, obrigado!',{hold:900});
      clearAll();
    }
  },
  { // 9. PONTUALIDADE
    name:'Atraso', clock:'SEG<br>08:20', bg:()=>officeBg,
    intro:'Reunião de segunda, marcada para as 8h.<br>Já são 8h20…',
    setup(){ addActor('brenda',96,1); addActor('amauri',128,-1); addActor('fernanda',160,-1); addActor('wagner',-24,1); },
    async play(){
      await wait(300);
      await say('brenda','Alguém sabe do Wagner? A reunião era às 8h…',{hold:400});
      emote('amauri','?',1000); await emote('fernanda','?',1000);
      clearAll(); await walk('wagner',58,80);
      await emote('wagner','^^;',1000);
      await say('wagner','Cheguei! O trânsito estava terrível…',{hold:600});
      clearAll();
    },
    q:'O Wagner sabia que ia se atrasar. O que ele deveria ter feito?',
    opts:['Entrar quietinho e fingir que estava lá','Avisar a equipe antes','Nada, 20 minutos é normal','Avisar só depois da reunião'],
    right:1,
    async react(){
      look('brenda',-1);
      await say('brenda','Imprevisto acontece! Mas avisando antes, a gente se organiza.',{hold:500});
      await say('wagner','Combinado! Da próxima vez eu aviso no grupo.',{hold:1000});
      clearAll();
    }
  },
  { // 10. MARMITA NA SEXTA (copa)
    name:'Marmita', clock:'SEX<br>17:28', bg:()=>kitchenBg,
    intro:'Sexta-feira, 17h28.<br>Faltam 2 minutos para o fim de semana!',
    setup(){ addActor('brenda',70,1); addActor('fernanda',112,1); addActor('wagner',150,1); addActor('amauri',192,-1);
      BIG('brenda',KY_B); BIG('fernanda',KY); BIG('wagner',KY); BIG('amauri',KY);
      actors.wagner.holding = 'nada'; actors.amauri.holding = 'nada';
      fridgeOpen = fridgeTarget = 0; window.lunchTaken = false; },
    async play(){
      await wait(300);
      await say('brenda','Ufa, que semana! Bom descanso, gente!',{hold:400});
      look('amauri',-1); await say('amauri','Até segunda, pessoal!',{hold:300});
      await say('wagner','Bom fim de semana! Fui!',{hold:200});
      clearAll(); look('amauri',1); look('wagner',1);
      walk('amauri',270,80); await walk('wagner',270,80);
      await wait(300);
      await walk('fernanda',196,90);
      look('fernanda',-1); await emote('fernanda','?',1100);
      await say('fernanda','Opa… estou esquecendo alguma coisa?',{hold:500});
      clearAll();
    },
    q:'Sexta, 17h28. Antes de sair às 17h30, o que a Fernanda precisa fazer?',
    opts:['Desligar o computador, pegar as coisas e levar a marmita da geladeira','Sair correndo, não pode atrasar nem um minuto','Deixar a marmita, segunda ela pega','Pedir pra alguém jogar fora na segunda'],
    right:0,
    async react(){
      clearAll(); await walk('fernanda',26,80); look('fernanda',-1);
      fridgeTarget = 1; SFX.door(); await wait(700);
      window.lunchTaken = true; actors.fernanda.holding = 'marmita'; SFX.pick(); await wait(500);
      fridgeTarget = 0; SFX.door(true); await wait(350); look('fernanda',1);
      await say('fernanda','Marmita resgatada! Segunda sem cheiro ruim.',{hold:700});
      look('brenda',-1);
      await say('brenda','Isso! E lembrando: o que sobrar na geladeira na sexta vai pro lixo.',{hold:1200});
      clearAll();
    }
  },
];

