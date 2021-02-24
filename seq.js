'use strict';
alert=(x,mw)=>{albox.textContent=x;albox.style.pointerEvents=mw?'':'none';albox.style.maxWidth=mw?mw:'';alcb.checked=true;}
//window.onbeforeunload=e=>{e.preventDefault();return'';};
//window.onerror=()=>{alert('Please reboot browser');}

let sc=Number(sc_.value),main,calced={ind:[],p:[]},curpos=0,userscr=[false,false],urstack,rawexet,screxet,noteclip;
const info='⚠️alpha test⚠️\n\nPowerd by Tone.js\nAudio: GarageBand\n\nauthor:@McbeEringi\nbuild:2102242\nMIT License\n',
llog=(x,c)=>{if(logcb.checked){if(c)log.textContent='';log.textContent+=`${x}\n`;}},
//url_o=(x)=>JSON.stringify(x).replace(/\"/g,"'").replace(/,/g,'.').replace(/\[/g,'(').replace(/\]/g,')'), url_i=(x)=>JSON.parse(x.replace(/'/g,'"').replace(/\./g,',').replace(/\(/g,'[').replace(/\)/g,']')),
seq=new Tone.Sequence((time,note)=>{
	note=note.split(',');
	curpset();scrset();kbset(note);//Tone.Draw.schedule(()=>{},time);
	if(note[0]){
		synth.triggerAttackRelease(note.map(toHz),'1m',time,kbfixed.checked?.3:1);
		llog(`${note.map(x=>n2c[(Number(x)+main.sc+12)%12]+(Math.floor((Number(x)+main.sc)*.08333)+4)/*49+Number(x)+main.sc*/)}`,1);
	}
	llog(Tone.Transport.position);
},[],'4n').start(0),
mbxli=()=>{let s={};for(let i=3;i<=6;i++){s[`a${i}`]=`a${i}.mp3`;s[`d#${i+1}`]=`ds${i+1}.mp3`;}return s;},
synth=new Tone.Sampler(mbxli(),()=>{},"https://mcbeeringi.github.io/sky/audio/instr/musicbox/").connect(new Tone.Volume(-10).toDestination()),
toHz=x=>880*Math.pow(2,(Number(x)+main.sc)/12),//C5~C7
i2n=['-9','-7','-5','-4','-2','0','2','3','5','7','8','10','12','14','15'],
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6',
	'3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
n2c=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'],
pos2p=pos_=>{let tmp=pos_.split(':').map(x=>Number(x));return tmp[0]*Tone.Transport.timeSignature+tmp[1]+tmp[2]*.25;},
p2pos=p_=>`${Math.floor(p_/Tone.Transport.timeSignature)}:${Math.floor(p_)%Tone.Transport.timeSignature}:${(p_*4)%4}`,
scset=()=>{if(Number.isInteger(Number(sc_.value)))main.sc=Number(sc_.value);else sc_.value=main.sc;llog(main.sc);},
bpmset=()=>{let tmp=Number(bpm_.value);if(tmp){main.bpm=tmp;Tone.Transport.bpm.value=tmp;}else bpm_.value=main.bpm;llog(main.bpm);},
tsset=()=>{let tmp=Number(ts_.value);if(tmp){main.ts=tmp;Tone.Transport.timeSignature=tmp||4;}else ts_.value=main.ts;
	stybeat.textContent=main.ts>1?`#disp>.noteW:nth-child(${main.ts}n+1){overflow:hidden;}#disp>.noteW:nth-child(${main.ts}n+1)::before{content:"";position:absolute;display:block;width:2px;height:100%;background:#feac;}`:'';
	llog(main.ts);
},
nameset=()=>{if(name_.value)main.name=name_.value;else name_.value=main.name;llog(main.name);},
curset=()=>{
	let tmp=calced.e[curpos].getBoundingClientRect().left+dispScr.scrollLeft+window.scrollX;
	let dbpds=dispBar.clientWidth/dispScr.scrollWidth;
	dispCur.style.left=tmp+'px';
	dispBar.children[1].style.width=(16*dbpds)+'px';
	dispBar.children[1].style.left=(tmp*dbpds)+'px';
},
curpset=p=>{
	if(typeof p=='number'&&isFinite(p)){curpos=calced.p.indexOf(p);}
	else{p=pos2p(Tone.Transport.position)%main.scores.length;curpos=calced.p.indexOf(Math.floor(p));while(p>=calced.p[curpos])curpos++;curpos--;}
	curset();
},
kbset=(x=calced.ind[curpos].split('-').reduce((a,x)=>a[x],main.scores).split(','))=>{
	let tmp=x.map(y=>n2i[y]);
	document.querySelectorAll('#kb p').forEach((e,i)=>e.classList[tmp.includes(String(i))?'add':'remove']('press'));
	return x;
},
scrset=()=>{
	let dcbl=dispCur.getBoundingClientRect().left+window.scrollX;
	if(16<dcbl&&dcbl<dispScr.clientWidth-64&&userscr[1]){userscr[1]=false;dispBar.children[0].style.opacity=.5;}
	if(!userscr[1]){
		//userscr[0]=true;dispCur.scrollIntoView();
		userscr[0]=true;
		if(curpos==0)dispScr.scrollLeft=0;
		else if(curpos==calced.length-1)dispScr.scrollLeft=dispScr.scrollWidth;
		else if(dcbl>=dispScr.clientWidth-64)dispScr.scrollLeft+=dcbl-16;
		else if(dcbl<=16)dispScr.scrollLeft-=dispScr.clientWidth-dcbl-64;
		else userscr[0]=false;
	}
},
urset=()=>{urstack[2]=[];urstack[0].push(urstack[1]);urstack[1]=JSON.stringify(main.scores);while(urstack[0].length>Number(localStorage.seq_undoMax))urstack[0].shift();llog('urstacked')},
ccset=()=>{
	calced={ind:[],p:[]};
	calced.e=document.querySelectorAll('#disp .note');
	calced.e.forEach(e=>{
		calced.ind.push(e.dataset.ind);
		calced.p.push(Number(e.dataset.p));
	});
	calced.length=calced.e.length;
},
ttoggle=()=>{
	Tone.start();
	styperf.textContent=Tone.Transport.state=='started'?'':'#dispCur,#kb p::before,#kb p::after{transition: none !important;}';
	Tone.Transport[Tone.Transport.state=='started'?'pause':'start']();
},
tstop=()=>{Tone.Transport.stop();styperf.textContent='';curpos=0;curset();scrset();kbset();},
tstep=x=>{
	Tone.start();
	Tone.Transport.pause();styperf.textContent='';
	curpos+=x;
	if(curpos<0)curpos+=calced.length;else if(curpos>=calced.length)curpos-=calced.length;
	Tone.Transport.position=p2pos(calced.p[curpos]);
	curset();setTimeout(scrset,100);
	let note=kbset();if(note[0])synth.triggerAttackRelease(note.map(toHz));
},
curct=()=>{userscr[0]=true;dispScr.scrollLeft=dispCur.getBoundingClientRect().left+dispScr.scrollLeft+window.scrollX-dispScr.clientWidth*.5;},
urdo=x=>{
	let tmp=false;
	while(x<0){if(urstack[0].length){urstack[2].unshift(urstack[1]);urstack[1]=urstack[0].pop();x++;tmp=true;llog('undo');}else{domshake(undobtn);break;}}
	while(0<x){if(urstack[2].length){urstack[0].push(urstack[1]);urstack[1]=urstack[2].shift();x--;tmp=true;llog('redo');}else{domshake(redobtn);break;}}
	if(tmp){
		seq.events=main.scores=JSON.parse(urstack[1]);if(rawedit.checked)rawtxt.value=JSON.stringify(main.scores,null,'	');requestIdleCallback(a2d);requestIdleCallback(()=>curpset());requestIdleCallback(()=>kbset());
	}
},
domshake=x=>{x.onanimationend=()=>x.classList.remove('shake');x.classList.add('shake');};

ibtn.onclick=()=>{alert(info,' ');albox.innerHTML+=`<label for="uiflip" class="grid bg" style="--bp:0 -200%;">flip ui</label><label for="logcb" class="grid showtxt">debuglog</label>`;}
document.querySelectorAll('#kb p').forEach((e,i)=>{
	const keyfx=ev=>{
		ev.preventDefault();Tone.start();
		if(kblock.checked)synth.triggerAttackRelease(toHz(i2n[i]));
		else{
			let arr=calced.ind[curpos].split('-').reduce((a,c)=>a[c],main.scores).split(',');
			if(e.classList.contains('press')==false){
				synth.triggerAttackRelease(toHz(i2n[i]));
				requestIdleCallback(()=>{let note=document.createElement('p');note.style.bottom=i*16+'px';calced.e[curpos].appendChild(note);});
				arr=[...arr,i2n[i]].filter(x=>x);
			}else{
				requestIdleCallback(()=>calced.e[curpos].querySelectorAll(`p[style*="${i*16}"]`).forEach(e=>calced.e[curpos].removeChild(e)));
				arr=arr.filter(x=>x!=i2n[i]);
			}
			arr=arr.join(',');calced.e[curpos].dataset.note=arr;
			arr=`main.scores[${calced.ind[curpos].replace(/-/g,'][')}]='${arr}';`;llog(arr);
			Function(arr)();seq.events=main.scores;urset();
			e.classList.toggle('press');
		}
	};
	e.addEventListener('touchstart',keyfx,{passive:false});
	e.addEventListener('mousedown',keyfx,{passive:false});
});
document.addEventListener('keydown',e=>{
	llog(e.code);
	if(!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){
		switch(e.code){
			case'Space':e.preventDefault();ttoggle();break;
			case'ArrowUp':e.preventDefault();if(e.shiftKey){Tone.Transport.bpm.value++;bpm_.value=++main.bpm;}else sc_.value=++main.sc;break;
			case'ArrowDown':e.preventDefault();if(e.shiftKey){Tone.Transport.bpm.value--;bpm_.value=--main.bpm;}else sc_.value=--main.sc;break;
			case'ArrowLeft':e.preventDefault();if(e.shiftKey)tstep(-10);else tstep(-1);break;
			case'ArrowRight':e.preventDefault();if(e.shiftKey)tstep(10);else tstep(1);break;
			case'KeyZ':if(e.metaKey){e.preventDefault();urdo(e.shiftKey?1:-1);}break;
			default:
				const keymap={
					KeyR:'kbb00',KeyT:'kbb01',KeyY:'kbb02',KeyU:'kbb03',KeyI:'kbb04',
					KeyF:'kbb10',KeyG:'kbb11',KeyH:'kbb12',KeyJ:'kbb13',KeyK:'kbb14',
					KeyC:'kbb20',KeyV:'kbb21',KeyB:'kbb22',KeyN:'kbb23',KeyM:'kbb24'
				}
				if(keymap[e.code]){
					//e.preventDefault();
					window[keymap[e.code]].dispatchEvent(new Event('mousedown'));
				}
		}
	}
});
disp.onclick=e=>{
	if(e.target.classList.contains('note')){
		Tone.start();llog(e.target.dataset.p);
		e.target.style.background='#fea8';setTimeout(()=>e.target.style.background='',100);
		Tone.Transport.position=p2pos(e.target.dataset.p);
		curpset(Number(e.target.dataset.p));
		let note=kbset();if(note[0])synth.triggerAttackRelease(note.map(toHz));
		if(rawedit.checked)rawedit.onchange();
	}
};
dispScr.onwheel=e=>{
	e.preventDefault();
	dispScr.scrollLeft+=e.deltaX+e.deltaY;
};
dispScr.onscroll=e=>{
	if(userscr[0])userscr[0]=false;else userscr[1]=true;
	if(screxet)return;
	const tmp=()=>{
		screxet=null;
		let dbpds=dispBar.clientWidth/dispScr.scrollWidth;
		dispBar.children[0].style.width=(dispBar.clientWidth*dbpds)+'px';
		dispBar.children[0].style.left=(dispScr.scrollLeft*dbpds)+'px';
		if(userscr[1])dispBar.children[0].style.opacity=1;
	};
	tmp();screxet=setTimeout(tmp,100);
};
rawedit.onchange=()=>{
	if(rawedit.checked){
		Tone.Transport.pause();styperf.textContent='';
		rawtxt.focus();
		if(!rawtxt.value)rawtxt.value=JSON.stringify(main.scores,null,'	');
		requestIdleCallback(()=>{
			let ind=0;
			for(let i=0;i<curpos*2+1;i++)ind=rawtxt.value.indexOf('"',ind+1);
			rawtxt.setSelectionRange(ind+1,rawtxt.value.indexOf('"',ind+1));
		});
	}else{
		rawtxt.value='';
		kbset();
	}
};
rawtxt.oninput=e=>{
	clearTimeout(rawexet);rawexet=setTimeout(()=>{
		let tmp,now=Tone.now();
		try{tmp=JSON.parse(rawtxt.value);}catch(e){console.log(e);}
		if(tmp){
			seq.events=main.scores=tmp;urset();
			llog('raw good');
			requestIdleCallback(a2d);curpset();
			synth.triggerAttackRelease(440*Math.pow(2,(3 +main.sc)/12),'1m',now);
			synth.triggerAttackRelease(440*Math.pow(2,(7 +main.sc)/12),'1m',now+.05,.9);
			synth.triggerAttackRelease(440*Math.pow(2,(10+main.sc)/12),'1m',now+.1,.8);
		}else{
			llog('raw bad');
			synth.triggerAttackRelease(440*Math.pow(2,(8 +main.sc)/12),'1m',now);
			synth.triggerAttackRelease(440*Math.pow(2,(7 +main.sc)/12),'1m',now+.05,.9);
			synth.triggerAttackRelease(440*Math.pow(2,(1+main.sc)/12),'1m',now+.1,.8);
		}
	},1000);
};
undobtn.onclick=()=>urdo(-1);redobtn.onclick=()=>urdo(1);


const sopt={
	group:{
		name:"group_",
		pull:(to,from)=>to.el.id=='clip'?'clone':true,
		put:true,
	},
	onStart:()=>dispCur.style.opacity='0',onEnd:()=>dispCur.style.opacity='1',
	invertSwap:true,animation:150,forceFallback:true,direction:'horizontal',delay:100,delayOnTouchOnly:false,
	onSort:e=>{if(e.to.id!='clip')requestIdleCallback(()=>{d2d();curset();d2a();});else ccset();}
},
a2d=()=>{
	const core=(scores,e,b,l=1)=>{
		if(b)e.textContent='';
		else{
			let sort=document.createElement('div');
			e.classList.add('sortW');
			sort.classList.add('sort');
			new Sortable(sort,sopt);
			e=e.appendChild(sort);
		}
		scores.forEach((x,i)=>{
			let div = document.createElement('div');
			div.classList.add('noteW');
			e.appendChild(div);
			if(b)div.dataset.p=div.dataset.ind=i;
			else{
				div.dataset.ind=div.parentNode.parentNode.dataset.ind+'-'+i;
				div.dataset.p=Number(div.parentNode.parentNode.dataset.p)+l*i;
			}
			div.dataset.l=l;
			if(typeof x=='string'){
				div.dataset.note=x;
				x.split(',').forEach(y=>{
					let note=document.createElement('p');
					note.style.bottom=((n2i[y]+1?Number(n2i[y]):15)*16)+'px';
					div.appendChild(note);
				});
				div.classList.add('note');
			}else core(x,div,0,l/x.length);
		});
	};
	console.time('a2d');
	core(main.scores,disp,1);
	console.timeEnd('a2d');
	ccset();dispScr.onscroll();
},
d2a=()=>{
	const core=e=>
		Array.from(e.children,x=>{
			if(x.classList.contains('note'))return x.dataset.note;//Array.from(x.children,y=>i2n_[y.style.bottom.slice(0,-2)/16]).join(',');
			else if(x.classList.contains('sortW'))return core(x.children[0]);
		});
	console.time('d2a');
	seq.events=main.scores=core(disp);
	console.timeEnd('d2a');
	urset();
},
d2d=(x=disp)=>{
	const core=y=>{
		let l=Number(y.dataset.l)/y.children[0].childNodes.length;
		Array.from(y.children[0].children,(z,i)=>{
			z.dataset.ind=`${y.dataset.ind}-${i}`;
			z.dataset.p=(Number(y.dataset.p)+l*i);
			z.dataset.l=l;
			if(z.classList.contains('sortW'))core(z);
		});
	};
	console.time('d2d');
	if(x.id=='disp'){
		Array.from(x.children,(y,i)=>{
			y.dataset.p=y.dataset.ind=i;y.dataset.l=1;
			if(y.classList.contains('sortW'))core(y);
		})
	}else core(x);
	console.timeEnd('d2d');
	ccset();
},
save=()=>{

},
load=()=>{
	alert('Loading…','none');
	albox.textContent='';
	albox.insertAdjacentHTML('beforeend',`<div>New sheet<br><br><button onclick="main=null;init();alcb.checked=false;"class="grid bg" style="--bp:0 -100%;">open</button></div>`);
	new Array(20).fill({name:'example ',lastm:'xx/xx/xx'}).forEach((x,i)=>{
		albox.insertAdjacentHTML('beforeend',`<div>${x.name+i}<br>${x.lastm}<br><button
			onclick="alcb.checked=false;"class="grid bg" style="--bp:0 -100%;">open</button><button
			onclick="alert('dupe');"class="grid bg" style="--bp:0 -300%;">dupe</button><button
			onclick="alert('export');" class="grid bg" style="--bp:-400% -100%;">export</button><button
			onclick="if(this.style.left=='0px'){this.style.left='52px';this.textContent='really?';this.classList.add('showtxt');
			setTimeout(()=>{this.style.left='0px';this.textContent='delete';this.classList.remove('showtxt');},1000);}else{alert('del');}"
			class="grid bg" style="--bp:-700% -200%;position:relative;left:0px;transition:left .2s;">delete</button></div>`);
	});
},
exp=()=>{

},
init=()=>{
	Tone.Transport.pause();
	if(!main)main={name:'',sc:0,bpm:120,ts:4,scores:new Array(16).fill('')};
	rawedit.checked=false;rawtxt.value='';disp.textContent='Loading…';
	urstack=[[],JSON.stringify(main.scores),[]];
	seq.events=main.scores;sc_.value=main.sc;
	bpm_.value=main.bpm;bpmset();ts_.value=main.ts;tsset();name_.value=main.name;nameset();
	//Tone.Transport.swing=1;
	requestIdleCallback(a2d);
	requestIdleCallback(tstop);
};

if(!localStorage.seq_undoMax)localStorage.seq_undoMax=48;
main=sample[slc.value];
log.textContent=info;
init();
focus();


new Sortable(temp,{
	group:{
		name:'group_',
		pull:'clone',
		put:false
	},
	onStart:()=>dispCur.style.opacity='0',
	invertSwap:true,animation:150,forceFallback:true,direction:'horizontal',delay:100,delayOnTouchOnly:false,
	sort:false,draggable:'.noteW',
	onEnd:e=>{
		dispCur.style.opacity='1';
		console.log(e);
		if(e.pullMode=='clone'&&e.item.children.length)Array.from(e.item.children,e=>new Sortable(e,sopt));
	},
});
new Sortable(clip,{
	group:{
		name:'group_',
		pull:(to,from)=>to.el.id=='trash'?true:'clone',
		put:true
	},
	onStart:()=>dispCur.style.opacity='0',onEnd:()=>dispCur.style.opacity='1',
	invertSwap:true,animation:150,forceFallback:true,direction:'horizontal',delay:100,delayOnTouchOnly:false,
});
new Sortable(trash,{group:'group_',onAdd:e=>e.item.parentNode.removeChild(e.item)});
new Sortable(disp,sopt);
