'use strict';
let main,calced,tims={},curpos=0;
const ctx=c.getContext('2d'),res=window.devicePixelRatio||1,cfg={pad:12,w:16},
i2n=['-9','-7','-5','-4','-2','0','2','3','5','7','8','10','12','14','15'],
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6','3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
pos2p=(pos_=Tone.Transport.position)=>{let tmp=pos_.split(':').map(x=>Number(x));return(tmp[0]*Tone.Transport.timeSignature+tmp[1]+tmp[2]*.25)%main.scores.length;},
p2pos=p_=>`${Math.floor(p_/Tone.Transport.timeSignature)}:${Math.floor(p_)%Tone.Transport.timeSignature}:${(p_*4)%4}`,
n2Hz=x=>440*Math.pow(2,(Number(x)+main.sc)/12)*2,//C4~C6
ind2n=x=>x.reduce((a,y)=>a[y],main.scores),
tstat=()=>Tone.Transport.state!='started',
seqset=()=>{clearTimeout(tims.seqset);tims.seqset=setTimeout(()=>requestIdleCallback(()=>{seq.events=main.scores;console.log('seqset')}),300);},
stdli=(a,b=a+1,s={})=>{for(let i=a;i<=b;i++){s[`d#${i}`]=`ds${i}.mp3`;s[`a${i}`]=`a${i}.mp3`;}return s;},
synth=new Tone.Sampler(stdli(4,6,{'a3':'a3.mp3','d#7':'ds7.mp3'}),()=>{},'https://mcbeeringi.github.io/sky/audio/instr/musicbox/').toDestination(),
sytar=(n,t)=>{n=n.split(',');if(n[0])synth.triggerAttackRelease(n.map(n2Hz),'1m',t,1);},
seq=new Tone.Sequence((time,note)=>{
	//Tone.Draw.schedule(()=>{
		curset();
		kbset(note);
		curpos=(curpos+1)%calced.note.length;
	//},time);
	sytar(note,time);
},[],'4n').start(0),
frr=(ct,col,x,y,dx,dy,r=0)=>{
	ct.fillStyle=col;
	ct.beginPath();
	ct.moveTo(x,y+r);ct.arc(x+r,y+r,r,Math.PI,Math.PI*1.5);
	ct.lineTo(x+dx-r,y);ct.arc(x+dx-r,y+r,r,Math.PI*1.5,0);
	ct.lineTo(x+dx,y+dy-r);ct.arc(x+dx-r,y+dy-r,r,0,Math.PI*.5);
	ct.lineTo(x+r,y+dy);ct.arc(x+r,y+dy-r,r,Math.PI*.5,Math.PI);
	ct.fill();
},
calc=()=>{
	calced={box:[],note:[]};
	let pos=0,
	core=(x,l=1,p=0,ind=[])=>{
		let odl=1/l;
		x.forEach((y,i)=>{
			if(typeof y=='object'){
				let tmp=pos;
				pos+=cfg.pad+1;
				core(y,l*y.length,p,[...ind,i]);
				pos+=cfg.pad;
				calced.box.push({pos:tmp,ind:[...ind,i],dx:pos-tmp});
			}
			else{
				calced.note.push({pos,ind:[...ind,i],p});
				pos+=cfg.w;
			}
			pos+=1;
			p+=odl;
		});
	};
	core(main.scores);
	scrw.style.width=(calced.length=pos-1)+'px';
},
draw=()=>{
	if(!calced)return;
	let w=c.parentNode.clientWidth,pos=w*.5-scr.scrollLeft,ins,cppos=calced.note[curpos].pos;
	ctx.clearRect(0,0,w,240);
	for(let x of calced.box){
		if(x.pos+x.dx+pos<0)continue;if(w<x.pos+pos)break;
		frr(ctx,'#4444',x.pos+pos,0,x.dx,240,4);
		if(Math.abs(x.pos-scr.scrollLeft+x.dx*.5)<=x.dx*.5){
			let cur;
			if(scr.scrollLeft<=x.pos+cfg.pad){
				cur=x.pos-scr.scrollLeft+cfg.pad2>0;
				ins=[x.pos+pos+(cur?-2:cfg.pad-1),cur?[...x.ind,0]:x.ind];
			}else if(x.pos+x.dx-cfg.pad<=scr.scrollLeft){
				cur=x.pos-scr.scrollLeft+x.dx-cfg.pad2>0;
				ins=[x.pos+x.dx+pos+(cur?-cfg.pad-2:-1),cur?[...x.ind.slice(0,-1),x.ind.slice(-1)[0]+1]:[...x.ind,x.ind.reduce((a,y)=>a[y],main.scores).length]];
			}
		}
	}
	for(let x of calced.note){
		if(x.pos+cfg.w+pos<0)continue;if(w<x.pos+pos)break;
		let cur=Math.abs(x.pos-scr.scrollLeft+cfg.w2)<=cfg.w2;
		frr(ctx,cppos==x.pos&&!emode.checked?'#aef8':'#0004',x.pos+pos,0,cfg.w,240,4);
		if(cur){
			cur=x.pos-scr.scrollLeft+cfg.w2>0;
			ins=[x.pos+pos+(cur?-2:cfg.w-1),cur?x.ind:[...x.ind.slice(0,-1),x.ind.slice(-1)[0]+1]];
		}
		let note=x.ind.reduce((a,y)=>a[y],main.scores);
		if(note)
			note.split(',').forEach(n=>{
				let col='#fea';
				if(n2i[n]==undefined){
					n=Number(n);col='#fea8';
					if(n>0)n=(n+9)%24-9;else n=(n+10)%24+14;
				}
				frr(ctx,col,x.pos+1+pos,225-Number(n2i[String(n)])*16,cfg.w-2,14,4);//240-16+1
			});
	}
	if(emode.checked){if(ins)frr(ctx,'#feac',ins[0],0,3,240);return ins[1];}
},
curset=()=>{tims.igscr=true;scr.scrollLeft=calced.note[curpos].pos+cfg.w2;draw();},
pset=()=>Tone.Transport.position=p2pos(calced.note[curpos].p),
cp2cp=(cp=scr.scrollLeft)=>calced.note.findIndex(x=>x.pos<=cp&&cp<x.pos+cfg.w),
kbset=(x=calced.note[curpos].ind.reduce((a,x)=>a[x],main.scores))=>{
	let tmp=x.split(',');
	[...kb.children].forEach((y,i)=>y.classList[tmp.includes(i2n[i])?'add':'remove']('a'));
},
tstart=()=>{Tone.Transport.start();},
tpause=()=>{Tone.Transport.pause();requestIdleCallback(()=>{curset();kbset();});},
tstop=e=>{Tone.Transport.stop();curpos=0;requestIdleCallback(()=>{curset();kbset();});},
tstep=x=>{
	Tone.start();
	curpos=((curpos+x)%calced.note.length+calced.note.length)%calced.note.length;
	pset();tpause();kbset();
	if(tstat())sytar(ind2n(calced.note[curpos].ind));
},
init=()=>{
	calc();seqset();tstop();
	Tone.Transport.bpm.value=main.bpm;
};

scr.addEventListener('scroll',()=>{
	if(tims.igscr){tims.igscr=false;return;}
	console.log('')
	requestAnimationFrame(draw);
	//if(!tims.scr)tims.scr=setTimeout(()=>{tims.scr=0;},100);
	/*
	clearTimeout(tims.scr);
	tims.scr=setTimeout(()=>{
		if(tstat()){
			let ind=cp2cp();if(!~ind)return;
			curpos=ind;pset();draw();kbset();
		}
	},100);
	*/
},{passive:true});
[...kb.children].forEach((x,i)=>{
	const keyfx=e=>{
		e.preventDefault();
		x.classList.toggle('a');
	};
	x.addEventListener('touchstart',keyfx);
	x.addEventListener('mousedown',keyfx);
});
document.onkeydown=e=>{
	if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
	if(e.ctrlKey||e.metaKey)
		switch(e.code){
			case'KeyZ':e.preventDefault();//urdo(e.shiftKey?1:-1);
		}
	else
		switch(e.code){
			case'Space':e.preventDefault();playbtn.onclick();break;
			case'ArrowLeft':e.preventDefault();Tone.start();tstep(e.shiftKey?-8:-1);break;
			case'ArrowRight':e.preventDefault();Tone.start();tstep(e.shiftKey?8:1);break;
			case'Tab':e.preventDefault();emode.click();
			default:
				const keymap=Array.from('QWERTASDFGZXCVB',x=>`Key${x}`);
				if(keymap.includes(e.code))
					kb.children[keymap.indexOf(e.code)].dispatchEvent(new Event('mousedown'));
		}
};
emode.onchange=draw;
scr.onclick=e=>{
	Tone.start();
	let ind=cp2cp(e.clientX+window.scrollX+scr.scrollLeft-c.parentNode.clientWidth*.5);
	if(!~ind)return;
	curpos=ind;pset();draw();kbset();
	if(tstat())sytar(ind2n(calced.note[curpos].ind));
};
playbtn.onclick=e=>{
	Tone.start();
	if(tstat())tstart();else tpause();
};
stopbtn.onclick=tstop;

{
	(window.onresize=()=>{
		c.width=res*c.parentNode.clientWidth;
		c.height=res*240;
		ctx.scale(res,res);
		draw();
	})();
	cfg.pad2=cfg.pad/2;
	cfg.w2=cfg.w/2;

	main={
		"sc":-2,"bpm":120,"ts":4,"arp":0,"name":"ウミユリ海底譚",
		"scores":["-4","",["-4","-4"],["-4","-4"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5","","3,-2","5"],["-5,0,7","","0,10","10"],["-5,-2,12","","-2,7","5"],["-9,-4,3","3","-4,7","7"],["-7,-2,5","3","-2,3","5"],["-5,0,7","","0,10",""],["-5,-2,7","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5","","-2,3","5"],["0,-5,7","","0,10",""],["-5,-2,7","","-2,5",""],["-9,-4,3","","-4,7",""],["-7,-2,5","","-2,7",""],["-9,-5,3","","-5,-2",""],["-9,-5","","7","10"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-9,-5,3","","-5,-2",""],["-9,-5,3","","3,5","3,10,7"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,14,10",""],["-5,-2,15,10,3","","-2,3,7","5"],["-9,-4,0","","7,3,-4",""],["-7,-2,2,5,10","","-2,7,3","5"],["-9,-5,3","","-5,-2",""],["-9,-5,0","","-2",""],["-9,-4","7,3"],["","-4","7,3",""],["5,-7,-2,2","","3","-2"],["2","","5,2,-2",""],["3,-5,0","","","0"],["","-2"],["-2,-5","-4"],["-5","-5"],["-9,-4","7,3"],["7,3","-4","7,3",""],["5,-7,-2,2","3"],["2","-2,-7"],["-2,-5,0","7,3"],["5","3,-5,0"],["7,2,-2,5,-5",""],["5,-2,2,-5","3"],["-9,-4","-2"],["7,-9,-4,3","10,7,3"],["-7,-2","7,3"],["2,-2,-7","3"],["-5,0","-2"],["7,3,-5,0","10,7,3"],["-5,-2","7,3"],["2,-5,-2","5"],["3,-9,-4","","","-4"],["","-2,-4"],["3,-4,-9",""],["-4","3"],["5,-7,-2,2","3"],["8,-7,-2,5","8,5"],["7,3","-4,-7"],["2","2,-7,-5"],["3,-5,0","3"],["3","-2,-5,0"],["5,-9,-4,2",""],["3,-4","3"],["5,-7,-2,2","3"],["3","8,-7,-2,5"],["7,-2,-9,3",""],["7,-5,2,5","5","3","2"],["3,-5,0","","","0"],["3","7,-5,0,3"],["10,-4,-9,7,3","3"],["3","3,-4,-9"],["5,-7,2,-2","7,3"],["5,2,-7,-2","3"],["3,-2,-9",""],["2","2,-5,-7"],["3,-5,0","3"],["3","-2,-5,0"],["5,-9,-4,2",""],["3,-4","3"],["5,-7,-2,2","3"],["3","8,-7,-2,5"],["7,-2,-9,3",""],["7,-5,2,5","5","3","2"],["3,-5,0","","","0"],["3","7,-5,0,3"],["-5,-2,8,5","7,3"],["-5,-2,5","3"],["-9,-4,5,3",""],["-9,-4","-2"],["-4,-9,-2","-2"],["-4,-9,7,3","5,3"],["-7,-2,5,2",""],["3","-7,2,-2"],["-7,2,-4",""],["-5,-7,7,3","3"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5,2","","3,-2","5"],["-5,0,7,3","","0,10,7,3","10,7,3"],["-5,-2,12,7,3","","-2,7,3","5"],["-9,-4,3","3","-4,7,3","7,3"],["-7,-2,5,2","3","-2,3","5,2"],["-5,0,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5,2","","-2,3","5"],["0,-5,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2,5,3","3"],["-9,-4,3","","-4,7,3",""],["-7,-2,5,2","","-2,7,5,2",""],["-9,-5,3","","-5,-2",""],["-9,-5","","0","2"],["-9,-4,3","","-4,-2","-2"],["-7,-2,5,2","","3,-2","5"],["-5,0,7,3","","0,10,7,3","10,7,3"],["-5,-2,12,7,3","","-2,7,3","5"],["-9,-4,3","3","-4,7,3","7,3"],["-7,-2,5,2","3","-2,3","5,2"],["-5,0,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2",""],["-9,-4,3","","-4,-2",""],["-7,-2,5,2","","-2,3","5"],["0,-5,7,3","","0,10,3,7",""],["-5,-2,7,3","","-2,5,3",""],["-9,-4,3","","-4,7,3",""],["-7,-2,5,2","","-2,7,5,2",""],["-9,-5,3","","-5,-2",""],["-9,-5","","7,3","7,3,10"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-9,-5,3","","-5,-2",""],["-9,-5,3","","3,5","3,10,7"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,7",""],["-5,-2,3","","-2,7,3",""],["-9,-4,3,5","","7,3,-4",""],["-7,-2,2,5","","-2,2,5,10",""],["-5,0,3,7","","0",""],["-5,-2,3,7","","3,-2,5","3"],["-9,-4,3,12,7","","3,7,-4,12",""],["-7,-2,12,3,7","","-2,3,10,7","3,7"],["-5,0,3,5","","0,3,14,10",""],["-5,-2,15,10,3","","-2,3,7","5"],["-9,-4,0","","7,3,-4",""],["-7,-2,2,5,10","","-2,7,3","5"],["-9,-5,3","","-5,-2",""],["-5,-9",""],"","","",""]
	};

	init();
}
if(['Chrome','Safari'].findIndex(x=>window.navigator.userAgent.includes(x))==1)
	requestIdleCallback(()=>{
		let img=new Image();
		img.onload=()=>{
			let c=document.createElement('canvas'),ctx=c.getContext('2d');
			c.width=img.naturalWidth;c.height=img.naturalHeight;
			ctx.drawImage(img,0,0);
			document.body.insertAdjacentHTML('beforeend',`<style>#kb>div::after,.bg{background-image:url(${c.toDataURL()});}</style>`);
		};
		img.src='img/seq.svg';
	});
