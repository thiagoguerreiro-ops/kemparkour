import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);
// Uma linha de largura w com barras ('=') nas colunas `cols`.
const bars = (w, ...cols) => Array.from({ length: w }, (_, i) => (cols.includes(i) ? '=' : '.')).join('');

// Fase 29 da Cidade à noite — "A última subida". A penúltima: uma subida quase
// só pra cima, por três torres, cada uma com um movimento diferente, e a
// bandeira no telhado de onde se vê a torre mais alta da cidade (a da grande
// final). Nenhum movimento novo e nenhuma dica; cada obstáculo é do tamanho dos
// das Fases 20 a 26 (o mais difícil deles nunca passa da Fase 10) e o desafio
// é a fila, por isso tantos checkpoints (nunca mais de 16 tiles entre eles):
//   1) o andaime da primeira torre (beirada, muro de 5 tiles);
//   2) o vão de 9 tiles do pulo duplo, caindo na rua;
//   3) o guindaste leva até a boca da chaminé da segunda torre (wall jump,
//      6 tiles), que termina no telhado mais alto da fase;
//   4) desce um degrau e uma barra atravessa o vão de 10 tiles;
//   5) a escada de corrida na parede da terceira torre: dois vãos de 9 tiles,
//      cada muro 2 tiles mais alto que o outro, até o telhado da bandeira.
export const BAIRRO_29 = buildLevel({
  id: 'bairro-29',
  name: 'A última subida',
  height: 15,
  targetTime: 68,
  sections: [
    // 1) A rua do começo. Largura 9.
    {
      bands: [
        [0, 11, dot(9)],
        [12, 12, '.S' + dot(7)],
        [13, 14, wall(9)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 3, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 5, ty: 12 },
      ],
    },
    // 2) O andaime: muro de 5 tiles (beirada), 2 tiles livres acima da quina,
    //    5 tiles de corrida antes. Em cima, o primeiro adesivo (um pulinho) e
    //    o checkpoint a 4 tiles da beirada do vão. Largura 15.
    {
      bands: [
        [0, 7, dot(15)],
        [8, 12, dot(5) + wall(10)],
        [13, 14, wall(15)],
      ],
      entities: [
        { type: 'coin', id: 'c02', tx: 2, ty: 12 },
        { type: 'sticker', id: 's1', tx: 7, ty: 5 },
        { type: 'checkpoint', id: 'cp1', tx: 10, ty: 7 },
      ],
    },
    // 3) O vão do pulo duplo: 9 tiles, e o pouso é a rua, 5 tiles abaixo.
    //    Largura 9.
    {
      bands: [
        [0, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 3, ty: 5 },
        { type: 'coin', id: 'c04', tx: 6, ty: 5 },
      ],
    },
    // 4) Pouso largo na rua, com checkpoint. Largura 8.
    {
      bands: [
        [0, 12, dot(8)],
        [13, 14, wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c05', tx: 4, ty: 12 },
      ],
    },
    // 5) A segunda torre. O guindaste (poço de 2 tiles, cols 0-1) sobe da rua
    //    (ty 13) até o telhado baixo (ty 9), onde fica a boca da chaminé:
    //    vão de 3 tiles (cols 11-13), 6 tiles até o telhado alto. A parede da
    //    esquerda (col 10) flutua (2 tiles livres embaixo, dá pra andar por
    //    baixo) e o topo fica livre pra sair. Largura 24.
    {
      bands: [
        [0, 0, dot(24)],
        [1, 2, dot(10) + '#' + dot(13)],
        [3, 6, dot(10) + '#' + dot(3) + wall(10)],
        [7, 8, dot(14) + wall(10)],
        [9, 14, dot(2) + wall(22)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 0, ty: 13 }, to: { tx: 0, ty: 9 }, speed: 55 },
        { type: 'checkpoint', id: 'cp3', tx: 6, ty: 8 },
        { type: 'coin', id: 'c06', tx: 12, ty: 4 },
        { type: 'coin', id: 'c07', tx: 17, ty: 1 },
        { type: 'checkpoint', id: 'cp4', tx: 19, ty: 2 },
      ],
    },
    // 6) O telhado da chaminé acaba e o Kem desce um degrau de 5 tiles pro
    //    telhado da barra. Largura 9.
    {
      bands: [
        [0, 7, dot(9)],
        [8, 14, wall(9)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp5', tx: 7, ty: 7 },
        { type: 'coin', id: 'c08', tx: 3, ty: 7 },
      ],
    },
    // 7) A barra: vão de 10 tiles com a barra perto do meio (col 5), 3 tiles
    //    acima do telhado. Largura 10.
    {
      bands: [
        [0, 4, dot(10)],
        [5, 5, bars(10, 5)],
        [6, 14, dot(10)],
      ],
      entities: [
        { type: 'sticker', id: 's2', tx: 8, ty: 5 },
        { type: 'coin', id: 'c09', tx: 6, ty: 5 },
      ],
    },
    // 8) Pouso da barra e a base da terceira torre; checkpoint a 3 tiles da
    //    beirada do primeiro muro. Largura 8.
    {
      bands: [
        [0, 7, dot(8)],
        [8, 14, wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp6', tx: 4, ty: 7 },
        { type: 'coin', id: 'c10', tx: 6, ty: 7 },
      ],
    },
    // 9) Escada, degrau 1: vão de 9 tiles, muro nas linhas 2-3, rumo a um
    //    telhado 2 tiles mais alto. Largura 9.
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
    // 10) Primeiro telhado da escada, 2 tiles de muro sobre ele. O terceiro
    //     adesivo paira acima do fim da corrida. Largura 9.
    {
      bands: [
        [0, 1, dot(9)],
        [2, 3, graf(2) + dot(7)],
        [4, 5, dot(9)],
        [6, 14, wall(9)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 2, ty: 1 },
        { type: 'checkpoint', id: 'cp7', tx: 3, ty: 5 },
        { type: 'coin', id: 'c13', tx: 6, ty: 5 },
      ],
    },
    // 11) Escada, degrau 2: vão de 9 tiles, muro nas linhas 0-1, rumo ao
    //     telhado da bandeira, outros 2 tiles acima. Largura 9.
    {
      bands: [
        [0, 1, graf(9)],
        [2, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c14', tx: 3, ty: 1 },
        { type: 'coin', id: 'c15', tx: 6, ty: 1 },
      ],
    },
    // 12) O telhado da bandeira, e a torre mais alta da cidade ao fundo (o
    //     paredão sólido no fim). Largura 14.
    {
      bands: [
        [0, 1, graf(2) + dot(8) + wall(4)],
        [2, 3, dot(10) + wall(4)],
        [4, 14, wall(14)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp8', tx: 1, ty: 3 },
        { type: 'coin', id: 'c16', tx: 5, ty: 3 },
        { type: 'flag', tx: 8, ty: 3 },
      ],
    },
  ],
});
