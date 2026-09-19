import { buildLevel } from './build.js';

// Fase 2 do Bairro do Kem: os primeiros buracos de verdade. Cair num buraco
// volta ao último checkpoint. Os adesivos pedem um pulo bem calculado.
export const BAIRRO_02 = buildLevel({
  id: 'bairro-02',
  name: 'Cuidado com os buracos',
  height: 15,
  targetTime: 20,
  sections: [
    // 1) Começo com um buraco pequeno (2 tiles) para aprender.
    {
      bands: [
        [0, 11, '................'],
        [12, 12, '.S..............'],
        [13, 14, '#######..#######'],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 7, ty: 10 },
        { type: 'coin', id: 'c02', tx: 8, ty: 10 },
        { type: 'coin', id: 'c03', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 14, ty: 12 },
      ],
    },
    // 2) Caixa e buraco de 3 tiles. O adesivo fica no ar sobre o buraco:
    //    pega quem corre por cima da caixa e pula na beirada.
    {
      bands: [
        [0, 10, '....................'],
        [11, 12, '...##...............'],
        [13, 14, '#####...############'],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 6, ty: 8 },
        { type: 'coin', id: 'c04', tx: 9, ty: 12 },
        { type: 'coin', id: 'c05', tx: 10, ty: 12 },
        { type: 'coin', id: 'c06', tx: 11, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 12, ty: 12 },
      ],
    },
    // 3) Prédio, buraco de 4 tiles, outro prédio e uma laje alta com o
    //    segundo adesivo (sobe pelo segundo prédio).
    {
      bands: [
        [0, 6, '........................'],
        [7, 7, '...................###..'],
        [8, 9, '........................'],
        [10, 12, '..####........####......'],
        [13, 14, '######....##############'],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 9 },
        { type: 'coin', id: 'c08', tx: 4, ty: 9 },
        { type: 'coin', id: 'c09', tx: 8, ty: 10 },
        { type: 'checkpoint', id: 'cp2', tx: 11, ty: 12 },
        { type: 'coin', id: 'c10', tx: 15, ty: 9 },
        { type: 'coin', id: 'c11', tx: 16, ty: 9 },
        { type: 'sticker', id: 's2', tx: 20, ty: 6 },
      ],
    },
    // 4) Três buracos seguidos (2, 3 e 2 tiles). O terceiro adesivo fica alto
    //    sobre o buraco do meio: só pega quem pula cheio na hora certa. O chão
    //    depois dele tem 4 tiles para o pulo cheio pousar sem cair no próximo buraco.
    {
      bands: [
        [0, 12, '......................'],
        [13, 14, '###..###...####..#####'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 12 },
        { type: 'coin', id: 'c12', tx: 4, ty: 11 },
        { type: 'sticker', id: 's3', tx: 9, ty: 8 },
        { type: 'coin', id: 'c13', tx: 12, ty: 12 },
        { type: 'coin', id: 'c14', tx: 18, ty: 12 },
        { type: 'coin', id: 'c15', tx: 19, ty: 12 },
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
