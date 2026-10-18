// Sprites carregados como arquivos PNG locais. Sem dependências externas.
const SPRITES = {};
const NEW_ENEMIES = {barata:4,joaninha:4,caramujo:4,besouro:4};
const CURATED = {barata:4,joaninha:5,caramujo:3,sapo:3,lesma:2,besouro:4,caranguejo:2};
function loadSprites(){
  const groups = {
    aurora: {idle:5,walk:6,run:5,jump:6,spit:5,hurt:5,victory:3},
    inimigos: {barata:7,caranguejo:6,sapo:8,caramujo:7,lesma:6,joaninha:7,besouro:7,espinho:2}
  };
  for(const [folder,types] of Object.entries(groups)){
    for(const [name,count] of Object.entries(types)){
      const key=folder==='aurora'?'aurora_'+name:name;
      SPRITES[key]=[];
      for(let i=0;i<count;i++){
        const img=new Image();
        img.src=folder==='inimigos' && NEW_ENEMIES[name] ? `assets/sprites/novos/${name}/${name}_${String(i % NEW_ENEMIES[name]).padStart(2,'0')}.png` : folder==='inimigos' && CURATED[name] ? `assets/sprites/refinados/${name}/${name}_${String(i % CURATED[name]).padStart(2,'0')}.png` : `assets/sprites/${folder}/${name}_${String(i).padStart(2,'0')}.png`;
        SPRITES[key].push(img);
      }
    }
  }
}
function sprite(ctx,key,frame,x,y,w,h,flip=false){
 const arr=SPRITES[key];if(!arr||!arr.length)return false;
 const img=arr[Math.floor(frame)%arr.length];if(!img.complete||!img.naturalWidth)return false;
 ctx.save();if(flip){ctx.translate(x+w,0);ctx.scale(-1,1);ctx.drawImage(img,0,y,w,h)}
 else ctx.drawImage(img,x,y,w,h);ctx.restore();return true;
}
loadSprites();
