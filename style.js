document.write(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lato:wght@300&family=M+PLUS+Rounded+1c&display=swap" rel="stylesheet" />
<style>
:root{background:#222;font-family:"M PLUS Rounded 1c",sans-serif;color:#fff;text-shadow:0 0 4px #222;word-wrap:break-word;}
#bg{position:fixed;top:0;left:0;z-index:-16;width:100vw;height:100vh;transition:background 1s;}
#bg>img{opacity:.2;height:100vmin;float:right;transform:translateX(25%);background:none;pointer-events:none;}
a:link,a:visited{color:#aef;}a:hover{color:#8af;}a:active{color:#48f;}
.flex{display:flex;justify-content:space-evenly;flex-wrap:wrap;align-items:flex-start;}
</style>`);
const e_bg=document.createElement('div');e_bg.setAttribute('id','bg');document.body.appendChild(e_bg);
document.addEventListener('readystatechange',e=>{if(e.target.readyState=='interactive'){const e_img=document.createElement('img');e_img.setAttribute('src','https://mcbeeringi.github.io/sky/img/sky.svg');e_img.setAttribute('alt','background');e_bg.appendChild(e_img);}},false);
const bgcol=[
	"#fff1cf,#ced980",//morn
	"#cce5f0,#ced980",//day
	"#f08300,#f8b862",//dusk
	"#192f60,#274a78"//night
],bgset=(x)=>bg.style.background=`linear-gradient(${bgcol[x!=undefined?x:([3,0,1,1,2,3][Math.floor(Math.max(new Date().getHours()-1,0)*.25)])]})`;
bgset();
document.addEventListener('visibilitychange',()=>{if(document.visibilityState=='visible')bgset();})
