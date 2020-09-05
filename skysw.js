//https://qiita.com/masanarih0ri/items/0845f312cff5c8d0ec60
const STATIC_DATA = [
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
	'audio/instr/musicbox/ds7.mp3'
	'https://tonejs.github.io/audio/salamander/Ds4.mp3',
	'https://tonejs.github.io/audio/salamander/A4.mp3',
	'https://tonejs.github.io/audio/salamander/Ds5.mp3',
	'https://tonejs.github.io/audio/salamander/A5.mp3',
	'https://tonejs.github.io/audio/salamander/Ds6.mp3',
	'https://tonejs.github.io/audio/salamander/A6.mp3'
];

self.addEventListener('install',function(e){
	e.waitUntil(
		caches.open('cache_v1').then(function(cache){
			return cache.addAll(STATIC_DATA);
		})
	);
	console.log('[ServiceWorker] Install');
});
self.addEventListener('activate', function(e){console.log('[ServiceWorker] Activate');});
self.addEventListener('fetch', function(e) {
	console.log(e.request.url);
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});
