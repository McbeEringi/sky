'use strict';
let main,calced,tims={},curpos=0,ecur,sel,urstack,clips=[];
alert=x=>{alcb.checked=true;albox.textContent='';albox.insertAdjacentHTML('beforeend',x);};
const texts={
	info:'Powerd by Tone.js\nAudio: GarageBand\n\nauthor:@McbeEringi\nbuild:2107011\nMIT License\n',
	title:'enter title',del:'delete',cancel:'cancel',save:'saved.',osave:'overwrite saved.',copy:' copy',
	...{
		ja:{
			title:'タイトルを入力',del:'削除',cancel:'キャンセル',save:'保存しました!',osave:'上書き保存しました!',copy:'のコピー',
		}
	}[window.navigator.language.slice(0,2)]
},
ctx=c.getContext('2d'),res=window.devicePixelRatio||1,cfg={pad:12,w:16},
i2n=['-9','-7','-5','-4','-2','0','2','3','5','7','8','10','12','14','15'],
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6','3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
pos2p=(pos_=Tone.Transport.position)=>{let tmp=pos_.split(':').map(x=>Number(x));return(tmp[0]*Tone.Transport.timeSignature+tmp[1]+tmp[2]*.25)%main.scores.length;},
p2pos=p_=>`${Math.floor(p_/Tone.Transport.timeSignature)}:${Math.floor(p_)%Tone.Transport.timeSignature}:${(p_*4)%4}`,
n2Hz=x=>440*Math.pow(2,(Number(x)+main.sc)/12)*2,//C4~C6
ind2n=x=>x.reduce((a,y)=>a[y],main.scores),
ind2c=x=>{let s=x.join();return calced[typeof ind2n(x)=='string'?'note':'box'].find(y=>y.ind.join()==s);},
tstat=()=>Tone.Transport.state!='started',
seqset=()=>{clearTimeout(tims.seqset);tims.seqset=setTimeout(()=>requestIdleCallback(()=>{seq.events=main.scores;console.log('seqset')}),300);},
stdli=(a,b=a+1,s={})=>{for(let i=a;i<=b;i++){s[`d#${i}`]=`ds${i}.mp3`;s[`a${i}`]=`a${i}.mp3`;}return s;},
synth=new Tone.Sampler(stdli(4,6,{'a3':'a3.mp3','d#7':'ds7.mp3'}),()=>{},'https://mcbeeringi.github.io/sky/audio/instr/musicbox/').toDestination(),
sytar=(n,t)=>{n=n.split(',');if(n[0])synth.triggerAttackRelease(n.map(n2Hz),'1m',t,1);},
seq=new Tone.Sequence((time,note)=>{
	//Tone.Draw.schedule(()=>{},time);
	sytar(note,time);curset();kbset(note);
	curpos=(curpos+1)%calced.note.length;
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
	if(scr.scrollLeft>calced.length)scr.scrollLeft=calced.length;
},
draw=()=>{
	if(!calced)return;//window.scrollY>240
	let w=c.parentNode.clientWidth,pos=w*.5-scr.scrollLeft,cppos=calced.note[curpos].pos;
	ctx.clearRect(0,0,w,240);
	ecur=null;
	for(let x of calced.box){
		if(x.pos+x.dx+pos<0)continue;if(w<x.pos+pos)break;
		frr(ctx,'#4444',x.pos+pos,0,x.dx,240,4);
		if(Math.abs(x.pos-scr.scrollLeft+x.dx*.5)<=x.dx*.5){
			let cur;
			if(scr.scrollLeft<=x.pos+cfg.pad){
				cur=x.pos-scr.scrollLeft+cfg.pad2>0;
				if(emode.checked)ecur=[x.pos+(cur?-2:cfg.pad-1),true,cur?x.ind:[...x.ind,0]];
			}else if(x.pos+x.dx-cfg.pad<=scr.scrollLeft){
				cur=x.pos-scr.scrollLeft+x.dx-cfg.pad2>0;
				if(emode.checked)ecur=[x.pos+x.dx+(cur?-cfg.pad-2:-1),false,cur?[...x.ind,ind2n(x.ind).length-1]:x.ind];
			}
		}
	}
	for(let x of calced.note){
		if(x.pos+cfg.w+pos<0)continue;if(w<x.pos+pos)break;
		let cur=Math.abs(x.pos-scr.scrollLeft+cfg.w2)<=cfg.w2;
		frr(ctx,cppos==x.pos?'#aef8':'#0004',x.pos+pos,0,cfg.w,240,4);
		if(cur){
			cur=x.pos-scr.scrollLeft+cfg.w2>0;
			if(emode.checked)ecur=[x.pos+(cur?-2:cfg.w-1),cur,x.ind];
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
		//ctx.fillStyle='#fff';ctx.fillText(x.p,pos+x.pos,16,16);ctx.fillText(x.ind,pos+x.pos,32,16);
	}
	if(emode.checked)frr(ctx,'#fea8',w*.5,0,1,240);
	if(ecur)frr(ctx,'#feac',ecur[0]+pos,0,3,240);
	if(sel)frr(ctx,sel.col,sel.x+pos,0,sel.dx,240);
},
selfix=(ind0,ind1)=>{
	if(ind0[0]>ind1[0])[ind0,ind1]=[ind1,ind0];
	ind0.shift();ind1.shift();//[stat,ind]
	let l=Math.min(ind0[1].length,ind1[1].length);
	for(let i=0;true;i++)
		if(ind0[1][i]!=ind1[1][i]||i+1==l){
			ind0=[...ind0[1].slice(0,i),ind0[1][i]+((i+1==ind0[1].length?ind0[0]:true )? 0:1)];
			ind1=[...ind1[1].slice(0,i),ind1[1][i]+((i+1==ind1[1].length?ind1[0]:false)?-1:0)];
			break;
		}
	return[ind0,ind1];
},
selins=x=>{
	if(!x)return;if(typeof x=='string')x=JSON.parse(x);
	let w=-1,m=y=>{if(typeof y=='string')w+=cfg.w+1;else{w+=cfg.pad*2+2;y.forEach(m);}};
	x.forEach(m);
	if(sel){
		let tmp=sel.dat[0].ind.length-1;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
		urset(['main.scores'+tmp[0].map(y=>`[${y}]`).join('')+`.splice(${tmp[1]},`, `${tmp[2]-tmp[1]+1},...${JSON.stringify(x)})`, `${x.length},...${JSON.stringify(ind2n(tmp[0]).slice(tmp[1],tmp[2]+1))})`]);
		calc();tims.igscr=true;scr.scrollLeft=sel.x+w;sel=null;cxbtn.disabled=ccbtn.disabled=true;
	}else{
		let tmp=ecur[2].length-1;tmp=[ecur[2].slice(0,tmp),ecur[2][tmp]-ecur[1]+1];
		urset(['main.scores'+tmp[0].map(y=>`[${y}]`).join('')+`.splice(${tmp[1]},`, `0,...${JSON.stringify(x)})`, `${x.length})`]);
		calc();tims.igscr=true;scr.scrollLeft=ecur[0]+w;
	}
	seqset();draw();kbset();
},
curset=()=>{if(!emode.checked){tims.igscr=true;scr.scrollLeft=calced.note[curpos].pos+cfg.w2;}draw();},
pset=()=>Tone.Transport.position=p2pos(calced.note[curpos].p),
kbset=(x=calced.note[curpos].ind.reduce((a,x)=>a[x],main.scores))=>{
	let tmp=x.split(',');
	[...kb.children].forEach((y,i)=>y.classList[tmp.includes(i2n[i])?'add':'remove']('a'));
},
cbset=x=>{
	if(typeof x=='number')x=clips[x];
	if(x){
		clips.unshift(typeof x=='string'?x:JSON.stringify(x));
		clips=[...new Set(clips)];
		while(clips.length>localStorage.seq_clipMax)clips.pop();
	}
	clip.textContent='';
	clips.forEach((y,i)=>{
		let e=document.createElement('p');
		e.textContent=y;e.onclick=()=>cbset(i);
		clip.appendChild(e);
	})
},
urset=x=>{Function(x[0]+x[1])();urstack[1]=[];urstack[0].push(x);while(urstack[0].length>Number(localStorage.seq_urMax))urstack[0].shift();console.log(x);undobtn.disabled=false;redobtn.disabled=true;},
urdo=x=>{
	let tmp;
	while(x<0){if(urstack[0].length){urstack[1].unshift(tmp=urstack[0].pop());tmp=tmp[0]+tmp[2];x++;console.log('undo:	'+tmp);Function(tmp)();}else{break;}}
	while(0<x){if(urstack[1].length){urstack[0].push(tmp=urstack[1].shift());tmp=tmp[0]+tmp[1];x--;console.log('redo:	'+tmp);Function(tmp)();}else{break;}}
	undobtn.disabled=!urstack[0].length;redobtn.disabled=!urstack[1].length;
	if(tmp){calc();draw();seqset();kbset();}
},
bpmset=()=>{let x=Number(bpm_.value);if(x>0)Tone.Transport.bpm.value=main.bpm=x;else bpm_.value=Tone.Transport.bpm.value=main.bpm;},
scset=()=>{let x=Number(sc_.value);if(sc_.value&&Number.isInteger(x))main.sc=x;else sc_.value=main.sc;},
tstart=()=>{Tone.start();Tone.Transport.start();},
tpause=()=>{Tone.Transport.pause();requestIdleCallback(()=>{curset();kbset();});},
tstop=e=>{Tone.Transport.stop();requestIdleCallback(()=>{curpos=0;curset();kbset();});},
tstep=x=>{
	Tone.start();
	curpos=((curpos+x)%calced.note.length+calced.note.length)%calced.note.length;
	pset();tpause();kbset();
	if(tstat())sytar(ind2n(calced.note[curpos].ind));
},
init=()=>{
	main={sc:0,bpm:120,scores:new Array(8).fill(''),...main};
	calc();seqset();tstop();bpmset();scset();document.title='sky_seq '+(name_.textContent=main.name||'');
	urstack=[[],[]];redobtn.disabled=undobtn.disabled=true;
};

document.onkeydown=e=>{
	if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
	if(alcb.checked){if(['Space','Enter'].includes(e.code)){e.preventDefault();alcb.checked=false;}return;}
	if(e.ctrlKey||e.metaKey)
		switch(e.code){
			case'KeyZ':e.preventDefault();urdo(e.shiftKey?1:-1);break;
			case'KeyS':e.preventDefault();savebtn.onclick();break;
			case'KeyO':e.preventDefault();filebtn.onclick();break;
			case'KeyA':if(emode.checked&&!slbtn.disabled){e.preventDefault();slbtn.onclick();}break;
			case'KeyX':if(emode.checked&&!cxbtn.disabled){e.preventDefault();cxbtn.onclick();}break;
			case'KeyC':if(emode.checked&&!ccbtn.disabled){e.preventDefault();ccbtn.onclick();}break;
			case'KeyV':if(emode.checked&&!cvbtn.disabled){e.preventDefault();cvbtn.onclick();}break;
			case'KeyD':if(emode.checked&&!rmbtn.disabled){e.preventDefault();rmbtn.onclick();}break;
			case'KeyF':if(emode.checked&&!icbtn.disabled){e.preventDefault();icbtn.onclick();}break;
			case'KeyG':if(emode.checked&&!iwbtn.disabled){e.preventDefault();iwbtn.onclick();}break;
		}
	else
		switch(e.code){
			case'Space':e.preventDefault();playbtn.onclick();break;
			case'ArrowLeft':e.preventDefault();tstep(e.shiftKey?-8:-1);break;
			case'ArrowRight':e.preventDefault();tstep(e.shiftKey?8:1);break;
			case'Tab':e.preventDefault();emode.click();break;
			case'KeyJ':e.preventDefault();tstop();break;
			case'KeyK':e.preventDefault();tpause();break;
			case'KeyL':e.preventDefault();tstart();break;
		default:
				const keymap=Array.from('QWERTASDFGZXCVB',x=>`Key${x}`);
				if(keymap.includes(e.code)&&!emode.checked)
					kb.children[keymap.indexOf(e.code)].dispatchEvent(new Event('mousedown'));
		}
};
scr.addEventListener('wheel',e=>{e.preventDefault();scr.scrollLeft+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.shiftKey?.1:1);});
scr.addEventListener('scroll',()=>{if(tims.igscr){tims.igscr=false;return;}requestAnimationFrame(draw);},{passive:true});
scr.onclick=e=>{
	//if(emode.checked){scr.scrollLeft=e.clientX+window.scrollX+scr.scrollLeft-c.parentNode.clientWidth*.5;else
	Tone.start();
	let cp=e.clientX+window.scrollX+scr.scrollLeft-c.parentNode.clientWidth*.5,
	ind=calced.note.findIndex(x=>x.pos<=cp&&cp<x.pos+cfg.w);
	if(!~ind)return;
	curpos=ind;pset();draw();kbset();
	if(tstat())sytar(ind2n(calced.note[curpos].ind));
};
bpm_.onchange=bpmset;
sc_.onchange=scset;
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
			urset([`main.scores[${ind.join('][')}]=`, `'${arr.join(',')}'`, `'${ind2n(ind)}'`]);
			seqset();calc();curset();
		}else synth.triggerAttackRelease(n2Hz(i2n[i]));
	};
	x.addEventListener('touchstart',keyfx);
	x.addEventListener('mousedown',keyfx);
});

playbtn.onclick=e=>{if(tstat())tstart();else tpause();};
stopbtn.onclick=tstop;
prevbtn.onclick=()=>tstep(-1);
nextbtn.onclick=()=>tstep( 1);
undobtn.onclick=()=> urdo(-1);
redobtn.onclick=()=> urdo( 1);
filebtn.onclick=()=>alert(null);
savebtn.onclick=()=>alert(null);
infobtn.onclick=()=>alert(texts.info+'\n<a class="grid bg icotxt" href="manual/seq.html">?</a>');

emode.onchange=()=>{sel=null;cxbtn.disabled=ccbtn.disabled=true;slbtn.classList.remove('a');draw();};
slbtn.onclick=()=>{
	if(slbtn.classList.toggle('a')){
		cxbtn.disabled=ccbtn.disabled=true;
		cvbtn.disabled=icbtn.disabled=iwbtn.disabled=rmbtn.disabled=true;
		sel={x:ecur[0],dx:3,col:'#feaa',dat:ecur};//ecur=[pos,prev,ind]
		draw();
	}else{
		if(sel.dat[0]==ecur[0]){sel=null;cvbtn.disabled=icbtn.disabled=iwbtn.disabled=rmbtn.disabled=false;return;}
		let dat=selfix(sel.dat,ecur).map(ind2c);
		sel={x:dat[0].pos,dx:dat[1].pos+(dat[1].dx||cfg.w)-dat[0].pos,col:'#fea6',dat};//dat:[ind,ind]
		console.log(sel);
		cxbtn.disabled=ccbtn.disabled=false;
		cvbtn.disabled=icbtn.disabled=iwbtn.disabled=rmbtn.disabled=false;
		draw();
	}
};
cxbtn.onclick=()=>{
	if(!sel)return;
	let tmp=sel.dat[0].ind.length-1,s;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
	s=ind2n(tmp[0]).slice(tmp[1],tmp[2]+1);cbset(s);
	if(sel.dx==calced.length){icbtn.onclick();return;}
	urset(['main.scores'+tmp[0].map(x=>`[${x}]`).join('')+`.splice(${tmp[1]},`, `${tmp[2]-tmp[1]+1})`, `0,...${JSON.stringify(s)})`]);
	calc();tims.igscr=true;scr.scrollLeft=sel.x;sel=null;cxbtn.disabled=ccbtn.disabled=true;
	seqset();draw();kbset();
};
ccbtn.onclick=()=>{
	if(!sel)return;
	let tmp=sel.dat[0].ind.length-1;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
	cbset(ind2n(tmp[0]).slice(tmp[1],tmp[2]+1));
	sel=null;cxbtn.disabled=ccbtn.disabled=true;draw();
};
cvbtn.onclick=()=>selins(clips[0]);
rmbtn.onclick=()=>{
	if(sel){
		if(sel.dx==calced.length){icbtn.onclick();return;}
		let tmp=sel.dat[0].ind.length-1;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
		urset(['main.scores'+tmp[0].map(x=>`[${x}]`).join('')+`.splice(${tmp[1]},`, `${tmp[2]-tmp[1]+1})`, `0,...${JSON.stringify(ind2n(tmp[0]).slice(tmp[1],tmp[2]+1))})`]);
		calc();tims.igscr=true;scr.scrollLeft=sel.x;sel=null;cxbtn.disabled=ccbtn.disabled=true;
	}else{
		let tmp=ecur[2].length-1;
		if(!tmp&&main.scores.length==1){
			if(main.scores[0]){urset(['main.scores.splice(0,1,',`'')`,`${JSON.stringify(main.scores[0])})`]);calc();}else return;
		}else{
			tmp=[ecur[2].slice(0,tmp),ecur[2][tmp]-ecur[1]];
			if(!~tmp[1])return;
			tmp[2]=ind2c([...tmp[0],tmp[1]]).pos;
			urset(['main.scores'+tmp[0].map(x=>`[${x}]`).join('')+`.splice(${tmp[1]},`, '1)', `0,${JSON.stringify(ind2n([...tmp[0],tmp[1]]))})`]);
			calc();tims.igscr=true;scr.scrollLeft=tmp[2];
		}
	}
	seqset();draw();kbset();
};
icbtn.onclick=()=>selins(['']);
iwbtn.onclick=()=>selins([['','']]);

{
	(window.onresize=()=>{
		c.width=res*c.parentNode.clientWidth;
		c.height=res*240;
		ctx.scale(res,res);
		draw();
	})();
	localStorage.seq_urMax=128;
	localStorage.seq_clipMax=8;
	cfg.pad2=cfg.pad/2;
	cfg.w2=cfg.w/2;
	//setInterval(()=>console.log(ecur),500);

	main=localStorage.seq_ezsave?JSON.parse(localStorage.seq_ezsave):{};

	init();
	if(texts.notice)requestIdleCallback(()=>alert(texts.notice));
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
