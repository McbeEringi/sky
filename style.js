const idbName='sky_idb',idbVer=1;
let idb=indexedDB.open(idbName,idbVer);
idb.onupgradeneeded=e=>{
	console.log('idb upgrade');
	idb.result.createObjectStore('stuff');
}
idb.onsuccess=e=>{console.log('idb open success');if(!['0',undefined].includes(localStorage.sky_bgmode))bgset();};
idb.onerror=e=>{console.log('idb open error: '+idb.errorCode);localStorage.sky_bgmode='0';bgset();};

document.body.insertAdjacentHTML('afterbegin',`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" rel="stylesheet" />
<style>
:root,.style{background:#222;font-family:"M PLUS Rounded 1c",sans-serif;color:#fff;text-shadow:0 0 4px #222;word-wrap:break-word;}
#bg{position:fixed;top:0;left:0;z-index:-16;width:100vw;height:100vh;transition:background 1s;pointer-events:none;background-size:cover;background-position:center;user-select:none;-webkit-user-select:none;}
#bg>img{opacity:.2;width:100vmin;height:auto;float:right;transform:translateX(25%);background:none;}
a:link,a:visited{color:#aef;}a:hover{color:#8af;}a:active{color:#48f;}
.flex{display:flex;justify-content:space-evenly;flex-wrap:wrap;align-items:flex-start;}
#hisbackb{display:none;position:fixed;left:2px;bottom:2px;width:48px;height:48px;border-radius:12px;background:#2228 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' style='filter:drop-shadow(0 0 4px %23f00);'%3E%3Cpath d='M32,8L16,24L32,40' stroke='%23fea' stroke-width='2px' fill='%230000'/%3E%3C/svg%3E");}
</style>`);
var urlq={};location.search.substr(1).split('&').map(x=>x.split('=')).map(x=>urlq[x[0]]=x[1]);console.log(urlq);
const e_bg=document.createElement('div');e_bg.setAttribute('id','bg');document.body.appendChild(e_bg);
const e_img=document.createElement('img');e_img.setAttribute('src','https://mcbeeringi.github.io/sky/img/sky.svg');e_img.setAttribute('alt','background');e_img.setAttribute('width','1');e_img.setAttribute('height','1');e_bg.appendChild(e_img);
const e_bb=document.createElement('div');e_bb.setAttribute('id','hisbackb');e_bb.onclick=()=>history.back();document.body.appendChild(e_bb);
if(urlq.pwa=='1')e_bb.setAttribute('style','display:block;');
//document.addEventListener('readystatechange',e=>{if(e.target.readyState=='interactive'){}},false);
const bgcol=[
	"#fff1cf,#ced980",//morn
	"#cce5f0,#ced980",//day
	"#f08300,#f8b862",//dusk
	"#192f60,#274a78"//night
];
const bgset=(x,b)=>{
	let bgimg;
	switch(b||localStorage.sky_bgmode){
		case'1':
			e_img.setAttribute('style','display:none;');
			bgimg=idb.result.transaction('stuff','readwrite').objectStore('stuff').get('bgimg');
			bgimg.onsuccess=e=>bg.style.backgroundImage=`url(${URL.createObjectURL(e.target.result)})`;
			break;
		case'2':e_img.setAttribute('style','display:none;');bg.style.backgroundImage=localStorage.sky_bgcode;break;
		default:e_img.setAttribute('style','');bg.style.backgroundImage=`linear-gradient(${bgcol[x!=undefined?x:([3,0,1,1,2,3][Math.floor(Math.max(new Date().getHours()-1,0)*.25)])]})`;
	}
};
{
	const bgset_=()=>{console.log('_');if(['0',undefined].includes(localStorage.sky_bgmode))bgset();};
	bgset_();
	setTimeout(()=>{bgset_();setInterval(bgset_,3600000);},3600000-(new Date().getTime()%3600000));
}
