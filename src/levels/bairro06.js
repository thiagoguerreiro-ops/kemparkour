import { buildLevel } from './build.js';

// Fase 6 do Bairro do Kem: ventiladores (contra e a favor) e as primeiras
// plataformas móveis — uma balsa sobre um buraco e um elevador até uma laje.
export const BAIRRO_06 = buildLevel({
  id: 'bairro-06',
  name: 'Vento e elevador',
  height: 15,
  targetTime: 45,
  sections: [
    // 1) Vento contra num trecho plano.
    {
      bands: [
        [0, 11, '................'],
        [12, 12, '.S..............'],
        [13, 14, '################'],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 7, ty: 12 },
        { type: 'coin', id: 'c02', tx: 9, ty: 12 },
        { type: 'fan', tx: 12, ty: 12, dir: -1, range: 6, push: 180 },
        { type: 'checkpoint', id: 'cp0', tx: 14, ty: 12 },
      ],
    },
    // 2) Buraco de 8 tiles com uma balsa. O adesivo flutua sobre o buraco.
    {
      bands: [
        [0, 12, '........................'],
        [13, 14, '####........############'],
      ],
      entities: [
        { type: 'platform', w: 3, from: { tx: 4, ty: 13 }, to: { tx: 9, ty: 13 }, speed: 60 },
        { type: 'sticker', id: 's1', tx: 8, ty: 9 },
        { type: 'coin', id: 'c03', tx: 13, ty: 12 },
        { type: 'coin', id: 'c04', tx: 14, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 16, ty: 12 },
      ],
    },
    // 3) Vento a favor sobre um buraco de 7 tiles, e um elevador até a laje.
    {
      bands: [
        [0, 7, '........................'],
        [8, 8, '..................######'],
        [9, 12, '........................'],
        [13, 14, '#####.......####..######'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'fan', tx: 2, ty: 12, dir: 1, range: 9, push: 220 },
        { type: 'coin', id: 'c05', tx: 4, ty: 12 },
        { type: 'coin', id: 'c06', tx: 8, ty: 10 },
        { type: 'coin', id: 'c07', tx: 13, ty: 12 },
        { type: 'checkpoint', id: 'cp2a', tx: 13, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 16, ty: 13 }, to: { tx: 16, ty: 8 }, speed: 50 },
        { type: 'sticker', id: 's2', tx: 21, ty: 7 },
        { type: 'coin', id: 'c08', tx: 22, ty: 7 },
      ],
    },
    // 4) Buracos de 2 tiles com vento contra; o terceiro adesivo fica alto.
    {
      bands: [
        [0, 12, '......................'],
        [13, 14, '######..####..########'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 12 },
        { type: 'coin', id: 'c09', tx: 3, ty: 12 },
        { type: 'sticker', id: 's3', tx: 7, ty: 9 },
        { type: 'coin', id: 'c10', tx: 9, ty: 12 },
        { type: 'coin', id: 'c11', tx: 10, ty: 12 },
        { type: 'coin', id: 'c12', tx: 16, ty: 12 },
        { type: 'fan', tx: 20, ty: 12, dir: -1, range: 16, push: 150 },
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
