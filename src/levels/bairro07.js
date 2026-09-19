import { buildLevel } from './build.js';

// Fase 7 do Bairro do Kem: ensina a agarrar a beirada. Muros de 4 e 5 tiles
// não dão para subir só pulando — o Kem se segura na quina e sobe com A.
export const BAIRRO_07 = buildLevel({
  id: 'bairro-07',
  name: 'Agarra na beirada',
  height: 15,
  targetTime: 22,
  sections: [
    // 1) A dica e o primeiro prédio de 4 tiles.
    {
      bands: [
        [0, 8, '................'],
        [9, 11, '..........######'],
        [12, 12, '.S........######'],
        [13, 14, '################'],
      ],
      entities: [
        { type: 'tutorial', tx: 3, ty: 12, w: 6, move: 'ledge', text: 'Pulo curto? O Kem se segura na beirada! Toque A (ou Espaço) pra subir.' },
        { type: 'coin', id: 'c01', tx: 5, ty: 12 },
        { type: 'coin', id: 'c02', tx: 7, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 13, ty: 8 },
      ],
    },
    // 2) O telhado acaba num buraco; depois, um pilar de 5 tiles com o
    //    primeiro adesivo em cima.
    {
      bands: [
        [0, 7, '....................'],
        [8, 8, '............##......'],
        [9, 12, '####........##......'],
        [13, 14, '####...#############'],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 8, ty: 12 },
        { type: 'coin', id: 'c04', tx: 9, ty: 12 },
        { type: 'sticker', id: 's1', tx: 12, ty: 7 },
        { type: 'checkpoint', id: 'cp1', tx: 17, ty: 12 },
      ],
    },
    // 3) Túnel (desliza) e um platô de 4 tiles logo depois. O segundo
    //    adesivo fica na ponta do platô.
    {
      bands: [
        [0, 4, '........................'],
        [5, 8, '...######...............'],
        [9, 11, '...######.....##########'],
        [12, 12, '..............##########'],
        [13, 14, '########################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c05', tx: 5, ty: 12 },
        { type: 'coin', id: 'c06', tx: 7, ty: 12 },
        { type: 'coin', id: 'c07', tx: 18, ty: 8 },
        { type: 'sticker', id: 's2', tx: 22, ty: 8 },
      ],
    },
    // 4) Desce do platô por cima de um buraco; uma caixa de 4 tiles e, dela,
    //    um pulo até a laje flutuante com o terceiro adesivo.
    {
      bands: [
        [0, 6, '......................'],
        [7, 7, '................###...'],
        [8, 8, '......................'],
        [9, 12, '######......##........'],
        [13, 14, '######..##############'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 8 },
        { type: 'coin', id: 'c08', tx: 9, ty: 12 },
        { type: 'coin', id: 'c09', tx: 10, ty: 12 },
        // Depois do buraco e antes da última subida: sem ele, um erro aqui
        // fazia repetir 29 tiles até a bandeira.
        { type: 'checkpoint', id: 'cp4', tx: 11, ty: 12 },
        { type: 'sticker', id: 's3', tx: 17, ty: 6 },
        { type: 'coin', id: 'c10', tx: 19, ty: 12 },
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
