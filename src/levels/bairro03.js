import { buildLevel } from './build.js';

// Fase 3 do Bairro do Kem: o primeiro vapor. No corredor coberto não dá para
// pular por cima — é esperar desligar e passar. Lá fora dá para esperar ou pular.
export const BAIRRO_03 = buildLevel({
  id: 'bairro-03',
  name: 'Vapor na rua',
  height: 15,
  targetTime: 24,
  sections: [
    // 1) Começo com um buraco de 2 tiles.
    {
      bands: [
        [0, 11, '................'],
        [12, 12, '.S..............'],
        [13, 14, '########..######'],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 12 },
        { type: 'coin', id: 'c02', tx: 5, ty: 12 },
        { type: 'coin', id: 'c03', tx: 8, ty: 10 },
        { type: 'coin', id: 'c04', tx: 9, ty: 10 },
        { type: 'checkpoint', id: 'cp0', tx: 13, ty: 12 },
      ],
    },
    // 2) Corredor coberto (2 tiles de altura) com o primeiro vapor. Depois do
    //    vapor, um nicho no teto guarda o primeiro adesivo: pule lá dentro.
    {
      bands: [
        [0, 4, '....................'],
        [5, 9, '.....##########.....'],
        [10, 10, '.....#######.##.....'],
        [11, 12, '....................'],
        [13, 14, '####################'],
      ],
      entities: [
        { type: 'coin', id: 'c05', tx: 6, ty: 12 },
        { type: 'coin', id: 'c06', tx: 7, ty: 12 },
        { type: 'steam', tx: 9, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2000, offsetMs: 0 },
        { type: 'sticker', id: 's1', tx: 12, ty: 10 },
        { type: 'coin', id: 'c07', tx: 15, ty: 12 },
        { type: 'coin', id: 'c08', tx: 16, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 17, ty: 12 },
      ],
    },
    // 3) Dois buracos de 3 tiles com um vapor ao ar livre no meio (dá para
    //    pular por cima). No fim, um pilar e uma laje alta com o segundo adesivo.
    {
      bands: [
        [0, 6, '........................'],
        [7, 7, '......................##'],
        [8, 9, '........................'],
        [10, 12, '...................##...'],
        [13, 14, '#####...######...#######'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c09', tx: 6, ty: 10 },
        { type: 'coin', id: 'c10', tx: 9, ty: 12 },
        { type: 'steam', tx: 10, ty: 12, dir: 'up', length: 2, onMs: 1500, offMs: 1500, offsetMs: 700 },
        { type: 'coin', id: 'c11', tx: 11, ty: 12 },
        { type: 'coin', id: 'c12', tx: 15, ty: 10 },
        { type: 'sticker', id: 's2', tx: 22, ty: 6 },
      ],
    },
    // 4) Dois vapores em ritmos diferentes e um buraco de 4 tiles no meio.
    //    O terceiro adesivo fica alto sobre o buraco.
    {
      bands: [
        [0, 12, '......................'],
        [13, 14, '#########....#########'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 12 },
        { type: 'coin', id: 'c13', tx: 2, ty: 12 },
        { type: 'steam', tx: 4, ty: 12, dir: 'up', length: 2, onMs: 1000, offMs: 1600, offsetMs: 0 },
        { type: 'coin', id: 'c14', tx: 6, ty: 12 },
        { type: 'coin', id: 'c15', tx: 7, ty: 12 },
        { type: 'sticker', id: 's3', tx: 11, ty: 8 },
        { type: 'coin', id: 'c16', tx: 14, ty: 12 },
        { type: 'coin', id: 'c17', tx: 15, ty: 12 },
        { type: 'steam', tx: 16, ty: 12, dir: 'up', length: 2, onMs: 1000, offMs: 1600, offsetMs: 800 },
        { type: 'coin', id: 'c18', tx: 19, ty: 12 },
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
