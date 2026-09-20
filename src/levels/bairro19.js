import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
// Uma linha de largura w com barras ('=') nas colunas `cols`.
const bars = (w, ...cols) => Array.from({ length: w }, (_, i) => (cols.includes(i) ? '=' : '.')).join('');

// Fase 19 do Centro — "Balança-balança". Ensina as barras: pulou perto de
// uma, o Kem se pendura sozinho; ◀ ▶ balançam; A solta e lança pra frente.
// Do nível da Fase 10 quando ensinou o wall jump: um aquecimento sem perigo,
// a dica antes do primeiro vão, o checkpoint colado nele e o pouso largo e
// mais baixo. As barras ficam 5 tiles acima de onde o Kem pula (um pulo
// segurado alcança) e o lado de saída é sempre mais alto que o de chegada,
// então soltar logo depois de agarrar já atravessa; dá pra soltar em vários
// momentos do balanço. Ordem:
//   1) vão de 8 tiles do telhado até a rua, barra a 2 tiles da beirada;
//   2) vão de 8 com uma ilha de vapor no meio e a barra por cima;
//   3) o guindaste leva ao telhado alto, e dali duas barras em sequência
//      atravessam o maior vão da fase (12 tiles) até a rua da chegada;
//   4) volta da vitória: um muro (beirada) na rua até a bandeira.
// Movimentos: jump, deslizar, beirada, wall jump, rolamento, pulo duplo e a
// barra nova. Sem corrida na parede ainda.
export const BAIRRO_19 = buildLevel({
  id: 'bairro-19',
  name: 'Balança-balança',
  height: 15,
  targetTime: 55,
  sections: [
    // 1) Aquecimento no telhado do começo: uma caixinha baixa e um vão de 3
    //    tiles (um pulo comum atravessa; cair só volta pro início).
    //    Largura 14.
    {
      bands: [
        [0, 7, dot(14)],
        [8, 8, '.S' + dot(2) + '##' + dot(8)],
        [9, 14, wall(9) + dot(3) + wall(2)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 6 },
        { type: 'coin', id: 'c02', tx: 5, ty: 6 },
        { type: 'coin', id: 'c03', tx: 10, ty: 6 },
      ],
    },
    // 2) A dica e o checkpoint, a 5 tiles da beirada. Largura 8.
    {
      bands: [
        [0, 7, dot(8)],
        [8, 8, dot(8)],
        [9, 14, wall(8)],
      ],
      entities: [
        { type: 'tutorial', tx: 0, ty: 8, w: 6, move: 'swing', text: 'Pulou perto de uma barra? O Kem se pendura! Toque ◀ ▶ pra balançar e A pra soltar.' },
        { type: 'checkpoint', id: 'cp0', tx: 3, ty: 8 },
      ],
    },
    // 3) Primeiro vão: 8 tiles, barra na coluna 2 (5 tiles acima do telhado).
    //    Errar só cai no buraco e volta pro cp0. Largura 8.
    {
      bands: [
        [0, 3, dot(8)],
        [4, 4, bars(8, 2)],
        [5, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c04', tx: 0, ty: 6 },
        { type: 'coin', id: 'c05', tx: 7, ty: 9 },
      ],
    },
    // 4) Pouso largo, 2 tiles abaixo do telhado. Largura 7.
    {
      bands: [
        [0, 10, dot(7)],
        [11, 14, wall(7)],
      ],
      entities: [
        { type: 'coin', id: 'c06', tx: 1, ty: 10 },
        { type: 'checkpoint', id: 'cp1', tx: 2, ty: 10 },
        { type: 'sticker', id: 's1', tx: 4, ty: 8 },
      ],
    },
    // 5) A ilha do vapor: 8 tiles de vão, ilha de 2 no meio (colunas 3-4) com
    //    um cano de vapor, e a barra passa por cima dele. Largura 8.
    {
      bands: [
        [0, 5, dot(8)],
        [6, 6, bars(8, 2)],
        [7, 12, dot(8)],
        [13, 14, dot(3) + '##' + dot(3)],
      ],
      entities: [
        { type: 'steam', tx: 3, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c07', tx: 6, ty: 7 },
        { type: 'sticker', id: 's2', tx: 4, ty: 4 },
        { type: 'coin', id: 'c08', tx: 7, ty: 10 },
      ],
    },
    // 6) Pouso largo na rua. Largura 7.
    {
      bands: [
        [0, 12, dot(7)],
        [13, 14, wall(7)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 2, ty: 12 },
        { type: 'coin', id: 'c09', tx: 5, ty: 12 },
      ],
    },
    // 7) O guindaste: poço de 2 tiles (cols 0-1) que sobe da rua (ty:13) até
    //    o telhado alto (ty:9). No telhado, o último checkpoint. Largura 8.
    {
      bands: [
        [0, 8, dot(8)],
        [9, 14, dot(2) + wall(6)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 0, ty: 13 }, to: { tx: 0, ty: 9 }, speed: 55 },
        { type: 'checkpoint', id: 'cp3', tx: 4, ty: 8 },
      ],
    },
    // 8) O vão maior: 12 tiles do telhado alto até a rua, com duas barras
    //    (a segunda 5 colunas depois e 3 linhas mais baixa). Largura 12.
    {
      bands: [
        [0, 3, dot(12)],
        [4, 4, bars(12, 2)],
        [5, 6, dot(12)],
        [7, 7, bars(12, 7)],
        [8, 14, dot(12)],
      ],
      entities: [
        { type: 'coin', id: 'c10', tx: 5, ty: 5 },
        { type: 'sticker', id: 's3', tx: 4, ty: 2 },
        { type: 'coin', id: 'c11', tx: 11, ty: 9 },
      ],
    },
    // 9) Rua da chegada: checkpoint no pouso, um muro de 5 tiles (beirada, 2
    //    tiles livres acima da quina) e a bandeira. Largura 24.
    {
      bands: [
        [0, 7, dot(24)],
        [8, 12, dot(13) + wall(4) + dot(7)],
        [13, 14, wall(24)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 2, ty: 12 },
        { type: 'coin', id: 'c12', tx: 5, ty: 12 },
        { type: 'coin', id: 'c13', tx: 13, ty: 6 },
        { type: 'coin', id: 'c14', tx: 15, ty: 6 },
        { type: 'coin', id: 'c15', tx: 18, ty: 12 },
        { type: 'flag', tx: 19, ty: 12 },
      ],
    },
  ],
});
