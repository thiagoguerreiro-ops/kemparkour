import { buildLevel } from './build.js';

// Fase 1 do Bairro do Kem: ensina o pulo. Sem buracos e sem perigos —
// só caixas, uma escadinha até o telhado e três adesivos fáceis de ver.
export const BAIRRO_01 = buildLevel({
  id: 'bairro-01',
  name: 'Primeiros pulos',
  height: 15,
  targetTime: 40,
  sections: [
    // 1) Começo: a dica do pulo e duas caixinhas.
    {
      bands: [
        [0, 10, '................'],
        [11, 11, '............##..'],
        [12, 12, '.S......#...##..'],
        [13, 14, '################'],
      ],
      entities: [
        { type: 'tutorial', tx: 2, ty: 12, w: 6, move: 'jump', text: 'Toque A (ou Espaço) pra pular!' },
        { type: 'coin', id: 'c01', tx: 5, ty: 11 },
        { type: 'coin', id: 'c02', tx: 10, ty: 11 },
        { type: 'coin', id: 'c03', tx: 12, ty: 9 },
      ],
    },
    // 2) Caixa alta com o primeiro adesivo em cima, e um checkpoint no fim.
    {
      bands: [
        [0, 9, '....................'],
        [10, 10, '.....###............'],
        [11, 12, '.....###.......##...'],
        [13, 14, '####################'],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 6, ty: 8 },
        { type: 'coin', id: 'c04', tx: 10, ty: 12 },
        { type: 'coin', id: 'c05', tx: 11, ty: 12 },
        { type: 'coin', id: 'c06', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 18, ty: 12 },
      ],
    },
    // 3) Escadinha até o telhado, com o segundo adesivo lá em cima.
    {
      bands: [
        [0, 6, '........................'],
        [7, 8, '........########........'],
        [9, 10, '.....###########........'],
        [11, 12, '..##############........'],
        [13, 14, '########################'],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 10 },
        { type: 'coin', id: 'c08', tx: 6, ty: 8 },
        { type: 'coin', id: 'c09', tx: 10, ty: 6 },
        { type: 'coin', id: 'c10', tx: 12, ty: 6 },
        { type: 'sticker', id: 's2', tx: 14, ty: 5 },
      ],
    },
    // 4) Caixa e uma varanda flutuante escondendo o terceiro adesivo.
    {
      bands: [
        [0, 7, '......................'],
        [8, 8, '........####..........'],
        [9, 9, '......................'],
        [10, 12, '....##................'],
        [13, 14, '######################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'sticker', id: 's3', tx: 10, ty: 7 },
        { type: 'coin', id: 'c11', tx: 14, ty: 12 },
        { type: 'coin', id: 'c12', tx: 15, ty: 12 },
        { type: 'coin', id: 'c13', tx: 16, ty: 12 },
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
