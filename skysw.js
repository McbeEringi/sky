//https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
//https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja
const cacheName='cache200906_4',STATIC_DATA=[
	'style.js',
	'img/sky.svg',

	//index
	'index.html?pwa=0','img/ico.png',
	//info
	'info.html?pwa=1',
	'img/candle/00.JPG','img/candle/01.JPG','img/candle/02.JPG',
	'img/candle/10.JPG','img/candle/11.JPG','img/candle/12.JPG',
	'img/candle/20.JPG','img/candle/21.JPG',
	'img/candle/30.JPG','img/candle/31.JPG','img/candle/32.JPG',
	'img/candle/40.JPG','img/candle/41.JPG',
	//instr
	'instr.html?pwa=1',
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
	'audio/instr/musicbox/ds7.mp3'
];

self.addEventListener('install',(e)=>{
	e.waitUntil(
		caches.open(cacheName).then((cache)=>{
			return cache.addAll(STATIC_DATA);
		})
	);
	console.log('[ServiceWorker] Install');
});
self.addEventListener('activate',(e)=>{
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
				return caches.open(cacheName).then((cache)=>{
					console.log('[ServiceWorker] Caching new resource: '+e.request.url);
					cache.put(e.request,response.clone());
					return response;
				});
			});
		})
	);
});
