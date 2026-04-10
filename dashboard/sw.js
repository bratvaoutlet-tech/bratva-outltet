const CACHE='bratva-dash-v1';
const ASSETS=['/','/index.html','/manifest.json'];
const SUPA_URL='https://ibotiuzqjvqxoizpqhoi.supabase.co';
const SUPA_KEY='sb_publishable_wsjd0JCgHf8WDB6B7TNEmA_hLjGs59a';

self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS).catch(()=>{})));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();startPolling();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request,{cache:'no-cache'}).then(res=>{const c=res.clone();caches.open(CACHE).then(ca=>ca.put(e.request,c));return res;}).catch(()=>caches.match(e.request)));});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('/'));});

let lastCheck=new Date().toISOString();
function startPolling(){setInterval(checkNotifs,60000);}
async function checkNotifs(){
  try{
    const res=await fetch(`${SUPA_URL}/rest/v1/push_notificacoes?created_at=gt.${lastCheck}&order=created_at.desc&limit=1`,{headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY}});
    if(!res.ok)return;
    const data=await res.json();
    if(data&&data.length){
      lastCheck=new Date().toISOString();
      self.registration.showNotification(data[0].titulo||'👟 Bratva Outlet',{body:data[0].mensagem||'Nova atualização!',icon:'/icon-192.png',badge:'/icon-192.png',tag:'bratva-notif'});
    }
  }catch(e){}
}
