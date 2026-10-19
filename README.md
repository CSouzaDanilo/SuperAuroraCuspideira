# SUPER AURORA CUSPIDEIRA — V25

- Blocos comuns: tijolos marrons.
- Blocos rachados: amarelos.
- Blocos surpresa removidos do mapa, sem substituir por outros.
- Mecânicas de pulo duplo, colisão e cuspe mantidas.

Abra `index.html` para jogar.


V11: novos sprites de barata, joaninha, besouro e caramujo, extraídos da nova folha, fundo transparente, alinhamento padronizado e ciclo de quatro quadros sem repetição incorreta. Outros inimigos preservados.


## Versão 12 — mudanças no level design
- Trecho 1: removidas plataformas P120 e P250; P805 substituída por escada de colunas com 2, 3 e 4 blocos de tijolos.
- Trecho 2: removidas todas as plataformas entre x=1184 e x=2368; adicionados pares de blocos empilhados em x=1760 e x=1950.
- Trecho 3: removidas P2840 e a joaninha em x=2870; buraco de 64 pixels entre x=2850 e x=2914.
- Inimigos terrestres mudam de direção antes do buraco.


## Versão 13
- Buraco com fundo escuro opaco, bordas amarelas, placas listradas e seta de alerta.
- Aurora: todos os quadros recortados individualmente, centralizados e alinhados pelos pés em canvas 120×160 transparente; renderização 36×48.


## Áudio — versão 14
Os 7 arquivos MP4 enviados foram convertidos em MP3 e integrados em `assets/audio/`.
- `feira.mp3`: música de fundo em loop; pausa com o jogo e respeita SOM ON/OFF.
- `cuspe.mp3`: Aurora cuspindo.
- `dano.mp3`: Aurora recebendo dano.
- `inimigo.mp3`: inimigo derrotado.
- `pulo.mp3`: primeiro salto.
- `pulo_duplo.mp3`: segundo salto.
- `vitoria.mp3`: conclusão da fase.
Os sons originais sintetizados continuam para moedas e blocos, pois não foram enviados áudios para esses eventos.

Versão 15: removido o efeito sonoro de derrotar inimigo (arquivo e chamadas).


Versão 17: baseada na V15; efeitos em WAV com silêncio inicial removido, pré-carregados, sem alterar a música MP3.


## V18 — recompensa por todas as moedas
Ao coletar todas as moedas da fase, Aurora recebe +1 vida e desbloqueia o Super Cuspe. Uma tela de tutorial pausa o jogo e explica o comando. Após confirmar com ENTER ou ENTENDI, um toque rápido em C lança o cuspe comum; segurar C por aproximadamente 0,6 segundo e soltar lança o Super Cuspe. O disparo especial derrota qualquer inimigo em um hit e destrói até dois blocos consecutivos, atravessando o primeiro. Uma barra de carga aparece acima da Aurora.


## Versão 19
- Chupeta especial na plataforma em x=1720: libera Super Cuspe (segure C, solte para disparar).
- Duas ultimas moedas removidas. Todas as moedas concedem +1 coracao, sem liberar o poder.
- A chegada da fase 1-1 inicia a fase 1-2, repetindo o mapa e preservando coracoes e poder.
- Aviso do buraco: placa triangular amarela com borda preta, sem seta.


## Versão 20
- Super Cuspe agora é uma esfera azul com brilho, mantendo o dano especial e alcance de até dois blocos.
- SUPER SAPO antes da faixa de chegada nas fases 1-1 e 1-2: 8 pontos de vida; cuspe normal causa 1, Super Cuspe causa 2, danos acumulam. Barra de vida visível.
- A conclusão da fase exige derrotar o Super Sapo.
- Colisão preditiva entre inimigos: eles invertem o sentido ao se encontrar, sem atravessar uns aos outros.
- Sons da versão 19 preservados.


V22: fundo da feira com predominância amarela, todos os blocos marrons, nova Super Chupeta pixel art rosa/dourada na fase 1-1 e sapatinho rosa na fase 1-2 sobre plataforma central. Pulo duplo bloqueado até coletar sapatinho; tela de instruções ao coletar. Poderes persistem entre fases.


V23: removidas as caixas decorativas vermelhas/verdes do primeiro plano; adicionada parede de tijolos marrons (2 colunas x 5 blocos) apos a plataforma da Super Chupeta, destrutivel com cuspe. A mesma barreira fica na fase 1-2.


V25: Seta para baixo agacha Aurora enquanto estiver no chao; agachada ela fica parada e cospe numa altura menor. Parede apos a Super Chupeta aumentada de 5 para 7 blocos de altura, mantendo 2 colunas. Removida a moeda sobreposta a barreira, com contagem total atualizada automaticamente.
