import { buildLevel } from './build.js';

// Fase 5 do Bairro do Kem: pratica o deslizar junto com pulo e vapor.
// O túnel com vapor dentro pede paciência: espere desligar e deslize.
export const BAIRRO_05 = buildLevel({
  id: 'bairro-05',
  name: 'Rua dos canos',
  height: 15,
  targetTime: 24,
  sections: [
    // 1) Começo com um túnel curto (3 tiles).
    {
      bands: [
        [0, 4, '................'],
        [5, 11, '......###.......'],
        [12, 12, '.S..............'],
        [13, 14, '################'],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 7, ty: 12 },
        { type: 'coin', id: 'c02', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 14, ty: 12 },
      ],
    },
    // 2) Buraco de 4 tiles (adesivo lá no alto) e um túnel com vapor dentro.
    {
      bands: [
        [0, 4, '......................'],
        [5, 11, '.........#######......'],
        [12, 12, '......................'],
        [13, 14, '##....################'],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 3, ty: 8 },
        { type: 'coin', id: 'c03', tx: 4, ty: 10 },
        { type: 'checkpoint', id: 'cp1a', tx: 7, ty: 12 },
        { type: 'steam', tx: 10, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2200, offsetMs: 0 },
        { type: 'coin', id: 'c04', tx: 13, ty: 12 },
        { type: 'coin', id: 'c05', tx: 17, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 18, ty: 12 },
      ],
    },
    // 3) Dois blocos baixos (3 e 5 tiles): o segundo adesivo fica embaixo do
    //    maior. Depois, um buraco de 3 tiles.
    {
      bands: [
        [0, 9, '........................'],
        [10, 11, '..###.....#####.........'],
        [12, 12, '........................'],
        [13, 14, '#################...####'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c06', tx: 6, ty: 12 },
        { type: 'coin', id: 'c07', tx: 7, ty: 12 },
        { type: 'sticker', id: 's2', tx: 12, ty: 12 },
        { type: 'coin', id: 'c08', tx: 18, ty: 10 },
      ],
    },
    // 4) Vapor ao ar livre, buraco (terceiro adesivo no alto) e um túnel
    //    logo depois do pouso.
    {
      bands: [
        [0, 4, '......................'],
        [5, 11, '...........######.....'],
        [12, 12, '......................'],
        [13, 14, '#####...##############'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 0, ty: 12 },
        // O checkpoint fica logo antes (2 tiles), porque atrás dele tem um
        // buraco que ninguém deve repetir. Como a distância é curta, o jato
        // fica desligado bem mais tempo: quem acabou de renascer tem folga
        // pra se situar antes de precisar correr.
        { type: 'steam', tx: 2, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2800, offsetMs: 400 },
        { type: 'sticker', id: 's3', tx: 6, ty: 8 },
        { type: 'coin', id: 'c09', tx: 9, ty: 12 },
        { type: 'coin', id: 'c10', tx: 12, ty: 12 },
        { type: 'coin', id: 'c11', tx: 14, ty: 12 },
        { type: 'coin', id: 'c12', tx: 19, ty: 12 },
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
