const idbName='sky_idb',idbVer=3;
let idb=indexedDB.open(idbName,idbVer);
idb.onupgradeneeded=e=>{
	console.log('idb upgrade');
	try{idb.result.createObjectStore('stuff');}catch(e){}
	try{idb.result.createObjectStore('seq',{keyPath:'name'});}catch(e){}
	try{idb.result.createObjectStore('instr',{keyPath:'name'});}catch(e){}
}
idb.onsuccess=e=>{console.log('idb open success');window.dispatchEvent(new Event('idbready'));if(!['0',undefined].includes(localStorage.sky_bgmode))bgset();};
idb.onerror=e=>{console.log('idb open error',e);bgset(-1,'0');};

document.body.insertAdjacentHTML('afterbegin',`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" media="print" onload="this.media='all'">
<style>
:root,.style{background:#222;font-family:"M PLUS Rounded 1c",sans-serif;color:#fff;text-shadow:0 0 4px #222;word-wrap:break-word;}*{-webkit-tap-highlight-color:#0000;}
#bg{position:fixed;top:0;left:0;z-index:-16;width:100vw;height:100vh;transition:background 1s;pointer-events:none;background-size:cover;background-position:center;user-select:none;-webkit-user-select:none;}
#bg>img{opacity:.2;width:100vmin;height:auto;float:right;transform:translateX(25%);background:none;}
a:link,a:visited{color:#aef;}a:hover{color:#8af;}a:active{color:#48f;}
#hisbackb{display:none;position:fixed;left:2px;bottom:2px;width:48px;height:48px;border-radius:12px;background:#2228 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' style='filter:drop-shadow(0 0 4px %23f00);'%3E%3Cpath d='M32,8L16,24L32,40' stroke='%23fea' stroke-width='2px' fill='%230000'/%3E%3C/svg%3E");}
</style>`);
var urlq={};location.search.substr(1).split('&').map(x=>x.split('=')).forEach(x=>urlq[x[0]]=x[1]||'');console.log(urlq);
const e_bg=document.createElement('div');e_bg.setAttribute('id','bg');document.body.appendChild(e_bg);
const e_img=document.createElement('img');e_img.setAttribute('src','https://mcbeeringi.github.io/sky/img/sky_.svg');e_img.setAttribute('style','display:none;');e_img.setAttribute('alt','background');e_img.setAttribute('width','1');e_img.setAttribute('height','1');e_bg.appendChild(e_img);
const e_bb=document.createElement('div');e_bb.setAttribute('id','hisbackb');e_bb.onclick=()=>history.back();document.body.appendChild(e_bb);
if(urlq.pwa=='1')e_bb.setAttribute('style','display:block;');
//document.addEventListener('readystatechange',e=>{if(e.target.readyState=='interactive'){}},false);
const bgcol=[
	"#fff1cf,#ced980",//morn
	"#cce5f0,#ced980",//day
	"#f08300,#f8b862",//dusk
	"#192f60,#274a78",//night
	"#fbfaf6,#ced980"//cloud
],
bgset=(x,b)=>{
	switch(b||localStorage.sky_bgmode){
		case'1':e_img.setAttribute('style','display:none;');idb.result.transaction('stuff','readwrite').objectStore('stuff').get('bgimg').onsuccess=e=>bg.style.backgroundImage=`url(${e.target.result?URL.createObjectURL(e.target.result):'https://mcbeeringi.github.io/sky/img/photo/summer.jpg'})`;break;
		case'2':e_img.setAttribute('style','display:none;');bg.style.backgroundImage=localStorage.sky_bgcode;break;
		default:e_img.setAttribute('style','');bg.style.backgroundImage=`linear-gradient(${bgcol[x]||bgcol[[3,3,3,3,3,0,0,0,0,1,1,1,1,1,1,1,4,2,2,2,2,3,3,3][new Date().getHours()]]})`;
	}
};
{
	if(!localStorage.sky_bgcode)localStorage.sky_bgcode='linear-gradient(60deg,#214,#415)';
	const bgset_=()=>{console.log('_');if(['0',undefined].includes(localStorage.sky_bgmode))bgset();};
	bgset_();
	setTimeout(()=>{bgset_();setInterval(bgset_,3600000);},3600000-(new Date().getTime()%3600000));
}
document.dispatchEvent(new Event('styexe'));
