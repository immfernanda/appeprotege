/* Conexão ao vivo TV <-> celulares (MQTT público via WebSocket, sem cadastro).
   Só trafegam: letra respondida, número da pergunta e um código aleatório do aparelho. */
const QUIZ_BROKER = new URLSearchParams(location.search).get('broker') || 'wss://broker.emqx.io:8084/mqtt';
const QUIZ_PREFIX = 'eprotege-quiz/v1/';
const QUIZ_CHARS  = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function quizRandom(n){ let s=''; for(let i=0;i<n;i++) s += QUIZ_CHARS[Math.floor(Math.random()*QUIZ_CHARS.length)]; return s; }

/* code: código da sala; subs: lista de sub-tópicos para ouvir; onMessage(sub, data); onStatus('on'|'off') */
function quizNet(code, subs, onMessage, onStatus){
  const base = QUIZ_PREFIX + code + '/';
  let client = null;
  try {
    client = mqtt.connect(QUIZ_BROKER, {
      clientId: 'epq_' + quizRandom(10), clean: true, keepalive: 30,
      connectTimeout: 8000, reconnectPeriod: 2000,
    });
  } catch (e) { onStatus && onStatus('off'); return { publish(){}, connected:()=>false }; }
  client.on('connect', ()=>{ onStatus && onStatus('on'); subs.forEach(s=>client.subscribe(base+s, {qos:1})); });
  client.on('close',   ()=>onStatus && onStatus('off'));
  client.on('offline', ()=>onStatus && onStatus('off'));
  client.on('error',   ()=>onStatus && onStatus('off'));
  client.on('message', (topic, payload)=>{
    let data = null; try { data = JSON.parse(payload.toString()); } catch(e){ return; }
    onMessage(topic.slice(base.length), data);
  });
  return {
    publish(sub, data, retain=false){ if (client && client.connected) client.publish(base+sub, JSON.stringify(data), {qos:1, retain}); },
    connected(){ return !!(client && client.connected); },
  };
}
