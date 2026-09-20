import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 18 do Centro — "Ponte de aço". A prova do Centro, antes das barras
// (Fase 19): uma ponte comprida entre duas torres, revisando um movimento por
// trecho — rolamento, beirada, chaminé (wall jump), pulo duplo, túnel baixo
// com vapor e o guindaste. Nenhum obstáculo é mais difícil que os da Fase 10
// ("Entre as paredes") nem que o vão da Fase 16; o que cresce é o comprimento,
// e por isso há mais checkpoints (nunca mais de 18 tiles entre eles): errar
// nunca custa muito. Sem movimento novo, sem dica. Só jump, deslizar, beirada,
// wall jump, rolamento e pulo duplo — sem barras nem corrida na parede.
export const BAIRRO_18 = buildLevel({
  id: 'bairro-18',
  name: 'Ponte de aço',
  height: 15,
  targetTime: 70,
  sections: [
    // 1) Telhado da primeira torre (início). Depois da beirada, a queda de 8
    //    tiles até a rua: o primeiro adesivo fica no caminho dessa queda.
    //    Largura 16 (telhado cols 0-11, queda cols 12-15).
    {
      bands: [
        [0, 3, dot(16)],
        [4, 4, 'S' + dot(15)],
        [5, 12, wall(12) + dot(4)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 3, ty: 4 },
        { type: 'coin', id: 'c02', tx: 6, ty: 4 },
        { type: 'checkpoint', id: 'cp0', tx: 9, ty: 4 },
        { type: 'sticker', id: 's1', tx: 14, ty: 7 },
      ],
    },
    // 2) Pouso da queda (rolando ou não): rua larga e lisa, nada logo depois.
    //    Largura 12.
    {
      bands: [
        [0, 12, dot(12)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 3, ty: 12 },
        { type: 'coin', id: 'c04', tx: 6, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 8, ty: 12 },
      ],
    },
    // 3) O andaime na rua: muro de 5 tiles (beirada), 2 tiles livres acima
    //    da quina, 5 tiles de corrida antes. Em cima, o adesivo pede um
    //    pulinho; depois é só descer pro outro lado. Largura 16.
    {
      bands: [
        [0, 7, dot(16)],
        [8, 12, dot(5) + wall(5) + dot(6)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'sticker', id: 's2', tx: 7, ty: 5 },
        { type: 'coin', id: 'c05', tx: 9, ty: 7 },
        { type: 'coin', id: 'c06', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp2', tx: 13, ty: 12 },
      ],
    },
    // 4) A chaminé do pilar da ponte: vão de 3 tiles (cols 9-11), sobe 6
    //    até o tabuleiro. A parede esquerda flutua (2 tiles livres embaixo,
    //    dá pra andar por baixo) e o topo fica livre pra sair. Largura 20.
    {
      bands: [
        [0, 4, dot(20)],
        [5, 6, dot(8) + '#' + dot(11)],
        [7, 10, dot(8) + '#' + dot(3) + wall(8)],
        [11, 12, dot(12) + wall(8)],
        [13, 14, wall(20)],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 12 },
        { type: 'coin', id: 'c08', tx: 10, ty: 8 },
        { type: 'coin', id: 'c09', tx: 16, ty: 6 },
        { type: 'checkpoint', id: 'cp3', tx: 14, ty: 6 },
      ],
    },
    // 5) O vão da ponte: 9 tiles no tabuleiro (pulo duplo), com o
    //    checkpoint 6 tiles antes da beirada e pouso largo do outro lado.
    //    O terceiro adesivo paira sobre o vão, no arco do pulo duplo.
    //    Largura 9.
    {
      bands: [
        [0, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c10', tx: 2, ty: 4 },
        { type: 'sticker', id: 's3', tx: 4, ty: 2 },
        { type: 'coin', id: 'c11', tx: 6, ty: 4 },
      ],
    },
    // 6) Fim do tabuleiro (10 tiles de pouso) e a descida de 6 tiles de
    //    volta pra rua. Largura 16.
    {
      bands: [
        [0, 6, dot(16)],
        [7, 12, wall(10) + dot(6)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 2, ty: 6 },
        { type: 'coin', id: 'c12', tx: 6, ty: 6 },
        { type: 'coin', id: 'c13', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp5', tx: 14, ty: 12 },
      ],
    },
    // 7) O túnel baixo sob o tabuleiro da segunda torre (deslizar): 5 tiles
    //    de corrida até a boca, cano de vapor 2 tiles pra dentro. Depois,
    //    rua livre e o checkpoint. Largura 18.
    {
      bands: [
        [0, 4, dot(18)],
        [5, 11, dot(3) + wall(7) + dot(8)],
        [12, 12, dot(18)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'steam', tx: 5, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c14', tx: 8, ty: 12 },
        { type: 'coin', id: 'c15', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp6', tx: 15, ty: 12 },
      ],
    },
    // 8) O guindaste: poço de 2 tiles (cols 7-8) que sobe da rua (ty:13) até
    //    o telhado da segunda torre (ty:5, rente ao telhado). Largura 14.
    {
      bands: [
        [0, 4, dot(14)],
        [5, 12, dot(9) + wall(5)],
        [13, 14, wall(7) + dot(2) + wall(5)],
      ],
      entities: [
        { type: 'coin', id: 'c16', tx: 3, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 7, ty: 13 }, to: { tx: 7, ty: 5 }, speed: 60 },
      ],
    },
    // 9) Telhado da segunda torre, com a bandeira. Largura 10.
    {
      bands: [
        [0, 4, dot(10)],
        [5, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c17', tx: 1, ty: 4 },
        { type: 'flag', tx: 3, ty: 4 },
      ],
    },
  ],
});
