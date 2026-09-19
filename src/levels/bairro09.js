import { buildLevel } from './build.js';

// Fase 9 do Bairro do Kem: "Tudo junto" — a revisão do bairro antes da fase
// final. Mistura tudo o que o Kem já sabe: beirada (duas subidas, 4 e 5
// tiles), deslizar logo depois de pousar de um pulo, vapor dentro de um
// túnel, ventilador e a balsa sobre o buraco largo demais pra pular.
export const BAIRRO_09 = buildLevel({
  id: 'bairro-09',
  name: 'Tudo junto',
  height: 15,
  targetTime: 36,
  sections: [
    // 1) Aquecimento: um muro de 4 tiles (a beirada que a Fase 7 ensinou).
    {
      bands: [
        [0, 8, '....................'],
        [9, 11, '.............##.....'],
        [12, 12, '.S...........##.....'],
        [13, 14, '####################'],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 12 },
        { type: 'coin', id: 'c02', tx: 7, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 17, ty: 12 },
      ],
    },
    // 2) Buraco de 3 tiles seguido, dois tiles depois de pousar, de um túnel
    //    (linha 11 sólida, linha 12 livre) — pede deslizar logo após o pulo.
    {
      bands: [
        [0, 10, '......................'],
        [11, 11, '.........######.......'],
        [12, 12, '......................'],
        [13, 14, '####...###############'],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 2, ty: 12 },
        { type: 'coin', id: 'c04', tx: 17, ty: 12 },
      ],
    },
    // 3) Ventilador contra, num trecho plano e comprido.
    {
      bands: [
        [0, 12, '....................'],
        [13, 14, '####################'],
      ],
      entities: [
        // Um checkpoint no meio do caminho: entre o cp0 e o cp1 eram 44 tiles.
        { type: 'checkpoint', id: 'cp0a', tx: 2, ty: 12 },
        { type: 'coin', id: 'c05', tx: 3, ty: 12 },
        { type: 'fan', tx: 16, ty: 12, dir: -1, range: 10, push: 180 },
        { type: 'coin', id: 'c06', tx: 18, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 19, ty: 12 },
      ],
    },
    // 4) Balsa: buraco de 8 tiles largo demais pra pular. A superfície da
    //    balsa fica rente ao chão (ty:13) e toca as duas margens. O adesivo
    //    só dá pra pegar pulando de cima dela, sobre o buraco.
    {
      bands: [
        [0, 12, '....................'],
        [13, 14, '####........########'],
      ],
      entities: [
        { type: 'platform', w: 3, from: { tx: 4, ty: 13 }, to: { tx: 9, ty: 13 }, speed: 60 },
        { type: 'sticker', id: 's1', tx: 8, ty: 9 },
        { type: 'coin', id: 'c07', tx: 13, ty: 12 },
        { type: 'coin', id: 'c08', tx: 14, ty: 12 },
      ],
    },
    // 5) Segunda beirada (muro de 5 tiles, adesivo em cima) e, logo depois,
    //    um túnel com vapor dentro (adesivo debaixo do teto baixo). O
    //    checkpoint antes do túnel fica a 4 tiles do jato (nunca menos de 2).
    {
      bands: [
        [0, 7, '........................'],
        [8, 10, '..####..................'],
        [11, 11, '..####......######......'],
        [12, 12, '..####..................'],
        [13, 14, '########################'],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 0, ty: 12 },
        { type: 'coin', id: 'c09', tx: 1, ty: 12 },
        { type: 'sticker', id: 's2', tx: 4, ty: 7 },
        { type: 'checkpoint', id: 'cp3', tx: 10, ty: 12 },
        { type: 'steam', tx: 14, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'sticker', id: 's3', tx: 16, ty: 12 },
        { type: 'coin', id: 'c10', tx: 20, ty: 12 },
      ],
    },
    // 6) Chegada.
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
