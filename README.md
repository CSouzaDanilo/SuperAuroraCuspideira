# SUPER AURORA CUSPIDEIRA — V10

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
