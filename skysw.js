//https://qiita.com/masanarih0ri/items/0845f312cff5c8d0ec60
const cacheName='cache_v1',STATIC_DATA=[
	'instr.html',
	'style.js',
	'https://tonejs.github.io/build/Tone.js',
	'https://cdn.jsdelivr.net/npm/js-cookie@rc/dist/js.cookie.min.js',
	'img/tex.png',
	'audio/instr/musicbox/a3.mp3',
	'audio/instr/musicbox/a4.mp3',
	'audio/instr/musicbox/a5.mp3',
	'audio/instr/musicbox/a6.mp3',
	'audio/instr/musicbox/ds4.mp3',
	'audio/instr/musicbox/ds5.mp3',
	'audio/instr/musicbox/ds6.mp3',
	'audio/instr/musicbox/ds7.mp3',
	'https://tonejs.github.io/audio/salamander/Ds4.mp3',
	'https://tonejs.github.io/audio/salamander/A4.mp3',
	'https://tonejs.github.io/audio/salamander/Ds5.mp3',
	'https://tonejs.github.io/audio/salamander/A5.mp3',
	'https://tonejs.github.io/audio/salamander/Ds6.mp3',
	'https://tonejs.github.io/audio/salamander/A6.mp3'
];

self.addEventListener('install',function(e){
	e.waitUntil(
		caches.open(cacheName).then((cache)=>{
			return cache.addAll(STATIC_DATA);
		})
	);
	console.log('[ServiceWorker] Install');
});
self.addEventListener('activate', (e) => {
	console.log('[ServiceWorker] Activate')
	e.waitUntil(
		caches.keys().then((keyList)=>{
			return Promise.all(keyList.map((key)=>{
				if(key !== cacheName){return caches.delete(key);}
			}));
		})
	);
});
self.addEventListener('fetch',(e)=>{
	e.respondWith(
		caches.match(e.request).then((r)=>{
			console.log('[ServiceWorker] Fetching resource: '+e.request.url);
			return r || fetch(e.request).then((response)=>{
				return caches.open(cacheName).then((cache) => {
					console.log('[ServiceWorker] Caching new resource: '+e.request.url);
					cache.put(e.request, response.clone());
					return response;
				});
			});
		})
	);
});
