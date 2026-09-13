const CACHE='clarksons-app-shell-v1';
const asset=url=>url.origin===self.location.origin&&!url.pathname.startsWith('/api/')&&(/\.(js|css|woff2?|svg)$/.test(url.pathname));
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('message',event=>{
 if(event.data?.type!=='CACHE_LOADED_ASSETS'||!Array.isArray(event.data.urls))return;
 event.waitUntil((async()=>{const cache=await caches.open(CACHE);let failed=0;for(const raw of event.data.urls.slice(0,300)){try{const url=new URL(raw);if(!asset(url))continue;const response=await fetch(url.href,{credentials:'same-origin'});if(response.ok&&!response.redirected)await cache.put(url.href,response);else if(!await cache.match(url.href))failed++}catch{if(!await cache.match(raw))failed++}}try{const response=await fetch('/',{credentials:'same-origin'});if(response.ok&&!response.redirected&&response.headers.get('content-type')?.includes('text/html'))await cache.put(new URL('/',self.location.origin).href,response);else if(!await cache.match(new URL('/',self.location.origin).href))failed++}catch{if(!await cache.match(new URL('/',self.location.origin).href))failed++}event.source?.postMessage({type:'SHELL_CACHE_READY',complete:failed===0});const keys=await cache.keys();for(const key of keys.slice(0,Math.max(0,keys.length-350)))if(new URL(key.url).pathname!=='/')await cache.delete(key);})());
});
self.addEventListener('fetch',event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=='GET'||url.origin!==self.location.origin||url.pathname.startsWith('/api/'))return;
 if(request.mode==='navigate'&&url.pathname==='/'){event.respondWith((async()=>{const cache=await caches.open(CACHE),key=new URL('/',self.location.origin).href;try{const response=await fetch(request);if(response.ok&&!response.redirected&&response.headers.get('content-type')?.includes('text/html'))await cache.put(key,response.clone());return response}catch{const saved=await cache.match(key);return saved||new Response('Connect once to load your flock application before working offline.',{status:503,headers:{'Content-Type':'text/plain'}})}})());return;}
 if(asset(url))event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request);if(response.ok&&!response.redirected)await cache.put(request,response.clone());return response}catch{const saved=await cache.match(request);if(saved)return saved;throw Error('This screen has not been cached yet.')}})());
});
