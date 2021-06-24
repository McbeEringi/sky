'use strict';
let main,calced,tims={},curpos=0,urstack;
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
	if(!calced)return;//window.scrollY>240
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
				ins=[x.pos+x.dx+pos+(cur?-cfg.pad-2:-1),cur?[...x.ind.slice(0,-1),x.ind.slice(-1)[0]+1]:[...x.ind,ind2n(x.ind).length]];
			}
		}
	}
	for(let x of calced.note){
		if(x.pos+cfg.w+pos<0)continue;if(w<x.pos+pos)break;
		let cur=Math.abs(x.pos-scr.scrollLeft+cfg.w2)<=cfg.w2;
		frr(ctx,cppos==x.pos?'#aef8':'#0004',x.pos+pos,0,cfg.w,240,4);
		if(cur){
			cur=x.pos-scr.scrollLeft+cfg.w2>0;
			ins=[x.pos+pos+(cur?-2:cfg.w-1),cur?x.ind:[...x.ind.slice(0,-1),x.ind.slice(-1)[0]+1]];
		}
		let note=ind2n(x.ind);
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
kbset=(x=calced.note[curpos].ind.reduce((a,x)=>a[x],main.scores))=>{
	let tmp=x.split(',');
	[...kb.children].forEach((y,i)=>y.classList[tmp.includes(i2n[i])?'add':'remove']('a'));
},
urset=x=>{urstack[2]=[];urstack[0].push(urstack[1]);urstack[1]=x;while(urstack[0].length>Number(localStorage.seq_urMax))urstack[0].shift();console.log(x);undobtn.disabled=false;redobtn.disabled=true;},
urdo=x=>{
	let tmp=false;
	while(x<0){if(urstack[0].length){urstack[2].unshift(urstack[1]);urstack[1]=urstack[0].pop();x++;tmp=true;console.log('undo');Function(urstack[1][0]+urstack[1][2])();}else{break;}}
	while(0<x){if(urstack[2].length){urstack[0].push(urstack[1]);urstack[1]=urstack[2].shift();x--;tmp=true;console.log('redo');Function(urstack[1][0]+urstack[1][1])();}else{break;}}
	undobtn.disabled=!urstack[0].length;redobtn.disabled=!urstack[2].length;
	if(tmp){calc();draw();seqset();kbset();}
},
bpmset=()=>{let x=Number(bpm_.value);if(x>0)Tone.Transport.bpm.value=main.bpm=x;else bpm_.value=Tone.Transport.bpm.value=main.bpm;},
scset=()=>{let x=Number(sc_.value);if(sc_.value&&Number.isInteger(x))main.sc=x;else sc_.value=main.sc;},
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
	calc();seqset();tstop();bpmset();scset();
	urstack=[[],['main.scores=',null,JSON.stringify(main.scores)],[]];
	redobtn.disabled=undobtn.disabled=true;
};

scr.addEventListener('wheel',e=>{e.preventDefault();scr.scrollLeft+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.shiftKey?.1:1);});
scr.addEventListener('scroll',()=>{if(tims.igscr){tims.igscr=false;return;}requestAnimationFrame(draw);},{passive:true});
[...kb.children].forEach((x,i)=>{
	const keyfx=e=>{
		e.preventDefault();
		if(tstat()){
			let ind=calced.note[curpos].ind,
				arr=ind2n(ind).split(',').filter(y=>y);
			if(x.classList.toggle('a')){
				Tone.start();
				synth.triggerAttackRelease(n2Hz(i2n[i]));
				arr=arr.concat(i2n[i]);
			}else{
				arr=arr.filter(y=>y!=i2n[i]);
			}
			let cmd=[`main.scores[${ind.join('][')}]=`,`'${arr.join(',')}'`];
			Function(cmd[0]+cmd[1])();urset(cmd.concat(`'${ind2n(ind)}'`));
			seqset();calc();curset();
		}else synth.triggerAttackRelease(n2Hz(i2n[i]));
	};
	x.addEventListener('touchstart',keyfx);
	x.addEventListener('mousedown',keyfx);
});
document.onkeydown=e=>{
	if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
	if(e.ctrlKey||e.metaKey)
		switch(e.code){
			case'KeyZ':e.preventDefault();urdo(e.shiftKey?1:-1);
			case'KeyX':if(emode.checked){e.preventDefault();}
			case'KeyC':if(emode.checked){e.preventDefault();}
			case'KeyV':if(emode.checked){e.preventDefault();}
		}
	else
		switch(e.code){
			case'Space':e.preventDefault();playbtn.onclick();break;
			case'ArrowLeft':e.preventDefault();Tone.start();tstep(e.shiftKey?-8:-1);break;
			case'ArrowRight':e.preventDefault();Tone.start();tstep(e.shiftKey?8:1);break;
			case'Tab':e.preventDefault();emode.click();
			default:
				const keymap=Array.from('QWERTASDFGZXCVB',x=>`Key${x}`);
				if(keymap.includes(e.code)&&!emode.checked)
					kb.children[keymap.indexOf(e.code)].dispatchEvent(new Event('mousedown'));
		}
};
emode.onchange=draw;
scr.onclick=e=>{
	if(emode.checked){
		scr.scrollLeft=e.clientX+window.scrollX+scr.scrollLeft-c.parentNode.clientWidth*.5;
	}else{
		Tone.start();
		let cp=e.clientX+window.scrollX+scr.scrollLeft-c.parentNode.clientWidth*.5,
		ind=calced.note.findIndex(x=>x.pos<=cp&&cp<x.pos+cfg.w);
		if(!~ind)return;
		curpos=ind;pset();draw();kbset();
		if(tstat())sytar(ind2n(calced.note[curpos].ind));
	}
};
playbtn.onclick=e=>{
	Tone.start();
	if(tstat())tstart();else tpause();
};
bpm_.onchange=bpmset;
sc_.onchange=scset;
stopbtn.onclick=tstop;
prevbtn.onclick=()=>tstep(-1);
nextbtn.onclick=()=>tstep( 1);
undobtn.onclick=()=> urdo(-1);
redobtn.onclick=()=> urdo( 1);

{
	(window.onresize=()=>{
		c.width=res*c.parentNode.clientWidth;
		c.height=res*240;
		ctx.scale(res,res);
		draw();
	})();
	localStorage.seq_urMax=128;
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
