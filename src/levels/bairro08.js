import { buildLevel } from './build.js';

// Fase 8 do Bairro do Kem: "Telhados". Pratica tudo que a Fase 7 ensinou —
// beirada e deslizar — em telhados de alturas diferentes, com buracos que
// pedem pulo com corrida, um túnel e o primeiro vapor ao ar livre. Sem dica
// (nenhum movimento novo).
export const BAIRRO_08 = buildLevel({
  id: 'bairro-08',
  name: 'Telhados',
  height: 15,
  targetTime: 26,
  sections: [
    // 1) Começo: buraco de 5 tiles pedindo corrida, depois o primeiro prédio
    //    de 4 tiles — sobe com beirada até o primeiro telhado.
    {
      bands: [
        [0, 8, '.........................'],
        [9, 11, '.................########'],
        [12, 12, '.S...............########'],
        [13, 14, '#######.....#############'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp0', tx: 3, ty: 12 },
        { type: 'coin', id: 'c01', tx: 4, ty: 12 },
        { type: 'coin', id: 'c02', tx: 5, ty: 12 },
        { type: 'coin', id: 'c03', tx: 13, ty: 12 },
        { type: 'coin', id: 'c04', tx: 15, ty: 12 },
        { type: 'coin', id: 'c05', tx: 20, ty: 8 },
      ],
    },
    // 2) No telhado, uma beirada flutuante fora do caminho (mesmo alcance de
    //    um muro de 5 tiles) guarda o primeiro adesivo — dá para ignorar e
    //    seguir andando embaixo. Depois, o segundo prédio (5 tiles).
    {
      bands: [
        [0, 7, '....................'],
        [8, 10, '........##..########'],
        [11, 12, '............########'],
        [13, 14, '####################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 1, ty: 12 },
        { type: 'coin', id: 'c06', tx: 4, ty: 12 },
        { type: 'sticker', id: 's1', tx: 8, ty: 7 },
        { type: 'coin', id: 'c07', tx: 10, ty: 12 },
        { type: 'coin', id: 'c08', tx: 14, ty: 7 },
        { type: 'coin', id: 'c09', tx: 17, ty: 7 },
      ],
    },
    // 3) Túnel (revisão do deslizar) com um bloco baixo logo depois — o
    //    segundo adesivo só dá pra pegar deslizando por baixo. Na sequência,
    //    um buraco de 5 tiles pedindo corrida, com o terceiro adesivo lá no
    //    alto (pouso seguro de 5 tiles depois dele).
    {
      bands: [
        [0, 4, '.........................'],
        [5, 9, '...#####.................'],
        [10, 11, '...#####.##..............'],
        [12, 12, '.........................'],
        [13, 14, '###############.....#####'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c10', tx: 5, ty: 12 },
        { type: 'sticker', id: 's2', tx: 9, ty: 12 },
        { type: 'coin', id: 'c11', tx: 13, ty: 12 },
        // Na altura do voo por cima do buraco: o mesmo pulo que atravessa pega
        // o adesivo e pousa em chão firme. Mais alto virava armadilha — só dava
        // pra tocar nele caindo dentro do buraco.
        { type: 'sticker', id: 's3', tx: 17, ty: 9 },
        { type: 'coin', id: 'c12', tx: 21, ty: 12 },
        { type: 'coin', id: 'c13', tx: 23, ty: 12 },
      ],
    },
    // 4) Vapor ao ar livre (ritmo tranquilo) e o terceiro prédio (4 tiles)
    //    antes da reta final.
    {
      bands: [
        [0, 8, '......................'],
        [9, 12, '..........######......'],
        [13, 14, '######################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 12 },
        { type: 'coin', id: 'c14', tx: 4, ty: 12 },
        { type: 'steam', tx: 6, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 1800, offsetMs: 0 },
        { type: 'coin', id: 'c15', tx: 9, ty: 12 },
        // Depois do vapor e antes do último prédio (3 tiles longe do jato).
        { type: 'checkpoint', id: 'cp4', tx: 9, ty: 12 },
        { type: 'coin', id: 'c16', tx: 13, ty: 8 },
        { type: 'coin', id: 'c17', tx: 18, ty: 12 },
        { type: 'coin', id: 'c18', tx: 20, ty: 12 },
      ],
    },
    // 5) Chegada.
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
