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


## Versão 26 — Menu e controles
- Abertura pixel art com ilha, céu, logo e Aurora. Pressione Z, Enter ou qualquer tecla alfanumérica para avançar.
- Menu com INICIAR JOGO / COMO JOGAR? / CRÉDITOS DO PAPAI; setas para escolher, somente Z para confirmar.
- Telas de instruções e créditos provisórios com VOLTAR/FECHAR (Z).
- Z e seta para cima pulam; seta para baixo não agacha.
- Ao desbloquear Super Cuspe, C fecha o aviso; para pulo duplo, Z ou ↑ fecha o aviso.
- Música de vitória também ao concluir a fase 1-1.
- Editor de fases fica para a V27.


## Ajustes V26.1
- Cuspe normal: um disparo por pressionamento de C, sem repetição ao manter pressionado.
- Após desbloquear Super Chupeta: toque rápido C solta um cuspe normal ao liberar; segurar C carrega Super Cuspe, disparado ao liberar.
- Super Cuspe atravessa até 4 blocos quebráveis (antes 2).
- Transição 1-1 para 1-2: aguarda no mínimo 5 segundos na tela de vitória antes de aceitar Z/Enter.


## V26.2
Super Cuspe atravessa e pode derrotar até 2 inimigos comuns no mesmo disparo. Cuspe normal permanece limitado a 1 inimigo. Mantidos 4 blocos para o Super Cuspe.

## V26.3 — Ajustes finos sem editar o código

Abra `configuracoes.html` para editar parâmetros de Aurora, cuspidas, Super Cuspe,
chefe, recompensas e duração da transição. Clique em **SALVAR ALTERAÇÕES**,
depois abra/recarregue `index.html`. O navegador armazena as preferências
localmente; exporte/import JSON para transportar os valores.

O arquivo `js/config.js` define os padrões e a validação; o jogo lê
`window.AURORA_CONFIG` ao carregar. Use um servidor local (`python3 -m http.server`)
se o navegador restringir o armazenamento ao abrir arquivos diretamente.

A tela de conclusão da fase 1-1 agora mostra somente **FASE CONCLUÍDA!**,
sem textos auxiliares nem botão, e passa automaticamente à fase 1-2
após o tempo configurado (5 segundos por padrão). O som de vitória continua tocando.

O editor visual de fases continua reservado para a V27.

## V27 — Editor visual de fases

Abra `editor.html` para criar e modificar mapas das fases 1-1 e 1-2 de forma independente.
O editor permite inserir, mover, duplicar e remover blocos, moedas, inimigos,
plataformas, itens especiais, buracos, chefe, ponto de início e chegada.

Ferramentas: selecionar, mover arrastando, apagar, zoom, grade de 16px, rolagem
horizontal, propriedades numéricas, camadas, validação básica de posições,
Ctrl+Z/Ctrl+Y, Ctrl+D, salvar no navegador, importar/exportar JSON e testar fase.

O botão **TESTAR FASE** salva o mapa e abre `index.html?testLevel=1` ou
`index.html?testLevel=2` diretamente no jogo, sem passar pelos menus.
No modo de teste da fase 1-2, Super Cuspe começa liberado (como após a fase 1-1),
mas o Pulo Duplo precisa ser coletado no sapatinho para permitir testar o item.
Na fase 1-1, a Super Chupeta ainda precisa ser coletada.

O jogo e o editor compartilham `js/levels.js`, que mantém as fases independentes.
Os dados são salvos no localStorage do navegador; exporte os JSON para backup.
Para testar de forma consistente, recomendamos um servidor local:

    python3 -m http.server 8000

Acesse `http://localhost:8000/editor.html`.

## V28 — Novos elementos e inimigos

**Cinco objetos no editor:** Bloco de metal (inquebrável mesmo com Super Cuspe),
plataforma móvel horizontal, plataforma móvel vertical, espinhos (1 coração por
contato, respeitando a invulnerabilidade) e mola (impulso vertical).

**Dois inimigos:** Ratinho cinza de óculos escuros (patrulha terrestre) e planta
carnívora em vaso verde (fica parada, abre e fecha a boca e causa dano por contato).

Abra `editor.html`, escolha a ferramenta ou selecione `Inimigo` e o novo tipo.
As plataformas móveis têm `Distância do movimento` e `Velocidade`; os espinhos
têm largura configurável e a mola tem força de impulso configurável.
Todos os elementos são salvos junto ao mapa em JSON e funcionam no teste direto
da fase selecionada.

Nenhum dos novos objetos foi inserido automaticamente nos mapas antigos.
Assim, o layout das fases existentes é preservado até você decidir utilizá-los.


## V28 — Expansão para seis fases (1-1 até 1-6)

As fases **1-3, 1-4, 1-5 e 1-6** começam com o mesmo mapa-base da 1-1,
mas são independentes: o editor oferece seis opções no seletor de fase,
com rascunhos, exportação/importação JSON e **TESTAR FASE** direto para qualquer uma.
No jogo normal, a sequência é 1-1 → 1-2 → 1-3 → 1-4 → 1-5 → 1-6 → vitória.
Cada transição mantém a tela **FASE CONCLUÍDA!** durante cinco segundos
(ou o valor definido em `configuracoes.html`).
Corações, pontuação e poderes são mantidos na passagem entre fases.
Super Chupeta fica na 1-1; Sapatinho Rosa fica na 1-2.
As quatro fases novas não contêm novos itens especiais por padrão.
No teste direto, fases 1-3 a 1-6 começam com ambos os poderes desbloqueados.

O armazenamento das fases continua usando a chave `aurora-levels-v27`,
para preservar os rascunhos já feitos no editor anterior.

## V28 — Cubo mágico de invencibilidade

Novo objeto **Cubo mágico (invencibilidade)** disponível na ferramenta do
`editor.html` em qualquer uma das seis fases. O cubo é um item único por fase:
pode ser movido, excluído e exportado/importado com o mapa JSON.

Ao tocar no cubo, Aurora recebe **invencibilidade até o final da fase atual**:
- Encostar em qualquer inimigo comum o elimina imediatamente (inclusive ratinho
  e planta carnívora); tocar no Super Sapo Rei também o derrota.
- Espinhos e ataques por contato não retiram corações.
- Blocos, plataformas fixas ou móveis, molas, física e obstáculos permanecem
  com o mesmo comportamento de antes.
- O efeito é indicado por um contorno luminoso e pelo texto `INVENCÍVEL` no HUD.
- O poder não é transportado à próxima fase; cada fase pode ter seu próprio cubo.

O efeito é permanente **durante a fase** por padrão, pois não foi especificado
um tempo de duração.

## V28 — Correção da Super Chupeta na fase 1-1
- A Super Chupeta aparece agora no começo da fase 1-1, em X=490 e Y=142,
  para facilitar o teste do Super Cuspe.
- Se um rascunho antigo da fase 1-1 tiver perdido a chupeta, o carregamento
  recupera o item automaticamente sem apagar o restante do mapa personalizado.
- Corrigida a inicialização dos poderes ao começar uma nova partida.
- O desenho da chupeta tem alternativa em pixel art caso o PNG não carregue.
- Para testar: abra o editor, escolha 1-1, clique em TESTAR FASE e avance
  até a plataforma perto de X=490.

## V28 — Créditos finais (fase 1-6)
Ao concluir a fase 1-6, a tela FASE CONCLUÍDA! aparece pelo tempo configurado e então inicia a rolagem dos créditos finais com o texto fornecido pelo autor, incluindo o Hino Nacional. O texto pode ser alterado em `configuracoes.html` e é salvo no navegador, com exportação/importação JSON.

A trilha exclusiva será adicionada depois: coloque `creditos.mp3` em `assets/audio/`. A tela funciona mesmo sem o arquivo. Os botões permitem reiniciar a rolagem, retornar ao menu e alternar som. A tecla Enter ou Escape retorna ao menu.

## V28 — Configurações de áudio
A seção **ÁUDIO** em `configuracoes.html` permite ajustar o volume de
músicas (0–100%), efeitos (0–100%) e silenciar o jogo. Os valores são
salvos no navegador e exportados/importados com as configurações JSON.
Os áudios ainda não integrados não começam a funcionar apenas por serem
copiados para `assets/audio/`; os eventos correspondentes precisam ser
programados em uma atualização futura.

## Fases verticais — planejamento
O jogo continua com câmera e editor predominantemente horizontais.
Fases verticais e mistas são possíveis, mas requerem ampliação do mapa
no eixo Y, câmera vertical e ferramentas de navegação no editor.

## V28.1 — Créditos finais
- Texto sobe duas vezes mais rápido do que na V28.
- Segure **Z** para acelerar a rolagem novamente (2× sobre a velocidade V28.1); solte para voltar à velocidade normal.
- Ao terminar a animação, aguarda **3 segundos** e retorna à tela inicial (splash).
- Música dos créditos: `assets/audio/creditos.mp3`. Se o arquivo não existir, os créditos continuam silenciosos.
- O botão de reiniciar créditos reinicia também a contagem de retorno.
