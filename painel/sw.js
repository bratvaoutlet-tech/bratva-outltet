const CACHE='bratva-v2';
const STATIC=['/','index.html','manifest.json','icon-192.png','icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC).catch(()=>{})));
  self.skipWaiting();
});

self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch',e=>{
  // CRÍTICO: ignorar URLs não-http (chrome-extension, etc)
  if(!e.request.url.startsWith('http'))return;
  // Ignorar Supabase e APIs (sempre fresh)
  const url=new URL(e.request.url);
  if(url.hostname.includes('supabase.co')||url.hostname.includes('anthropic.com'))return;

  if(e.request.method!=='GET')return;

  e.respondWith(
    caches.open(CACHE).then(cache=>{
      return fetch(e.request).then(response=>{
        if(response&&response.status===200&&e.request.url.startsWith('http')){
          try{cache.put(e.request,response.clone());}catch(err){}
        }
        return response;
      }).catch(()=>cache.match(e.request));
    })
  );
});

self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow('/'));});
