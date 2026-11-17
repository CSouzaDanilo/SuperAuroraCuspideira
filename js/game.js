
(()=>{'use strict';
const canvas=document.querySelector('#game'),g=canvas.getContext('2d'),W=384,H=216,T=16,$=s=>document.querySelector(s);g.imageSmoothingEnabled=false;
const CFG=window.AURORA_CONFIG||{};
const keys={};let mapWidth=3552,ground=188;let mode='intro',camera=0,score=0,money=0,health=CFG.player.initialHearts,tick=0,last=0,acc=0,sound=true,audio=null,finish=3470,superUnlocked=false,chargeTicks=0,chargeReady=false,chargeHeld=false,chargeMax=CFG.superSpit.chargeMaxFrames,chargeThreshold=CFG.superSpit.chargeFrames,spitKeyWasDown=false,stageReadyAt=0,level=1,levelRewarded=false,pacifier=null,shoe=null,cube=null,magicInvincible=false,doubleJumpUnlocked=false,boss=null,bosses=[],itemLists={pacifier:[],shoe:[],cube:[]};
const player={x:32,y:140,w:17,h:29,vx:0,vy:0,grounded:false,face:1,step:0,cool:0,spitAnim:0,inv:0,coyote:0,jumps:0};
let blocks=[],ledges=[],enemies=[],coins=[],shots=[],dust=[],holes=[],market=[],spikes=[],springs=[];
const itemImages={pacifier:new Image(),shoe:new Image()};
itemImages.pacifier.src='assets/sprites/itens/super_chupeta.png';
itemImages.shoe.src='assets/sprites/itens/sapatinho_rosa.png';
const marketBackground=new Image();marketBackground.src='assets/backgrounds/feira-de-rua.png';
const colors={skin:'#cb865e',skinLight:'#e8a477',hair:'#332138',dress:'#b69af5',shade:'#7456bc',bow:'#64d6ff'};
function r(x,y,w,h,color){g.fillStyle=color;g.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(s,x,y,color='#fff8e1',size=9){g.font=`bold ${size}px monospace`;g.textBaseline='top';g.fillStyle='#18204d';g.fillText(s,x+1,y+1);g.fillStyle=color;g.fillText(s,x,y)}
function rand(n){return (Math.sin(n*92.71)*43758.5453)%1}
function rect(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function noise(x){return Math.abs(Math.sin(x*3.81)*124.83)%1}
function sfx(f=440,d=.08,type='square',vol=.025){if(!sound||CFG.audio.muted||CFG.audio.effectsVolume===0)return;vol*=CFG.audio.effectsVolume/70;try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();let o=audio.createOscillator(),a=audio.createGain();o.type=type;o.frequency.setValueAtTime(f,audio.currentTime);a.gain.setValueAtTime(vol,audio.currentTime);a.gain.exponentialRampToValueAtTime(.001,audio.currentTime+d);o.connect(a);a.connect(audio.destination);o.start();o.stop(audio.currentTime+d)}catch(e){}}
// Sons fornecidos pelo jogador. A trilha inicia após a primeira interação.
const audioFiles={cuspe:'cuspe',dano:'dano',feira:'feira',vitoria:'vitoria',pulo:'pulo',pulo_duplo:'pulo_duplo'};
const clips={};
for(const [key,file] of Object.entries(audioFiles)){
 const clip=new Audio('assets/audio/'+file+(key==='feira'?'.mp3':'.wav'));clip.preload='auto';clip.load();clip.volume=(key==='feira'?CFG.audio.musicVolume:CFG.audio.effectsVolume)/100;clip.loop=key==='feira';clips[key]=clip;
}
function playSound(name){if(!sound||CFG.audio.muted)return;const clip=clips[name];if(!clip)return;
 if(name==='feira'){if(!clip.paused)return;clip.play().catch(()=>{});return;}
 // Arquivo WAV sem silêncio inicial: reinicia no instante do evento.
 try{clip.pause();clip.currentTime=0;const playing=clip.play();if(playing)playing.catch(()=>{});}catch(e){}
}
function stopSound(name){const clip=clips[name];if(clip){clip.pause();clip.currentTime=0;}}
function pauseMusic(){clips.feira.pause()}
function resumeMusic(){if(sound&&mode==='play')playSound('feira')}
function build(preserve=false){
 if(!preserve){level=1;superUnlocked=false;doubleJumpUnlocked=false;}
 const data=window.AURORA_LEVELS.load(level,{draftFirst:!!new URLSearchParams(location.search).get('testLevel')});
 blocks=data.blocks;ledges=data.platforms;enemies=data.enemies;for(const e of enemies){const ec=CFG['enemy_'+e.kind];if(ec){e.hp=ec.health;e.maxHp=ec.health;}}coins=data.coins;
 holes=data.holes;spikes=data.spikes||[];springs=data.springs||[];market=[];shots=[];dust=[];
 mapWidth=data.width;ground=data.ground;finish=data.finish;
 itemLists={pacifier:!superUnlocked?[...(data.itemLists?.pacifier||[])]:[],shoe:!doubleJumpUnlocked?[...(data.itemLists?.shoe||[])]:[],cube:[...(data.itemLists?.cube||[])]};
 pacifier=itemLists.pacifier[0]||null;shoe=itemLists.shoe[0]||null;cube=itemLists.cube[0]||null;magicInvincible=false;
 bosses=(data.bosses|| (data.boss?[data.boss]:[])).map(b=>{const bc=CFG['boss_'+(b.kind==='cobra_mola'?'cobra_mola':'sapo_rei')];return {...b,hp:bc.health,maxHp:bc.health,dir:-1,hit:0,alive:true,phase:0,vy:0,grounded:false,jumpWait:35};});boss=bosses[0]||null;
 if(!preserve){health=CFG.player.initialHearts;score=0;}
 levelRewarded=false;chargeTicks=0;chargeReady=false;chargeHeld=false;spitKeyWasDown=false;keys.KeyC=false;
 player.x=data.start.x;player.y=data.start.y;player.vx=0;player.vy=0;player.face=1;player.inv=0;
 player.cool=0;player.spitAnim=0;player.step=0;player.jumps=0;
 camera=0;tick=0;money=0;updateHud();
}
function updateHud(){$('#score').textContent='PONTOS '+String(score).padStart(6,'0');$('#money').textContent='MOEDAS ×'+String(money).padStart(2,'0');$('#health').textContent=magicInvincible?'✦ INVENCÍVEL ✦ '+('♥ '.repeat(health).trim()):('♥ '.repeat(health).trim()||'SEM VIDAS')}
function overlay(title,message,button='JOGAR'){$('#title').innerHTML=title;$('#message').textContent=message;$('#play').textContent=button;$('#overlay').style.display='grid'}
const front=$('#front');let menuIndex=0,frontScreen='splash',transitioning=false,frontWaitRelease=false;
function showFront(screen){frontScreen=screen;for(const el of front.querySelectorAll('.screen'))el.classList.toggle('active',el.id===screen)}
function showMenu(){stopCredits();stopSound('feira');mode='menu';front.classList.remove('is-hidden');$('#overlay').style.display='none';showFront('mainMenu');updateMenuSelection()}
function updateMenuSelection(){document.querySelectorAll('.menu-option').forEach((el,i)=>el.classList.toggle('selected',i===menuIndex))}
function goFromSplash(){if(transitioning)return;transitioning=true;mode='menu';showFront('mainMenu');updateMenuSelection();setTimeout(()=>{transitioning=false},420)}
function menuChoose(){if(transitioning)return;if(frontScreen==='mainMenu'){if(menuIndex===0)start();else showFront(menuIndex===1?'howTo':'credits')}else if(frontScreen==='howTo'||frontScreen==='credits')showFront('mainMenu')}
function start(){stopCredits();front.classList.add('is-hidden');build(false);mode='play';$('#overlay').style.display='none';acc=0;last=performance.now();requestAnimationFrame(loop);playSound('feira')}
function unlockSuper(){if(superUnlocked)return;superUnlocked=true;itemLists.pacifier=[];pacifier=null;mode='power';pauseMusic();overlay('★ CHUPETA DO SUPER CUSPE! ★','NOVO PODER! Segure C para CARREGAR e SOLTE para disparar. O Super Cuspe pode derrotar ate 2 inimigos no mesmo disparo e destroi ate 4 blocos. Toque C rapidamente para cuspir normalmente.','APERTE C');$('#sub').textContent='APERTE C PARA CONTINUAR';}
function unlockDoubleJump(){
 if(doubleJumpUnlocked||level!==2)return;
 doubleJumpUnlocked=true;itemLists.shoe=[];shoe=null;mode='power';pauseMusic();
 overlay('★ SAPATINHO ROSA! ★','PULO DUPLO DESBLOQUEADO! Aperte Z ou ↑ para pular e aperte novamente enquanto estiver no ar para dar o segundo salto.','APERTE Z');
 $('#sub').textContent='APERTE Z OU ↑ PARA CONTINUAR';
}
function unlockMagicCube(){
 if(magicInvincible)return;
 magicInvincible=true;itemLists.cube=[];cube=null;updateHud();
 spark(player.x+8,player.y+12,'#e6b4ff',32);
 sfx(880,.24,'triangle',.055);
}
function defeatOnContact(enemy){
 enemy.alive=false;enemy.hp=0;score+=CFG.rewards.enemyPoints;
 spark(enemy.x+enemy.w/2,enemy.y+enemy.h/2,'#dca5ff',20);
 sfx(650,.09,'triangle',.035);
}
function awardCoins(){if(levelRewarded)return;levelRewarded=true;health+=CFG.rewards.allCoinsHearts;score+=CFG.rewards.allCoinsPoints;updateHud();spark(player.x+9,player.y,'#ffe96a',20);sfx(990,.24,'triangle',.04);}
function nextLevel(){if(level>=window.AURORA_LEVELS.MAX_LEVEL){finalVictory();return;}level++;build(true);mode='stage';pauseMusic();playSound('vitoria');stageReadyAt=performance.now()+CFG.transitions.victoryDelayMs;
 overlay('FASE CONCLUÍDA!','','');
 $('#overlay').classList.add('stage-complete');
 setTimeout(()=>{if(mode==='stage')resumeStage(true)},CFG.transitions.victoryDelayMs);}
function resumeStage(fromTimer=false){if(mode!=='stage'||(!fromTimer&&performance.now()<stageReadyAt))return;mode='play';$('#overlay').classList.remove('stage-complete');$('#overlay').style.display='none';last=performance.now();acc=0;requestAnimationFrame(loop);resumeMusic()}
function resumePower(){if(mode!=='power')return;mode='play';keys.KeyC=false;keys.KeyZ=false;keys.ArrowUp=false;chargeHeld=false;chargeTicks=0;spitKeyWasDown=false;$('#overlay').style.display='none';last=performance.now();acc=0;requestAnimationFrame(loop);resumeMusic()}
function togglePause(){if(mode==='play'){mode='pause';pauseMusic();overlay('PAUSADO','A feira está esperando a Aurora. Aperte ENTER para continuar.','CONTINUAR')}else if(mode==='pause'){mode='play';$('#overlay').style.display='none';last=performance.now();acc=0;requestAnimationFrame(loop);resumeMusic()}}
const creditsPanel=$('#finalCredits'),creditsScroll=$('#creditsScroll');
// Trilha reservada: coloque o arquivo em assets/audio/creditos.mp3.
const creditsMusic=new Audio('assets/audio/creditos.mp3');
creditsMusic.preload='none';creditsMusic.loop=true;
creditsMusic.volume=CFG.audio.muted?0:CFG.audio.musicVolume/100;
let creditsReturnTimer=null;
let creditsAccelerating=false;
function cancelCreditsReturn(){
 if(creditsReturnTimer!==null){clearTimeout(creditsReturnTimer);creditsReturnTimer=null;}
}
function stopCredits(){
 cancelCreditsReturn();creditsAccelerating=false;
 creditsPanel.hidden=true;creditsScroll.style.animation='none';
 creditsMusic.pause();creditsMusic.currentTime=0;
}
function playCreditsMusic(){
 if(!sound||CFG.audio.muted)return;
 creditsMusic.volume=CFG.audio.musicVolume/100;
 creditsMusic.play().catch(()=>{/* O arquivo de música pode ser incluído depois. */});
}
function setCreditsAcceleration(active){
 if(mode!=='finalCredits'||creditsAccelerating===active)return;
 creditsAccelerating=active;
 // Segurar Z dobra a velocidade novamente, preservando a posição atual.
 for(const animation of creditsScroll.getAnimations()){
  if(animation.animationName==='auroraCreditsRoll')animation.playbackRate=active?2:1;
 }
}
function showSplashAfterCredits(){
 stopCredits();stopSound('feira');stopSound('vitoria');
 mode='intro';transitioning=false;frontWaitRelease=false;menuIndex=0;
 front.classList.remove('is-hidden');showFront('splash');
 $('#overlay').style.display='none';
}
function showFinalCredits(){
 cancelCreditsReturn();
 mode='finalCredits';stopSound('feira');stopSound('vitoria');
 $('#overlay').classList.remove('stage-complete');$('#overlay').style.display='none';
 front.classList.add('is-hidden');creditsPanel.hidden=false;
 const content=$('#creditsContent');content.textContent=window.AURORA_CREDITS.load();
 const lines=content.textContent.split('\n').length;
 // V28.1: duração reduzida pela metade em relação à V28.
 creditsScroll.style.setProperty('--credits-duration',Math.max(75,lines*1.75)/2/CFG.credits.speedMultiplier+'s');
 creditsScroll.style.animation='none';void creditsScroll.offsetHeight;
 creditsScroll.style.animation='';
 creditsAccelerating=false;
 playCreditsMusic();
}
creditsScroll.addEventListener('animationend',e=>{
 if(e.animationName!=='auroraCreditsRoll'||mode!=='finalCredits')return;
 cancelCreditsReturn();
 creditsReturnTimer=setTimeout(()=>{
  creditsReturnTimer=null;
  if(mode==='finalCredits')showSplashAfterCredits();
 },3000);
});
function finalVictory(){
 mode='stage';pauseMusic();playSound('vitoria');stageReadyAt=performance.now()+CFG.transitions.victoryDelayMs;
 overlay('FASE CONCLUÍDA!','','');$('#overlay').classList.add('stage-complete');
 setTimeout(()=>{if(mode==='stage')showFinalCredits()},CFG.transitions.victoryDelayMs);
}
function end(win){stopSound('feira');mode=win?'win':'lost';overlay(win?'AURORA VENCEU!':'FIM DE JOGO',win?'A feira está livre dos bichinhos! Pontuação: '+score:'Tente outra vez! Pontuação: '+score,'APERTE Z');if(win)playSound('vitoria');else sfx(180,.3)}
function damage(){if(magicInvincible||player.inv>0||mode!=='play')return;health--;player.inv=CFG.player.invulnerabilityFrames;player.vy=-4;player.vx=-player.face*2.3;playSound('dano');updateHud();if(health<=0)end(false)}
// A origem do cuspe acompanha a boca do sprite (não o centro do corpo).
function mouthPosition(){return {x:player.face>0?player.x+19:player.x-2,y:player.y+11}}
function spit(power=false){
 if(player.cool>0||mode!=='play')return;
 player.cool=power?CFG.superSpit.cooldownFrames:CFG.normalSpit.cooldownFrames;player.spitAnim=13;
 const mouth=mouthPosition(),dir=player.face;
 shots.push({x:mouth.x+(dir>0?0:(power?-13:-7)),y:mouth.y-(power?5:2),w:power?15:7,h:power?15:5,vx:dir*(power?7.2:5.2),life:55,age:0,dir,power,blocksLeft:power?CFG.superSpit.maxBlocks:CFG.normalSpit.maxBlocks,enemiesLeft:power?CFG.superSpit.maxEnemies:CFG.normalSpit.maxEnemies});
 spark(mouth.x,mouth.y,power?'#73dbff':'#b5faff',power?16:5);
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
// Teste preditivo para que os inimigos não se atravessem.
function enemyAhead(e,nextX,nextY){
 const probe={x:nextX,y:nextY,w:e.w,h:e.h};
 return enemies.find(other=>other!==e&&other.alive&&rect(probe,other)) ||
 (bosses.find(b=>b.alive&&rect(probe,b))||null);
}
function moveEnemy(e,speed,nextY){
 const nextX=e.x+e.dir*speed;
 // Inimigos terrestres retornam antes de alcançar o buraco.
 if(e.kind!=='joaninha'&&!groundExists(nextX+(e.dir>0?e.w+2:-2))){e.dir*=-1;return;}
 const neighbor=enemyAhead(e,nextX,nextY);
 if(neighbor){
   if(e.dir>0)e.x=Math.min(e.x,neighbor.x-e.w);
   else e.x=Math.max(e.x,neighbor.x+neighbor.w);
   e.dir*=-1;
   return;
 }
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
function updateMovingPlatforms(){
 for(const p of ledges){
  if(!p.kind||p.kind==='static')continue;
  const beforeX=p.x,beforeY=p.y;
  const origin=p.kind==='horizontal'?(p.originX??p.x):(p.originY??p.y);
  const value=p.kind==='horizontal'?p.x:p.y;
  let direction=p.dir||1,after=value+direction*(p.speed||0.8);
  if(after>origin+(p.range||96)){after=origin+(p.range||96);direction=-1}
  if(after<origin){after=origin;direction=1}
  p.dir=direction;
  if(p.kind==='horizontal')p.x=after;else p.y=after;
  const dx=p.x-beforeX,dy=p.y-beforeY;
  // Transporta Aurora quando ela esta apoiada na plataforma.
  if(player.vy>=0&&Math.abs(player.y+player.h-beforeY)<3&&player.x+player.w>beforeX+2&&player.x<beforeX+p.w-2){
   player.x+=dx;player.y+=dy;
  }
 }
}
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
  else if(player.vy<0&&oldY>=b.y+b.h-4){player.y=b.y+b.h;player.vy=0;if(b.type!==3){b.alive=false;score+=CFG.rewards.blockPoints;spark(b.x+8,b.y+8,'#d88b4a',13);sfx(370,.08);}}
  else {player.y=oldY;player.vy=0;}
 }
}
function step(){tick++;let left=keys.ArrowLeft,right=keys.ArrowRight;
if(left){player.vx=Math.max(-CFG.player.maxSpeed,player.vx-CFG.player.acceleration);player.face=-1}if(right){player.vx=Math.min(CFG.player.maxSpeed,player.vx+CFG.player.acceleration);player.face=1}if(!left&&!right)player.vx*=CFG.player.friction;

if(Math.abs(player.vx)<.04)player.vx=0;
if(player.grounded)player.coyote=CFG.player.coyoteFrames;else player.coyote=Math.max(0,player.coyote-1);
if((keys.KeyZ||keys.ArrowUp)&&!keys.jumpLock&&(player.jumps<(doubleJumpUnlocked?2:1)||player.coyote>0)){const second=player.jumps>=1;player.vy=second?-CFG.player.doubleJumpForce:-CFG.player.jumpForce;player.grounded=false;player.coyote=0;player.jumps=Math.min(2,player.jumps+1);keys.jumpLock=true;spark(player.x+8,player.y+player.h,'#c3efff',second?10:4);playSound(second?'pulo_duplo':'pulo')}if(!keys.KeyZ&&!keys.ArrowUp)keys.jumpLock=false;
if(superUnlocked){
 if(keys.KeyC){
  if(!spitKeyWasDown){chargeHeld=true;chargeTicks=0;}
  if(chargeHeld){chargeTicks=Math.min(chargeMax,chargeTicks+1);if(chargeTicks===chargeThreshold)spark(player.x+9,player.y+7,'#7be9ff',12);}
 }else if(spitKeyWasDown&&chargeHeld){
  const power=chargeTicks>=chargeThreshold;
  chargeHeld=false;chargeTicks=0;spit(power);
 }
}else if(keys.KeyC&&!spitKeyWasDown)spit();
spitKeyWasDown=!!keys.KeyC;player.cool=Math.max(0,player.cool-1);player.spitAnim=Math.max(0,player.spitAnim-1);
updateMovingPlatforms();
let oldX=player.x;player.x+=player.vx;collideBlocksX(oldX);player.x=Math.max(0,Math.min(mapWidth-player.w,player.x));
let oldY=player.y;player.vy=Math.min(CFG.player.maxFallSpeed,player.vy+CFG.player.gravity);player.y+=player.vy;player.grounded=false;collideBlocksY(oldY);collidePlatforms(player,'y',oldY);
if(player.vy>=0&&oldY+player.h<=ground&&player.y+player.h>=ground&&groundExists(player.x+player.w*.5)){player.y=ground-player.h;player.vy=0;player.grounded=true;player.jumps=0}
if(player.y>H+25){damage();if(mode==='play'){player.x=Math.max(25,player.x-100);player.y=90;player.vy=0}}
for(const hazard of spikes)if(rect(player,hazard))damage();
for(const spring of springs){
 if(player.vy>=0&&oldY+player.h<=spring.y+6&&player.y+player.h>=spring.y&&
    player.x+player.w>spring.x&&player.x<spring.x+spring.w){
   player.y=spring.y-player.h;player.vy=-(spring.force||10.5);player.grounded=false;
   player.coyote=0;player.jumps=1;playSound('pulo_duplo');
   spark(player.x+8,spring.y,'#ffdc67',10);
 }
}
if(player.grounded&&Math.abs(player.vx)>.2)player.step+=Math.abs(player.vx)*.17;
if(player.inv>0)player.inv--;
for(const c of coins){if(!c.got&&rect(player,{x:c.x,y:c.y,w:9,h:11})){c.got=true;money++;score+=CFG.rewards.coinPoints;sfx(850,.05);if(money===coins.length)awardCoins()}}
if(itemLists.pacifier.some(it=>rect(player,it)))unlockSuper();
if(itemLists.shoe.some(it=>rect(player,it)))unlockDoubleJump();
if(itemLists.cube.some(it=>rect(player,it)))unlockMagicCube();
for(const e of enemies){if(!e.alive)continue;e.phase+=.06;if(e.hit>0)e.hit--;

const ec=CFG['enemy_'+e.kind];const speed=ec?ec.speed:.42;
const flying=e.kind==='joaninha';
 if(!flying){
  const bottom=e.y+e.h;let surface=ground;
  for(const k of blocks)if(k.alive&&e.x+e.w>k.x+2&&e.x<k.x+k.w-2&&k.y>=bottom-2&&k.y<surface)surface=k.y;
  for(const k of ledges)if(e.x+e.w>k.x+2&&e.x<k.x+k.w-2&&k.y>=bottom-2&&k.y<surface)surface=k.y;
  if(!groundExists(e.x+e.w/2)&&surface===ground)surface=H+70;
  const target=surface-e.h;
  e.baseY=e.y=Math.min(target,e.y+Math.min(7,(e.fallSpeed=(e.fallSpeed||0)+(ec?ec.gravity:CFG.enemies.fallGravity))));
  if(e.y>=target)e.fallSpeed=0;
 }
 const nextY=flying?e.baseY+Math.sin(e.phase)*14:e.kind==='sapo'?e.baseY-Math.max(0,Math.sin(e.phase))*20:e.baseY;
// Primeiro testa a parede; só depois atualiza a posição do inimigo.
if(e.kind!=='planta')moveEnemy(e,speed*CFG.enemies.speedMultiplier,nextY);
// Inimigos voadores ou saltadores também não podem atravessar um bloco na vertical.
if(e.kind==='planta'||(!enemyBlocked(e,e.x,nextY)&&!enemyAhead(e,e.x,nextY)))e.y=nextY;
if(e.x<30){e.x=30;e.dir=1}else if(e.x>mapWidth-50){e.x=mapWidth-50;e.dir=-1;}
if(rect(player,e)){if(magicInvincible){defeatOnContact(e);continue;}if(player.vy>1&&oldY+player.h<=e.y+7){const hit=ec?ec.stompDamage:1;if(hit>0){e.hp=Math.max(0,e.hp-hit);e.hit=8;score+=100;player.vy=-4.6;}else {player.vy=-4.6;damage();}}else damage()}
if(e.hp<=0){e.alive=false;spark(e.x+9,e.y+8,'#ff8aa2',10)}}
// Super Sapo Rei: salta em direcao a Aurora.
for(const b of bosses)if(b.alive){ const bc=CFG['boss_'+(b.kind==='cobra_mola'?'cobra_mola':'sapo_rei')];b.phase+=.075;if(b.hit>0)b.hit--;
 const distance=player.x+player.w/2-(b.x+b.w/2);b.dir=distance<0?-1:1;
 if(b.grounded){
   b.vy=0;
   if(Math.abs(distance)<370&&--b.jumpWait<=0){b.vy=-bc.jumpForce;b.grounded=false;b.jumpWait=bc.jumpInterval;spark(b.x+b.w/2,b.y+b.h,'#a1f68a',9)}
 }
 if(!b.grounded){
   const oldY=b.y;let nx=Math.max(0,Math.min(mapWidth-b.w,b.x+b.dir*(Math.abs(distance)>18?(b.kind==='cobra_mola'?2.15:1.65)*bc.moveSpeed:0)));
   if(!blocks.some(k=>k.alive&&rect({x:nx,y:b.y,w:b.w,h:b.h},k)))b.x=nx;
   b.vy=Math.min(8,b.vy+bc.gravity);b.y+=b.vy;
   if(b.vy>=0){
     for(const k of blocks){if(k.alive&&b.x+b.w>k.x&&b.x<k.x+k.w&&oldY+b.h<=k.y&&b.y+b.h>=k.y){b.y=k.y-b.h;b.vy=0;b.grounded=true;break}}
     if(!b.grounded&&oldY+b.h<=ground&&b.y+b.h>=ground&&groundExists(b.x+b.w/2)){b.y=ground-b.h;b.vy=0;b.grounded=true}
   }
   if(b.y>H+50){b.x=Math.max(0,Math.min(mapWidth-b.w,finish-130));b.y=ground-b.h;b.vy=0;b.grounded=true;b.jumpWait=35}
 }
 if(rect(player,b)){
  if(magicInvincible){b.alive=false;b.hp=0;score+=CFG.rewards.bossPoints;spark(b.x+24,b.y+20,'#dca5ff',45);}
  else if(player.vy>0.8&&oldY+player.h<=b.y+Math.min(15,b.h*.28)){
   // Pisão válido apenas se o perfil do chefão permitir dano por cabeçada/pisão.
   if(bc.stompDamage>0){b.hp=Math.max(0,b.hp-bc.stompDamage);b.hit=13;spark(b.x+b.w/2,b.y,'#ffdf8d',14);sfx(570,.1,'triangle');if(!b.hp){b.alive=false;score+=CFG.rewards.bossPoints;}}
   else damage();
   player.y=b.y-player.h;player.vy=-5.2;player.grounded=false;
  }else damage();
  if(!magicInvincible&&oldX+player.w<=b.x+5){player.x=b.x-player.w;player.vx=0}else if(!magicInvincible&&oldX>=b.x+b.w-5){player.x=b.x+b.w;player.vx=0}
 }
}
 for(let i=shots.length-1;i>=0;i--){let p=shots[i];p.x+=p.vx;p.life--;p.age++;if(p.age%3===0)spark(p.x-p.dir*3,p.y+2,'#8bdfff',1);let hit=false;
for(const b of blocks){if(!b.alive||!rect(p,b))continue;if(b.type===3){hit=true;spark(p.x,p.y,'#d8f1ff',8);sfx(290,.08);break;}b.hp=p.power?0:b.hp-CFG.normalSpit.blockDamage;hit=true;spark(p.x,p.y,p.power?'#ffe67a':'#aef7ff');if(b.hp<=0){b.alive=false;score+=CFG.rewards.blockPoints;spark(b.x+8,b.y+8,'#d88b4a',13);sfx(370,.08)}p.blocksLeft--;if(p.blocksLeft>0){hit=false;continue;}break}
if(!hit)for(const b of bosses){if(!b.alive||!rect(p,b))continue;
   hit=true;const bc=CFG['boss_'+(b.kind==='cobra_mola'?'cobra_mola':'sapo_rei')];const dmg=p.power?bc.superSpitDamage:bc.normalSpitDamage;if(dmg>0){b.hp=Math.max(0,b.hp-dmg);b.hit=13;}
   spark(p.x,p.y,'#8deaff',15);
   if(b.hp===0){b.alive=false;score+=CFG.rewards.bossPoints;spark(b.x+b.w/2,b.y+b.h/2,'#8af5a3',45);sfx(520,.28,'triangle',.04);}break;
 }
 if(!hit)for(const e of enemies){if(e.alive&&rect(p,e)){const ec=CFG['enemy_'+e.kind];e.hp-=Math.round((p.power?CFG.superSpit.enemyDamage:CFG.normalSpit.enemyDamage)*(ec?ec.spitDamageMultiplier:1));e.hit=8;spark(p.x,p.y,'#b9faff');if(e.hp<=0){e.alive=false;score+=CFG.rewards.enemyPoints;spark(e.x+8,e.y+8,'#ffb76b',12);}p.enemiesLeft--;hit=p.enemiesLeft<=0;break}}
if(hit||p.life<=0||p.x<0||p.x>mapWidth)shots.splice(i,1)}
for(let i=dust.length-1;i>=0;i--){let d=dust[i];d.x+=d.vx;d.y+=d.vy;d.vy+=.14;if(--d.life<=0)dust.splice(i,1)}
camera=Math.max(0,Math.min(mapWidth-W,player.x-CFG.camera.followOffset));if(player.x>finish&&bosses.every(b=>!b.alive)){score+=CFG.rewards.stagePoints;if(level<window.AURORA_LEVELS.MAX_LEVEL)nextLevel();else finalVictory()}updateHud();}
function sky(){
 if(marketBackground.complete&&marketBackground.naturalWidth){
   const srcW=1120,srcH=550;
   const maxX=Math.max(0,marketBackground.naturalWidth-srcW);
   const sx=Math.max(0,Math.min(maxX,camera*.26));
   g.drawImage(marketBackground,sx,0,srcW,srcH,0,0,W,ground);
 }else{
   r(0,0,W,ground,'#ffdb61');
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
  // Placa triangular amarela com borda preta, fixada no solo antes do buraco.
  const sx=h.x-52,sy=ground-30;
  r(sx+10,sy+24,3,7,'#171423');
  g.fillStyle='#151523';g.beginPath();g.moveTo(sx+11,sy);g.lineTo(sx+24,sy+25);g.lineTo(sx-2,sy+25);g.closePath();g.fill();
  g.fillStyle='#ffda37';g.beginPath();g.moveTo(sx+11,sy+5);g.lineTo(sx+19,sy+22);g.lineTo(sx+3,sy+22);g.closePath();g.fill();
  r(sx+10,sy+12,3,6,'#1c1b26');r(sx+10,sy+19,3,2,'#1c1b26');
 }
}
function terrain(){
 for(const h of spikes){for(let x=h.x;x<h.x+h.w;x+=8){
  r(x,h.y+9,8,3,'#3c455e');r(x+1,h.y+6,6,3,'#aab9c9');
  r(x+2,h.y+3,4,3,'#d4e5f1');r(x+3,h.y,2,3,'#ffffff');
 }}
 for(const spring of springs){
  const x=spring.x,y=spring.y;r(x,y+8,spring.w,4,'#763b48');
  r(x+2,y+1,spring.w-4,3,'#f2d44f');r(x+3,y+4,spring.w-6,4,'#e65c66');
  r(x+5,y+5,3,3,'#ffea9b');r(x+spring.w-8,y+5,3,3,'#ffea9b');
 }
 for(let x=Math.floor(camera/16)*16;x<camera+W+16;x+=16){if(!groundExists(x+8))continue;r(x,ground,16,H-ground,'#8d553a');r(x,ground,16,4,'#c4c1ac');r(x,ground+4,16,3,'#5d535d');r(x+2,ground+10,5,4,'#ae7048');r(x+10,ground+19,4,4,'#663e41');r(x+5,ground+24,4,3,'#c08b57')}

for(const p of ledges){
 // Plataformas destacadas sobre o cenário da feira: contorno escuro, topo dourado e base violeta.
 r(p.x-2,p.y-2,p.w+4,p.h+5,p.kind&&p.kind!=='static'?'#193b58':'#1c1737');
 r(p.x,p.y,p.w,p.h,p.kind&&p.kind!=='static'?'#458fae':'#92512f');
 r(p.x,p.y,p.w,3,p.kind&&p.kind!=='static'?'#b5f3ff':'#e5a369');
 r(p.x,p.y+3,p.w,2,'#c17b46');
 r(p.x,p.y+p.h-2,p.w,2,'#4b2925');
 for(let i=0;i<p.w;i+=16){
   r(p.x+i+1,p.y+5,2,2,'#e2a474');
   r(p.x+i+8,p.y+5,5,1,'#ae6b45');
   if(i+16<p.w)r(p.x+i+15,p.y+3,1,p.h-3,'#4b2925');
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
 if(b.type===3){
  r(x+1,y+1,14,14,'#65758a');r(x+2,y+2,12,3,'#b3c5d2');
  r(x+2,y+12,12,2,'#35465c');r(x+6,y+5,4,6,'#849bad');
  for(const [dx,dy] of [[3,3],[12,3],[3,12],[12,12]])r(x+dx,y+dy,2,2,'#e5f3ff');
  continue;
 }
 if(false){ // estilo amarelo desativado: todos os blocos agora sao marrons
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
}

function enemyDraw(e){
 if(e.kind==='ratinho'){
  const x=Math.round(e.x),y=Math.round(e.y),leg=tick%12<6?1:0;
  r(x+2,y+6,16,9,'#7e8797');r(x+4,y+2,11,9,'#a7afba');
  r(x+2,y,5,5,'#9da6b4');r(x+12,y,5,5,'#9da6b4');
  r(x+6,y+5,11,4,'#151b2d');r(x+7,y+6,3,2,'#5b708b');r(x+13,y+6,3,2,'#5b708b');
  r(x+17,y+9,3,3,'#eaa4a7');r(x+3,y+14,4,2,'#555c70');r(x+12+leg,y+14,4,2,'#555c70');
  r(x-4,y+9,6,2,'#b5bdc7');return;
 }
 if(e.kind==='planta'){
  const x=Math.round(e.x),y=Math.round(e.y),open=Math.sin(e.phase*1.4)>0;
  r(x+2,y+19,20,11,'#256b45');r(x,y+18,24,4,'#64c26c');
  r(x+5,y+23,14,5,'#389957');r(x+11,y+11,3,9,'#28874a');
  r(x+3,y+5,18,12,'#279c48');r(x+4,y+3,16,8,'#6ed65e');
  if(open){r(x+5,y+9,14,6,'#5b263c');r(x+6,y+9,3,3,'#fff1d0');r(x+15,y+9,3,3,'#fff1d0')}
  else r(x+6,y+11,12,2,'#f6d9b5');
  r(x+6,y+5,3,3,'#fff');r(x+15,y+5,3,3,'#fff');
  r(x+7,y+6,1,2,'#18273a');r(x+16,y+6,1,2,'#18273a');return;
 }
 if(e.hit>0&&tick%4<2)return;const animation=(e.kind==='sapo'?Math.floor(e.phase*1.6):Math.floor(tick/9));const frame=typeof NEW_ENEMIES!=='undefined'&&NEW_ENEMIES[e.kind]?animation%NEW_ENEMIES[e.kind]:animation;if(sprite(g,e.kind,frame,e.x-8,e.y-19,36,36,e.dir<0))return;let x=Math.round(e.x),y=Math.round(e.y),k=e.kind;const eye=()=>{r(x+12,y+4,4,5,'#fff');r(x+14,y+6,2,3,'#22283f')};
if(k==='barata'){r(x+2,y+5,14,9,'#773f29');r(x+5,y+4,10,7,'#bc6935');r(x+4,y+13,3,3,'#3d2d38');r(x+12,y+13,3,3,'#3d2d38');r(x+8,y+1,1,5,'#432739');r(x+13,y,1,5,'#432739');eye()}
if(k==='joaninha'){r(x+3,y+5,13,9,'#d92937');r(x+8,y+5,2,9,'#35283b');r(x+5,y+7,3,3,'#2c243a');r(x+12,y+9,3,3,'#2c243a');r(x+1,y+9,4,5,'#292d4a');eye();if(tick%10<5){r(x+3,y+1,6,4,'#a9edff');r(x+9,y+2,6,3,'#a9edff')}}
if(k==='caramujo'){r(x+1,y+10,17,5,'#e3a64b');r(x+2,y+2,12,12,'#8d44ba');r(x+4,y+4,8,8,'#c779ed');r(x+6,y+6,4,4,'#6d3294');r(x+15,y+5,2,7,'#e3a64b');r(x+16,y+3,3,3,'#fff');r(x+17,y+4,1,1,'#34213e')}
if(k==='sapo'){r(x+1,y+7,17,8,'#37a54b');r(x+4,y+3,12,9,'#67d75e');r(x+4,y+1,5,5,'#fff');r(x+12,y+1,5,5,'#fff');r(x+6,y+3,2,2,'#263749');r(x+14,y+3,2,2,'#263749');r(x,y+13,6,3,'#258a46');r(x+13,y+13,6,3,'#258a46')}
if(k==='lesma'){r(x+1,y+11,17,5,'#eab184');r(x+4,y+7,12,6,'#cf3ca7');r(x+12,y+3,4,8,'#e9a67c');r(x+12,y,2,4,'#e9a67c');r(x+16,y,2,4,'#e9a67c');r(x+12,y,3,3,'#fff');r(x+16,y,3,3,'#fff');r(x+13,y+1,1,2,'#3d2d45');r(x+17,y+1,1,2,'#3d2d45')}
if(k==='besouro'){r(x+2,y+5,15,10,'#1b4d9a');r(x+4,y+3,11,8,'#357ed0');r(x+3,y+12,3,4,'#e4b052');r(x+13,y+12,3,4,'#e4b052');r(x+9,y+7,9,6,'#f3d25d');r(x+10,y+8,7,4,'#20273e');r(x+11,y+9,2,2,'#e2faff');r(x+15,y+9,2,2,'#e2faff')}
if(k==='caranguejo'){r(x+3,y+7,13,7,'#e8494e');r(x+5,y+4,10,7,'#ff7860');r(x,y+3,5,6,'#dc3948');r(x+15,y+3,5,6,'#dc3948');r(x+6,y+1,4,5,'#fff');r(x+12,y+1,4,5,'#fff');r(x+8,y+3,2,2,'#2c2643');r(x+14,y+3,2,2,'#2c2643');r(x+4,y+14,3,2,'#ba3845');r(x+12,y+14,3,2,'#ba3845')}
}
function drawBoss(){
 for(const b of bosses){if(!b.alive)continue;const x=Math.round(b.x),y=Math.round(b.y);
 if(b.hit>0&&tick%4<2)return;
 if(b.kind==='cobra_mola'){
  const cx=x+b.w/2,coilY=y+b.h-10;
  for(let i=0;i<5;i++){const yy=coilY-i*16;const xx=x+10+(i%2)*24;r(xx,yy,Math.max(20,b.w-35),13,i%2?'#79cb58':'#3e9c55');r(xx+5,yy+2,Math.max(12,b.w-45),5,'#b3e577');}
  r(x+22,y+3,b.w-44,34,'#47ae63');r(x+28,y,b.w-56,27,'#8dd65b');
  r(x+34,y+8,13,13,'#fff');r(x+b.w-47,y+8,13,13,'#fff');r(x+40,y+12,5,6,'#192738');r(x+b.w-42,y+12,5,6,'#192738');
  r(x+40,y+30,b.w-80,7,'#1b4234');r(x+48,y+37,4,13,'#fff7d4');r(x+b.w-52,y+37,4,13,'#fff7d4');
  r(x+1,y-34,b.w-2,8,'#12192d');r(x+3,y-32,Math.round((b.w-6)*b.hp/b.maxHp),4,'#8ce64f');
  text('COBRA MOLA',x+8,y-47,'#fff2a5',8);continue;
 }
 // Sprite do sapo inimigo ampliado, com coroa de rei.
 if(!sprite(g,'sapo',Math.floor(b.phase*1.5)%3,x-6,y-9,b.w+12,b.h+13,b.dir<0)){
   r(x+5,y+16,b.w-10,b.h-19,'#226c3d');r(x+9,y+12,b.w-18,b.h-18,'#65d65c');
   r(x+10,y+8,12,13,'#fff');r(x+b.w-22,y+8,12,13,'#fff');
   r(x+16,y+13,4,5,'#24313c');r(x+b.w-18,y+13,4,5,'#24313c');
 }
 const cx=x+Math.floor(b.w/2);
 r(cx-15,y-10,30,10,'#51351d');r(cx-13,y-9,26,7,'#f6c83d');
 r(cx-14,y-17,7,9,'#f6c83d');r(cx-3,y-22,7,14,'#ffdf55');r(cx+8,y-17,7,9,'#f6c83d');
 r(cx-10,y-7,5,4,'#e04a50');r(cx+5,y-7,5,4,'#e04a50');r(cx-2,y-7,4,4,'#fff3a6');
 if(!b.grounded)r(x+8,ground+1,b.w-16,3,'#46372d');
 r(x+1,y-34,b.w-2,8,'#12192d');r(x+3,y-32,b.w-6,4,'#543a46');
 r(x+3,y-32,Math.round((b.w-6)*b.hp/b.maxHp),4,'#8ce64f');
 text('SUPER SAPO REI',x-15,y-47,'#fff2a5',8);
}
}
function aurora(){if(player.inv>0&&tick%6<3)return;const moving=player.grounded&&Math.abs(player.vx)>.25;const action=player.inv>0?'hurt':player.spitAnim>0?'spit':!player.grounded?'jump':moving?(Math.abs(player.vx)>1.8?'run':'walk'):'idle';const animFrame=action==='jump'?(player.vy<0?2:4):action==='spit'?Math.min(4,Math.floor((13-player.spitAnim)/2.6)):Math.floor(action==='idle'?tick/18:player.step*1.7);
if(sprite(g,'aurora_'+action,animFrame,player.x-9,player.y-16,36,48,player.face<0))return;let x=Math.round(player.x),y=Math.round(player.y),walk=player.grounded&&Math.abs(player.vx)>.25,leg=walk?Math.round(Math.sin(player.step)*3):0;
g.save();g.translate(x+9,y+14);g.scale(player.face,1);g.translate(-9,-14);
r(1,1,15,14,'#2f2036');r(0,5,5,7,'#302137');r(4,0,10,4,'#302137');
r(4+leg,22,5,5,colors.skin);r(10-leg,22,5,5,colors.skin);r(3+leg,26,7,3,'#64b7ff');r(10-leg,26,7,3,'#64b7ff');
r(2,13,14,10,colors.dress);r(0,19,18,5,colors.shade);r(2,19,14,3,colors.dress);r(6,13,6,3,'#d3f3ff');r(5,18,2,2,'#e2faff');r(12,19,2,2,'#e2faff');
r(0,14,3,7,colors.skin);r(15,14,3,7,colors.skin);r(2,4,14,11,colors.skin);r(1,7,17,6,colors.skinLight);r(3,3,12,4,colors.hair);r(2,4,4,5,colors.hair);
r(10,7,4,5,'#fff');r(12,8,2,3,'#242038');r(13,11,4,2,'#e78b8f');r(16,11,3,4,'#52243d');r(17,13,2,1,'#ff82a7');
r(3,2,13,2,'#f4faff');r(9,0,4,4,colors.bow);r(13,0,4,4,colors.bow);r(12,1,2,2,'#fff');g.restore()}
function render(){sky();g.save();g.translate(-Math.floor(camera),0);terrain();pitVisual();for(const c of coins){if(c.got)continue;let bob=Math.round(Math.sin(tick*.12+c.x)*2);let cw=[9,7,4,7][Math.floor((tick+c.x)/9)%4],cx=c.x+Math.floor((9-cw)/2);r(cx,c.y+bob,cw,12,'#b76b18');r(cx+1,c.y+bob+1,Math.max(1,cw-2),10,'#ffd232');if(cw>=7){r(cx+3,c.y+bob+2,3,7,'#fff19b');r(cx+2,c.y+bob+3,1,5,'#e49a21')}else r(cx+1,c.y+bob+2,2,7,'#fff2a0')}
for(const pacifier of itemLists.pacifier){
 const y=pacifier.y+Math.round(Math.sin(tick*.1)*2);
 if(itemImages.pacifier.complete&&itemImages.pacifier.naturalWidth)g.drawImage(itemImages.pacifier,pacifier.x,y,pacifier.w,pacifier.h);
 else{
  r(pacifier.x+3,y+1,16,7,'#f2b6ee');r(pacifier.x+5,y+3,12,4,'#fff1ff');
  r(pacifier.x+1,y+8,20,9,'#9fe6ff');r(pacifier.x+7,y+17,8,5,'#e3b5ff');
  r(pacifier.x+8,y+10,6,5,'#fff8ad');
 }
 if(tick%16<8){r(pacifier.x-3,y+2,3,3,'#fff6a6');r(pacifier.x+pacifier.w+1,y+5,3,3,'#fff6a6')}
}
for(const cube of itemLists.cube){
 const x=Math.round(cube.x),y=Math.round(cube.y+Math.sin(tick*.1)*2);
 r(x-2,y-2,26,26,'#43286b');r(x,y,22,22,'#9d63e8');
 const palette=['#fff2a2','#75d5ff','#ff88b7','#9df8a7','#f9f5ff','#ffa857'];
 for(let iy=0;iy<3;iy++)for(let ix=0;ix<3;ix++){
  r(x+2+ix*6,y+2+iy*6,5,5,palette[(ix+iy*3+Math.floor(tick/18))%palette.length]);
  r(x+3+ix*6,y+3+iy*6,2,2,'#ffffff');
 }
 if(tick%16<8){r(x-5,y+4,3,3,'#fff1a8');r(x+24,y+14,3,3,'#fff1a8')}
}
for(const shoe of itemLists.shoe){
 const y=shoe.y+Math.round(Math.sin(tick*.1)*2);
 if(itemImages.shoe.complete&&itemImages.shoe.naturalWidth)g.drawImage(itemImages.shoe,shoe.x,y,shoe.w,shoe.h);
 if(tick%16<8){r(shoe.x-3,y+2,3,3,'#fff6a6');r(shoe.x+shoe.w+1,y+5,3,3,'#fff6a6')}
}
for(const e of enemies)if(e.alive)enemyDraw(e);drawBoss();for(const p of shots){
 // Gota animada em três quadros, com reflexo e pequenas partículas.
 const pulse=Math.floor(p.age/3)%3;
 if(p.power){const cx=p.x+7,cy=p.y+7;r(cx-8,cy-4,17,9,'#124c92');r(cx-4,cy-8,9,17,'#124c92');r(cx-6,cy-6,13,13,'#288fd4');r(cx-4,cy-5,9,10,'#60d5ff');r(cx-3,cy-5,5,3,'#e2ffff');r(p.x-p.dir*5,p.y+6,4,3,'#55b9f5');continue;}r(p.x-p.dir*3,p.y+2,3,2,'#4ab8ee');
 r(p.x,p.y+(pulse===1?-1:0),8,6,'#267cbd');
 r(p.x+1,p.y+(pulse===1?-1:0),6,4,'#82eaff');
 r(p.x+2,p.y+(pulse===1?-1:0),3,2,'#f4ffff');
 if(pulse===2)r(p.x-p.dir*5,p.y+3,2,2,'#a2e8ff');
 }
aurora();
 if(magicInvincible){
  const pulse=Math.sin(tick*.16);
  g.strokeStyle=pulse>0?'#e4b5ff':'#8defff';g.lineWidth=2;
  g.strokeRect(Math.round(player.x-4),Math.round(player.y-5),player.w+8,player.h+10);
  for(let i=0;i<3;i++){
   const a=tick*.085+i*Math.PI*2/3;
   r(player.x+player.w/2+Math.cos(a)*17,player.y+player.h/2+Math.sin(a)*20,3,3,i===0?'#ffe38c':'#d5a3ff');
  }
 }
 if(superUnlocked&&chargeHeld){const ratio=Math.min(1,chargeTicks/chargeThreshold);const px=player.x+8,py=player.y-20;r(px-12,py,24,5,'#17142c');r(px-11,py+1,Math.round(22*ratio),3,ratio>=1?'#75eaff':'#438de1');if(ratio>=1&&tick%8<4){r(player.x-3,player.y-4,3,3,'#8beaff');r(player.x+18,player.y+7,3,3,'#8beaff')}}
 // Brilho na boca durante o ataque, sempre espelhado com a personagem.
 if(player.spitAnim>7){const m=mouthPosition();
 r(m.x+(player.face>0?0:-3),m.y-3,3,3,'#e9ffff');
 r(m.x+(player.face>0?2:-5),m.y-1,3,2,'#7de7ff');
 }
 for(const d of dust)r(d.x,d.y,3,3,d.color);
r(finish,ground-52,3,52,'#f7e4a1');r(finish+3,ground-50,26,15,'#ee5798');r(finish+6,ground-47,17,4,'#ffb4d8');g.restore();
// pixel HUD with backing strip
r(0,0,W,19,'#172a60');r(0,18,W,2,'#e6bc4d');text('AURORA',6,4,'#fff',9);text('♥'.repeat(health),71,4,'#ff698a',10);text('◉ '+String(money).padStart(2,'0'),126,4,'#ffe470',9);text(String(score).padStart(6,'0'),188,4,'#fff',9);text('1-'+level+(superUnlocked?' ★C':'')+(doubleJumpUnlocked?' ★Z':''),320,4,superUnlocked?'#ffe76b':'#e5f7ff',9)}
function loop(now){if(mode!=='play')return;acc+=Math.min(50,now-last||16.67);last=now;let n=0;while(acc>=1000/60&&n++<4&&mode==='play'){step();acc-=1000/60}render();if(mode==='play')requestAnimationFrame(loop)}
window.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyZ','KeyC','Enter'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(mode==='intro'){if(e.code==='Enter'||e.code==='KeyZ'||e.code==='Space'||/^Key[A-Z]$/.test(e.code)||/^Digit[0-9]$/.test(e.code)||/^Numpad[0-9]$/.test(e.code)){goFromSplash();frontWaitRelease=true}return}
 if(mode==='menu'){
  if(frontWaitRelease)return;
  if(frontScreen==='mainMenu'&&(e.code==='ArrowDown'||e.code==='ArrowUp')){menuIndex=(menuIndex+(e.code==='ArrowDown'?1:2))%3;updateMenuSelection();sfx(570,.045);return}
  if(e.code==='KeyZ'){menuChoose();return}
  return;
 }
 if(mode==='finalCredits'){if(e.code==='KeyZ'){setCreditsAcceleration(true);return;}if(e.code==='Escape'||e.code==='Enter'){showSplashAfterCredits()}return}
 if(mode==='power'){if((level===1&&e.code==='KeyC')||(level===2&&(e.code==='KeyZ'||e.code==='ArrowUp'))){resumePower();frontWaitRelease=true}return}
 if(mode==='stage'){return}
 if(mode==='pause'){if(e.code==='Enter')togglePause();return}
 if(mode==='win'||mode==='lost'){if(e.code==='KeyZ'||e.code==='Enter')showMenu();return}
 if(mode==='play'&&e.code==='Enter'){togglePause();return}
 if(mode==='play'&&e.code==='KeyR'){start();return}
 if(mode==='play'&&!frontWaitRelease)keys[e.code]=true;
});
window.addEventListener('keyup',e=>{if(mode==='finalCredits'&&e.code==='KeyZ')setCreditsAcceleration(false);keys[e.code]=false;if(frontWaitRelease&&(e.code==='KeyZ'||e.code==='KeyC'||e.code==='ArrowUp'||e.code==='Enter'||mode==='menu'))frontWaitRelease=false});
window.addEventListener('blur',()=>{if(mode==='finalCredits')setCreditsAcceleration(false);keys.ArrowLeft=keys.ArrowRight=keys.ArrowUp=keys.KeyC=keys.KeyZ=false;spitKeyWasDown=false;chargeHeld=false;chargeTicks=0;keys.jumpLock=false;if(mode==='play')togglePause()});
$('#play').addEventListener('click',()=>{if(mode==='power')resumePower();else if(mode==='stage')resumeStage();else if(mode==='pause')togglePause();else if(mode==='win'||mode==='lost')showMenu();else if(mode==='menu')menuChoose()});
$('#creditsReplay').addEventListener('click',()=>{if(mode==='finalCredits')showFinalCredits()});
$('#creditsMenu').addEventListener('click',()=>{showSplashAfterCredits()});
$('#creditsSound').addEventListener('click',()=>{sound=!sound;$('#creditsSound').textContent=sound?'♫ SOM ON':'♫ SOM OFF';if(sound)playCreditsMusic();else creditsMusic.pause()});
$('#pause').addEventListener('click',()=>{if(mode==='play'||mode==='pause')togglePause()});$('#sound').addEventListener('click',()=>{sound=!sound;$('#sound').textContent=sound?'♫ SOM ON':'♫ SOM OFF';if(sound){resumeMusic();sfx(700,.06)}else pauseMusic()});
const touchPointers=new Map();
 function virtualDown(code){
  if(mode==='intro'){goFromSplash();frontWaitRelease=false;return}
  if(mode==='menu'){
   if(code==='ArrowLeft'||code==='ArrowUp'){menuIndex=(menuIndex+2)%3;updateMenuSelection();return}
   if(code==='ArrowRight'){menuIndex=(menuIndex+1)%3;updateMenuSelection();return}
   if(code==='KeyZ'||code==='KeyC'){menuChoose();return}return;
  }
  if(mode==='power'){resumePower();return}
  if(mode==='stage'){resumeStage();return}
  if(mode==='pause'){togglePause();return}
  if(mode==='lost'||mode==='win'){showMenu();return}
  if(mode==='finalCredits'){if(code==='KeyZ')setCreditsAcceleration(true);return}
  if(mode==='play')keys[code]=true;
 }
 for(const b of document.querySelectorAll('[data-k]')){
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touchPointers.set(e.pointerId,b.dataset.k);virtualDown(b.dataset.k)});
  const release=e=>{e.preventDefault();const code=touchPointers.get(e.pointerId);if(!code)return;touchPointers.delete(e.pointerId);if(![...touchPointers.values()].includes(code))keys[code]=false;if(code==='KeyZ'&&mode==='finalCredits')setCreditsAcceleration(false)};
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,release);
 }

const testParams=new URLSearchParams(location.search);
const testLevel=testParams.get('testLevel');
if(/^[1-6]$/.test(testLevel||'')){
 level=Number(testLevel);build(true);
 // Testes de fases podem começar com os poderes liberados para facilitar verificação.
 superUnlocked=level>=2;doubleJumpUnlocked=level>=3;pacifier=level===1?window.AURORA_LEVELS.load(level,{draftFirst:true}).items.pacifier:null;
 mode='play';front.classList.add('is-hidden');$('#overlay').style.display='none';
 last=performance.now();requestAnimationFrame(loop);
 document.querySelector('.small').textContent='MODO TESTE · FASE 1-'+level;
}else{build();render();showFront('splash')}
})();
