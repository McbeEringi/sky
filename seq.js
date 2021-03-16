'use strict';
alert=(x,pe,mw)=>{albox.textContent=x;albox.style.pointerEvents=pe?'':'none';albox.style.maxWidth=mw?'100%':'';alcb.checked=true;}
//window.onbeforeunload=e=>{e.preventDefault();return'';};

let synth,sc,main,calced,curpos,userscr=[false,false],urstack,seqsett,screxet,noteclip,from_url;
const texts=Object.assign({
	notice:'⚠️\nThis program is still in β test.\nThere are some bugs or unimplemented functions.',
	title:'enter title',del:'delete',cancel:'cancel',save:'saved.',osave:'overwrite saved.',
	nodat:'no datas found',err:x=>`coudnt ${['load','duplicate','delete','save'][x]} datas.`,
	exp:x=>`Ready to export "${x}"`,imp:'import from URL',
	delq:x=>`Are you sure you want to delete "${x}"?`,
	info:'⚠️beta test⚠️\n\nPowerd by Tone.js\nAudio: GarageBand\n\nauthor:@McbeEringi\nbuild:2103161\nMIT License\n'
},{
	ja:{
		notice:'⚠️\nこのページはβテスト中です。\n不具合や未実装の機能があることがあります。',
		title:'タイトルを入力',del:'削除',cancel:'キャンセル',save:'保存しました!',osave:'上書き保存しました!',
		nodat:'データがありません',err:x=>`データの${['読み込み','複製','削除','保存'][x]}に失敗しました`,
		exp:x=>`「${x}」を書き出す`,imp:'URLから読みこむ',
		delq:x=>`「${x}」を削除してよろしいですか？`
	}
}[window.navigator.language.slice(0,2)]),
llog=(x,c)=>{if(dbgcb.checked){if(c)log.textContent='';log.textContent+=`${x}\n`;}},
seq=new Tone.Sequence((time,note)=>{
	note=note.split(',');
	curpset();scrset();kbset(note);//Tone.Draw.schedule(()=>{},time);
	llog(Tone.Transport.position,1);
	if(note[0]){
		if(main.arp){let arp=main.arp*.01;note.map(toHz).forEach((x,i)=>synth.triggerAttackRelease(x,'1m',time+arp*i,kbfixed.checked?.3:1));}
		else synth.triggerAttackRelease(note.map(toHz),'1m',time,kbfixed.checked?.3:1);
		llog(`${note.map(x=>n2c[(Number(x)+main.sc+48)%12]+(Math.floor((Number(x)+main.sc)*.08333)+4)/*49+Number(x)+main.sc*/)}`);
	}
},[],'4n').start(0),
stdli=(a,b,s={})=>{for(let i=a;i<=b;i++){s[`d#${i}`]=`ds${i}.mp3`;s[`a${i}`]=`a${i}.mp3`;}return s;},
toHz=x=>880*Math.pow(2,(Number(x)+main.sc)/12),//C5~C7
i2n=['-9','-7','-5','-4','-2','0','2','3','5','7','8','10','12','14','15'],
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6','3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
n2c=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'],
pos2p=pos_=>{let tmp=pos_.split(':').map(x=>Number(x));return tmp[0]*Tone.Transport.timeSignature+tmp[1]+tmp[2]*.25;},
p2pos=p_=>`${Math.floor(p_/Tone.Transport.timeSignature)}:${Math.floor(p_)%Tone.Transport.timeSignature}:${(p_*4)%4}`,
scset=()=>{if(Number.isInteger(Number(sc_.value)))main.sc=Number(sc_.value);else sc_.value=main.sc;llog(main.sc);},
arpset=()=>{if(Number.isInteger(Number(arp_.value)))main.arp=Number(arp_.value);else arp_.value=main.arp;llog(main.arp);},
bpmset=()=>{let tmp=Number(bpm_.value);if(tmp){Tone.Transport.bpm.value=tmp;main.bpm=tmp;}else bpm_.value=main.bpm;llog(main.bpm);},
tsset=()=>{let tmp=Number(ts_.value);if(tmp){main.ts=tmp;Tone.Transport.timeSignature=tmp||4;}else ts_.value=main.ts;
	stybeat.textContent=main.ts>1?`#disp>.noteW:nth-child(${main.ts}n+1){overflow:hidden;}#disp>.noteW:nth-child(${main.ts}n+1)::before{content:"";position:absolute;display:block;width:2px;height:100%;background:#feac;}`:'';
	llog(main.ts);
},
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
	if(16<dcbl&&dcbl<dispScr.clientWidth-64&&userscr[1]){userscr[1]=false;curct.style.display='none';}
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
	console.time('ccset');
	calced={ind:[],p:[]};
	calced.e=document.querySelectorAll('#disp .note');
	calced.e.forEach(e=>{
		calced.ind.push(e.dataset.ind);
		calced.p.push(Number(e.dataset.p));
	});
	calced.length=calced.e.length;
	console.timeEnd('ccset');
},
ttoggle=()=>{
	Tone.start();
	let state=Tone.Transport.state!='started';
	distrs.checked=state;
	if(state&&!from_url)ezsave();
	Tone.Transport[state?'start':'pause']();
},
tstop=()=>{Tone.Transport.stop();distrs.checked=false;curpos=0;curset();scrset();kbset();},
tstep=x=>{
	Tone.start();
	Tone.Transport.pause();distrs.checked=false;
	curpos+=x;
	if(curpos<0)curpos=calced.length+curpos%calced.length;else if(curpos>=calced.length)curpos=curpos%calced.length;
	Tone.Transport.position=p2pos(calced.p[curpos]);
	curset();setTimeout(scrset,100);
	let note=kbset();if(note[0])synth.triggerAttackRelease(note.map(toHz));
},
urdo=x=>{
	let tmp=false;
	while(x<0){if(urstack[0].length){urstack[2].unshift(urstack[1]);urstack[1]=urstack[0].pop();x++;tmp=true;llog('undo');}else{domshake(undobtn);break;}}
	while(0<x){if(urstack[2].length){urstack[0].push(urstack[1]);urstack[1]=urstack[2].shift();x--;tmp=true;llog('redo');}else{domshake(redobtn);break;}}
	if(tmp){
		main.scores=JSON.parse(urstack[1]);requestIdleCallback(()=>seq.events=main.scores);requestIdleCallback(()=>{a2d();curpset();kbset();});
	}
},
rawedit=()=>{
	Tone.Transport.pause();distrs.checked=false;
	alert('',1,1);
	let str=JSON.stringify(main.scores/*,null,'	'*/).replace(/,/g,', ');
	let txta=document.createElement('textarea');
	albox.appendChild(txta);
	txta.value=str;
	txta.classList.add('style');
	requestIdleCallback(()=>{
		let ind=0;
		for(let i=0;i<curpos*2+1;i++)ind=txta.value.indexOf('"',ind+1);
		txta.setSelectionRange(ind+1,txta.value.indexOf('"',ind+1));
	});
	txta.oninput=()=>{
		clearTimeout(seqsett);
		seqsett=setTimeout(()=>{
			let tmp;
			try{tmp=JSON.parse(txta.value.replace(/\s/g,''));}catch(e){console.log(e);}
			if(tmp){
				main.scores=tmp;requestIdleCallback(()=>seq.events=main.scores);urset();
				llog('raw good');
				requestIdleCallback(a2d);curpset();
				synth.triggerAttackRelease(440*Math.pow(2,(3 +main.sc)/12),'1m');
				synth.triggerAttackRelease(440*Math.pow(2,(7 +main.sc)/12),'1m','+.05',.9);
				synth.triggerAttackRelease(440*Math.pow(2,(10+main.sc)/12),'1m','+.1',.8);
			}else{
				llog('raw bad');
				/*synth.triggerAttackRelease(440*Math.pow(2,(8 +main.sc)/12),'1m');
				synth.triggerAttackRelease(440*Math.pow(2,(7 +main.sc)/12),'1m','+.05',.9);
				synth.triggerAttackRelease(440*Math.pow(2,(1+main.sc)/12),'1m','+.1',.8);*/
			}
		},1000);
	};
},
domshake=x=>{x.onanimationend=()=>x.classList.remove('shake');x.classList.add('shake');};

ibtn.onclick=()=>{alert(texts.info,1);albox.innerHTML+=`<label for="uiflip" class="grid bg" style="--bp:0 -200%;">flip ui</label><button onclick="rawedit();" class="grid bg" style="--bp:-400% -200%;">raw edit</button><label for="dbgcb" class="grid showtxt">debug</label>`;};
curct.onclick=()=>{userscr[0]=true;dispScr.scrollLeft=dispCur.getBoundingClientRect().left+dispScr.scrollLeft+window.scrollX-dispScr.clientWidth*.5;};
document.querySelectorAll('#kb p').forEach((e,i)=>{
	const keyfx=ev=>{
		ev.preventDefault();Tone.start();
		if(kblock.checked)synth.triggerAttackRelease(toHz(i2n[i]));
		else{
			clearTimeout(seqsett);
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
			Function(arr)();
			seqsett=setTimeout(()=>{requestIdleCallback(()=>seq.events=main.scores);urset();},500);
			e.classList.toggle('press');
		}
	};
	e.addEventListener('touchstart',keyfx,{passive:false});
	e.addEventListener('mousedown',keyfx,{passive:false});
});
document.addEventListener('keydown',e=>{
	if(alcb.checked&&albox.style.pointerEvents){alcb.checked=false;return;}
	if(!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)&&!alcb.checked){
		llog(e.code);
		switch(e.code){
			case'Space':e.preventDefault();ttoggle();break;
			case'ArrowUp':e.preventDefault();if(e.shiftKey)bpm_.parentNode.nextElementSibling.click();else sc_.value=++main.sc;break;
			case'ArrowDown':e.preventDefault();if(e.shiftKey)bpm_.parentNode.previousElementSibling.click();else sc_.value=--main.sc;break;
			case'ArrowLeft':e.preventDefault();if(e.shiftKey)tstep(-10);else tstep(-1);break;
			case'ArrowRight':e.preventDefault();if(e.shiftKey)tstep(10);else tstep(1);break;
			case'KeyE':if(e.metaKey||e.ctrlKey){console.log(urlfx.e());}break;
			case'KeyO':if(e.metaKey||e.ctrlKey){if(!e.shiftKey){e.preventDefault();load();}}break;
			case'KeyS':if(e.metaKey||e.ctrlKey){if(!e.shiftKey){e.preventDefault();save();}}break;
			case'KeyZ':if(e.metaKey||e.ctrlKey){e.preventDefault();urdo(e.shiftKey?1:-1);}break;
			default:
				const keymap={
					KeyR:'kbb00',KeyT:'kbb01',KeyY:'kbb02',KeyU:'kbb03',KeyI:'kbb04',
					KeyF:'kbb10',KeyG:'kbb11',KeyH:'kbb12',KeyJ:'kbb13',KeyK:'kbb14',
					KeyC:'kbb20',KeyV:'kbb21',KeyB:'kbb22',KeyN:'kbb23',KeyM:'kbb24'
				}
				if(keymap[e.code]&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){
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
		if(userscr[1])curct.style.display='';
	};
	tmp();screxet=setTimeout(tmp,100);
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
	onClone:e=>e.clone.querySelectorAll('.sort').forEach(x=>new Sortable(x,sopt)),
	onSort:e=>{
		console.log(e);
		const clto=(e.pullMode=='clone'&&e.target.isEqualNode(e.to)),
			clfrom=(e.pullMode=='clone'&&e.target.isEqualNode(e.from));
		if(clfrom)ccset();
		else if(clto||e.target.isEqualNode(e.from))
			requestIdleCallback(()=>{
				if(e.to.id=='trash'||e.from.contains(e.to))d2d(e.from);
				else if(clto||e.to.contains(e.from))d2d(e.to);
				else{d2d(e.from);d2d(e.to);}
				ccset();
				if(curpos<0)curpos=0;else if(calced.length-1<curpos)curpos=calced.length-1;
				curset();d2a();urset();kbset();
			});
	}
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
				if(x)x.split(',').forEach(y=>{
					let note=document.createElement('p');
					if(n2i[y]==undefined){
						if(Number(y)>0)y=String((Number(y)+9)%24-9);
						else y=String((Number(y)+10)%24+14);
						note.style.opacity=.5;
					}
					note.style.bottom=Number(n2i[y])*16+'px';
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
			if(x.classList.contains('note'))return x.dataset.note;
			else if(x.classList.contains('sortW'))return core(x.children[0]);
		});
	console.time('d2a');
	main.scores=core(disp);requestIdleCallback(()=>seq.events=main.scores);
	console.timeEnd('d2a');
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
	}else core(x.parentNode);
	console.timeEnd('d2d');
},
save=()=>{
	if(!main.name){
		alert('',1,1);
		albox.insertAdjacentHTML('beforeend',`${texts.title}<input class="style" onchange="this.nextElementSibling.click();"><button
		onclick="{let tmp=this.previousElementSibling.value||('untitled '+new Date().toLocaleString());name_.textContent=main.name=tmp;document.title='sky_seq '+tmp;dbfx.save();}" class="grid bg" style="--bp:-600% -200%;">save</button>`);
		albox.querySelector('input').focus();
	}else dbfx.save();
},
load=()=>{
	alert('',1,1);
	let req=idb.result.transaction('seq','readwrite').objectStore('seq').getAllKeys(),
		tpl=`<button onclick="main=null;init();alcb.checked=false;" class="grid bg" style="--bp:-700% -100%;">new</button><button onclick="dbfx.imp();"class="grid bg" style="--bp:-600% -100%;">import</button><br>`;
	req.onsuccess=e=>{
		let tmp=e.target.result;//sort
		albox.insertAdjacentHTML('beforeend',tpl);
		console.log(tmp);dbfx.tmp=tmp;
		if(!tmp.length)albox.insertAdjacentHTML('beforeend',`${texts.nodat}<br><button onclick="this.textContent='Loading…';this.disabled=true;impsample(load);">download sample</button>`);
		tmp.forEach((x,i)=>requestIdleCallback(()=>{
			albox.insertAdjacentHTML('beforeend',`<div><span onclick="dbfx.open(${i});">${x}</span><br><button
				onclick="dbfx.renameW(${i});" class="grid bg" style="--bp:-200% -300%;">rename</button><button
				onclick="dbfx.dupe(${i});" class="grid bg" style="--bp:0 -300%;">dupe</button><button
				onclick="dbfx.exp(${i});" class="grid bg" style="--bp:-400% -100%;">export</button><button
				onclick="dbfx.delW(${i});" class="grid bg" style="--bp:-700% -200%;">delete</button></div>`
			);
		}));
	};
	req.onerror=e=>{
		albox.textContent=`⚠️\n${texts.err(0)}\n\n${e.target.error}`;
		albox.insertAdjacentHTML('beforeend',tpl);
	};
},
dbfx={
	tmp:[],
	get:function(i,sfx,efx){
		console.log(this.tmp[i]);
		let req=idb.result.transaction('seq','readwrite').objectStore('seq').get(this.tmp[i]);
		req.onsuccess=sfx;req.onerror=efx||(e=>albox.textContent=`⚠️\n${texts.err(0)}\n\n${e.target.error}`);
	},
	open:i=>dbfx.get(i,e=>{main=e.target.result;init();alcb.checked=false;}),
	dupe:i=>dbfx.get(i,e=>{
		let dup=e.target.result;dup.name+=' copy';
		let req=idb.result.transaction('seq','readwrite').objectStore('seq').add(dup);
		req.onsuccess=load;
		req.onerror=e=>albox.textContent=`⚠️\n${texts.err(1)}\n\n${e.target.error}`;
	}),
	exp:i=>{
		dbfx.get(i,e=>{
			alert('',1);
			albox.insertAdjacentHTML('beforeend',`${texts.exp(e.target.result.name)}<input value="${urlfx.e(e.target.result)}"><button
			onclick="navigator.clipboard.writeText(this.previousElementSibling.value).then(()=>alcb.checked=false);" class="grid bg" style="--bp:0 -300%;">copy</button><button
			onclick="window.open('https://twitter.com/share?text=${encodeURIComponent(e.target.result.name)}&hashtags=sky_sequencer&url='+encodeURIComponent(this.previousElementSibling.previousElementSibling.value));alcb.checked=false;" class="grid bg" style="--bp:-700% -300%;">tweet</button>`);
		});
	},
	imp:()=>{
		alert('',1);
		albox.insertAdjacentHTML('beforeend',`${texts.imp}<input class="style" onchange="this.nextElementSibling.click();"><button
		onclick="{let tmp=urlfx.l(this.previousElementSibling.value.split('#',2)[1]);if(tmp){main=tmp;alcb.checked=false;init();idb.result.transaction('seq','readwrite').objectStore('seq').add(tmp);}else domshake(this);}" class="grid bg" style="--bp:-600% -100%;">import</button>`);
		requestIdleCallback(()=>navigator.clipboard.readText().then(x=>albox.querySelector('input').value=x).catch(console.log));
	},
	delW:function(i){
		alert('',1);
		albox.insertAdjacentHTML('beforeend',`${texts.delq(this.tmp[i])}<br><br><button
		onclick="dbfx.del(${i});" class="style dialogb" style="background:#f448;">${texts.del}</button><button
		onclick="load();" class="style dialogb">${texts.cancel}</button>`);
	},
	del:function(i){
		let req=idb.result.transaction('seq','readwrite').objectStore('seq').delete(this.tmp[i]);
		req.onsuccess=load;
		req.onerror=e=>albox.textContent=`⚠️\n${texts.err(2)}\n\n${e.target.error}`;
	},
	delAll:()=>idb.result.transaction('seq','readwrite').objectStore('seq').clear().onsuccess=()=>llog('delall done'),
	save:()=>{
		let req=idb.result.transaction('seq','readwrite').objectStore('seq').add(main);
		req.onerror=()=>{
			req=idb.result.transaction('seq','readwrite').objectStore('seq').put(main);
			req.onerror=e=>alert(`⚠️\n${texts.err(3)}\n\n${e.target.error}`);
			req.onsuccess=()=>alert(`✅\n${texts.osave}`);
		};
		req.onsuccess=()=>{alert(`✅\n${texts.save}`)};
	},
	renameW:function(i){
		albox.textContent='';
		albox.insertAdjacentHTML('beforeend',`${texts.title}<input class="style" value="${this.tmp[i]}" onchange="this.nextElementSibling.click();"><button
		onclick="dbfx.rename(${i},this.previousElementSibling.value);" class="grid bg" style="--bp:-200% -300%;">rename</button>`);
		albox.querySelector('input').focus();
	},
	rename:(i,x)=>{
		dbfx.get(i,e=>{
			let dat=e.target.result;dat.name=x;
			let req=idb.result.transaction('seq','readwrite').objectStore('seq').add(dat);
			req.onerror=e=>{console.log(e);load();};req.onsuccess=()=>dbfx.del(i);
		});
	}
},
init=()=>{
	Tone.Transport.pause();from_url=false;
	if(!main)main={name:'',sc:0,bpm:120,ts:4,arp:0,scores:new Array(8).fill('')};
	if(main.arp==undefined)main.arp=0;
	disp.textContent='Loading sheet…';
	urstack=[[],JSON.stringify(main.scores),[]];
	requestIdleCallback(()=>seq.events=main.scores);sc_.value=main.sc;arp_.value=main.arp;
	bpm_.value=main.bpm;bpmset();ts_.value=main.ts;tsset();//Tone.Transport.swing=1;
	name_.textContent=main.name;document.title='sky_seq '+main.name;
	requestIdleCallback(a2d);
	requestIdleCallback(tstop);
},
ezsave=()=>{localStorage.seq_ezsave=JSON.stringify(main);console.log('ezsave');},
urlfx={
	dmap:(x,fx)=>x.map(y=>{if(Array.isArray(y))return urlfx.dmap(y,fx);else return fx(y);}),
	e:(dat=Object.assign({},main))=>{
		dat.scores=urlfx.dmap(dat.scores,x=>x.split(',').map(y=>{if(y){y=Number(y)+15;return(y<0?'-':'')+Math.abs(y).toString(36);}}).join('.'));
		dat.scores=JSON.stringify(dat.scores).replace(/\"/g,'').replace(/\],\[/g,'*').replace(/,/g,'~').replace(/\[/g,'!').replace(/\]/g,'_');
		return 'https://mcbeeringi.github.io/sky/seq.html#'+encodeURIComponent(JSON.stringify(dat));
	},
	l:(str=location.hash.slice(1))=>{
		if(!str)return;
		let dat=JSON.parse(decodeURIComponent(str));
		if(!dat.scores)return;
		dat.scores=dat.scores.replace(/\*/g,'],[').replace(/~/g,',').replace(/!/g,'[').replace(/_/g,']');
		dat.scores=JSON.parse(dat.scores.replace(/([\[\,])([^\[\]\,\"]*)([\]\,])/g,'$1"$2"$3').replace(/([\[\,])([^\[\]\,\"]*)([\]\,])/g,'$1"$2"$3'));
		dat.scores=urlfx.dmap(dat.scores,x=>x.split('.').map(y=>{if(y)return parseInt(y,36)-15;}).join(','));
		console.log('load url',dat);
		return dat;
	}
},
impsample=fx=>fetch('sample.json').then(x=>x.json()).then(x=>
	Promise.allSettled(x.map(y=>new Promise((t,c)=>{
		let tmp=idb.result.transaction('seq','readwrite').objectStore('seq').add(y);
		tmp.onsuccess=()=>{llog(y.name);t(y.name);};tmp.onerror=()=>c();
	}))).then(fx||(()=>{}))
);

alert(texts.notice);
if(!localStorage.seq_undoMax){
	localStorage.seq_undoMax=24;
	requestIdleCallback(()=>{
		fetch('sample.json').then(x=>x.json()).then(x=>x.forEach((y,i)=>idb.result.transaction('seq','readwrite').objectStore('seq').add(y).onsuccess=()=>{if(x.length==i+1)load();}));
	});
}
synth=new Tone.Sampler(stdli(4,6,{'a3':'a3.mp3','d#7':'ds7.mp3'}),()=>{},'https://mcbeeringi.github.io/sky/audio/instr/musicbox/').toDestination();
log.textContent=texts.info;//Tone.Transport.loop=true;
from_url=Boolean(main=urlfx.l());
if(!from_url&&localStorage.seq_ezsave)main=JSON.parse(localStorage.seq_ezsave);
init();document.body.focus();
if(!from_url){
	setInterval(ezsave,60000);
	document.onvisibilitychange=()=>{if(document.visibilityState=='hidden')ezsave();};
}else idb.result.transaction('seq','readwrite').objectStore('seq').add(main);

new Sortable(tpl,{
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
	onClone:e=>e.clone.querySelectorAll('.sort').forEach(x=>new Sortable(x,sopt)),
	invertSwap:true,animation:150,forceFallback:true,direction:'horizontal',delay:100,delayOnTouchOnly:false,
});
new Sortable(trash,{group:'group_',onAdd:e=>e.item.parentNode.removeChild(e.item)});
new Sortable(disp,sopt);
