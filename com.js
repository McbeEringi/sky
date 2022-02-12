alert=x=>{alcb.checked=true;albox.textContent='';albox.insertAdjacentHTML('beforeend',x);};
if(urlq.pwa=='1'){const a=drawer.querySelector('a');a.href+='&pwa=1';a.target='';}
const errfx=(e={})=>{alert(`⚠️${e.name||'Error'}\n<small>${e.message||'Something went wrong :('}</small>`);console.error(e);},
	yn=x=>new Promise(f=>{alert(`${x}<div class="yn"><p class="grid btn" style="--bp:-400% 0;"></p><p class="grid btn" style="--bp:-300% 0;"></p></div>`);[...albox.lastChild.children].forEach((e,i)=>e.onclick=()=>f(i));}),
	n2nn=x=>({c:12,d:14,e:16,f:17,g:19,a:21,b:23})[x[0].toLowerCase()]+(({'#':1,s:1})[x[1]]?x.slice(2)*12+1:x.slice(1)*12),
	nn2n=x=>['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][x%12]+Math.floor(x/12-1),
	bp=i=>`${i%8*-100}% ${Math.floor(i*.125+1)*-100}%`,
	e2p=x=>new Promise((f,r)=>Object.assign(x,{onsuccess:f,onerror:r})),
	stdli=(a,b=a+1,s={})=>{for(let i=a;i<=b;i++){s['ds'+i]=`ds${i}.mp3`;s['a'+i]=`a${i}.mp3`;}return s;},
	d={
		instr:[
			['audio/instr/musicbox/',1,[stdli(4,6,{a3:'a3.mp3',ds7:'ds7.mp3'})],0],
			['audio/instr/harp/',-1,[stdli(3,5)],0],//210503
			['audio/instr/percussion/',0,[{a4:'0.mp3',as4:'1.mp3',b4:'2.mp3',c5:'3.mp3',a5:'4.mp3',as5:'5.mp3',b5:'6.mp3',c6:'7.mp3'}],1],
			['audio/instr/contrabass/',-2,[stdli(2,4)],0],//211009
			['audio/instr/horn/',-1,[stdli(3,5)],0],//211009
			['audio/instr/piano/',0,[stdli(4,6)],0],//220127 +10db
				['',0,[{ds5:'audio/instr/musicbox/ds6.mp3',a5:'audio/instr/musicbox/a6.mp3'},{ds5:'audio/instr/glock/ds5.mp3',a5:'audio/instr/glock/a5.mp3'}],2],
				['audio/instr/bell2/',1,[{c4:'c4.mp3',d4:'d4.mp3',g4:'g4.mp3',a4:'a4.mp3'},{c4:'c4_.mp3',d4:'d4_.mp3',g4:'g4_.mp3',a4:'a4_.mp3'}],2],
			['audio/instr/flute/',0,[stdli(4,6)],0],//211009
			['audio/instr/quena/',0,[stdli(4,6)],0],//211009
			['audio/instr/guitar/',-1,[stdli(3,5)],0,4],//main:210503 fret:211009
			['audio/instr/ukulele/',-1,[stdli(3,5)],0],//211009
			['audio/instr/piano/',1,[stdli(5,7)],0],//220127 +10db
			['audio/instr/glock/',0,[stdli(4,6)],0],//210529
			['audio/instr/handpan/',-1,[stdli(3)],3],
			['audio/instr/dundun/',0,[{a4:'0.mp3',as4:'1.mp3',b4:'2.mp3',c5:'3.mp3',a5:'4.mp3',as5:'5.mp3',b5:'6.mp3',c6:'7.mp3'}],1],
			['audio/instr/pipa/',-1,[stdli(3,5)],0],//210529
			['audio/instr/bugle/',0,[stdli(4,6)],0],//210529
				['audio/instr/ocarina/',0,[stdli(4,6)],0],
			['audio/instr/kalimba/',0,[stdli(4,6)],0]//211025
		],
		i2n:[
			[-9,-7,-5,-4,-2,0,2,3,5,7,8,10,12,14,15],
			[0,1,2,3,12,13,14,15],//percussion
			[-9,-7,-2,0,-9,-7,-2,0],//bell
			[-7,0,3,5,8,10,12,15],//handpan
			[2,5,12,-10,-7,0,-22,-19,-12]//nov
		],
		g:[0,1,1,1,2],
		k2g:[
			[5,3],
			[4,2],
			[3,3]
		],
		p:[0,0,1,0,0],
		i2p:[[],
			[0,0,0,0,1,1,1,1]
		]
	},
	q={
		flip:400,tex:new Image(),
		k2i:Object.fromEntries(Array.from('QWERTASDFGZXCVB',(x,i)=>[`Key${x}`,[i%5,Math.floor(i/5)]]))
	};
