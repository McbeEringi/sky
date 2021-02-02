//https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
//https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja
const cacheName='cache210202_1',STATIC_DATA=[
	'style.js',
	'img/sky.svg',
	'img/sky.png',
	'img/sky_192.png',

	//index
	'index.html?pwa=0',
	'img/ico/sky.jpg','img/ico/instr.jpg','img/ico/info.jpg','img/ico/seq.jpg',
	'https://mcbeeringi.github.io/src/menu.css'
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
	'img/tex.webp',
	//'img/hotsprv.mp4',
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
	console.log('skysw Install');
});
self.addEventListener('activate',(e)=>{
	console.log('skysw Activate')
	e.waitUntil(
		caches.keys().then((keyList)=>{
			return Promise.all(keyList.map((key)=>{
				if(key !== cacheName){return caches.delete(key);}
			}));
		})
	);
});

self.addEventListener('fetch',(e)=>{
	const cacheNew=()=>fetch(e.request.url).then(r=>caches.open(cacheName).then(cache=>{
		console.log('skysw Cache: '+e.request.url);
		cache.put(e.request.url,r.clone());
		if(r)return r;
	}));

	if(e.request.headers.has('range')){
		//https://lt-collection.gitlab.io/pwa-nights-vol8/document/#12
		//https://qiita.com/biga816/items/dcc69a265235f1c3f7e0
		const ranPrm=e.request.headers.get('range').match(/^bytes\=(\d+)\-(\d+)?/),contType=e.request.headers.get('content-type');
		const pos=Number(ranPrm[1]),pos2=ranPrm[2]?Number(ranPrm[2]):ranPrm[2];
		e.respondWith(
			caches.match(e.request.url)
			.then(r=>{
				if(!r)return cacheNew().arrayBuffer();
				console.log('skysw Range: '+e.request.url);
				return r.arrayBuffer();
			})
			.then(arrb=>new Response(arrb.slice(pos,(pos2>0)?(pos2+1):undefined),{
				status:206,
				statusText:'Partial Content',
				headers:[
					['Content-Type',contType],
					['Content-Range',`bytes${pos}-${(pos2||(arrb.byteLength-1))}/${arrb.byteLength}`]
				]
			}))
		)
	}
	else
	e.respondWith(
		caches.match(e.request.url).then((r)=>{
			if(r)console.log('skysw Fetch: '+e.request.url);
			return r || cacheNew();
		})
	);
});
