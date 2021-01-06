//https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
//https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja
const cacheName='cache210106_6',STATIC_DATA=[
	'style.js',
	'img/sky.svg',
	'img/sky.png',
	'img/sky_192.png',

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
	'img/tex.png',
	'img/hotsprv.mp4',
	'audio/hotspra.mp3',
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
		caches.match(e.request).then((r)=>{
			if(!r){//cache doesnt exist
				 e.respondWith(
					 fetch(e.request).then((response)=>{
						return caches.open(cacheName).then((cache)=>{
							console.log('[ServiceWorker] Caching: '+e.request.url);
							cache.put(e.request,response.clone());
							return response;
						});
					});
				);
				return;
			}
			switch(e.request.destination){
				case'video':{
					const rangeMatch=e.request.headers.get('range').match(/^bytes\=(\d+)\-(\d+)?/);
					const pos=Number(rangeMatch[1]);
					let pos2=rangeMatch[2];if(pos2)pos2=Number(pos2);
					e.respondWith(
						caches.open(cacheName)
						.then(cache=>cache.match(e.request.url).arrayBuffer())
						.then(arrayBuffer=>{
							const responseHeaders={
								status:206,
								statusText:'Partial Content',
								headers:[
									['Content-Type','video/mp4'],
									['Content-Range',`bytes${pos}-${(pos2||(arrayBuffer.byteLength-1))}/${arrayBuffer.byteLength}`]
								]
							};
							if(pos2>0)return new Response(arrayBuffer.slice(pos,pos2+1),responseHeaders);
							else return new Response(arrayBuffer.slice(pos),responseHeaders);
						})
					)
					return;
				}
				default:{
					e.respondWith(r);
					return;
				}
			/*
			console.log('[ServiceWorker] Fetching resource: '+e.request.url,r);
			return r || fetch(e.request).then((response)=>{
				return caches.open(cacheName).then((cache)=>{
					console.log('[ServiceWorker] Caching new resource: '+e.request.url);
					cache.put(e.request,response.clone());
					return response;
				});
			});*/
		})
});

//https://lt-collection.gitlab.io/pwa-nights-vol8/document/#12
//https://qiita.com/biga816/items/dcc69a265235f1c3f7e0
/*
self.addEventListener('fetch',e=>{
	switch(e.request.destination){
		case'video':{
			// ステータスコード206 Partial Contentでレスポンスを返却する処理
			const rangeHeader=e.request.headers.get('range');
			const rangeMatch=rangeHeader.match(/^bytes\=(\d+)\-(\d+)?/);
			const pos=Number(rangeMatch[1]);
			let pos2=rangeMatch[2];
			if(pos2)pos2=Number(pos2);
			if(!rangeHeader){cacheFirst(e);return;}
			e.respondWith(
				caches.open(cacheName)
				.then(cache=>cache.match(e.request.url))
				.then(response=>{
					if(!response)fetch(e.request.url).then(res=>res.arrayBuffer())
					return response.arrayBuffer();
				})
				.then(arrayBuffer=>{
					let responseHeaders={
						status:206,
						statusText:'Partial Content',
						headers:[
							['Content-Type','video/mp4'],
							['Content-Range',`bytes${pos}-${(pos2||(arrayBuffer.byteLength-1))}/${arrayBuffer.byteLength}`]
						]
					};
					let arrayBufferSliced={};
					if(pos2>0)arrayBufferSliced=arrayBuffer.slice(pos,pos2+1);
					else arrayBufferSliced=arrayBuffer.slice(pos);
					return new Response(arrayBufferSliced,responseHeaders);
				})
			)
			return;
		}
		default:{
			e.respondWith(
				cacheFallingBackToNetwork(e)
			);
			return;
		}
	}
});
*/
