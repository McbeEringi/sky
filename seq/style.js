'use strict';
let idb=indexedDB.open('sky_idb',4);
idb.onupgradeneeded=e=>{console.log('IDB UPG',e=idb.result);[['stuff'],['seq',{keyPath:'name'}],['instr',{keyPath:'name'}]].forEach(x=>{if(!e.objectStoreNames.contains(x[0]))e.createObjectStore(...x);});};
idb.onsuccess=e=>{console.log('IDB OK',idb=idb.result);e=()=>dispatchEvent(new Event('idbready'));if(document.readyState=='loading')addEventListener('DOMContentLoaded',e);else e();bgset();};
idb.onerror=e=>{console.log('IDB ERR',idb,e);idb=null;bgset();};
const urlq=Object.fromEntries(location.search.slice(1).split('&').filter(y=>y).map(x=>x.split('=',2))),
	bgset=x=>{
		const bgcol=['#fff1cf,#ced980','#cce5f0,#ced980','#f08300,#f8b862','#192f60,#274a78','#fbfaf6,#ced980'],//morn day dusk night cloud
			url='https://mcbeeringi.github.io/sky/img/photo/performance.jpg';
		(({
			1:()=>{bgi.style.display='';Object.assign(idb.transaction('stuff','readwrite').objectStore('stuff').get('bgimg'),{onsuccess:e=>bg.style.backgroundImage=`url(${e.target.result?URL.createObjectURL(e.target.result):url})`,onerror:e=>bg.style.backgroundImage=`url(${url})`});},
			2:()=>{bgi.style.display='';bg.style.backgroundImage=localStorage.sky_bgcode;}
		})[x==undefined?localStorage.sky_bgmode:0]||
		(()=>{bgi.style.display='unset';bg.style.backgroundImage=`linear-gradient(${bgcol[x]||bgcol[[3,3,3,3,3,0,0,0,0,4,1,1,1,1,1,1,4,2,2,2,2,3,3,3][new Date().getHours()]]})`;}))();
	},
	bgset_=()=>{if(localStorage.sky_bgmode=='0'){console.log('_');bgset();}};
if(!localStorage.sky_bgcode)localStorage.sky_bgcode='linear-gradient(60deg,#214,#415)';if(!localStorage.sky_bgmode)localStorage.sky_bgmode='0';
document.body.insertAdjacentHTML('afterbegin',`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" media="print" onload="this.media='all'"><style>
:root,.style{background-color:#222;font-family:"M PLUS Rounded 1c",sans-serif;color:#fff;text-shadow:0 0 4px #222;}*{-webkit-tap-highlight-color:#0000;}hr{border:1px solid #fff6;border-radius:1px;}a:link,a:visited{color:#aef;}a:hover{color:#8af;}a:active{color:#48f;}
#bg{position:fixed;top:0;left:0;z-index:-16;width:100vw;height:100vh;transition:background 1s;pointer-events:none;background:center/cover;user-select:none;-webkit-user-select:none;}#bgi{display:none;opacity:.2;width:100vmin;height:auto;float:right;transform:translateX(25%);}
</style><div id="bg"><img id="bgi" src="sky_.svg" width="1" height="1"></div>`);
setTimeout(()=>{bgset_();setInterval(bgset_,36e5);},36e5-(Date.now()%36e5));bgset_();document.addEventListener('visiblitychange',bgset_);
if(urlq.pwa=='1')addEventListener('DOMContentLoaded',()=>document.body.insertAdjacentHTML('beforeend','<div onclick="history.back();" style="position:fixed;left:4px;bottom:4px;width:40px;height:40px;border-radius:50%;font-size:30px;line-height:29px;transform:rotateZ(-45deg);user-select:none;-webkit-user-select:none;background-color:#3338;color:#fea;text-shadow:0 0 1px #f00;">┌</div>'));
if(urlq.pwa&&(localStorage.sky_1time||0)<1)document.body.insertAdjacentHTML('beforeend',`<div style="display:inline-block;position:fixed;padding:8px;top:0;left:0;background-color:#222;z-index:20;">アンケートのお願い<br>5問程度の簡単なものです。次の改修の参考のためお願いします。<br>トップ画面の設定から後で参加することもできます。<br><br><a href="https://forms.gle/EgqHvrqu8MsC2Vku7" onclick="localStorage.sky_1time=1;">アンケート Google Form</a> <button onclick="localStorage.sky_1time=1;this.parentNode.remove();">この表示を消す</button></div>`);
