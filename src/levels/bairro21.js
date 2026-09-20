import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 21 da Cidade à noite — "Luzes da cidade". A primeira do bairro novo é
// um respiro: um pouco mais fácil que o fecho do Centro (Fase 20), do nível
// das Fases 14-17, pra apresentar o cenário sem susto. Sem movimento novo e
// sem dica: tudo o que aparece o Kem já aprendeu.
//   1) a corrida pelos telhados dos letreiros: vãos pequenos, um degrau
//      pra cima, outro pra baixo;
//   2) o elevador leva pro topo do prédio (5 tiles);
//   3) o ventilador sopra a favor e ajuda a cruzar 6 tiles;
//   4) um telhado com UM cano de vapor, e a descida de 5 tiles pra rua;
//   5) o vão de 8 tiles pede o pulo duplo (mesma altura, chão largo do outro lado);
//   6) UMA barra num buraco de 8 tiles, com a barra na coluna 5, o
//      checkpoint logo antes e um pouso largo;
//   7) dois degraus de antena até a bandeira.
// Checkpoints a no máximo 19 tiles um do outro; nenhum obstáculo passa da
// dificuldade da Fase 10.
export const BAIRRO_21 = buildLevel({
  id: 'bairro-21',
  name: 'Luzes da cidade',
  height: 15,
  targetTime: 64,
  sections: [
    // 1) Telhado do começo (chão em ty 10). Largura 8.
    {
      bands: [
        [0, 9, dot(8)],
        [10, 10, dot(1) + 'S' + dot(6)],
        [11, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 3, ty: 10 },
        { type: 'coin', id: 'c02', tx: 6, ty: 10 },
      ],
    },
    // 2) A corrida dos letreiros: três vãos de 3-4 tiles entre telhados (um
    //    degrau pra cima, outro pra baixo). Errar só devolve pro checkpoint.
    //    O primeiro adesivo paira no arco do segundo vão. Largura 28
    //    (telhados: cols 3-9, 14-17 e 21-27).
    {
      bands: [
        [0, 8, dot(28)],
        [9, 9, dot(14) + wall(4) + dot(10)],
        [10, 10, dot(3) + wall(7) + dot(4) + wall(4) + dot(10)],
        [11, 14, dot(3) + wall(7) + dot(4) + wall(4) + dot(3) + wall(7)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 1, ty: 8 },
        { type: 'checkpoint', id: 'cp0', tx: 7, ty: 9 },
        { type: 'sticker', id: 's1', tx: 12, ty: 6 },
        { type: 'coin', id: 'c04', tx: 19, ty: 7 },
        { type: 'coin', id: 'c05', tx: 22, ty: 10 },
        { type: 'checkpoint', id: 'cp1', tx: 24, ty: 10 },
      ],
    },
    // 3) O elevador: poço de 2 tiles (cols 0-1) que sobe da calçada (ty:11,
    //    rente ao telhado) até o topo do prédio (ty:6). O segundo adesivo
    //    paira sobre o topo. O ventilador fica na ponta do telhado e sopra
    //    pra frente, sobre o vão. Largura 8.
    {
      bands: [
        [0, 5, dot(8)],
        [6, 14, dot(2) + wall(6)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 0, ty: 11 }, to: { tx: 0, ty: 6 }, speed: 55 },
        { type: 'sticker', id: 's2', tx: 4, ty: 3 },
        { type: 'coin', id: 'c06', tx: 3, ty: 5 },
        { type: 'fan', tx: 7, ty: 5, dir: 1, range: 7, push: 200 },
      ],
    },
    // 4) O vão de 6 tiles com o vento a favor e o telhado do cano de vapor
    //    (chão em ty 6): o checkpoint logo no pouso, 3 tiles antes do jato,
    //    que dá pra esperar apagar ou pular. Depois do cano, a borda: a
    //    descida é de 5 tiles pra rua. Largura 14.
    {
      bands: [
        [0, 6, dot(14)],
        [7, 14, dot(6) + wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 4 },
        { type: 'checkpoint', id: 'cp2', tx: 7, ty: 6 },
        { type: 'steam', tx: 10, ty: 6, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c08', tx: 12, ty: 6 },
      ],
    },
    // 5) A rua (5 tiles de queda), o checkpoint 5 tiles antes da beirada e o
    //    vão do pulo duplo: 8 tiles, mesma altura, com o telhado largo do
    //    outro lado. O terceiro adesivo paira no arco do pulo duplo. Largura 26.
    {
      bands: [
        [0, 11, dot(26)],
        [12, 14, wall(9) + dot(8) + wall(9)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 2, ty: 11 },
        { type: 'checkpoint', id: 'cp3', tx: 4, ty: 11 },
        { type: 'coin', id: 'c10', tx: 7, ty: 11 },
        { type: 'sticker', id: 's3', tx: 14, ty: 7 },
        { type: 'checkpoint', id: 'cp4', tx: 22, ty: 11 },
      ],
    },
    // 6) A barra: buraco de 8 tiles com a barra na coluna 5 (3 tiles antes
    //    da beirada de lá), a 2 tiles acima do chão (agarra com um pulo,
    //    balança, solta pro outro lado). Pouso largo de 8 tiles e o
    //    checkpoint depois. Largura 16.
    {
      bands: [
        [0, 8, dot(16)],
        [9, 9, dot(5) + '=' + dot(10)],
        [10, 11, dot(16)],
        [12, 14, dot(8) + wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c11', tx: 6, ty: 8 },
        { type: 'coin', id: 'c12', tx: 12, ty: 11 },
        { type: 'checkpoint', id: 'cp5', tx: 14, ty: 11 },
      ],
    },
    // 7) A antena: dois degraus de 2 tiles até o telhado mais alto, com a
    //    bandeira. Largura 14.
    {
      bands: [
        [0, 7, dot(14)],
        [8, 9, dot(9) + wall(5)],
        [10, 11, dot(4) + wall(10)],
        [12, 14, wall(14)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 6, ty: 9 },
        { type: 'flag', tx: 11, ty: 7 },
      ],
    },
  ],
});
