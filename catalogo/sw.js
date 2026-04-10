const CACHE = 'bratva-rev-v3';
const ASSETS = ['/', '/index.html', '/manifest.json'];
const SUPA_URL = 'https://ibotiuzqjvqxoizpqhoi.supabase.co';
const SUPA_KEY = 'sb_publishable_wsjd0JCgHf8WDB6B7TNEmA_hLjGs59a';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
  ));
  self.clients.claim();
  startPolling();
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, {cache:'no-cache'})
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('/'));
});

let lastCheck = new Date().toISOString();

function startPolling(){
  setInterval(checkNewNotifs, 60000);
}

async function checkNewNotifs(){
  try{
    const res = await fetch(
      `${SUPA_URL}/rest/v1/push_notificacoes?created_at=gt.${lastCheck}&order=created_at.desc&limit=1`,
      { headers:{'apikey':SUPA_KEY,'Authorization':'Bearer '+SUPA_KEY} }
    );
    if(!res.ok) return;
    const data = await res.json();
    if(data && data.length){
      lastCheck = new Date().toISOString();
      const n = data[0];
      self.registration.showNotification(n.titulo || '👟 Bratva Outlet', {
        body: n.mensagem || 'Confira o catálogo!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'bratva-produto',
        requireInteraction: false
      });
    }
  }catch(e){}
}
