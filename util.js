'use strict';
if('serviceWorker'in navigator&&location.protocol.includes('https'))addEventListener('load',()=>navigator.serviceWorker.register('sw.js').then(x=>{console.log('sw Registered',x);}),{once:true});
let idb=indexedDB.open('sky_idb',4),
	midi=null,
	tex=new Image(),
	texts={
		loading:'<p class="btn a1 spin">loading</p>',ename:'Error',emsg:'Something went wrong :(',
		idberr:'Failed to access indexedDB.<br>The app may not work properly.<br>Make sure your browser is not in private mode.',nf:'Not Found',caches:'Offline Caches',check:'Check',frcupd:'Fource Update',
		back2top:'Back to Top',gcfg:'General Config',bgi:'Background Image',bgil:['Dynamic','Photo','CSS Code'],bga:'Background Audio',bgal:['Hotspring','Home','Forest','Vault'],custom:'Custom',gain:'Volume',xfade:'Crossfade(sec)',
		...{
			ja:{
				ename:'エラー',emsg:'問題が発生しました Σ(・ω・ﾉ)ﾉ',
				idberr:'indexedDBのアクセスに失敗しました。<br>アプリが正常に動作しない可能性があります。<br>ブラウザがプライベートモードでないことを確認してください。',nf:'見つかりません',caches:'オフラインキャッシュ',check:'確認',frcupd:'強制更新',
				back2top:'トップに戻る',gcfg:'一般設定',bgi:'背景画像',bgil:['ダイナミック','画像','CSSコード'],bga:'背景音',bgal:['温泉','ホーム','雨林','書庫'],custom:'カスタム',gain:'音量',xfade:'クロスフェード(秒)'
			}
		}[navigator.language.slice(0,2)]
	};
const urlq=Object.fromEntries(location.search.slice(1).split('&').filter(y=>y).map(x=>x.split('=',2))),
	root=document.querySelector('script[src$="util.js"]').outerHTML.match(/"(.*)util.js"/)[1],
	gq={},
	gload=()=>({bgicode:gq.bgicode='linear-gradient(60deg,#214,#415)',bgialt:gq.bgialt,bgi:gq.bgi=0,bgagain:gq.bgagain=1,bgafade:gq.bgafade=10,bga:gq.bga=-1}=JSON.parse(localStorage.sky_gcfg||'{}')),
	gsave=()=>localStorage.sky_gcfg=JSON.stringify({bgicode:gq.bgicode,bgialt:gq.bgialt,bgi:gq.bgi,bgagain:gq.bgagain,bgafade:gq.bgafade,bga:gq.bga}),
	bgiset=(x=-1)=>{
		const bgcol=['#dca,#ac8','#bde,#ac8','#f80,#fb7','#112,#126','#bbc,#ac8'],//morn day dusk night cloud
		url=root+'img/photo/harmony.jpg',
		set=(y=`url(${url})`)=>bg.style.backgroundImage=y;
		({
			0:()=>{bgi.hidden=false;set(`linear-gradient(${bgcol[~x?x:[3,3,3,3,3,0,0,0,0,4,1,1,1,1,1,1,4,2,2,2,2,3,3,3][new Date().getHours()]]})`);},
			1:()=>{bgi.hidden=true;idb.name?e2p(os().get('bgimg')).then(e=>set(`url(${e.target.result?(x=>(ourls.push(x),x))(URL.createObjectURL(e.target.result)):url})`)).catch(e=>set()):set(`url(${gq.bgialt||url})`);},
			2:()=>{bgi.hidden=true;set(gq.bgicode);}
		})[~x?0:gq.bgi]();
	},
	bgaset=(fade=gq.bgafade)=>(async w=>{
		const id=bga.id=Symbol();
		bga.abs&&(bga.abs.stop(),bga.abs=null);
		if(!idb.name&&!~gq.bga)return;
		w=(~gq.bga?{name:texts.bgal[gq.bga],data:await(await fetch(`${root}audio/bga/${['onsen','home','forest','vault'][gq.bga]}.mp3`)).arrayBuffer()}:(await e2p(os().get('bga'))).target.result)
		if(!w||!w.data)return;
		w=await new Promise((f,r)=>actx.decodeAudioData(w.data,f,r));
		if(fade)w=await new Promise(f=>{
			const d=w.duration-fade,r=w.sampleRate,
				oac=new(window.OfflineAudioContext||webkitOfflineAudioContext)(w.numberOfChannels,d*r,r),
				abs0=oac.createBufferSource(),g0=oac.createGain(),abs1=oac.createBufferSource(),g1=oac.createGain();g1.gain.setValueAtTime(0,0);
			g0.gain.setValueAtTime(1,d-fade);g0.gain.linearRampToValueAtTime(0,d);g1.gain.setValueAtTime(0,d-fade);g1.gain.linearRampToValueAtTime(1,d);
			abs1.buffer=abs0.buffer=w;[[abs0,g0,oac.destination],[abs1,g1,oac.destination]].forEach(x=>x.reduce((a,y)=>(a.connect(y),y)));
			abs0.start(0,fade);abs1.start(d-fade);oac.startRendering();oac.oncomplete=e=>f(e.renderedBuffer);
		});
		if(bga.id!=id)return;
		bga.abs&&(bga.abs.stop(),bga.abs=null);
		(bga.abs=Object.assign(actx.createBufferSource(),{buffer:w,loop:true})).start();
		bga.g.gain.value=gq.bgagain;bga.abs.connect(bga.g);
	})().catch(errfx),
	gcfg=()=>{
		const e=alert(`<div class="flex">
				<h2>${texts.gcfg}</h2>
				<a class="btn" style="--bp:-400% -200%;" href="${root}manual.html">manual</a>
			</div>
			<hr>
			<h3>${texts.bgi}</h3>
			<div class="items" style="--items:170px;">
				<label><input type="radio" name="bgir" value="0"><p class="btn" style="--bp:0 -100%;"></p>${texts.bgil[0]}</label>
				<div><input type="radio" name="bgir" value="1" id="bgir1"><label for="bgir1" class="btn" style="--bp:0 -100%;"></label><div>${texts.bgil[1]}<br>
					<button class="btn" style="--bp:-600% -500%;" onclick="this.firstElementChild.click();"><input tabindex="-1" type="file" style="width:100%;height:100%;opacity:0;" accept="image/*" onclick="event.stopPropagation();" onchange="altimggen(this.files[0]).then(x=>gsave(gq.bgialt=x));e2p(os().put(this.files[0],'bgimg')).then(()=>(gq.bgi==1&&bgiset())).catch(errfx);">
					</button><button class="btn" style="--bp:-400% -400%;" onclick="delete gq.bgialt;gsave();e2p(os().delete('bgimg')).then(()=>(gq.bgi==1&&bgiset())).catch(errfx);"></button>
				</div></div>
				<div><input type="radio" name="bgir" value="2" id="bgir2"><label for="bgir2" class="btn" style="--bp:0 -100%;"></label><div>${texts.bgil[2]}<br>
					<button class="btn bgicode" style="--bp:-400% -500%;"></button>
				</div></div>
			</div>
			<h3>${texts.bga}</h3>
			<div class="items" style="--items:150px;">
				${texts.bgal.map((x,i)=>'<label><input type="radio" name="bgar" value="'+i+'"><p class="btn" style="--bp:0 -300%;"></p>'+x+'</label>').join('')}
				<div><input type="radio" name="bgar" value="-1" id="bgar-1"><label for="bgar-1" class="btn" style="--bp:0 -300%;"></label><div>${texts.custom}<br>
					<button class="btn" style="--bp:-600% -500%;" onclick="this.firstElementChild.click();"><input tabindex="-1" type="file" style="width:100%;height:100%;opacity:0;" accept="audio/aac,audio/flac,audio/mpeg,audio/ogg,audio/opus,audio/wav,audio/webm" onclick="event.stopPropagation();" onchange="(async w=>{w=this.files[0];w={name:w.name,data:await w.arrayBuffer()};await e2p(os().put(w,'bga'));~gq.bga||bgaset();})().catch(errfx);">
					</button><button class="btn" style="--bp:-100% -100%;" onclick="e2p(os().delete('bga')).then(()=>(~gq.bga||bgaset())).catch(errfx);"></button>
				</div></div>
				<label><div>${texts.gain}<br><input type="range" step=".0625" max="1" value="${gq.bgagain}" oninput="gsave(gq.bgagain=bga.g.gain.value=+this.value);"></div></label>
				<label><div>${texts.xfade}<br><input type="number" min="0" class="input" value="${gq.bgafade}" oninput="this.value&&this.checkValidity()&&gsave(gq.bgafade=+this.value);" onchange="this.value&&this.checkValidity()&&bgaset();"></div></label>
			</div>
			<h3>${texts.caches}</h3>
			<div class="items" style="--items:150px;">
				<label><button class="btn" style="--bp:0 -500%;" onclick="caches.keys().then(x=>alert((''+x)||texts.nf));">check</button>${texts.check}</label>
				<label><button class="btn" style="--bp:-200% -500%;" onclick="caches.keys().then(x=>Promise.all(x.map(y=>caches.delete(y)))).then(x=>(x.every(y=>y)&&location.reload(true)));">update</button>${texts.frcupd}</label>
			</div>
		`).e;
		setRadio('bgir',gq.bgi,e);forRadio('bgir',x=>x.onchange=()=>(gsave(gq.bgi=+x.value),bgiset()));
		e.querySelector('.bgicode').onclick=()=>alert(`<a href="https://developer.mozilla.org/docs/Web/CSS/gradient">background-image</a>:<br><textarea class="input" rows="8" cols="40" oninput="(gsave(gq.bgicode=this.value),gq.bgi==2&&bgiset());">${gq.bgicode}</textarea>`).e.querySelector('textarea').focus();
		setRadio('bgar',gq.bga,e);forRadio('bgar',x=>x.onchange=()=>(gsave(gq.bga=+x.value),bgaset()));
	},
	actx=new(window.AudioContext||webkitAudioContext)(),
	bga={abs:null,g:actx.createGain(),out:[actx.destination]},
	ourls=[],
	altimggen=w=>new Promise(f=>{const c=Object.assign(document.createElement('canvas'),{width:4,height:4}),ctx=c.getContext('2d'),img=new Image();img.onload=()=>{ctx.drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(img.src);f(c.toDataURL());};img.src=URL.createObjectURL(w);}),
	errfx=e=>{console.error(e);e||(e={});e.target&&(e=e.target.error);alert(`⚠️${e.name||texts.ename}<br>${e.message||texts.emsg}`);},
	getAlert=()=>[...document.querySelectorAll('.alert:not(.fade)>.cont')],
	rmAlert=(m,e=getAlert().pop())=>e.parentNode.querySelector('.bg').onclick(m),
	yn=w=>{w=alert(`${w}<div class="tac"><button class="btn" style="--bp:-100% -100%;">no</button><button class="btn" style="--bp:0 -100%;">yes</button></div>`);Array.from(w.e.lastElementChild.children,(x,i)=>x.onclick=()=>rmAlert(i,x.closest('.cont')));return w;},
	setRadio=(x,y,e=document)=>e.querySelector(`input[type=radio][name=${x}][value="${y}"]`).checked=true,
	getRadio=(x,e=document)=>e.querySelector(`input[type=radio][name=${x}]:checked`),
	forRadio=(x,y,e=document)=>e.querySelectorAll(`input[type=radio][name=${x}]`).forEach(y),
	os=(x='stuff')=>idb.transaction(x,'readwrite').objectStore(x),
	e2p=x=>new Promise((f,r)=>Object.assign(x,{onsuccess:f,onerror:r}));
gload();
idb.onupgradeneeded=e=>{console.log('IDB UPG',e=idb.result);[['stuff'],['seq',{keyPath:'name'}],['instr',{keyPath:'name'}]].forEach(x=>e.objectStoreNames.contains(x[0])||e.createObjectStore(...x));};
idb.onsuccess=e=>{console.log('IDB OK',idb=idb.result);e=()=>dispatchEvent(new Event('idbready'));if(document.readyState=='loading')addEventListener('DOMContentLoaded',e,{once:true});else e();bgiset();bgaset();};
idb.onerror=e=>{console.log('IDB ERR',idb,e);idb={};alert(texts.idberr);};
navigator.requestMIDIAccess&&navigator.requestMIDIAccess().then(x=>(midi=x,dispatchEvent(new Event('midiready')))).catch(errfx);
Object.assign(new Image(),{onerror:()=>document.body.classList.add('nowebp'),src:root+'img/atlas1.webp'});
document.body.insertAdjacentHTML('afterbegin',`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" media="print" onload="this.media='all'"><style>
@keyframes spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}
:root,.input,.btn{
	--bc:#222;--fc:#fff;--l:#fea;--b0:#7af;--b1:#acf;--b2:#def;--p0:#a7f;--p1:#caf;--p2:#edf;--r0:#f00;--r1:#f44;
	--g:#2228;--w:#fff8;--btn:64px;--bp:0 0;--items:200px;
	background-color:var(--bc);color:var(--fc);font-family:"M PLUS Rounded 1c",sans-serif;text-shadow:0 0 .5ex var(--bc);
}
*{-webkit-tap-highlight-color:#0000;}
:link{color:var(--b2);}:link:hover{color:var(--b1);}:link:active{color:var(--b0);}:visited{color:var(--p2);}:visited:hover{color:var(--p1);}:visited:active{color:var(--p0);}
hr{border:1px solid var(--w);border-radius:1px;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}
#bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-16;transition:background 1s;background:center/cover;pointer-events:none;user-select:none;-webkit-user-select:none;}
#bgi{width:100vmin;height:auto;float:right;transform:translateX(25%);filter:drop-shadow(0 0 16px var(--l))blur(4px)opacity(.2);}
.tac{text-align:center;}

.input{appearance:none;-webkit-appearance:none;background-color:var(--g);margin:8px 0;padding:8px;border:2px solid #0000;border-radius:8px;outline:0;box-sizing:border-box;max-width:100%;resize:none;transition:.5s;}
.input:focus{border-color:var(--l);caret-color:var(--l);}.input:invalid{border-color:var(--r1);caret-color:var(--r1);}

.alert{position:fixed;top:0;left:0;width:100%;height:100%;z-index:16;transition:.2s;}.alert *{transition:.2s;}
.alert>.bg{width:100%;height:100%;margin:0;background-color:#0004;backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);}
.alert>.cont{position:absolute;background-color:#000c;top:50%;left:50%;max-width:calc(100% - 96px);max-height:calc(100% - 96px);margin:0;padding:16px;border-radius:16px;box-sizing:border-box;transform:translate(-50%,-50%);overflow:auto;overflow-wrap:break-word;}
.alert.fade{opacity:0;pointer-events:none;}
.alert.fade>.cont{transform:translate(-50%,calc(-50% - 32px));}
.alert:nth-last-of-type(n+2)>.cont{opacity:0;visibility:hidden;transform:translate(-50%,calc(-50% + 64px))scale(.95);}
.alert:nth-last-of-type(n+3)>.bg{opacity:0;}

.btn{position:relative;vertical-align:middle;display:inline-block;width:var(--btn);height:var(--btn);margin:0;padding:0;border:0;outline:0;background:none;overflow:hidden;user-select:none;-webkit-user-select:none;color:#0000 !important;text-shadow:none !important;}
.btn,.btn *{touch-action:manipulation;cursor:pointer;}
.btn::before,.btn::after{content:"";position:absolute;top:0;left:0;display:block;width:80%;height:80%;margin:10%;border-radius:25%;box-sizing:border-box;}
.btn::before{background:var(--bp_,var(--bp))/800% var(--g);}.btn::after{content:none;}
.btn::before{background-image:url(${root}img/atlas0.svg);}.btn.a1::before{background-image:url(${root}img/atlas1.webp);}.nowebp .btn.a1::before{background-image:url(${root}img/atlas1.png);}
:focus:not(.btn)+.btn::before,.btn:focus::before{box-shadow:0 0 0 calc(var(--btn)*.01) var(--l) inset;}
:checked:not(.btn)+.btn::after,.btn.a::after{content:"";border:calc(var(--btn)*.2) solid #00000001;border-image:url(${root}img/sel.svg) 32%;}:checked+.btn,.btn.a{transform:rotateY(360deg);transition:transform .5s;}
:disabled:not(.btn)+.btn,.btn:disabled,.btn.d,.d .btn{filter:grayscale(1)opacity(.5);pointer-events:none;}
.btn:active::before,.btn:active::after{transform:scale(.85);}.btn:not(:active)::before,.btn:not(:active)::after{transition:transform .2s;}
.spin{--bp:-200% 0;--g:#0000;animation:2s linear spin infinite;pointer-events:none;}
.clock::before{--bp:-200% -0%;filter:saturate(.3);}.clock::after{content:"";transform:rotate(var(--rot,45deg));filter:drop-shadow(0 0 2px #aef);background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 18'%3E%3Cpath d='M6 6h1v1h-1z' fill='%23caf0f6'/%3E%3C/svg%3E");}
.clock.d::after,.d .clock::after{--rot:initial;}.clock:active::after{transform:rotate(var(--rot,45deg))scale(.85);}

.items{display:grid;max-width:100%;width:100vw;grid-template-columns:repeat(auto-fill,minmax(min(var(--items),100%),1fr));grid-auto-rows:1fr;grid-gap:8px;}
.items::after{content:"";grid-column:1/-1;}
.items input[type=radio]{position:absolute;opacity:0;pointer-events:none;}
.items *{max-width:100%;margin:0;overflow:hidden;text-overflow:ellipsis;overflow-wrap:normal;word-break:keep-all;}
.items>*{box-sizing:border-box;padding:4px;display:flex;align-items:center;position:relative;}
.items>* .btn{--btn:40px;max-width:initial;}
.items>*>.btn{--btn:56px;flex-shrink:0;align-self:start;}

.flex{display:flex;justify-content:space-between;flex-wrap:wrap;align-items:center;}.flex>*{flex:0 0 auto;}
</style>
<div id="bg"><img id="bgi" src="${root}img/icon_.svg" width="1" height="1" alt="background image"></div>
`);
alert=x=>{
	const wrap=document.createElement('div'),bg=document.createElement('p'),e=document.createElement('p'),p=new Promise(f=>{
		wrap.classList.add('alert','fade');bg.classList.add('bg');e.classList.add('cont');
		bg.onclick=y=>{
			wrap.ontransitionend=()=>wrap.remove();wrap.classList.add('fade');f(y);
			const e_=getAlert().pop();e_&&(e_.ontransitionend=()=>(e_.focus(),e_.ontransitionend=null));
		};
		e.insertAdjacentHTML('beforeend',x);e.tabIndex=0;
		wrap.append(bg,e);document.body.append(wrap);e.focus();
		wrap.offsetWidth;wrap.classList.remove('fade');
	});
	return{e,p};
};
addEventListener('keydown',e=>{
	const al=getAlert();
	if(e.key=='Escape'){
		if(document.activeElement.matches('input:not([type=radio]),textarea'))document.activeElement.blur(e.preventDefault());
		else if(al.length)rmAlert(al.pop(),e.preventDefault());
	}
});
tex.onload=()=>{
	const c=document.createElement('canvas');c.width=tex.naturalWidth;c.height=tex.naturalHeight;
	c.getContext('2d').drawImage(tex,0,0,c.width,c.height);tex=c;dispatchEvent(new Event('texready'));
	document.body.insertAdjacentHTML('beforeend',`<style>.btn::before{background-image:url(${c.toDataURL()});}</style>`);
};tex.src=root+'img/atlas0.svg';
requestAnimationFrame(w=>{const img=new Image();img.onload=()=>{
	w={c:document.createElement('canvas'),w:screen.width*devicePixelRatio,h:screen.height*devicePixelRatio};
	const draw=([cw,ch])=>{
		w.c.width=cw;w.c.height=ch;const ctx=w.c.getContext('2d'),{width:iw,height:ih}=img,s=Math.min(cw/iw,ch/ih);
		ctx.drawImage(img,0,0,1,1,0,0,cw,ch);ctx.drawImage(img,0,0,iw,ih,(cw-iw*s)/2,(ch-ih*s)/2,iw*s,ih*s);return w.c.toDataURL();
	};
	document.head.insertAdjacentHTML('beforeend',[[draw([w.w,w.h]),'portrait'],[draw([w.h,w.w]),'landscape']].map(x=>`<link rel="apple-touch-startup-image" href="${x[0]}" media="(orientation:${x[1]})">`).join(''));
};img.src=root+'img/teaser.png';});
{const bg_=()=>gq.bgi==0&&bgiset();setTimeout(()=>{bg_();setInterval(bg_,36e5);},36e5-(Date.now()%36e5));bgiset();}
['touchstart','mousedown'].forEach(x=>addEventListener(x,()=>(actx.state=='suspended'&&actx.resume())));bga.out.forEach(x=>bga.g.connect(x));bgaset();
if('pwa'in urlq&&document.referrer)addEventListener('DOMContentLoaded',()=>document.body.insertAdjacentHTML('beforeend','<button class="btn" style="--bp:-400% -100%;--btn:48px;position:fixed;bottom:0;left:0;" onclick="history.back();">back</button>'),{once:true});
if('pwa'in urlq)addEventListener('DOMContentLoaded',()=>document.querySelectorAll('a[href]').forEach(e=>(e.ontouchstart||(e.ontouchstart=_=>_),e.href+='?pwa',e.removeAttribute('target'))),{once:true});
onbeforeunload=()=>ourls.forEach(URL.revokeObjectURL);

