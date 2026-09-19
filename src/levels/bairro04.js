import { buildLevel } from './build.js';

// Fase 4 do Bairro do Kem: ensina a deslizar. Túneis baixos só passam
// deslizando; blocos baixos dá para pular por cima — mas o adesivo fica embaixo.
export const BAIRRO_04 = buildLevel({
  id: 'bairro-04',
  name: 'Escorregando',
  height: 15,
  targetTime: 22,
  sections: [
    // 1) A dica do deslizar e o primeiro túnel (4 tiles).
    {
      bands: [
        [0, 4, '................'],
        [5, 11, '.........####...'],
        [12, 12, '.S..............'],
        [13, 14, '################'],
      ],
      entities: [
        { type: 'tutorial', tx: 3, ty: 12, w: 6, move: 'slide', text: 'Correndo, toque B (ou Shift) pra deslizar!' },
        { type: 'coin', id: 'c01', tx: 10, ty: 12 },
        { type: 'coin', id: 'c02', tx: 11, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 14, ty: 12 },
      ],
    },
    // 2) Buraco de 3 tiles e um bloco baixo: pule por cima ou deslize por
    //    baixo — o primeiro adesivo fica embaixo dele.
    {
      bands: [
        [0, 9, '....................'],
        [10, 11, '.........###........'],
        [12, 12, '....................'],
        [13, 14, '###...##############'],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 4, ty: 10 },
        { type: 'coin', id: 'c04', tx: 7, ty: 12 },
        { type: 'sticker', id: 's1', tx: 10, ty: 12 },
        { type: 'coin', id: 'c05', tx: 13, ty: 12 },
        { type: 'coin', id: 'c06', tx: 14, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 16, ty: 12 },
      ],
    },
    // 3) Túnel longo (8 tiles) com moedas dentro. Quatro passos depois da
    //    saída, um vapor; depois um buraco com o segundo adesivo lá no alto.
    {
      bands: [
        [0, 4, '........................'],
        [5, 11, '...########.............'],
        [12, 12, '........................'],
        [13, 14, '##################...###'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c07', tx: 5, ty: 12 },
        { type: 'coin', id: 'c08', tx: 7, ty: 12 },
        { type: 'coin', id: 'c09', tx: 9, ty: 12 },
        { type: 'steam', tx: 15, ty: 12, dir: 'up', length: 2, onMs: 1400, offMs: 1800, offsetMs: 0 },
        { type: 'sticker', id: 's2', tx: 19, ty: 8 },
        { type: 'coin', id: 'c10', tx: 19, ty: 10 },
      ],
    },
    // 4) Bloco baixo mais longo (4 tiles) com o terceiro adesivo embaixo,
    //    e um buraco logo depois.
    {
      bands: [
        [0, 9, '......................'],
        [10, 11, '....####..............'],
        [12, 12, '......................'],
        [13, 14, '##########...#########'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 12 },
        { type: 'sticker', id: 's3', tx: 6, ty: 12 },
        { type: 'coin', id: 'c11', tx: 8, ty: 12 },
        { type: 'coin', id: 'c12', tx: 11, ty: 10 },
        { type: 'coin', id: 'c13', tx: 15, ty: 12 },
        { type: 'coin', id: 'c14', tx: 16, ty: 12 },
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
