
(()=>{'use strict';
const canvas=document.querySelector('#game'),g=canvas.getContext('2d'),W=384,H=216,T=16,$=s=>document.querySelector(s);g.imageSmoothingEnabled=false;
const keys={},mapWidth=3552,ground=188;let mode='menu',camera=0,score=0,money=0,health=3,tick=0,last=0,acc=0,sound=true,audio=null,finish=3470;
const player={x:32,y:140,w:17,h:29,vx:0,vy:0,grounded:false,face:1,step:0,cool:0,spitAnim:0,inv:0,coyote:0,jumps:0};
let blocks=[],ledges=[],enemies=[],coins=[],shots=[],dust=[],holes=[],market=[];
const marketBackground=new Image();marketBackground.src='assets/backgrounds/feira-de-rua.png';
const colors={skin:'#cb865e',skinLight:'#e8a477',hair:'#332138',dress:'#b69af5',shade:'#7456bc',bow:'#64d6ff'};
function r(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(s,x,y,color='#fff8e1',size=9){g.font=`bold ${size}px monospace`;g.textBaseline='top';g.fillStyle='#18204d';g.fillText(s,x+1,y+1);g.fillStyle=color;g.fillText(s,x,y)}
function rand(n){return (Math.sin(n*92.71)*43758.5453)%1}
function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function noise(x){return Math.abs(Math.sin(x*3.81)*124.83)%1}
function sfx(f=440,d=.08,type='square',vol=.025){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);a.gain.setValueAtTime(vol,audio.currentTime);a.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(a);a.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}
// Sons fornecidos pelo jogador. A trilha inicia após a primeira interação.
const audioFiles={cuspe:'cuspe',dano:'dano',feira:'feira',vitoria:'vitoria',pulo:'pulo',pulo_duplo:'pulo_duplo'};
const clips={};
for(const [key,file] of Object.entries(audioFiles)){
 const clip=new Audio('assets/audio/'+file+'.mp3');clip.preload='auto';clip.volume=key==='feira'?.30:.70;clip.loop=key==='feira';clips[key]=clip;
}
function playSound(name){if(!sound)return;const clip=clips[name];if(!clip)return;
 if(name!=='feira'){clip.pause();clip.currentTime=0;}else if(!clip.paused)return;
 clip.play().catch(()=>{});
}
function stopSound(name){const clip=clips[name];if(clip){clip.pause();clip.currentTime=0;}}
function pauseMusic(){clips.feira.pause()}
function resumeMusic(){if(sound&&mode==='play')playSound('feira')}
function build(){blocks=[];ledges=[];enemies=[];coins=[];shots=[];dust=[];holes=[];market=[];
for(let x=0;x<mapWidth;x+=240)market.push({x,kind:Math.floor(x/240)%4});
[[405,150,70],[655,137,80],[985,148,65],[1100,120,80],[2370,148,78],[2540,115,90],[3010,120,70],[3230,140,80]].forEach(([x,y,w])=>ledges.push({x,y,w,h:8}));
[[423,118,2],[1010,116,2],[2390,116,2],[3025,88,0],[3250,108,2]].forEach(([x,y,type])=>blocks.push({x,y,w:16,h:16,type,hp:type===2?1:2,alive:true}));
// Mundo 1-1: pequeno tutorial de cuspe e pulo antes e depois do primeiro inimigo.
// Primeiro inimigo começa em x=220. Os blocos ficam apoiados no chão (y=188).
// O primeiro pode ser destruído com cuspe; a pilha exige pulo duplo ou destruição.
blocks.push({x:186,y:172,w:16,h:16,type:2,hp:1,alive:true});
for(const y of [140,156,172])blocks.push({x:304,y,w:16,h:16,type:0,hp:2,alive:true});
// Escada no lugar da plataforma P805: colunas de 2, 3 e 4 tijolos.
for(const [x,count] of [[785,2],[817,3],[849,4]]){
 for(let n=0;n<count;n++)blocks.push({x,y:ground-16*(n+1),w:16,h:16,type:0,hp:2,alive:true});
}
// Trecho 2: duas barreiras duplas entre caramujo/sapo e sapo/lesma.
for(const x of [1760,1950])for(const y of [ground-16,ground-32])
 blocks.push({x,y,w:16,h:16,type:0,hp:2,alive:true});
// Trecho 3: buraco real no solo, com largura de 64 pixels.
holes.push({x:2850,w:64});
const kinds=['barata','joaninha','caramujo','sapo','lesma','besouro','caranguejo'];
[220,355,465,700,875,1040,1160,1370,1545,1680,1850,2070,2250,2440,2610,2870,3070,3300].forEach((x,i)=>{let kind=kinds[i%kinds.length],fly=kind==='joaninha';if(x===2870)return;enemies.push({x,y:fly?130:ground-16,w:19,h:16,baseY:fly?130:ground-16,kind,dir:i%2?1:-1,hp:kind==='besouro'?3:kind==='caranguejo'?2:1,phase:i*1.3,alive:true,hit:0})});
for(let x=100;x<3420;x+=63)coins.push({x,y:105+(Math.floor(x/63)%3)*14,got:false});
player.x=32;player.y=135;player.vx=0;player.vy=0;player.face=1;player.inv=0;player.cool=0;player.spitAnim=0;player.step=0;player.jumps=0;camera=0;tick=0;score=0;money=0;health=3;updateHud();}
function updateHud(){$('#score').textContent='PONTOS '+String(score).padStart(6,'0');$('#money').textContent='MOEDAS ×'+String(money).padStart(2,'0');$('#health').textContent='♥ '.repeat(health).trim()||'SEM VIDAS'}
function overlay(title,message,button='JOGAR'){$('#title').innerHTML=title;$('#message').textContent=message;$('#play').textContent=button;$('#overlay').style.display='grid'}
function start(){build();mode='play';$('#overlay').style.display='none';acc=0;last=performance.now();requestAnimationFrame(loop);playSound('feira')}
function togglePause(){if(mode==='play'){mode='pause';pauseMusic();overlay('PAUSADO','A feira está esperando a Aurora. Aperte ENTER para continuar.','CONTINUAR')}else if(mode==='pause'){mode='play';$('#overlay').style.display='none';last=performance.now();acc=0;requestAnimationFrame(loop);resumeMusic()}}
function end(win){stopSound('feira');mode=win?'win':'lost';overlay(win?'AURORA VENCEU!':'FIM DE JOGO',win?'A feira está livre dos bichinhos! Pontuação: '+score:'Tente outra vez! Pontuação: '+score,'JOGAR DE NOVO');if(win)playSound('vitoria');else sfx(180,.3)}
function damage(){if(player.inv>0||mode!=='play')return;health--;player.inv=80;player.vy=-4;player.vx=-player.face*2.3;playSound('dano');updateHud();if(health<=0)end(false)}
// A origem do cuspe acompanha a boca do sprite (não o centro do corpo).
function mouthPosition(){return {x:player.face>0?player.x+19:player.x-2,y:player.y+11}}
function spit(){
 if(player.cool>0||mode!=='play')return;
 player.cool=18;player.spitAnim=13;
 const mouth=mouthPosition(),dir=player.face;
 shots.push({x:mouth.x+(dir>0?0:-7),y:mouth.y-2,w:7,h:5,vx:dir*5.2,life:55,age:0,dir});
 spark(mouth.x,mouth.y,'#b5faff',5);
 playSound('cuspe');
}
function spark(x,y,color,n=7){for(let i=0;i<n;i++)dust.push({x,y,vx:(Math.random()-.5)*3.7,vy:(Math.random()-.8)*3,life:15+Math.random()*12,color})}
function groundExists(x){return !holes.some(h=>x>=h.x&&x<h.x+h.w)}
// Inimigos patrulham entre os obstáculos: os blocos vivos são sólidos para eles.
// A verificação usa a posição futura, evitando atravessar blocos em movimento.
function enemyBlocked(e,nextX,nextY){
 const next={x:nextX,y:nextY,w:e.w,h:e.h};
 return blocks.some(b=>b.alive&&rect(next,b));
}
function moveEnemy(e,speed,nextY){
 const nextX=e.x+e.dir*speed;
 // Inimigos terrestres retornam antes de alcançar o buraco.
 if(e.kind!=='joaninha'&&!groundExists(nextX+(e.dir>0?e.w+2:-2))){e.dir*=-1;return;}
 if(enemyBlocked(e,nextX,nextY)){
   // Encosta na face do bloco e inverte a patrulha.
   let limit=e.x;
   for(const b of blocks){
     if(!b.alive||nextY+e.h<=b.y||nextY>=b.y+b.h)continue;
     if(e.dir>0&&e.x+e.w<=b.x&&nextX+e.w>b.x)limit=Math.min(limit,b.x-e.w);
     if(e.dir<0&&e.x>=b.x+b.w&&nextX<b.x+b.w)limit=Math.max(limit,b.x+b.w);
   }
   e.x=limit;
   e.dir*=-1;
 }else e.x=nextX;
}

// Plataformas são unidirecionais; blocos quebráveis são sólidos em todas as faces.
function collidePlatforms(obj,axis,old){
 if(axis==='x')return;
 if(obj.vy<0)return;
 const before=old+obj.h,after=obj.y+obj.h;
 let best=Infinity;
 for(const p of ledges)if(obj.x+obj.w>p.x+2&&obj.x<p.x+p.w-2&&before<=p.y+3&&after>=p.y&&p.y<best)best=p.y;
 if(best<Infinity){obj.y=best-obj.h;obj.vy=0;obj.grounded=true;obj.jumps=0;}
}
function collideBlocksX(oldX){
 if(player.vx===0)return;
 for(const b of blocks){if(!b.alive||!rect(player,b))continue;
  if(player.vx>0&&oldX+player.w<=b.x+3)player.x=b.x-player.w;
  else if(player.vx<0&&oldX>=b.x+b.w-3)player.x=b.x+b.w;
  else player.x=oldX;
  player.vx=0;
 }
}
function collideBlocksY(oldY){
 for(const b of blocks){if(!b.alive||!rect(player,b))continue;
  if(player.vy>=0&&oldY+player.h<=b.y+4){player.y=b.y-player.h;player.vy=0;player.grounded=true;player.jumps=0;}
  else if(player.vy<0&&oldY>=b.y+b.h-4){player.y=b.y+b.h;player.vy=0;}
  else {player.y=oldY;player.vy=0;}
 }
}
function step(){tick++;let left=keys.ArrowLeft,right=keys.ArrowRight;
if(left){player.vx=Math.max(-2.25,player.vx-.42);player.face=-1}if(right){player.vx=Math.min(2.25,player.vx+.42);player.face=1}if(!left&&!right)player.vx*=.72;
if(Math.abs(player.vx)<.04)player.vx=0;
if(player.grounded)player.coyote=6;else player.coyote=Math.max(0,player.coyote-1);
if(keys.KeyZ&&!keys.jumpLock&&(player.jumps<2||player.coyote>0)){const second=player.jumps>=1;player.vy=second?-6.1:-6.7;player.grounded=false;player.coyote=0;player.jumps=Math.min(2,player.jumps+1);keys.jumpLock=true;spark(player.x+8,player.y+player.h,'#c3efff',second?10:4);playSound(second?'pulo_duplo':'pulo')}if(!keys.KeyZ)keys.jumpLock=false;
if(keys.KeyC)spit();player.cool=Math.max(0,player.cool-1);player.spitAnim=Math.max(0,player.spitAnim-1);
let oldX=player.x;player.x+=player.vx;collideBlocksX(oldX);player.x=Math.max(0,Math.min(mapWidth-player.w,player.x));
let oldY=player.y;player.vy=Math.min(6.5,player.vy+.32);player.y+=player.vy;player.grounded=false;collideBlocksY(oldY);collidePlatforms(player,'y',oldY);
if(player.vy>=0&&oldY+player.h<=ground&&player.y+player.h>=ground&&groundExists(player.x+player.w*.5)){player.y=ground-player.h;player.vy=0;player.grounded=true;player.jumps=0}
if(player.y>H+25){damage();if(mode==='play'){player.x=Math.max(25,player.x-100);player.y=90;player.vy=0}}
if(player.grounded&&Math.abs(player.vx)>.2)player.step+=Math.abs(player.vx)*.17;
if(player.inv>0)player.inv--;
for(const c of coins){if(!c.got&&rect(player,{x:c.x,y:c.y,w:9,h:11})){c.got=true;money++;score+=50;sfx(850,.05)}}
for(const e of enemies){if(!e.alive)continue;e.phase+=.06;if(e.hit>0)e.hit--;

const speed=e.kind==='lesma'?.18:e.kind==='besouro'?.6:.42;
const nextY=e.kind==='joaninha'?e.baseY+Math.sin(e.phase)*14:e.kind==='sapo'?e.baseY-Math.max(0,Math.sin(e.phase))*20:e.baseY;
// Primeiro testa a parede; só depois atualiza a posição do inimigo.
moveEnemy(e,speed,nextY);
// Inimigos voadores ou saltadores também não podem atravessar um bloco na vertical.
if(!enemyBlocked(e,e.x,nextY))e.y=nextY;
if(e.x<30){e.x=30;e.dir=1}else if(e.x>mapWidth-50){e.x=mapWidth-50;e.dir=-1;}
if(rect(player,e)){if(player.vy>1&&oldY+player.h<=e.y+7){e.hp=0;player.vy=-4.6;score+=100;}else damage()}
if(e.hp<=0){e.alive=false;spark(e.x+9,e.y+8,'#ff8aa2',10)}}
for(let i=shots.length-1;i>=0;i--){let p=shots[i];p.x+=p.vx;p.life--;p.age++;if(p.age%3===0)spark(p.x-p.dir*3,p.y+2,'#8bdfff',1);let hit=false;
for(const b of blocks){if(!b.alive||!rect(p,b))continue;b.hp--;hit=true;spark(p.x,p.y,'#aef7ff');if(b.hp<=0){b.alive=false;score+=75;spark(b.x+8,b.y+8,'#d88b4a',13);sfx(370,.08)}break}
if(!hit)for(const e of enemies){if(e.alive&&rect(p,e)){hit=true;e.hp--;e.hit=8;spark(p.x,p.y,'#b9faff');if(e.hp<=0){e.alive=false;score+=150;spark(e.x+8,e.y+8,'#ffb76b',12);}break}}
if(hit||p.life<=0||p.x<0||p.x>mapWidth)shots.splice(i,1)}
for(let i=dust.length-1;i>=0;i--){let d=dust[i];d.x+=d.vx;d.y+=d.vy;d.vy+=.14;if(--d.life<=0)dust.splice(i,1)}
camera=Math.max(0,Math.min(mapWidth-W,player.x-110));if(player.x>finish){score+=1000;end(true)}updateHud();}
function sky(){
 if(marketBackground.complete&&marketBackground.naturalWidth){
   const srcW=1120,srcH=550;
   const maxX=Math.max(0,marketBackground.naturalWidth-srcW);
   const sx=Math.max(0,Math.min(maxX,camera*.26));
   g.drawImage(marketBackground,sx,0,srcW,srcH,0,0,W,ground);
 }else{
   r(0,0,W,ground,'#61b8ed');
 }
}
function awning(x,y,w,col){r(x+5,y+13,3,72,'#654b52');r(x+w-9,y+13,3,72,'#654b52');r(x,y+10,w,7,'#4a3956');r(x+4,y,w-8,13,col);r(x+14,y-6,w-28,7,col);for(let a=x+4;a<x+w-4;a+=14){r(a,y+13,13,5,col);r(a+9,y+3,3,10,'#ffffff35')}r(x+3,y+18,w-6,2,'#342941')}
function produce(x,y,type){const palette=[['#ff6e38','#fbb438','#7ac347'],['#e32d49','#eeb32b','#47ba69'],['#7ed54d','#e4d549','#e89a41'],['#d2a26d','#d7be7c','#f3c454']][type%4];for(let i=0;i<18;i++){let px=x+(i%9)*6,py=y+Math.floor(i/9)*6;r(px,py,6,6,palette[(i+Math.floor(i/3))%3]);r(px+1,py,2,2,'#fff5a055')}}
function marketBg(){g.save();g.translate(-Math.floor(camera*.63),0);for(let i=0;i<20;i++){let x=i*174-35;awning(x,90+(i%3)*8,150,['#e75063','#258fc5','#3fa789','#f3bf45'][i%4]);r(x+6,139,138,7,'#9a5d3d');r(x+8,147,133,5,'#59374b');produce(x+12,121,i);for(let k=0;k<5;k++){r(x+8+k*27,152,24,16,['#236c9b','#c74548','#3a9d67','#d7a72e'][k%4]);r(x+10+k*27,155,20,3,'#ffffff40')}if(i%2===0){for(let b=0;b<5;b++){r(x+63+b*10,106,8,11,'#e2ae61');r(x+65+b*10,108,4,5,'#ffe0a4')}}}g.restore()}
function pitVisual(){
 for(const h of holes){
  // Cover the background art: the pit must read as empty space, not painted ground.
  r(h.x,ground-2,h.w,H-ground+2,'#080b1b');
  r(h.x+3,ground+5,h.w-6,H-ground-7,'#11152a');
  for(let i=0;i<5;i++){let xx=h.x+7+i*12;r(xx,ground+10+(i%2)*5,5,2,'#27334c')}
  // Bright, sharply outlined rims on both sides.
  for(const edge of [h.x-7,h.x+h.w]){
   r(edge-2,ground-9,10,12,'#151324');r(edge,ground-7,6,8,'#ffdc43');
   r(edge,ground-7,6,2,'#fff3a3');
  }
  // Striped danger markers before the jump and after the landing.
  for(let side of [-1,1]){
   const bx=side<0?h.x-33:h.x+h.w+9;
   r(bx,ground-14,22,12,'#17162d');r(bx+2,ground-12,18,8,'#f8c83b');
   for(let i=0;i<3;i++)r(bx+3+i*6,ground-12,3,8,'#4d2b35');
  }
  // Downward warning arrow above the opening.
  const mid=h.x+h.w/2;
  r(mid-1,ground-37,3,13,'#fff1a0');
  r(mid-7,ground-27,15,3,'#fff1a0');
  r(mid-4,ground-24,9,3,'#fff1a0');
  r(mid-1,ground-21,3,3,'#fff1a0');
 }
}
function terrain(){for(let x=Math.floor(camera/16)*16;x<camera+W+16;x+=16){if(!groundExists(x+8))continue;r(x,ground,16,H-ground,'#8d553a');r(x,ground,16,4,'#c4c1ac');r(x,ground+4,16,3,'#5d535d');r(x+2,ground+10,5,4,'#ae7048');r(x+10,ground+19,4,4,'#663e41');r(x+5,ground+24,4,3,'#c08b57')}

for(const p of ledges){
 // Plataformas destacadas sobre o cenário da feira: contorno escuro, topo dourado e base violeta.
 r(p.x-2,p.y-2,p.w+4,p.h+5,'#1c1737');
 r(p.x,p.y,p.w,p.h,'#6546a0');
 r(p.x,p.y,p.w,3,'#ffde6b');
 r(p.x,p.y+3,p.w,2,'#eaa64b');
 r(p.x,p.y+p.h-2,p.w,2,'#302450');
 for(let i=0;i<p.w;i+=16){
   r(p.x+i+1,p.y+5,2,2,'#b7a2fa');
   r(p.x+i+8,p.y+5,5,1,'#9172d5');
   if(i+16<p.w)r(p.x+i+15,p.y+3,1,p.h-3,'#302450');
 }
}
// Blocos interativos: moldura escura grossa, alto contraste e desenho exclusivo.
// Apenas renderização; hitboxes, vida e lógica de destruição permanecem iguais.
for(const b of blocks){
 if(!b.alive)continue;
 const x=b.x,y=b.y;
 // Sombra lateral dá profundidade e separa os blocos das barracas ao fundo.
 r(x+2,y+3,15,15,'#10152d');
 r(x-1,y-1,17,17,'#11152d');
 if(b.type===2){ // bloco rachado amarelo
   r(x+1,y+1,14,14,'#ad761e');r(x+2,y+2,12,11,'#f6c33d');
   r(x+2,y+2,12,2,'#fff1a0');r(x+2,y+12,12,2,'#b27b23');
   r(x+7,y+3,2,4,'#7c531d');r(x+5,y+7,4,2,'#7c531d');
   r(x+9,y+9,2,4,'#7c531d');r(x+4,y+9,2,3,'#fff0a1');
 }else{ // tijolos marrons
   r(x+1,y+1,14,14,'#713a28');r(x+2,y+2,12,11,'#b96b42');
   r(x+2,y+2,12,2,'#edac6d');r(x+2,y+12,12,2,'#653525');
   r(x+2,y+7,12,2,'#633a2c');r(x+7,y+3,2,4,'#633a2c');
   r(x+4,y+9,2,3,'#633a2c');r(x+11,y+9,2,3,'#633a2c');
 }
 // Rebites pixelados comuns a todos os tipos.
 r(x+2,y+2,1,1,'#ffffff');r(x+13,y+13,1,1,'#15213d');
}
for(let i=0;i<market.length;i++){let m=market[i];if(m.x<camera-40||m.x>camera+W+40)continue;r(m.x+15,ground-19,31,19,['#268aaf','#d9a02d','#c3424d','#32966a'][m.kind]);r(m.x+17,ground-16,27,3,'#ffffff55');r(m.x+17,ground-5,27,3,'#23364e');if(i%3===0){r(m.x+55,ground-23,20,23,'#986442');r(m.x+57,ground-20,16,2,'#dca76c');r(m.x+59,ground-12,4,5,'#5a3446')}}
}
function enemyDraw(e){if(e.hit>0&&tick%4<2)return;const animation=(e.kind==='sapo'?Math.floor(e.phase*1.6):Math.floor(tick/9));const frame=typeof NEW_ENEMIES!=='undefined'&&NEW_ENEMIES[e.kind]?animation%NEW_ENEMIES[e.kind]:animation;if(sprite(g,e.kind,frame,e.x-8,e.y-19,36,36,e.dir<0))return;let x=Math.round(e.x),y=Math.round(e.y),k=e.kind;const eye=()=>{r(x+12,y+4,4,5,'#fff');r(x+14,y+6,2,3,'#22283f')};
if(k==='barata'){r(x+2,y+5,14,9,'#773f29');r(x+5,y+4,10,7,'#bc6935');r(x+4,y+13,3,3,'#3d2d38');r(x+12,y+13,3,3,'#3d2d38');r(x+8,y+1,1,5,'#432739');r(x+13,y,1,5,'#432739');eye()}
if(k==='joaninha'){r(x+3,y+5,13,9,'#d92937');r(x+8,y+5,2,9,'#35283b');r(x+5,y+7,3,3,'#2c243a');r(x+12,y+9,3,3,'#2c243a');r(x+1,y+9,4,5,'#292d4a');eye();if(tick%10<5){r(x+3,y+1,6,4,'#a9edff');r(x+9,y+2,6,3,'#a9edff')}}
if(k==='caramujo'){r(x+1,y+10,17,5,'#e3a64b');r(x+2,y+2,12,12,'#8d44ba');r(x+4,y+4,8,8,'#c779ed');r(x+6,y+6,4,4,'#6d3294');r(x+15,y+5,2,7,'#e3a64b');r(x+16,y+3,3,3,'#fff');r(x+17,y+4,1,1,'#34213e')}
if(k==='sapo'){r(x+1,y+7,17,8,'#37a54b');r(x+4,y+3,12,9,'#67d75e');r(x+4,y+1,5,5,'#fff');r(x+12,y+1,5,5,'#fff');r(x+6,y+3,2,2,'#263749');r(x+14,y+3,2,2,'#263749');r(x,y+13,6,3,'#258a46');r(x+13,y+13,6,3,'#258a46')}
if(k==='lesma'){r(x+1,y+11,17,5,'#eab184');r(x+4,y+7,12,6,'#cf3ca7');r(x+12,y+3,4,8,'#e9a67c');r(x+12,y,2,4,'#e9a67c');r(x+16,y,2,4,'#e9a67c');r(x+12,y,3,3,'#fff');r(x+16,y,3,3,'#fff');r(x+13,y+1,1,2,'#3d2d45');r(x+17,y+1,1,2,'#3d2d45')}
if(k==='besouro'){r(x+2,y+5,15,10,'#1b4d9a');r(x+4,y+3,11,8,'#357ed0');r(x+3,y+12,3,4,'#e4b052');r(x+13,y+12,3,4,'#e4b052');r(x+9,y+7,9,6,'#f3d25d');r(x+10,y+8,7,4,'#20273e');r(x+11,y+9,2,2,'#e2faff');r(x+15,y+9,2,2,'#e2faff')}
if(k==='caranguejo'){r(x+3,y+7,13,7,'#e8494e');r(x+5,y+4,10,7,'#ff7860');r(x,y+3,5,6,'#dc3948');r(x+15,y+3,5,6,'#dc3948');r(x+6,y+1,4,5,'#fff');r(x+12,y+1,4,5,'#fff');r(x+8,y+3,2,2,'#2c2643');r(x+14,y+3,2,2,'#2c2643');r(x+4,y+14,3,2,'#ba3845');r(x+12,y+14,3,2,'#ba3845')}
}
function aurora(){if(player.inv>0&&tick%6<3)return;const moving=player.grounded&&Math.abs(player.vx)>.25;const action=player.inv>0?'hurt':player.spitAnim>0?'spit':!player.grounded?'jump':moving?(Math.abs(player.vx)>1.8?'run':'walk'):'idle';const animFrame=action==='jump'?(player.vy<0?2:4):action==='spit'?Math.min(4,Math.floor((13-player.spitAnim)/2.6)):Math.floor(action==='idle'?tick/18:player.step*1.7);if(sprite(g,'aurora_'+action,animFrame,player.x-9,player.y-16,36,48,player.face<0))return;let x=Math.round(player.x),y=Math.round(player.y),walk=player.grounded&&Math.abs(player.vx)>.25,leg=walk?Math.round(Math.sin(player.step)*3):0;
g.save();g.translate(x+9,y+14);g.scale(player.face,1);g.translate(-9,-14);
r(1,1,15,14,'#2f2036');r(0,5,5,7,'#302137');r(4,0,10,4,'#302137');
r(4+leg,22,5,5,colors.skin);r(10-leg,22,5,5,colors.skin);r(3+leg,26,7,3,'#64b7ff');r(10-leg,26,7,3,'#64b7ff');
r(2,13,14,10,colors.dress);r(0,19,18,5,colors.shade);r(2,19,14,3,colors.dress);r(6,13,6,3,'#d3f3ff');r(5,18,2,2,'#e2faff');r(12,19,2,2,'#e2faff');
r(0,14,3,7,colors.skin);r(15,14,3,7,colors.skin);r(2,4,14,11,colors.skin);r(1,7,17,6,colors.skinLight);r(3,3,12,4,colors.hair);r(2,4,4,5,colors.hair);
r(10,7,4,5,'#fff');r(12,8,2,3,'#242038');r(13,11,4,2,'#e78b8f');r(16,11,3,4,'#52243d');r(17,13,2,1,'#ff82a7');
r(3,2,13,2,'#f4faff');r(9,0,4,4,colors.bow);r(13,0,4,4,colors.bow);r(12,1,2,2,'#fff');g.restore()}
function render(){sky();g.save();g.translate(-Math.floor(camera),0);terrain();pitVisual();for(const c of coins){if(c.got)continue;let bob=Math.round(Math.sin(tick*.12+c.x)*2);let cw=[9,7,4,7][Math.floor((tick+c.x)/9)%4],cx=c.x+Math.floor((9-cw)/2);r(cx,c.y+bob,cw,12,'#b76b18');r(cx+1,c.y+bob+1,Math.max(1,cw-2),10,'#ffd232');if(cw>=7){r(cx+3,c.y+bob+2,3,7,'#fff19b');r(cx+2,c.y+bob+3,1,5,'#e49a21')}else r(cx+1,c.y+bob+2,2,7,'#fff2a0')}
for(const e of enemies)if(e.alive)enemyDraw(e);for(const p of shots){
 // Gota animada em três quadros, com reflexo e pequenas partículas.
 const pulse=Math.floor(p.age/3)%3;
 r(p.x-p.dir*3,p.y+2,3,2,'#4ab8ee');
 r(p.x,p.y+(pulse===1?-1:0),8,6,'#267cbd');
 r(p.x+1,p.y+(pulse===1?-1:0),6,4,'#82eaff');
 r(p.x+2,p.y+(pulse===1?-1:0),3,2,'#f4ffff');
 if(pulse===2)r(p.x-p.dir*5,p.y+3,2,2,'#a2e8ff');
 }
aurora();
 // Brilho na boca durante o ataque, sempre espelhado com a personagem.
 if(player.spitAnim>7){const m=mouthPosition();
 r(m.x+(player.face>0?0:-3),m.y-3,3,3,'#e9ffff');
 r(m.x+(player.face>0?2:-5),m.y-1,3,2,'#7de7ff');
 }
 for(const d of dust)r(d.x,d.y,3,3,d.color);
r(finish,ground-52,3,52,'#f7e4a1');r(finish+3,ground-50,26,15,'#ee5798');r(finish+6,ground-47,17,4,'#ffb4d8');g.restore();
// pixel HUD with backing strip
r(0,0,W,19,'#172a60');r(0,18,W,2,'#e6bc4d');text('AURORA',6,4,'#fff',9);text('♥'.repeat(health),71,4,'#ff698a',10);text('◉ '+String(money).padStart(2,'0'),126,4,'#ffe470',9);text(String(score).padStart(6,'0'),188,4,'#fff',9);text('FEIRA 1-1',290,4,'#e5f7ff',9)}
function loop(now){if(mode!=='play')return;acc+=Math.min(50,now-last||16.67);last=now;let n=0;while(acc>=1000/60&&n++<4&&mode==='play'){step();acc-=1000/60}render();if(mode==='play')requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Space','ArrowUp','KeyZ','KeyC','Enter'].includes(e.code))e.preventDefault();if(e.code==='Enter'){if(!e.repeat){if(mode==='play'||mode==='pause')togglePause();else start()}return}if(e.code==='KeyR'&&(mode==='lost'||mode==='win')){start();return}keys[e.code]=true});window.addEventListener('keyup',e=>{keys[e.code]=false});window.addEventListener('blur',()=>{keys.ArrowLeft=keys.ArrowRight=keys.KeyC=keys.KeyZ=false;if(mode==='play')togglePause()});
$('#play').addEventListener('click',()=>{if(mode==='pause')togglePause();else start()});$('#pause').addEventListener('click',()=>{if(mode==='play'||mode==='pause')togglePause()});$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').textContent=sound?'♫ SOM ON':'♫ SOM OFF';if(sound){resumeMusic();sfx(700,.06)}else pauseMusic()});
for(const b of document.querySelectorAll('[data-k]')){const code=b.dataset.k;b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys[code]=true});for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{e.preventDefault();keys[code]=false})}
build();render();})();
