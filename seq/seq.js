'use strict';
let main,calced,tims={},curpos=0,ecur,sel,urstack,clips=[],from_url,cfg,isc,synth;
alert=(x,f)=>{alcb.checked=true;alfcb.checked=f;albox.textContent='';albox.insertAdjacentHTML('beforeend',x);};
if(!window.requestIdleCallback)window.requestIdleCallback=x=>setTimeout(x);
const texts={
	build:'2205141',
	notice:'Only this sky_seq is left as the old version due to ongoing development. \nSome functions may not be available. \nI apologize for any inconvenience.',
	title:'Enter title',save:'Saved.',osave:'Overwrite saved.',copy:' copy',imp:'load from URL',exp:x=>`export "${x}" as URL`,expmidi:'export as MIDI File',
	nodat:'No saved data found',sample:'Download sample',load:'Loading…',
	err:x=>`⚠️\nfailed to ${['read','write'][x]} datas\n\n`,saveq:'Do you want to save the current data?',delq:x=>`Are you sure you want to delete "${x}"?`,
	buiq:'All data will be over written.\nThis operation is irreversible.\nAre you sure you want to continue?',
	fubu:'Backups made in future versions cannot be loaded.',invf:'invailed file.',
	cfg:'config',sound:'sound',seq:'sequencer',kb:'keyboard',bhv:'behavior',udl:'undo & redo limit',res:'sheet resolution',chl:'clopboard his limit',bu:'backup',cbf:'create backup file',rff:'recover from file',adv:'advanced',st:'semitone editor',dbg:'show debug',
	usg:'usage',ntab:'Open in New Tab',
	...{
		ja:{
			notice:'現在開発中のためこのsky_seqのみ旧版のまま残しています。\n一部機能が使えない可能性があります。\nご不便おかけします。',
			title:'タイトルを入力',save:'保存しました!',osave:'上書き保存しました!',copy:'のコピー',imp:'URLから読み込む',exp:x=>`「${x}」をURLに書き出す`,expmidi:'MIDIファイルに書き出す',
			nodat:'保存されたデータはありません',sample:'サンプルをダウンロード',load:'読み込み中…',
			err:x=>`⚠️\nデータの${['読み出し','書き込み'][x]}に失敗しました\n\n`,saveq:'現在のデータを保存しますか？',delq:x=>`「${x}」を削除してよろしいですか？`,
			buiq:'全てのデータは上書きされます。\nこの操作は元に戻せません。\n本当にこの操作を続けますか?',
			fubu:'将来のバージョンで作成されたバックアップは読み込めません',invf:'このファイルは使用できません',
			cfg:'設定',sound:'サウンド',seq:'シーケンサ',kb:'キーボード',bhv:'動作',udl:'取り消し上限',res:'譜面解像度',chl:'コピー履歴上限',bu:'バックアップ',cbf:'バックアップを作成',rff:'ファイルから復元',adv:'高度な設定',st:'半音の編集',dbg:'デバッグの表示',
			usg:'使い方',ntab:'新規タブで開く'
		}
	}[window.navigator.language.slice(0,2)]
},
mod=(x,y)=>(x%y+y)%y,//{while(x<0)x+=y;while(x>=y)x-=y;return x;},
ctx=c.getContext('2d'),
i2n=['-9','-7','-5','-4','-2','0','2','3','5','7','8','10','12','14','15'],
n2i={'-9':'0','-8':'0.5','-7':'1','-6':'1.5','-5':'2','-4':'3','-3':'3.5','-2':'4','-1':'4.5','0':'5','1':'5.5','2':'6','3':'7','4':'7.5','5':'8','6':'8.5','7':'9','8':'10','9':'10.5','10':'11','11':'11.5','12':'12','13':'12.5','14':'13','15':'14'},
n2c=x=>{if(x){x=Number(x);return['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'][mod(x,12)]+Math.floor(x*.08333+3.833);}},
pos2p=(pos_=Tone.Transport.position)=>{let tmp=pos_.split(':').map(x=>Number(x));return mod(tmp[0]*Tone.Transport.timeSignature+tmp[1]+tmp[2]*.25,main.scores.length);},
p2pos=p_=>`${Math.floor(p_/Tone.Transport.timeSignature)}:${mod(Math.floor(p_),Tone.Transport.timeSignature)}:${mod(p_*4,4)}`,
n2Hz=x=>440*Math.pow(2,(Number(x)+main.sc)/12+isc),//C4~C6
ind2n=x=>x.reduce((a,y)=>a[y],main.scores),
ind2c=x=>{let s=x.join();return calced[typeof ind2n(x)=='string'?'note':'box'].find(y=>y.ind.join()==s);},
tstat=()=>Tone.Transport.state!='started',
seqset=(x=1500)=>{clearTimeout(tims.seqset);tims.seqset=setTimeout(()=>requestIdleCallback(()=>{seq.events=main.scores;console.log('seqset')}),x);},
stdli=(a,b=a+1,s={})=>{for(let i=a;i<=b;i++){s[`d#${i}`]=`ds${i}.mp3`;s[`a${i}`]=`a${i}.mp3`;}return s;},
instr_li=[//[baseurl, octave, map, (map2)]
	['musicbox',1,stdli(4,6,{a3:'a3.mp3','d#7':'ds7.mp3'})],
	['harp',-1,stdli(3,5)],
	null,
	['contrabass',-2,stdli(2,4)],
	['horn',-1,stdli(3,5)],
	['piano',0,stdli(4,6)],
	null,
	null,
	['flute',0,stdli(4,6)],
	['quena',0,stdli(4,6)],
	['guitar',-1,stdli(3,5)],
	['ukulele',-1,stdli(3,5)],
	['piano',1,stdli(5,7)],
	['glock',0,stdli(4,6)],
	null,
	null,
	['pipa',-1,stdli(3,5)],
	['bugle',0,stdli(4,6)],
	null,
	['kalimba',0,stdli(4,6)]
],
syset=()=>{
	let x=main.instr;
	if(!instr_li[x])main.instr=x=0;//avoid null
	instrbtn.setAttribute('style',`--bp:-${mod(x,8)}00% -${Math.floor(x*.125)+1}00%;`);
	x=instr_li[x];
	if(synth)synth.dispose();
	synth=new Tone.Sampler(x[2],null,`../audio/instr/${x[0]}/`).toDestination();
	isc=x[1];
},
sytar=(n,t=Tone.now())=>{
	if(!n)return;
	n=n.split(',').map(n2Hz);
	if(main.arp){let a=main.arp*.01;n.forEach((x,i)=>synth.triggerAttackRelease(x,undefined,t+a*i,cfg.seqvol));}
	else synth.triggerAttackRelease(n,undefined,t,cfg.seqvol);
},
seq=new Tone.Sequence((time,note)=>{
	//Tone.Draw.schedule(()=>{},time);
	curset();curpos=mod(curpos+1,calced.note.length);
	sytar(note,time);kbset(note);
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
	if(curpos>calced.note.length-1)curpos=calced.note.length-1;
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
					col=n>0?'#feaa':'#fea6';
					n=mod(Number(n)+9,24)-9;
				}
				frr(ctx,col,x.pos+1+pos,225-Number(n2i[String(n)])*16,cfg.w-2,14,4);//240-16+1
			});
		if(cfg.debug){ctx.fillStyle='#fff';ctx.fillText(x.p.toFixed(2),pos+x.pos,16,16);ctx.fillText(x.ind,pos+x.pos,32,16);}
	}
	if(emode.checked)frr(ctx,'#fea8',w*.5,0,1,240);
	if(ecur)frr(ctx,'#feac',ecur[0]+pos,0,3,240);
	if(emode.checked&&sel)frr(ctx,sel.col,sel.x+pos,0,sel.dx,240);
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
		calc();tims.igscr=true;scr.scrollLeft=sel.x+w;sel=null;[cxbtn,ccbtn].forEach(e=>e.classList.add('dis'));
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
		while(clips.length>cfg.clipMax)clips.pop();
	}
	clip.textContent='';
	clips.forEach((y,i)=>{
		let e=document.createElement('p');
		e.textContent=y.replace(/-?\d+/g,n2c);e.onclick=()=>cbset(i);
		clip.appendChild(e);
	})
},
urset=x=>{Function(x[0]+x[1])();urstack[1]=[];urstack[0].push(x);while(urstack[0].length>cfg.urMax)urstack[0].shift();console.log(x);undobtn.classList.remove('dis');redobtn.classList.add('dis');},
urdo=x=>{
	let tmp;
	while(x<0){if(urstack[0].length){urstack[1].unshift(tmp=urstack[0].pop());tmp=tmp[0]+tmp[2];x++;console.log('undo:	'+tmp);Function(tmp)();}else{break;}}
	while(0<x){if(urstack[1].length){urstack[0].push(tmp=urstack[1].shift());tmp=tmp[0]+tmp[1];x--;console.log('redo:	'+tmp);Function(tmp)();}else{break;}}
	undobtn.classList[urstack[0].length?'remove':'add']('dis');redobtn.classList[urstack[1].length?'remove':'add']('dis');
	if(tmp){calc();draw();seqset();kbset();}
},
bpmset=()=>{let x=Number(bpm_.value);if(x>0)Tone.Transport.bpm.value=main.bpm=x;else bpm_.value=Tone.Transport.bpm.value=main.bpm;},
scset=()=>{let x=Number(sc_.value);if(sc_.value&&Number.isInteger(x))main.sc=x;else sc_.value=main.sc;},
arpset=()=>{let x=Number(arp_.value);if(arp_.value&&Number.isInteger(x))main.arp=x;else arp_.value=main.arp;},
tstart=()=>{Tone.start();Tone.Transport.start();},
tpause=()=>{Tone.Transport.pause();setTimeout(()=>{pset();curset();kbset();});},
tstop=e=>{Tone.Transport.stop();setTimeout(()=>{curpos=0;curset();kbset();});},
tstep=x=>{
	Tone.start();
	curpos=mod(curpos+x,calced.note.length);
	pset();tpause();kbset();
	if(tstat())sytar(ind2n(calced.note[curpos].ind));
},
stfx=x=>{
	if(!tstat())return;
	let ind=calced.note[curpos].ind,
		arr=ind2n(ind).split(',').filter(y=>y);
	Tone.start();
	arr=x(arr).join(',');
	sytar(arr);
	urset([`main.scores[${ind.join('][')}]=`, `'${arr}'`, `'${ind2n(ind)}'`]);
	seqset();calc();curset();
},
browse=()=>{
	tpause();
	alert(texts.load);
	let s=`<button onclick="main=null;init();alcb.checked=false;" class="grid bg" style="--bp:-100% -200%;">new</button><button onclick="dbfx.imp();" class="grid bg" style="--bp:-600% -200%;">import</button><hr>`;
	Object.assign(idb.transaction('seq','readwrite').objectStore('seq').getAllKeys(),{
		onsuccess:e=>{
			let tmp=e.target.result;
			// TODO: sort
			console.log(tmp);dbfx.tmp=tmp;
			if(!tmp.length){alert(`${s}${texts.nodat}\n<button onclick="this.textContent='${texts.load}';this.disabled=true;dbfx.sam(browse);">${texts.sample}</button>`,1);return;}
			s+='<div class="items">';
			tmp.forEach((x,i)=>
				s+=`<button onclick="dbfx.ope(${i});this.blur();" class="style"><p>${x}</p><div><p
					onclick="dbfx.ren(${i});event.stopPropagation();" class="grid bg" style="--bp:-400% -200%;">rename</p><p
					onclick="dbfx.dup(${i});event.stopPropagation();" class="grid bg" style="--bp:-300% -200%;">dupe</p><p
					onclick="dbfx.exp(${i});event.stopPropagation();" class="grid bg" style="--bp:-700% -200%;">export</p><p
					onclick="dbfx.del(${i});event.stopPropagation();" class="grid bg" style="--bp:-200% -200%;">delete</p></div></button>`
			);
			alert(s+'</div>',1);
		},
		onerror:e=>alert(`${s}${texts.err(0)}${e.target.error}`)
	});
},
dbfx={
	sav:fx=>{
		if(main.name){dbfx.sav_(fx);return;}
		alert(`${texts.title}\n<input class="style input" placeholder="untitled">\n<button class="grid bg" style="--bp:-500% -200%;">save</button>`);
		albox.querySelector('input').focus();
		albox.querySelector('button').onclick=()=>{
			main.name=albox.querySelector('input').value||`untitled ${new Date().toLocaleString()}`;
			document.title=`sky_seq ${name_.textContent=main.name}`;dbfx.sav_(fx);
		};
	},
	sav_:fx=>{
		from_url=false;
		Object.assign(idb.transaction('seq','readwrite').objectStore('seq').add(main),{
			onsuccess:fx||(()=>alert(`✅\n${texts.save}`)),
			onerror:()=>Object.assign(idb.transaction('seq','readwrite').objectStore('seq').put(main),{
				onsuccess:fx||(()=>alert(`✅\n${texts.osave}`)),
				onerror:e=>alert(`${texts.err(1)}${e.target.error}`)
			})
		});
	},
	get:(i,fx)=>{
		console.log(dbfx.tmp[i]);
		Object.assign(idb.transaction('seq','readwrite').objectStore('seq').get(dbfx.tmp[i]),{
			onsuccess:fx,
			onerror:e=>alert(`${texts.err(0)}${e.target.error}`)
		});
	},
	ope:i=>dbfx.get(i,e=>{main=e.target.result;from_url=false;init();alcb.checked=false;}),
	ren:i=>{
		alert(`${texts.title}\n<input class="style input" value="${dbfx.tmp[i]}" placeholder="${dbfx.tmp[i]}"">\n<button class="grid bg" style="--bp:-400% -200%;">rename</button>`);
		albox.querySelector('input').focus();
		albox.querySelector('button').onclick=()=>dbfx.ren_(i,albox.querySelector('input').value);
	},
	ren_:(i,x)=>{
		if(!x||dbfx.tmp[i]==x){browse();return;}
		dbfx.get(i,e=>{
			let dat=e.target.result;dat.name=x;
			Object.assign(idb.transaction('seq','readwrite').objectStore('seq').add(dat),{
				onsuccess:()=>dbfx.del_(i),
				onerror:e=>alert(`${texts.err(1)}${e.target.error}`)
			});
		});
	},
	dup:i=>dbfx.get(i,e=>{
		let dat=e.target.result;dat.name+=texts.copy;
		Object.assign(idb.transaction('seq','readwrite').objectStore('seq').add(dat),{
			onsuccess:browse,
			onerror:e=>alert(`${texts.err(1)}${e.target.error}`)
		});
	}),
	del:i=>{
		alert(`${texts.delq(dbfx.tmp[i])}\n<button onclick="dbfx.del_(${i});" class="grid bg" style="--bp:-400% -100%;background-color:#f448;">delete</button>	<button onclick="browse();" class="grid bg" style="--bp:-500% -100%;">cancel</button>`);
		albox.lastElementChild.focus();
	},
	del_:i=>{Object.assign(idb.transaction('seq','readwrite').objectStore('seq').delete(dbfx.tmp[i]),{onsuccess:browse,onerror:e=>alert(`${texts.err(1)}${e.target.error}`)});},
	imp:()=>{
		alert(`${texts.imp}\n<input class="style input" placeholder="...sky/seq.html#...">\n<button class="grid bg" style="--bp:-600% -200%;">import</button>`);
		albox.querySelector('input').focus();
		albox.querySelector('button').onclick=()=>{
			let tmp=urlfx.i(albox.querySelector('input').value.split('#',2)[1]);
			if(tmp){
				main=tmp;alcb.checked=false;from_url=true;init();
				//idb.transaction('seq','readwrite').objectStore('seq').add(tmp);
			}else albox.querySelector('input').focus();
		};
		//requestIdleCallback(()=>navigator.clipboard.readText().then(x=>albox.querySelector('input').value=x).catch(console.log));
	},
	exp:i=>{
		dbfx.get(i,e=>{
			alert(`${texts.exp(e.target.result.name)}\n<input class="style input" value="${urlfx.o({...e.target.result})}">\n<button class="grid bg" style="--bp:-100% -100%;">copy</button>	<button class="grid bg" style="--bp:-400% -300%;">tweet</button>	<button class="grid bg" style="--bp:-700% -200%;">share</button><hr>${texts.expmidi}\n<button class="grid bg" style="--bp:-700% 0;">smf midi</button>`);
			let b=albox.querySelectorAll('button'),el=albox.querySelector('input');b[0].focus();
			b[0].onclick=()=>navigator.clipboard.writeText(el.value).then(browse);
			b[1].onclick=()=>{window.open(`https://twitter.com/share?text=${encodeURIComponent(e.target.result.name)}&hashtags=sky_seq&url=${encodeURIComponent(el.value)}`);browse();};
			if(navigator.share)b[2].onclick=()=>navigator.share({title:`sky_seq ${e.target.result.name}`,text:`${e.target.result.name}\n Created w/ #sky_seq `,url:el.value});
			else{b[2].previousSibling.remove();b[2].remove();}
			b[3].onclick=()=>{
				alert('Standard MIDI File export\ndownloading assets...');
				fetch('https://mcbeeringi.github.io/src/smf.js').then(x=>x.text()).then(w=>{
					const midi=Function(w+`return json2midi`)(),
						a=document.createElement('a'),
						note=69+e.target.result.sc+(instr_li[e.target.result.instr]||[,0])[1]*12,
						conv=(x,l=480,o=0)=>x.flatMap((y,i)=>Array.isArray(y)?conv(y,Math.round(l/y.length),l*i+o):y.split(',').flatMap(z=>z?[{dt:l*i+o,ch:0,name:'noteOn',note:+z+note,vel:100},{dt:l*(i+2)+o,ch:0,name:'noteOn',note:+z+note,vel:0}]:[]));
					a.download=e.target.result.name+'.mid';
					a.href=URL.createObjectURL(midi({
						header:{format:0,division:480},
						tracks:[[
							{dt:0,name:'meta',type:0x03,data:new TextEncoder().encode(e.target.result.name)},
							{dt:0,name:'meta',type:0x51,data:((x,l)=>new Array(l--).fill().map((_,i)=>(x>>(8*(l-i)))&0xff))(Math.round(60000000/e.target.result.bpm),3)},
							{dt:0,name:'meta',type:0x59,data:new Uint8Array([e.target.result.sc,0])},
							{dt:0,name:'prg',prg:[0x0a,0x2e,,0x2b,0x3b,0x00,,,0x49,0x4b,0x19,0x18,0x01,0x09,,,0x6a,0x38,,0x6c][e.target.result.instr]||0},
							...conv(e.target.result.scores).sort((a,b)=>Math.sign(a.dt-b.dt)).reduce((a,x)=>{x.dt=-a[0]+(a[0]=x.dt);a.push(x);return a;},[0]).slice(1),
							{dt:960,name:'meta',type:0x2f,data:[]}
						]]
					}));
					a.click();
					setTimeout(URL.revokeObjectURL,20000,a.href);
					browse();
				}).catch(e=>alert(`Error\n${e}`));
			};
		});
	},
	sam:fx=>fetch('sample.json').then(x=>x.json()).then(x=>
		Promise.allSettled(x.map(y=>new Promise((t,c)=>
			Object.assign(idb.transaction('seq','readwrite').objectStore('seq').add(y),{
				onsuccess:()=>{console.log(y.name);t(y.name);},
				onerror:c
			})
		))).then(fx||(()=>{}))
	),
	delAll:fx=>idb.transaction('seq','readwrite').objectStore('seq').clear().onsuccess=()=>{console.log('delall done');if(fx)fx();},
	buo:()=>{
		Object.assign(idb.transaction('seq','readwrite').objectStore('seq').getAll(),{
			onsuccess:e=>{
				let a=document.createElement('a'),
					x={
						sky_seq_backup_version:1,
						build:texts.build,
						date:Date.now(),
						data:e.target.result.map(y=>{y.scores=urlfx.zip(y.scores);return y;}),
						ezsave:{...main,scores:urlfx.zip(main.scores)},
						cfg:cfg
					};
				new Blob([JSON.stringify(x)]).arrayBuffer().then(b=>new Int8Array(b).map(y=>~y).buffer).then(b=>{
					a.download=`${new Date().toLocaleDateString()}.skyseq`;a.href=URL.createObjectURL(new Blob([b]));
					a.click();setTimeout(URL.revokeObjectURL,10000,a.href);
				});
			},
			onerror:e=>alert(`${texts.err(0)}${e.target.error}`)
		});
	},
	bui:x=>{
		alert(`${texts.buiq}\n<button class="grid bg" style="--bp:-400% -100%;background-color:#f448;">recover</button>	<button onclick="infobtn.onclick();" class="grid bg" style="--bp:-500% -100%;">cancel</button>`);
		let e=albox.querySelectorAll('button');
		e[0].onclick=()=>
			Promise.allSettled(x.data.map(y=>new Promise((t,c)=>{
				y.scores=urlfx.unzip(y.scores);
				Object.assign(idb.transaction('seq','readwrite').objectStore('seq').put(y),{
					onsuccess:()=>{console.log('recovered',y.name);t(y.name);},
					onerror:c
				});
			}))).then(()=>{
				localStorage.seq_ezsave=JSON.stringify(main={...x.ezsave,scores:urlfx.unzip(x.ezsave.scores)});
				localStorage.seq_cfg=JSON.stringify(cfg=x.cfg);
				init();
				alcb.checked=false;
			}).catch(e=>alert(`${texts.err(1)}${e}`));
		e[1].focus();
	}
},
urlfx={
	dmap:(x,fx)=>x.map(y=>{if(Array.isArray(y))return urlfx.dmap(y,fx);else return fx(y);}),
	zip:x=>{
		x=urlfx.dmap(x,y=>y.split(',').map(z=>{if(z){z=Number(z)+15;return(z<0?'-':'')+Math.abs(z).toString(36);}}).join('.'));
		return JSON.stringify(x).replace(/\"/g,'').replace(/\],\[/g,'*').replace(/,/g,'~').replace(/\[/g,'!').replace(/\]/g,'_');
	},
	unzip:x=>{
		x=x.replace(/\*/g,'],[').replace(/~/g,',').replace(/!/g,'[').replace(/_/g,']').replace(/([\[\,])([^\[\]\,\"]*)([\]\,])/g,'$1"$2"$3').replace(/([\[\,])([^\[\]\,\"]*)([\]\,])/g,'$1"$2"$3');
		return urlfx.dmap(JSON.parse(x),y=>y.split('.').map(z=>{if(z)return parseInt(z,36)-15;}).join(','));
	},
	o:(dat={...main})=>{dat.scores=urlfx.zip(dat.scores);return 'https://mcbeeringi.github.io/sky/seq.html#'+encodeURIComponent(JSON.stringify(dat));},
	i:(dat=location.hash.slice(1))=>{if(!dat)return;try{dat=JSON.parse(decodeURIComponent(dat));if(!dat.scores)return;dat.scores=urlfx.unzip(dat.scores);return dat;}catch(e){alert(`${texts.err(0)}${e}`);}}
},
ezsave=()=>{if(!from_url&&main){localStorage.seq_ezsave=JSON.stringify(main);console.log('ezsave');}},
init=()=>{
	main={sc:0,bpm:120,arp:0,instr:0,scores:[...new Array(4).fill(''),...new Array(4).fill(['',''])],...main};urstack=[[],[]];
	document.title='sky_seq '+(name_.textContent=main.name||'');
	[redobtn,undobtn,cxbtn,ccbtn].forEach(e=>e.classList.add('dis'));bpm_.value=sc_.value=arp_.value='';
	syset();calc();seqset(0);tstop();bpmset();scset();arpset();
};

window.onresize=()=>{c.width=cfg.res*c.parentNode.clientWidth;c.height=cfg.res*240;ctx.scale(cfg.res,cfg.res);draw();}
document.onvisibilitychange=()=>{if(document.visibilityState=='hidden')ezsave();};
document.onkeydown=e=>{
	if(['input','textarea'].some(x=>document.activeElement.matches(x)))return;
	if(alcb.checked){if(['Escape','Backspace'].includes(e.code)){e.preventDefault();alcb.checked=false;}return;}
	if(e.ctrlKey||e.metaKey)
		switch(e.code){
			case'KeyZ':e.preventDefault();urdo(e.shiftKey?1:-1);break;
			case'KeyS':e.preventDefault();savebtn.onclick();break;
			case'KeyO':e.preventDefault();filebtn.onclick();break;
			case'KeyA':if(emode.checked&&!slbtn.classList.contains('dis')){e.preventDefault();slbtn.onclick();}break;
			case'KeyX':if(emode.checked&&!cxbtn.classList.contains('dis')){e.preventDefault();cxbtn.onclick();}break;
			case'KeyC':if(emode.checked&&!ccbtn.classList.contains('dis')){e.preventDefault();ccbtn.onclick();}break;
			case'KeyV':if(emode.checked&&!cvbtn.classList.contains('dis')){e.preventDefault();cvbtn.onclick();}break;
			case'KeyD':if(emode.checked&&!rmbtn.classList.contains('dis')){e.preventDefault();rmbtn.onclick();}break;
			case'KeyF':if(emode.checked&&!icbtn.classList.contains('dis')){e.preventDefault();icbtn.onclick();}break;
			case'KeyG':if(emode.checked&&!iwbtn.classList.contains('dis')){e.preventDefault();iwbtn.onclick();}break;
			case'KeyE':console.log(urlfx.o());break;
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
scr.addEventListener('wheel',e=>{e.preventDefault();scr.scrollLeft+=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.shiftKey?.1:1);},{passive:false});
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
instrbtn.onclick=()=>{
	alert(instr_li.map((x,i)=>x?`<button class="grid bg tex" style="--bp:-${mod(i,8)}00% -${Math.floor(i*.125)+1}00%" data-i="${i}">${x[0]}</button>`:'').join(''));
	albox.querySelector(`[data-i="${main.instr}"]`).focus();
	albox.querySelectorAll('button').forEach(x=>x.onclick=()=>{x.focus();main.instr=Number(x.dataset.i);syset();});
};
bpm_.onchange=bpmset;
sc_.onchange=scset;
arp_.onchange=arpset;
[...kb.children].forEach((x,i)=>{
	const keyfx=e=>{
		e.preventDefault();
		if(tstat()){
			let ind=calced.note[curpos].ind,
				arr=ind2n(ind).split(',').filter(y=>y);
			if(x.classList.toggle('a')){
				Tone.start();
				synth.triggerAttackRelease(n2Hz(i2n[i]),undefined,undefined,cfg.kbvol);
				arr=arr.concat(i2n[i]);
			}else{
				arr=arr.filter(y=>y!=i2n[i]);
			}
			urset([`main.scores[${ind.join('][')}]=`, `'${arr.join(',')}'`, `'${ind2n(ind)}'`]);
			seqset();calc();curset();
		}else synth.triggerAttackRelease(n2Hz(i2n[i]),undefined,undefined,cfg.kbvol);
	};
	x.addEventListener('touchstart',keyfx,{passive:false});
	x.addEventListener('mousedown',keyfx);
});

playbtn.onclick=e=>{if(tstat()){ezsave();tstart();}else tpause();};
stopbtn.onclick=tstop;
prevbtn.onclick=()=>tstep(-1);
nextbtn.onclick=()=>tstep( 1);
undobtn.onclick=()=> urdo(-1);
redobtn.onclick=()=> urdo( 1);
filebtn.onclick=()=>{
	alert(`${texts.saveq}\n<button onclick="browse();" class="grid bg" style="--bp:-500% -100%;">don´t save</button>	<button onclick="dbfx.sav(browse);" class="grid bg" style="--bp:-400% -100%;">save</button>`);
	albox.lastElementChild.focus();
};
savebtn.onclick=()=>dbfx.sav();
infobtn.onclick=()=>{
	alert(`
		<h1>sky_seq</h1>
		<hr>
		<h2>${texts.usg}</h2>
		<a href="manual/index.html?m=seq${window.navigator.language.slice(0,2)!='ja'?'_en':''}${urlq.pwa?'&pwa=1':''}"${urlq.pwa?'':' target="_blank"'}>${texts.ntab}</a><br>
		<iframe src="manual/index.html?m=seq${window.navigator.language.slice(0,2)!='ja'?'_en':''}"></iframe>
		<hr>
		<h2>${texts.cfg}</h2>
		<h3>${texts.sound}</h3>
		${texts.seq}: <input type="range" value="${cfg.seqvol}" min="0" max="1" step=".0625"><span>${cfg.seqvol*16}</span><br>
		${texts.kb}: <input type="range" value="${cfg.kbvol}" min="0" max="1" step=".0625"><span>${cfg.kbvol*16}</span>
		<h3>${texts.bhv}</h3>
		${texts.udl}: <input type="range" value="${cfg.urMax}" min="16" max="256" step="16"><span>${cfg.urMax}</span><br>
		${texts.chl}: <input type="range" value="${cfg.clipMax}" min="2" max="32" step="1"><span>${cfg.clipMax}</span><br>
		${texts.res}: <input type="range" value="${cfg.res}" min=".1" max="${window.devicePixelRatio}" step=".1"><span>${cfg.res}</span>
		<h3>${texts.bu}</h3>
		${texts.cbf}: <button onclick="tpause();dbfx.buo();">${texts.bu}</button><br>
		${texts.rff}: <input type="file" onclick="tpause();" accept=".skyseq"><label><input type="hidden"><span style="white-space:pre-wrap;font-size:x-small;opacity:.7;"></span></label>
		<h3>${texts.adv}</h3>
		${texts.st}: <input type="checkbox" class="toggle"${stcb.checked?' checked':''}><br>
		${texts.dbg}: <input type="checkbox" class="toggle"${cfg.debug?' checked':''}>
		<hr>
		<p>Powerd by Tone.js<br>[sky_seq] build:${texts.build}<br><a href="https://twitter.com/McbeEringi">@McbeEringi</a> MIT License</p>
	`,1);
	let e=albox.querySelectorAll('input'),cfgsave=()=>localStorage.seq_cfg=JSON.stringify(cfg);
	e[0].oninput=()=>{e[0].nextSibling.textContent=(cfg.seqvol=Number(e[0].value))*16;if(tstat())synth.triggerAttackRelease([3,7].map(n2Hz),undefined,undefined,cfg.seqvol);};e[0].onchange=cfgsave;
	e[1].oninput=()=>{e[1].nextSibling.textContent=(cfg.kbvol=Number(e[1].value))*16;synth.triggerAttackRelease([3,7].map(n2Hz),undefined,undefined,cfg.kbvol);};e[1].onchange=cfgsave;
	e[2].oninput=()=>e[2].nextSibling.textContent=cfg.urMax=Number(e[2].value);e[2].onchange=cfgsave;
	e[3].oninput=()=>e[3].nextSibling.textContent=cfg.clipMax=Number(e[3].value);e[3].onchange=cfgsave;
	e[4].oninput=()=>{e[4].nextSibling.textContent=cfg.res=Number(e[4].value);window.onresize();};e[4].onchange=cfgsave;
	e[5].onchange=()=>
		e[5].files[0].arrayBuffer().then(b=>new Int8Array(b).map(y=>~y).buffer).then(b=>new Blob([b]).text()).then(t=>{
			let x=JSON.parse(t);
			if(!x.sky_seq_backup_version)throw texts.invf;
			if(x.sky_seq_backup_version>1)throw texts.fubu;
			e[6].value=new Date(x.date).toLocaleString(undefined,{weekday:'short',year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'numeric',second:'numeric'});
			e[6].nextSibling.textContent=x.data.map(y=>y.name).join(',   ');
			e[6].onclick=()=>dbfx.bui(x);
			e[5].type='hidden';e[6].type='button';
		}).catch(e=>alert(`${texts.err(0)}${e}`));
	e[7].onchange=()=>{stcb.checked=cfg.st=e[7].checked;cfgsave();};
	e[8].onchange=()=>{cfg.debug=e[8].checked;cfgsave();draw();};
};
st0btn.onclick=()=>stfx(x=>x.map(y=>+y+1));
st1btn.onclick=()=>stfx(x=>x.map(y=>y-1));
st2btn.onclick=()=>stfx(x=>{x[x.length-1]=+x[x.length-1]+1;return x;});
st3btn.onclick=()=>stfx(x=>{x[x.length-1]=x[x.length-1]-1;return x;});

emode.onchange=draw;//()=>{sel=null;[cxbtn,ccbtn].forEach(e=>e.classList.add('dis'));[cvbtn,icbtn,iwbtn,rmbtn].forEach(e=>e.classList.remove('dis'));slbtn.classList.remove('a');draw();};
slbtn.onclick=()=>{
	if(slbtn.classList.toggle('a')){
		[cxbtn,ccbtn, cvbtn,icbtn,iwbtn,rmbtn].forEach(e=>e.classList.add('dis'));
		sel={x:ecur[0],dx:3,col:'#feaa',dat:ecur};//ecur=[pos,prev,ind]
		draw();
	}else{
		if(sel.dat[0]==ecur[0]){sel=null;[cvbtn,icbtn,iwbtn,rmbtn].forEach(e=>e.classList.remove('dis'));return;}
		let dat=selfix(sel.dat,ecur).map(ind2c);
		sel={x:dat[0].pos,dx:dat[1].pos+(dat[1].dx||cfg.w)-dat[0].pos,col:'#fea6',dat};//dat:[ind,ind]
		console.log(sel);
		[cxbtn,ccbtn, cvbtn,icbtn,iwbtn,rmbtn].forEach(e=>e.classList.remove('dis'));
		draw();
	}
};
cxbtn.onclick=()=>{
	if(!sel)return;
	let tmp=sel.dat[0].ind.length-1,s;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
	s=ind2n(tmp[0]).slice(tmp[1],tmp[2]+1);cbset(s);
	if(sel.dx==calced.length){icbtn.onclick();return;}
	urset(['main.scores'+tmp[0].map(x=>`[${x}]`).join('')+`.splice(${tmp[1]},`, `${tmp[2]-tmp[1]+1})`, `0,...${JSON.stringify(s)})`]);
	calc();tims.igscr=true;scr.scrollLeft=sel.x;sel=null;[cxbtn,ccbtn].forEach(e=>e.classList.add('dis'));
	seqset();draw();kbset();
};
ccbtn.onclick=()=>{
	if(!sel)return;
	let tmp=sel.dat[0].ind.length-1;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
	cbset(ind2n(tmp[0]).slice(tmp[1],tmp[2]+1));
	/*sel=null;[cxbtn,ccbtn].forEach(e=>e.classList.add('dis'));*/draw();
};
cvbtn.onclick=()=>selins(clips[0]);
rmbtn.onclick=()=>{
	if(sel){
		if(sel.dx==calced.length){icbtn.onclick();return;}
		let tmp=sel.dat[0].ind.length-1;tmp=[sel.dat[0].ind.slice(0,tmp),sel.dat[0].ind[tmp],sel.dat[1].ind[tmp]];
		urset(['main.scores'+tmp[0].map(x=>`[${x}]`).join('')+`.splice(${tmp[1]},`, `${tmp[2]-tmp[1]+1})`, `0,...${JSON.stringify(ind2n(tmp[0]).slice(tmp[1],tmp[2]+1))})`]);
		calc();tims.igscr=true;scr.scrollLeft=sel.x;sel=null;[cxbtn,ccbtn].forEach(e=>e.classList.add('dis'));
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
	alcb.checked=false;

	cfg={pad:12,w:16,clipMax:8,urMax:128,res:window.devicePixelRatio||1,seqvol:1,kbvol:1,debug:false,st:false,...JSON.parse(localStorage.seq_cfg||'{}')};
	if(!localStorage.seq_cfg){localStorage.seq_cfg=JSON.stringify(cfg);infobtn.onclick();}
	cfg.pad2=cfg.pad/2;cfg.w2=cfg.w/2;stcb.checked=cfg.st;
	window.onresize();

	from_url=Boolean(main=urlfx.i());
	if(!main&&localStorage.seq_ezsave)main=JSON.parse(localStorage.seq_ezsave);
	tims.ezsave=setInterval(ezsave,60000);

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
			document.body.insertAdjacentHTML('beforeend',`<style>#kb>div::after,#alfcb:checked~label[for=alcb]::before,.bg{background-image:url(${c.toDataURL()});}</style>`);
		};
		img.src='seq.svg';
	});
