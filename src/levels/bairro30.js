import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);
// Uma linha de largura w com barras ('=') nas colunas `cols`.
const bars = (w, ...cols) => Array.from({ length: w }, (_, i) => (cols.includes(i) ? '=' : '.')).join('');

// Fase 30 da Cidade à noite — "O topo da cidade". A GRANDE FINAL: a subida da
// torre mais alta, do começo da rua até o telhado onde está a bandeira. É a
// fase mais comprida do jogo e pede tudo que o Kem aprendeu, na ordem, com um
// checkpoint entre um obstáculo e outro:
//   1) descer rolando (queda de 8 tiles) e o túnel baixo com vapor (deslizar);
//   2) o andaime (beirada, 5 tiles) e a chaminé (wall jump, sobe 6);
//   3) o vão de 8 tiles do pulo duplo e a escada de corrida na parede (dois
//      vãos de 9 tiles, cada pouso 1 tile acima do anterior);
//   4) do topo da escada, outra queda de 8 tiles (rolar) e UMA barra: buraco
//      de 8 tiles na rua com a barra na coluna 5;
//   5) o guindaste até o primeiro telhado e, ali, a subida final ao ar livre,
//      de telhado em telhado (dois vãos de 4 tiles, cada telhado 2 tiles
//      mais alto), até o telhado mais alto da cidade, largo e sem perigo.
// Nenhum obstáculo é mais difícil que os da Fase 10 nem que os das Fases 25 a
// 27 (são os mesmos, com as mesmas medidas): a final é a mais difícil por ser
// a mais comprida, não por algum pulo ser pior. Por isso 12 checkpoints: errar
// nunca custa mais que um obstáculo. Sem movimento novo e sem dica.
export const BAIRRO_30 = buildLevel({
  id: 'bairro-30',
  name: 'O topo da cidade',
  height: 15,
  targetTime: 86,
  sections: [
    // 1) Telhado do começo e a queda de 8 tiles até a rua (rolar). O primeiro
    //    adesivo fica no caminho da queda. Largura 10 (telhado cols 0-6).
    {
      bands: [
        [0, 3, dot(10)],
        [4, 4, 'S' + dot(9)],
        [5, 12, wall(7) + dot(3)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 2, ty: 4 },
        { type: 'coin', id: 'c02', tx: 5, ty: 4 },
        { type: 'sticker', id: 's1', tx: 9, ty: 7 },
      ],
    },
    // 2) O túnel baixo (deslizar): checkpoint no pouso, 4 tiles de corrida até
    //    a boca e o cano de vapor 2 tiles pra dentro. Na saída, o checkpoint
    //    antes do andaime. Largura 16.
    {
      bands: [
        [0, 4, dot(16)],
        [5, 11, dot(5) + wall(7) + dot(4)],
        [12, 12, dot(16)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 1, ty: 12 },
        { type: 'steam', tx: 7, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c03', tx: 9, ty: 12 },
        { type: 'coin', id: 'c04', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp2', tx: 14, ty: 12 },
      ],
    },
    // 3) O andaime: muro de 5 tiles (beirada), 2 tiles livres acima da quina,
    //    4 tiles de corrida antes. O telhado de cima tem o checkpoint; depois
    //    dele, a rua de novo (queda de 5 tiles). Largura 12.
    {
      bands: [
        [0, 7, dot(12)],
        [8, 12, dot(4) + wall(8)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'coin', id: 'c05', tx: 2, ty: 12 },
        { type: 'checkpoint', id: 'cp3', tx: 7, ty: 7 },
        { type: 'coin', id: 'c06', tx: 9, ty: 7 },
      ],
    },
    // 4) A chaminé: vão de 3 tiles (cols 9-11), sobe 6 até o telhado. A parede
    //    esquerda (col 8) flutua (2 tiles livres embaixo, dá pra andar por
    //    baixo) e o topo fica livre pra sair. No telhado, o checkpoint, 3
    //    tiles antes da beirada. Largura 19.
    {
      bands: [
        [0, 4, dot(19)],
        [5, 6, dot(8) + '#' + dot(10)],
        [7, 10, dot(8) + '#' + dot(3) + wall(7)],
        [11, 12, dot(12) + wall(7)],
        [13, 14, wall(19)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 4, ty: 12 },
        { type: 'coin', id: 'c07', tx: 10, ty: 8 },
        { type: 'coin', id: 'c08', tx: 14, ty: 5 },
        { type: 'checkpoint', id: 'cp5', tx: 15, ty: 6 },
      ],
    },
    // 5) O vão do pulo duplo: 8 tiles, mesma altura. Largura 8.
    {
      bands: [
        [0, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 2, ty: 4 },
        { type: 'coin', id: 'c10', tx: 6, ty: 4 },
      ],
    },
    // 6) Pouso largo (telhado em ty 7); checkpoint a 5 tiles do primeiro
    //    muro. Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 14, wall(9)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp6', tx: 3, ty: 6 },
      ],
    },
    // 7) Escada, degrau 1: vão de 9 tiles, muro nas linhas 2-3 (logo acima da
    //    cabeça do Kem em pé). Largura 9.
    {
      bands: [
        [0, 1, dot(9)],
        [2, 3, graf(9)],
        [4, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c11', tx: 3, ty: 3 },
        { type: 'coin', id: 'c12', tx: 6, ty: 3 },
      ],
    },
    // 8) Primeiro telhado da escada (ty 5), 2 tiles de muro sobre ele. O
    //    adesivo 2 paira acima do fim da corrida. Largura 9.
    {
      bands: [
        [0, 1, dot(9)],
        [2, 3, graf(2) + dot(7)],
        [4, 5, dot(9)],
        [6, 14, wall(9)],
      ],
      entities: [
        { type: 'sticker', id: 's2', tx: 3, ty: 1 },
        { type: 'checkpoint', id: 'cp7', tx: 3, ty: 5 },
      ],
    },
    // 9) Escada, degrau 2: vão de 9 tiles, muro nas linhas 1-2 (mais alto).
    //    Largura 9.
    {
      bands: [
        [0, 0, dot(9)],
        [1, 2, graf(9)],
        [3, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 3, ty: 2 },
        { type: 'coin', id: 'c14', tx: 6, ty: 2 },
      ],
    },
    // 10) Topo da escada (telhado em ty 4), 2 tiles de muro sobre ele;
    //     checkpoint antes da queda de 8 tiles. Largura 8.
    {
      bands: [
        [0, 0, dot(8)],
        [1, 2, graf(2) + dot(6)],
        [3, 4, dot(8)],
        [5, 14, wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp8', tx: 3, ty: 4 },
        { type: 'coin', id: 'c15', tx: 5, ty: 4 },
      ],
    },
    // 11) A queda de 8 tiles até a rua (rolar): rua lisa, com o checkpoint
    //     6 tiles antes do buraco da barra. Largura 12.
    {
      bands: [
        [0, 12, dot(12)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp9', tx: 5, ty: 12 },
      ],
    },
    // 12) A barra: buraco de 8 tiles na rua com a barra na coluna 5 (3 tiles
    //     antes da beirada de lá), a 2 tiles acima do chão (agarra com um pulo,
    //     balança, solta pro outro lado). Largura 8.
    {
      bands: [
        [0, 9, dot(8)],
        [10, 10, bars(8, 5)],
        [11, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c16', tx: 5, ty: 8 },
      ],
    },
    // 13) Pouso da barra (rua larga) e o checkpoint. Largura 5.
    {
      bands: [
        [0, 12, dot(5)],
        [13, 14, wall(5)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp10', tx: 1, ty: 12 },
      ],
    },
    // 14) O guindaste: poço de 2 tiles (cols 4-5) que sobe da rua (ty:13) até
    //     o primeiro telhado da subida final (ty:8, rente ao telhado). No
    //     telhado, o checkpoint. Largura 12.
    {
      bands: [
        [0, 7, dot(12)],
        [8, 12, dot(6) + wall(6)],
        [13, 14, wall(4) + dot(2) + wall(6)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 4, ty: 13 }, to: { tx: 4, ty: 8 }, speed: 60 },
        { type: 'coin', id: 'c17', tx: 1, ty: 12 },
        { type: 'checkpoint', id: 'cp11', tx: 8, ty: 7 },
        { type: 'coin', id: 'c18', tx: 10, ty: 6 },
      ],
    },
    // 15) Subida final, degrau 1: vão de 4 tiles e o telhado 2 tiles mais alto
    //     (ty 6), com o checkpoint. O terceiro adesivo paira no arco do pulo.
    //     Largura 10.
    {
      bands: [
        [0, 5, dot(10)],
        [6, 14, dot(4) + wall(6)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 2, ty: 4 },
        { type: 'checkpoint', id: 'cp12', tx: 7, ty: 5 },
      ],
    },
    // 16) Subida final, degrau 2: outro vão de 4 tiles e o telhado mais alto
    //     da cidade (ty 4): largo e seguro, com a bandeira. Largura 14.
    {
      bands: [
        [0, 3, dot(14)],
        [4, 14, dot(4) + wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c19', tx: 8, ty: 3 },
        { type: 'coin', id: 'c20', tx: 11, ty: 3 },
        { type: 'flag', tx: 6, ty: 3 },
      ],
    },
  ],
});
