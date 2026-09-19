import { buildLevel } from './build.js';

// Fase 10 do Bairro do Kem — "Entre as paredes". Fecha o bairro e ensina o
// wall jump: no ar, encostado numa parede, A lança o Kem pro lado oposto.
// Numa chaminé (vão de 3 ou 4 tiles entre duas paredes) isso dá pra subir
// pulando de parede em parede — paredes de 6 tiles ou mais só sobem assim,
// a beirada (fase 7) não alcança. Três chaminés, revisando a beirada no
// meio, e a última combinando o wall jump com vapor. A mais desafiadora do
// bairro, mas com checkpoint no pé de cada obstáculo difícil.
export const BAIRRO_10 = buildLevel({
  id: 'bairro-10',
  name: 'Entre as paredes',
  height: 15,
  targetTime: 46,
  sections: [
    // 1) A dica de wall jump e a primeira chaminé: baixa e larga (vão de 3
    //    tiles, sobe 6). A parede esquerda "flutua" (dá pra andar por baixo
    //    dela até o vão); a parede direita encosta no chão e é o que de
    //    fato bloqueia o caminho — só sobe pulando de parede em parede. O
    //    adesivo fica numa reentrância na parede esquerda, a meio caminho —
    //    a parede "falta" um tile ali, fechada por trás.
    {
      bands: [
        [0, 6, '......................'],
        [7, 7, '........#...##########'],
        [8, 9, '.......#....#.........'],
        [10, 11, '........#...#.........'],
        [12, 12, '.S..........#.........'],
        [13, 14, '######################'],
      ],
      entities: [
        { type: 'tutorial', tx: 2, ty: 12, w: 6, move: 'walljump', text: 'No ar, encostado na parede, toque A (ou Espaço) pra pular pro outro lado!' },
        { type: 'checkpoint', id: 'cp0', tx: 7, ty: 12 },
        { type: 'coin', id: 'c01', tx: 1, ty: 12 },
        { type: 'coin', id: 'c02', tx: 4, ty: 12 },
        { type: 'sticker', id: 's1', tx: 8, ty: 8 },
        { type: 'coin', id: 'c03', tx: 17, ty: 6 },
      ],
    },
    // 2) Revisão da beirada (fase 7): um prédio de 5 tiles, comum, sem
    //    wall jump. O checkpoint fica no pé dele.
    {
      bands: [
        [0, 7, '................'],
        [8, 12, '..........######'],
        [13, 14, '################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 8, ty: 12 },
        { type: 'coin', id: 'c09', tx: 12, ty: 7 },
        { type: 'coin', id: 'c04', tx: 1, ty: 12 },
        { type: 'coin', id: 'c05', tx: 4, ty: 12 },
      ],
    },
    // 3) A segunda chaminé, mais alta (vão de 4 tiles, sobe 7). No topo, fora
    //    do caminho principal, um pequeno pedestal um tile mais alto guarda
    //    o segundo adesivo — dá pra ignorar e seguir andando embaixo.
    {
      bands: [
        [0, 4, '.....................'],
        [5, 5, '................#....'],
        [6, 6, '......#....##########'],
        [7, 11, '......#....#.........'],
        [12, 12, '...........#.........'],
        [13, 14, '#####################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 4, ty: 12 },
        { type: 'coin', id: 'c06', tx: 1, ty: 12 },
        { type: 'sticker', id: 's2', tx: 16, ty: 4 },
      ],
    },
    // 4) Fechamento: vapor dentro da terceira chaminé (sobe 6, vão de 3) —
    //    precisa esperar o jato apagar antes de entrar e escalar. O terceiro
    //    adesivo, no meio do vão, só dá pra pegar já escalando de parede em
    //    parede (wall jump) depois do jato apagar.
    {
      bands: [
        [0, 6, '...................'],
        [7, 7, '.......#...########'],
        [8, 11, '.......#...#.......'],
        [12, 12, '...........#.......'],
        [13, 14, '###################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 3, ty: 12 },
        { type: 'steam', tx: 9, ty: 9, dir: 'up', length: 3, onMs: 1200, offMs: 2400, offsetMs: 0 },
        // Ao lado do jato, não dentro dele: já basta ter que subir a chaminé
        // esperando o vapor desligar — o adesivo não precisa ser uma segunda
        // armadilha no mesmo lugar.
        { type: 'sticker', id: 's3', tx: 10, ty: 8 },
      ],
    },
    // 5) Reta final tranquila, pra respirar depois da última chaminé.
    {
      bands: [
        [0, 12, '..........'],
        [13, 14, '##########'],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 12 },
        { type: 'coin', id: 'c08', tx: 6, ty: 12 },
      ],
    },
    // 6) Chegada — fim do Bairro do Kem.
    {
      bands: [
        [0, 12, '............'],
        [13, 14, '############'],
      ],
      entities: [
        { type: 'flag', tx: 8, ty: 12 },
      ],
    },
  ],
});
