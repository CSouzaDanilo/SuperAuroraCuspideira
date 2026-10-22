(()=>{'use strict';
const $=s=>document.querySelector(s),api=window.AURORA_LEVELS;
const canvas=$('#map'),g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
const bg=new Image();bg.src='assets/backgrounds/feira-de-rua.png';bg.onload=draw;
let level=1,data=api.load(level),selected=null,drag=null,history=[],future=[],offset=0;
const categories={blocks:'Blocos',platforms:'Plataformas',coins:'Moedas',enemies:'Inimigos',holes:'Buracos',items:'Itens',boss:'Chefe',start:'Início',finish:'Final'};
const visible=Object.fromEntries(Object.keys(categories).map(k=>[k,true]));
const colors={blocks:'#a85f39',platforms:'#e2a663',coins:'#ffe447',enemies:'#f75d76',holes:'#0c1126',items:'#7de3fa',boss:'#7ddd75',start:'#e8f5ff',finish:'#fa76c3'};
const clone=api.clone;
function setStatus(msg){$('#status').textContent=msg}
function snapshot(){history.push(clone(data));if(history.length>80)history.shift();future=[]}
function restore(stack,to){if(!stack.length)return;to.push(clone(data));data=stack.pop();selected=null;renderAll()}
function objects(){
 const a=[];
 for(const [type,key] of [['blocks','blocks'],['platforms','platforms'],['coins','coins'],['enemies','enemies'],['holes','holes']]){
  data[key].forEach((obj,i)=>a.push({type,key,index:i,obj}));
 }
 for(const type of ['pacifier','shoe'])if(data.items[type])a.push({type:'items',key:type,index:0,obj:data.items[type]});
 if(data.boss)a.push({type:'boss',key:'boss',index:0,obj:data.boss});
 a.push({type:'start',key:'start',index:0,obj:data.start});
 a.push({type:'finish',key:'finish',index:0,obj:{x:data.finish,y:0,w:5,h:data.ground}});
 return a;
}
function dims(it){
 const o=it.obj;
 if(it.type==='blocks')return [16,16];
 if(it.type==='coins')return [10,12];
 if(it.type==='enemies')return [19,16];
 if(it.type==='holes')return [o.w,216-data.ground+8];
 if(it.type==='start')return [17,29];
 if(it.type==='finish')return [8,50];
 if(it.type==='boss')return [55,53];
 return [o.w||22,o.h||22];
}
function pos(it){
 if(it.type==='holes')return {x:it.obj.x,y:data.ground};
 if(it.type==='finish')return {x:it.obj.x,y:data.ground-50};
 return {x:it.obj.x,y:it.obj.y};
}
function find(x,y){
 const arr=objects().filter(it=>visible[it.type]);
 for(let i=arr.length-1;i>=0;i--){
  const it=arr[i],p=pos(it),[w,h]=dims(it);
  if(x>=p.x-3&&x<=p.x+w+3&&y>=p.y-3&&y<=p.y+h+3)return it;
 }
 return null;
}
function snap(v){return $('#snap').checked?Math.round(v/16)*16:Math.round(v)}
function world(e){
 const r=canvas.getBoundingClientRect(),scale=Number($('#zoom').value),x=(e.clientX-r.left)*canvas.width/r.width/scale+offset,y=(e.clientY-r.top)*canvas.height/r.height/scale;
 return {x:Math.round(x),y:Math.round(y)};
}
function locate(it){if(!it)return null;return objects().find(o=>o.type===it.type&&o.key===it.key&&o.index===it.index)||null}
function move(it,x,y){
 const o=it.obj;
 if(it.type==='finish'){data.finish=Math.max(0,Math.min(data.width,Math.round(x)));return}
 o.x=Math.max(0,Math.min(data.width-8,snap(x)));
 if(it.type!=='holes')o.y=Math.max(-64,Math.min(216,snap(y)));
 if(it.type==='enemies')o.baseY=o.y;
}
function remove(it){
 if(!it||it.type==='start'||it.type==='finish')return;
 snapshot();
 if(['blocks','platforms','coins','enemies','holes'].includes(it.type))data[it.key].splice(it.index,1);
 else if(it.type==='items')data.items[it.key]=null;
 else if(it.type==='boss')data.boss=null;
 selected=null;renderAll();
}
function create(tool,x,y){
 snapshot();let it=null;const X=snap(x),Y=snap(y);
 if(tool==='block'){data.blocks.push({x:X,y:Y,w:16,h:16,type:0,hp:1,alive:true});it={type:'blocks',key:'blocks',index:data.blocks.length-1}}
 if(tool==='coin'){data.coins.push({x:X,y:Y,got:false});it={type:'coins',key:'coins',index:data.coins.length-1}}
 if(tool==='enemy'){const kind=$('#enemyKind').value;data.enemies.push({x:X,y:Y,w:19,h:16,baseY:Y,kind,dir:-1,hp:kind==='besouro'?3:kind==='caranguejo'?2:1,phase:0,alive:true,hit:0});it={type:'enemies',key:'enemies',index:data.enemies.length-1}}
 if(tool==='platform'){data.platforms.push({x:X,y:Y,w:80,h:8});it={type:'platforms',key:'platforms',index:data.platforms.length-1}}
 if(tool==='hole'){data.holes.push({x:X,w:64});it={type:'holes',key:'holes',index:data.holes.length-1}}
 if(tool==='pacifier'||tool==='shoe'){data.items[tool]={x:X,y:Y,w:tool==='shoe'?24:22,h:tool==='shoe'?23:22};it={type:'items',key:tool,index:0}}
 if(tool==='boss'){data.boss={x:X,y:Y,w:55,h:53,hp:8,maxHp:8,alive:true};it={type:'boss',key:'boss',index:0}}
 if(tool==='start'){data.start={x:X,y:Y};it={type:'start',key:'start',index:0}}
 if(tool==='finish'){data.finish=X;it={type:'finish',key:'finish',index:0}}
 selected=it?locate(it):null;renderAll();
}
function duplicate(){
 if(!selected||['start','finish','boss'].includes(selected.type))return;
 const it=selected;snapshot();const obj=clone(it.obj);obj.x+=16;
 if(it.type==='items'){setStatus('Itens únicos não podem ser duplicados.');history.pop();return}
 data[it.key].push(obj);selected=locate({type:it.type,key:it.key,index:data[it.key].length-1});renderAll();
}
function draw(){
 const z=Number($('#zoom').value),vw=canvas.width/z,vh=canvas.height/z;
 const max=Math.max(0,data.width-vw);offset=Math.max(0,Math.min(max,offset));
 g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,canvas.width,canvas.height);
 g.save();g.scale(z,z);g.translate(-offset,0);
 g.fillStyle='#9adcf2';g.fillRect(offset,0,vw,vh);
 if(bg.complete&&bg.naturalWidth){
  const sw=Math.min(1120,bg.naturalWidth),sh=Math.min(550,bg.naturalHeight);
  const sx=Math.min(Math.max(0,bg.naturalWidth-sw),offset*.26);
  g.drawImage(bg,sx,0,sw,sh,offset,0,vw,data.ground);
 }
 g.fillStyle='#8d553a';g.fillRect(offset,data.ground,vw,216-data.ground);
 g.fillStyle='#c6a078';g.fillRect(offset,data.ground,vw,3);
 for(const hole of data.holes){if(!visible.holes)continue;g.fillStyle='#0b1021';g.fillRect(hole.x,data.ground,hole.w,216-data.ground);g.strokeStyle='#ffb13e';g.lineWidth=1;g.strokeRect(hole.x,data.ground,hole.w,216-data.ground)}
 if($('#grid').checked){g.beginPath();g.strokeStyle='#182b4855';g.lineWidth=.5;for(let x=Math.floor(offset/16)*16;x<offset+vw;x+=16){g.moveTo(x,0);g.lineTo(x,216)}for(let y=0;y<=216;y+=16){g.moveTo(offset,y);g.lineTo(offset+vw,y)}g.stroke()}
 for(const it of objects()){
  if(!visible[it.type]||it.type==='holes')continue;
  const p=pos(it),[w,h]=dims(it);if(p.x+w<offset||p.x>offset+vw)continue;
  g.fillStyle=colors[it.type];g.strokeStyle='#17233e';g.lineWidth=1;
  if(it.type==='coins'){g.beginPath();g.ellipse(p.x+5,p.y+6,4,6,0,0,Math.PI*2);g.fill();g.stroke()}
  else if(it.type==='enemies'){g.fillRect(p.x,p.y,w,h);g.strokeRect(p.x,p.y,w,h);g.fillStyle='#ffffff';g.font='7px monospace';g.fillText(it.obj.kind.slice(0,3),p.x+1,p.y+10)}
  else if(it.type==='items'){g.fillRect(p.x,p.y,w,h);g.strokeRect(p.x,p.y,w,h);g.fillStyle='#111';g.font='8px monospace';g.fillText(it.key==='shoe'?'S':'C',p.x+8,p.y+13)}
  else if(it.type==='finish'){g.fillRect(p.x,p.y,3,50);g.fillRect(p.x+3,p.y,20,10)}
  else if(it.type==='start'){g.fillRect(p.x,p.y,w,h);g.fillStyle='#101a36';g.font='8px monospace';g.fillText('A',p.x+5,p.y+16)}
  else{g.fillRect(p.x,p.y,w,h);g.strokeRect(p.x,p.y,w,h)}
 }
 if(selected){const it=locate(selected);if(it){const p=pos(it),[w,h]=dims(it);g.strokeStyle='#fff';g.lineWidth=2;g.setLineDash([3,2]);g.strokeRect(p.x-2,p.y-2,w+4,h+4);g.setLineDash([])}}
 g.restore();
 $('#offset').textContent='X '+Math.round(offset);
 $('#viewport').textContent='Mapa '+data.width+' × 216 · '+objects().length+' objetos';
 $('#scroll').max=Math.ceil(max);$('#scroll').value=Math.round(offset);
}
function propertyPanel(){
 const box=$('#props');box.replaceChildren();
 const it=locate(selected);if(!it){box.textContent='Selecione um objeto no mapa para alterar as propriedades.';return}
 selected=it;
 const heading=document.createElement('strong');heading.textContent=(categories[it.type]||'Item')+' · '+it.key;box.append(heading);
 const fields=[['x','Posição X',0,data.width]];
 if(it.type!=='holes'&&it.type!=='finish')fields.push(['y','Posição Y',-64,216]);
 if(it.type==='platforms'||it.type==='holes')fields.push(['w','Largura',16,1200]);
 if(it.type==='blocks')fields.push(['hp','Resistência',1,20]);
 if(it.type==='enemies')fields.push(['hp','Vida',1,20]);
 for(const [key,label,min,max] of fields){
  const wrap=document.createElement('label'),input=document.createElement('input');wrap.textContent=label;
  input.type='number';input.min=min;input.max=max;input.step=1;
  input.value=it.type==='finish'?data.finish:it.obj[key];
  input.onchange=()=>{const n=Number(input.value);if(!Number.isFinite(n)||n<min||n>max){setStatus('Valor inválido para '+label);propertyPanel();return}snapshot();
   if(it.type==='finish')data.finish=n;else{it.obj[key]=n;if(it.type==='enemies'&&key==='y')it.obj.baseY=n}
   renderAll();
  };
  wrap.append(input);box.append(wrap);
 }
 if(it.type==='enemies'){
  const wrap=document.createElement('label'),sel=document.createElement('select');wrap.textContent='Tipo';
  for(const kind of api.kinds){const o=document.createElement('option');o.value=kind;o.textContent=kind;sel.append(o)}
  sel.value=it.obj.kind;sel.onchange=()=>{snapshot();it.obj.kind=sel.value;renderAll()};wrap.append(sel);box.append(wrap);
 }
}
function validate(){
 const problems=[];
 if(data.start.x>=data.finish)problems.push('Início está depois da chegada.');
 if(data.items.pacifier&&level===2)problems.push('Super Chupeta posicionada na fase 1-2 (o jogo usa apenas na 1-1).');
 if(data.items.shoe&&level===1)problems.push('Sapatinho posicionado na fase 1-1 (o jogo usa apenas na 1-2).');
 for(const it of objects()){
  if(it.type==='holes')continue;
  const p=pos(it),[w,h]=dims(it);
  if(p.x<0||p.x+w>data.width)problems.push('Objeto '+it.key+' fora dos limites horizontais.');
  if(it.type==='items'&&data.blocks.some(b=>p.x<b.x+16&&p.x+w>b.x&&p.y<b.y+16&&p.y+h>b.y))problems.push('Item '+it.key+' sobreposto a um bloco.');
  if(it.type==='enemies'&&data.holes.some(h=>p.x>=h.x&&p.x<h.x+h.w))problems.push('Inimigo em cima de um buraco, x='+Math.round(p.x));
 }
 const box=$('#warnings');box.replaceChildren();
 if(!problems.length){box.textContent='✓ Nenhum problema básico detectado.';return}
 for(const issue of [...new Set(problems)].slice(0,30)){const p=document.createElement('p');p.textContent='⚠ '+issue;box.append(p)}
}
function renderAll(){draw();propertyPanel();validate()}
function switchPhase(n){level=n;data=api.load(level);selected=null;history=[];future=[];offset=0;renderAll();setStatus('Fase 1-'+level+' carregada.')}
canvas.addEventListener('pointerdown',e=>{
 if(e.button!==0&&e.button!==1)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);
 const {x,y}=world(e);
 if(e.shiftKey||e.button===1){drag={pan:true,px:e.clientX,from:offset};return}
 const tool=$('#tool').value,hit=find(x,y);
 if(tool==='erase'){if(hit)remove(hit);return}
 if(tool!=='select'){create(tool,x,y);return}
 selected=hit;if(hit){snapshot();const p=pos(hit);drag={it:hit,dx:x-p.x,dy:y-p.y};}renderAll();
});
canvas.addEventListener('pointermove',e=>{
 const p=world(e);$('#coord').textContent='X: '+p.x+'  Y: '+p.y;
 if(!drag)return;
 if(drag.pan){const r=canvas.getBoundingClientRect(),z=Number($('#zoom').value);offset=drag.from-(e.clientX-drag.px)*canvas.width/r.width/z;draw();return}
 const it=locate(drag.it);if(!it)return;move(it,p.x-drag.dx,p.y-drag.dy);selected=it;draw();
});
function endDrag(){drag=null;renderAll()}
canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
canvas.addEventListener('wheel',e=>{e.preventDefault();offset+=e.deltaY>0?80:-80;draw()},{passive:false});
$('#phase').onchange=e=>{if(history.length&&!confirm('Trocar de fase? Salve o rascunho antes para não perder alterações.')){e.target.value=String(level);return}switchPhase(Number(e.target.value))};
$('#zoom').onchange=draw;$('#snap').onchange=draw;$('#grid').onchange=draw;
$('#scroll').oninput=e=>{offset=Number(e.target.value);draw()};
$('#undo').onclick=()=>restore(history,future);$('#redo').onclick=()=>restore(future,history);
$('#delete').onclick=()=>remove(locate(selected));$('#duplicate').onclick=duplicate;
$('#save').onclick=()=>{try{api.save(level,data);history=[];future=[];setStatus('Fase 1-'+level+' salva no navegador.')}catch(e){setStatus('Falha ao salvar: '+e.message)}};
$('#export').onclick=()=>{
 const clean=api.sanitize(data,level),blob=new Blob([JSON.stringify(clean,null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='aurora-fase-1-'+level+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setStatus('Mapa exportado em JSON.');
};
$('#import').onclick=()=>$('#importFile').click();
$('#importFile').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{const json=JSON.parse(await file.text());snapshot();data=api.sanitize(json,level);selected=null;renderAll();setStatus('Mapa importado. Salve para testar.')}catch(err){setStatus('Erro na importação: '+err.message)}e.target.value=''};
$('#test').onclick=()=>{try{api.save(level,data);window.open('index.html?testLevel='+level,'_blank');setStatus('Rascunho salvo. Abrindo teste direto da fase 1-'+level+'.')}catch(e){setStatus('Não foi possível iniciar teste: '+e.message)}};
$('#reset').onclick=()=>{if(!confirm('Restaurar a fase 1-'+level+' ao mapa original?'))return;snapshot();data=api.createDefault(level);selected=null;renderAll();setStatus('Mapa original restaurado no editor. Salve para aplicar.')};
for(const [key,label] of Object.entries(categories)){
 const row=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.checked=true;cb.onchange=()=>{visible[key]=cb.checked;draw()};row.append(cb,' '+label);$('#layers').append(row);
}
window.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.code==='KeyZ'){e.preventDefault();restore(history,future)}
 else if((e.ctrlKey||e.metaKey)&&e.code==='KeyY'){e.preventDefault();restore(future,history)}
 else if((e.ctrlKey||e.metaKey)&&e.code==='KeyD'){e.preventDefault();duplicate()}
 else if((e.code==='Delete'||e.code==='Backspace')&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();remove(locate(selected))}
});
renderAll();
})();