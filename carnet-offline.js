const cacheName='carnet-vol-'+self.registration.scope+'-v1';
const page=new URL('index.html',self.registration.scope).href;
const banner=new URL('c130j-bandeau.jpg',self.registration.scope).href;
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
   const cache=await caches.open(cacheName);
   await cache.add(new Request(page,{cache:'reload'}));
   await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 const isPage=request.mode==='navigate' && [self.registration.scope,page].includes(url.origin+url.pathname);
 if(!isPage && url.href!==banner)return;
 event.respondWith((async()=>{
   const cache=await caches.open(cacheName), key=isPage?page:banner;
   try{
     const response=await fetch(request);
     if(response.ok){
       try{await cache.put(key,response.clone())}catch{/* Le réseau reste utilisable si le cache est plein. */}
       return response;
     }
     return (await cache.match(key))||response;
   }catch(error){
     const cached=await cache.match(key);
     if(cached)return cached;
     throw error;
   }
 })());
});
