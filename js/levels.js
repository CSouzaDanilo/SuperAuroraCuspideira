/* Dados compartilhados pelo jogo e editor visual. Fases independentes. */
(function(){'use strict';
const STORAGE='aurora-levels-v27',W=3552,H=216,GROUND=188,MAX_LEVEL=6;
const kinds=['barata','joaninha','caramujo','sapo','lesma','besouro','caranguejo','ratinho','planta'];
function createDefault(level){
 if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)throw Error('Fase inválida: '+level);
let blocks=[],ledges=[],enemies=[],coins=[],holes=[],market=[],boss=null,pacifier=null,shoe=null;
const ground=GROUND;
// Caixas decorativas removidas para nao confundir com os blocos interativos.
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
// Parede alta de tijolos apos a plataforma da chupeta / sapatinho.
 // 5 blocos de altura: Aurora precisa abrir caminho com o cuspe.
 // Cada bloco leva um cuspe normal, para que a passagem seja viavel sem Super Cuspe.
 for(const x of [1840,1856]){
   for(let n=0;n<7;n++)blocks.push({
     x,y:ground-16*(n+1),w:16,h:16,type:0,hp:1,alive:true
   });
 }
// Trecho 3: buraco real no solo, com largura de 64 pixels.
holes.push({x:2850,w:64});
const kinds=['barata','joaninha','caramujo','sapo','lesma','besouro','caranguejo'];
[220,355,465,700,875,1040,1160,1370,1545,1680,1850,2070,2250,2440,2610,2870,3070,3300].forEach((x,i)=>{let kind=kinds[i%kinds.length],fly=kind==='joaninha';if(x===2870||x===3300)return;enemies.push({x,y:fly?130:ground-16,w:19,h:16,baseY:fly?130:ground-16,kind,dir:i%2?1:-1,hp:kind==='besouro'?3:kind==='caranguejo'?2:1,phase:i*1.3,alive:true,hit:0})});
for(let x=100;x<3420;x+=63)coins.push({x,y:105+(Math.floor(x/63)%3)*14,got:false});
// As duas ultimas moedas foram retiradas do mapa.
coins.splice(-2,2);
// Remove moeda que ficava sobreposta a parede de tijolos.
coins=coins.filter(c=>c.x<1830||c.x>1880);
// Chupeta sobre uma plataforma na metade da fase, somente se ainda nao coletada.
ledges.push({x:1720,y:134,w:78,h:8});
pacifier={x:490,y:142,w:22,h:22};
shoe={x:1750,y:109,w:24,h:23};
// Chefe da terceira parte, antes da faixa de chegada.
boss={x:3340,y:ground-53,w:55,h:53,dir:-1,hp:8,maxHp:8,hit:0,alive:true,phase:0,vy:0,grounded:true,jumpWait:35};

const map={version:2,id:'1-'+level,width:W,ground:GROUND,start:{x:32,y:135},finish:3470,
 blocks,platforms:ledges,enemies,coins,holes,boss,spikes:[],springs:[],
 items:level===1?{pacifier,shoe:null,cube:null}:level===2?{pacifier:null,shoe,cube:null}:{pacifier:null,shoe:null,cube:null}};
return map;
}
function clone(o){return JSON.parse(JSON.stringify(o))}
function validNum(v,min,max){return typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max}
function sanitize(raw,level){
 if(!Number.isInteger(level)||level<1||level>MAX_LEVEL)throw Error('Fase inválida');
 if(!raw||typeof raw!=='object')throw Error('Mapa inválido');
 const out=createDefault(level);out.id='1-'+level;
 if(validNum(raw.width,768,15000))out.width=Math.round(raw.width);
 if(validNum(raw.ground,80,216))out.ground=Math.round(raw.ground);
 const clean=(arr,max,fn)=>Array.isArray(arr)?arr.slice(0,max).filter(x=>x&&typeof x==='object').map(fn).filter(Boolean):null;
 const pos=(x)=>validNum(x,-200,15000);
 const blocks=clean(raw.blocks,2000,b=>pos(b.x)&&pos(b.y)?{x:b.x,y:b.y,w:16,h:16,type:[0,1,2,3].includes(b.type)?b.type:0,hp:validNum(b.hp,1,20)?b.hp:1,alive:true}:null);
 if(blocks)out.blocks=blocks;
 const platforms=clean(raw.platforms,400,b=>pos(b.x)&&pos(b.y)&&validNum(b.w,8,1200)?{
 x:b.x,y:b.y,w:b.w,h:validNum(b.h,2,100)?b.h:8,
 kind:['static','horizontal','vertical'].includes(b.kind)?b.kind:'static',
 range:validNum(b.range,0,800)?b.range:96,speed:validNum(b.speed,0.1,6)?b.speed:0.8,
 originX:b.x,originY:b.y,dir:1
}:null);
 if(platforms)out.platforms=platforms;
 const coins=clean(raw.coins,1500,c=>pos(c.x)&&pos(c.y)?{x:c.x,y:c.y,got:false}:null);
 if(coins)out.coins=coins;
 const enemies=clean(raw.enemies,400,e=>pos(e.x)&&pos(e.y)&&kinds.includes(e.kind)?{x:e.x,y:e.y,w:e.kind==='planta'?24:19,h:e.kind==='planta'?30:16,baseY:e.y,kind:e.kind,dir:e.dir===1?1:-1,hp:validNum(e.hp,1,20)?e.hp:1,phase:0,alive:true,hit:0}:null);
 if(enemies)out.enemies=enemies;
 const holes=clean(raw.holes,80,h=>pos(h.x)&&validNum(h.w,16,800)?{x:h.x,w:h.w}:null);
 if(holes)out.holes=holes;
 const spikes=clean(raw.spikes,300,a=>pos(a.x)&&pos(a.y)&&validNum(a.w,16,800)?{x:a.x,y:a.y,w:a.w,h:12}:null);
 if(spikes)out.spikes=spikes;
 const springs=clean(raw.springs,200,a=>pos(a.x)&&pos(a.y)?{x:a.x,y:a.y,w:20,h:12,force:validNum(a.force,5,20)?a.force:10.5}:null);
 if(springs)out.springs=springs;
 if(raw.start&&pos(raw.start.x)&&pos(raw.start.y))out.start={x:raw.start.x,y:raw.start.y};
 if(validNum(raw.finish,0,out.width))out.finish=raw.finish;
 if(raw.items&&typeof raw.items==='object'){
  for(const name of ['pacifier','shoe','cube']){
   const item=raw.items[name];out.items[name]=item&&pos(item.x)&&pos(item.y)?{x:item.x,y:item.y,w:name==='shoe'?24:name==='cube'?22:22,h:name==='shoe'?23:name==='cube'?22:22}:null;
  }
 }
 if(raw.boss===null)out.boss=null;
 else if(raw.boss&&pos(raw.boss.x)&&pos(raw.boss.y))out.boss={...out.boss,x:raw.boss.x,y:raw.boss.y};
 return out;
}
// V28.2: arquivos JSON versionados no GitHub são a fonte oficial.
// Rascunhos do navegador só prevalecem no editor e no modo de teste.
const published=new Map();
async function preloadAll(){
 await Promise.all(Array.from({length:MAX_LEVEL},async(_,i)=>{
  const n=i+1;
  try{
   const response=await fetch('fases/fase-1-'+n+'.json',{cache:'no-cache'});
   if(!response.ok)throw Error('HTTP '+response.status);
   const raw=await response.json();
   if(raw.id&&raw.id!=='1-'+n)throw Error('ID incompatível: '+raw.id);
   published.set(n,sanitize(raw,n));
  }catch(err){console.warn('Fase 1-'+n+': JSON indisponível; usando mapa padrão.',err.message)}
 }));
}
function draft(level){
 try{const all=JSON.parse(localStorage.getItem(STORAGE)||'{}');return all['1-'+level]||null}catch(e){return null}
}
function load(level,options={}){
 const raw=options.draftFirst?draft(level)||published.get(level):published.get(level)||draft(level);
 if(!raw)return createDefault(level);
 const result=sanitize(raw,level);
 // Compatibilidade com mapas antigos da 1-1 sem a Super Chupeta.
 if(level===1&&!result.items.pacifier&&options.draftFirst&&draft(level))result.items.pacifier={x:490,y:142,w:22,h:22};
 return result;
}
function hasDraft(level){return !!draft(level)}
function hasPublished(level){return published.has(level)}
function save(level,map){const all=JSON.parse(localStorage.getItem(STORAGE)||'{}');all['1-'+level]=sanitize(map,level);localStorage.setItem(STORAGE,JSON.stringify(all));}
window.AURORA_LEVELS={createDefault,load,save,sanitize,clone,preloadAll,hasDraft,hasPublished,STORAGE,kinds,MAX_LEVEL};
})();
