//https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
//https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja
const cname='2310260',
cstore=[
	'util.js',
	'img/icon.svg','img/icon_.svg','img/icon.png','img/icon192.png',
	'img/icon/instr.svg','img/icon/info.svg','img/icon/seq.svg','img/icon/manual.svg',
	'https://mcbeeringi.github.io/src/toggle.css',
	'img/atlas0.svg','img/atlas1.webp','img/sel.svg',
	'index.html',

	'instr.html',
	'audio/instr/musicbox/a3.mp3',
	'audio/instr/musicbox/a4.mp3',
	'audio/instr/musicbox/a5.mp3',
	'audio/instr/musicbox/a6.mp3',
	'audio/instr/musicbox/ds4.mp3',
	'audio/instr/musicbox/ds5.mp3',
	'audio/instr/musicbox/ds6.mp3',
	'audio/instr/musicbox/ds7.mp3',

	'info.html',
	'img/tc/00.webp','img/tc/01.webp','img/tc/02.webp',
	'img/tc/10.webp','img/tc/11.webp','img/tc/12.webp',
	'img/tc/20.webp','img/tc/21.webp',
	'img/tc/30.webp','img/tc/31.webp','img/tc/32.webp',
	'img/tc/40.webp','img/tc/41.webp',

	'manual.html'
],
cprev=[
	'_.html'
];
/*
const clist={
	common:[
		'com.js',
		'img/icon.svg','img/icon_.svg','img/icon.png','img/icon192.png',
		'index.html'
	],
	instr$2206081:[

	],
}
*/
self.addEventListener('install',e=>{
	console.log('sw Install');
	e.waitUntil(caches.open(cname).then(c=>c.addAll(cstore)));
});
self.addEventListener('activate',e=>{
	console.log('sw Activate');
	e.waitUntil(caches.keys().then(x=>Promise.all(x.map(y=>(y==cname||caches.delete(y))))));
});

self.addEventListener('fetch',e=>{
	if(cprev.find(x=>e.request.url.includes(x))){console.log('sw Cache canceled: '+e.request.url);return;}
	const cacheNew=()=>fetch(e.request.url).then(r=>caches.open(cname).then(c=>{
		c.put(e.request.url,r.clone());
		console.log(e.request.url+' cached.');
		return r;
	}));

	if(e.request.headers.has('range')){//https://qiita.com/biga816/items/dcc69a265235f1c3f7e0
		console.log('sw Fetch (Range): '+e.request.url);
		const p=e.request.headers.get('range').slice(6).split('-').map(Number);
		e.respondWith(
			caches.match(e.request.url,{ignoreSearch:true}).then(r=>r||cacheNew()).then(r=>r.arrayBuffer()).then(b=>{
				if(p[1])p[1]++;else p[1]=b.byteLength;
				new Response(b.slice(...p),{
					status:206,statusText:'Partial Content',
					headers:[
						['Content-Type',e.request.headers.get('content-type')],
						['Content-Range',`bytes ${p[0]}-${p[1]-1}/${b.byteLength}`]
					]
				});
			})
		);
	}else{
		console.log('sw Fetch: '+e.request.url);
		e.respondWith(caches.match(e.request.url,{ignoreSearch:true}).then(r=>r||cacheNew()));
	}
});
