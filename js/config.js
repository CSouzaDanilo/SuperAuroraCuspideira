/* Configuração de jogabilidade. Altere aqui ou use configuracoes.html.
   O painel guarda as preferências no navegador e permite exportar/importar JSON.
   Valores validados são aplicados quando index.html é recarregado. */
(function(){
'use strict';
const defaults={
 player:{initialHearts:3,maxSpeed:2.25,acceleration:0.42,friction:0.72,
  jumpForce:6.7,doubleJumpForce:6.1,gravity:0.32,maxFallSpeed:6.5,
  coyoteFrames:6,invulnerabilityFrames:80},
 normalSpit:{maxEnemies:1,maxBlocks:1,enemyDamage:1,blockDamage:1,bossDamage:1,cooldownFrames:18},
 superSpit:{maxEnemies:2,maxBlocks:4,enemyDamage:4,bossDamage:2,chargeFrames:36,chargeMaxFrames:65,cooldownFrames:28},
 boss:{health:8},
 transitions:{victoryDelayMs:5000},
 rewards:{coinPoints:50,blockPoints:75,enemyPoints:150,bossPoints:1200,stagePoints:1000,allCoinsPoints:500,allCoinsHearts:1}
};
const ranges={
 'player.initialHearts':[1,10,1],'player.maxSpeed':[0.5,6,0.05],'player.acceleration':[0.05,1.5,0.01],
 'player.friction':[0.3,0.99,0.01],'player.jumpForce':[3,12,0.1],'player.doubleJumpForce':[3,12,0.1],
 'player.gravity':[0.1,1,0.01],'player.maxFallSpeed':[3,15,0.1],'player.coyoteFrames':[0,20,1],
 'player.invulnerabilityFrames':[0,240,1],
 'normalSpit.maxEnemies':[1,6,1],'normalSpit.maxBlocks':[1,6,1],'normalSpit.enemyDamage':[1,10,1],
 'normalSpit.blockDamage':[1,10,1],'normalSpit.bossDamage':[1,10,1],'normalSpit.cooldownFrames':[0,100,1],
 'superSpit.maxEnemies':[1,10,1],'superSpit.maxBlocks':[1,15,1],'superSpit.enemyDamage':[1,20,1],
 'superSpit.bossDamage':[1,20,1],'superSpit.chargeFrames':[1,120,1],
 'superSpit.chargeMaxFrames':[1,180,1],'superSpit.cooldownFrames':[0,100,1],
 'boss.health':[1,50,1],'transitions.victoryDelayMs':[1000,20000,500],
 'rewards.coinPoints':[0,1000,10],'rewards.blockPoints':[0,1000,5],
 'rewards.enemyPoints':[0,2000,10],'rewards.bossPoints':[0,10000,50],
 'rewards.stagePoints':[0,10000,50],'rewards.allCoinsPoints':[0,5000,50],
 'rewards.allCoinsHearts':[0,5,1]
};
function sanitize(raw){
 const result=JSON.parse(JSON.stringify(defaults));
 for(const [path,[min,max,step]] of Object.entries(ranges)){
  const [section,key]=path.split('.');
  const v=raw&&raw[section]&&raw[section][key];
  if(typeof v==='number'&&Number.isFinite(v)){
   const clamped=Math.max(min,Math.min(max,v));
   result[section][key]=Number((Math.round((clamped-min)/step)*step+min).toFixed(4));
  }
 }
 result.superSpit.chargeMaxFrames=Math.max(result.superSpit.chargeFrames,result.superSpit.chargeMaxFrames);
 return result;
}
let stored=null;
try{stored=JSON.parse(localStorage.getItem('aurora-config-v1')||'null')}catch(e){}
window.AURORA_CONFIG=sanitize(stored);
window.AURORA_CONFIG_API={defaults,ranges,sanitize,storageKey:'aurora-config-v1'};
})();
