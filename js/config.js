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
 audio:{musicVolume:30,effectsVolume:70,muted:false},
 boss:{health:8,frogJumpForce:4.5,frogJumpInterval:66,snakeJumpForce:7.0,snakeJumpInterval:66,gravity:0.34,moveSpeed:1},
 enemies:{speedMultiplier:1,fallGravity:0.36},
 // Cada espécie tem parâmetros próprios. Ao criar uma espécie nova, registre-a aqui e no editor.
 enemy_barata:{speed:0.42,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_joaninha:{speed:0.42,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_caramujo:{speed:0.42,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_sapo:{speed:0.42,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_lesma:{speed:0.18,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_besouro:{speed:0.6,health:3,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_caranguejo:{speed:0.42,health:2,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_ratinho:{speed:0.85,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1},
 enemy_planta:{speed:0,health:1,gravity:0.36,stompDamage:1,spitDamageMultiplier:1,wakeDistance:145,sleepDistance:190},
 boss_sapo_rei:{health:8,jumpForce:4.5,jumpInterval:66,gravity:0.34,moveSpeed:1,stompDamage:0,normalSpitDamage:1,superSpitDamage:2},
 boss_cobra_mola:{health:8,jumpForce:7,jumpInterval:66,gravity:0.34,moveSpeed:1,stompDamage:1,normalSpitDamage:0,superSpitDamage:0},
 camera:{followOffset:110},
 credits:{speedMultiplier:1},
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
 'audio.musicVolume':[0,100,1],'audio.effectsVolume':[0,100,1],
 'boss.health':[1,50,1],
 'boss.frogJumpForce':[2,8,0.1],'boss.frogJumpInterval':[20,180,1],
 'boss.snakeJumpForce':[3,12,0.1],'boss.snakeJumpInterval':[20,180,1],
 'boss.gravity':[0.15,0.8,0.01],'boss.moveSpeed':[0.25,2.5,0.05],
 'enemies.speedMultiplier':[0.25,3,0.05],'enemies.fallGravity':[0.1,1,0.01],
 'enemy_barata.speed':[0,3,0.01],'enemy_barata.health':[1,30,1],'enemy_barata.gravity':[0.05,1.5,0.01],'enemy_barata.stompDamage':[0,30,1],'enemy_barata.spitDamageMultiplier':[0,10,0.25],
 'enemy_joaninha.speed':[0,3,0.01],'enemy_joaninha.health':[1,30,1],'enemy_joaninha.gravity':[0.05,1.5,0.01],'enemy_joaninha.stompDamage':[0,30,1],'enemy_joaninha.spitDamageMultiplier':[0,10,0.25],
 'enemy_caramujo.speed':[0,3,0.01],'enemy_caramujo.health':[1,30,1],'enemy_caramujo.gravity':[0.05,1.5,0.01],'enemy_caramujo.stompDamage':[0,30,1],'enemy_caramujo.spitDamageMultiplier':[0,10,0.25],
 'enemy_sapo.speed':[0,3,0.01],'enemy_sapo.health':[1,30,1],'enemy_sapo.gravity':[0.05,1.5,0.01],'enemy_sapo.stompDamage':[0,30,1],'enemy_sapo.spitDamageMultiplier':[0,10,0.25],
 'enemy_lesma.speed':[0,3,0.01],'enemy_lesma.health':[1,30,1],'enemy_lesma.gravity':[0.05,1.5,0.01],'enemy_lesma.stompDamage':[0,30,1],'enemy_lesma.spitDamageMultiplier':[0,10,0.25],
 'enemy_besouro.speed':[0,3,0.01],'enemy_besouro.health':[1,30,1],'enemy_besouro.gravity':[0.05,1.5,0.01],'enemy_besouro.stompDamage':[0,30,1],'enemy_besouro.spitDamageMultiplier':[0,10,0.25],
 'enemy_caranguejo.speed':[0,3,0.01],'enemy_caranguejo.health':[1,30,1],'enemy_caranguejo.gravity':[0.05,1.5,0.01],'enemy_caranguejo.stompDamage':[0,30,1],'enemy_caranguejo.spitDamageMultiplier':[0,10,0.25],
 'enemy_ratinho.speed':[0,3,0.01],'enemy_ratinho.health':[1,30,1],'enemy_ratinho.gravity':[0.05,1.5,0.01],'enemy_ratinho.stompDamage':[0,30,1],'enemy_ratinho.spitDamageMultiplier':[0,10,0.25],
 'enemy_planta.wakeDistance':[40,400,5],'enemy_planta.sleepDistance':[50,500,5],'enemy_planta.speed':[0,3,0.01],'enemy_planta.health':[1,30,1],'enemy_planta.gravity':[0.05,1.5,0.01],'enemy_planta.stompDamage':[0,30,1],'enemy_planta.spitDamageMultiplier':[0,10,0.25],
 'boss_sapo_rei.health':[1,50,1],
 'boss_sapo_rei.jumpForce':[0,15,0.1],
 'boss_sapo_rei.jumpInterval':[10,240,1],
 'boss_sapo_rei.gravity':[0.1,1.5,0.01],
 'boss_sapo_rei.moveSpeed':[0,4,0.05],
 'boss_sapo_rei.stompDamage':[0,50,1],
 'boss_sapo_rei.normalSpitDamage':[0,50,1],
 'boss_sapo_rei.superSpitDamage':[0,50,1],
 'boss_cobra_mola.health':[1,50,1],
 'boss_cobra_mola.jumpForce':[0,15,0.1],
 'boss_cobra_mola.jumpInterval':[10,240,1],
 'boss_cobra_mola.gravity':[0.1,1.5,0.01],
 'boss_cobra_mola.moveSpeed':[0,4,0.05],
 'boss_cobra_mola.stompDamage':[0,50,1],
 'boss_cobra_mola.normalSpitDamage':[0,50,1],
 'boss_cobra_mola.superSpitDamage':[0,50,1],
 'camera.followOffset':[40,260,5],'credits.speedMultiplier':[0.5,4,0.1],'transitions.victoryDelayMs':[1000,20000,500],
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
 if(raw&&raw.audio&&typeof raw.audio.muted==='boolean')result.audio.muted=raw.audio.muted;
 result.superSpit.chargeMaxFrames=Math.max(result.superSpit.chargeFrames,result.superSpit.chargeMaxFrames);
 return result;
}
let stored=null;
try{stored=JSON.parse(localStorage.getItem('aurora-config-v1')||'null')}catch(e){}
// Migração dos ajustes antigos do painel para os perfis individuais.
if(stored && stored.boss && !stored.boss_sapo_rei){
 stored.boss_sapo_rei={health:stored.boss.health,jumpForce:stored.boss.frogJumpForce,jumpInterval:stored.boss.frogJumpInterval,gravity:stored.boss.gravity,moveSpeed:stored.boss.moveSpeed};
}
if(stored && stored.boss && !stored.boss_cobra_mola){
 stored.boss_cobra_mola={health:stored.boss.health,jumpForce:stored.boss.snakeJumpForce,jumpInterval:stored.boss.snakeJumpInterval,gravity:stored.boss.gravity,moveSpeed:stored.boss.moveSpeed};
}
window.AURORA_CONFIG=sanitize(stored);
window.AURORA_CONFIG_API={defaults,ranges,sanitize,storageKey:'aurora-config-v1'};
})();
