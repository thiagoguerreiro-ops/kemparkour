import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);

// Fase 27 da Cidade à noite — "Sobe e desce". Uma fase só de altura: o Kem
// sobe a torre e depois desce do outro lado. Sem movimento novo e sem dica.
// Nenhum obstáculo passa da dificuldade da Fase 10 (são os mesmos das Fases
// 20, 22 e 24, com as mesmas medidas); o desafio é a sequência, e por isso há
// um checkpoint antes de cada obstáculo (nunca mais de ~17 tiles entre eles):
//   1) a chaminé (wall jump): vão de 3 tiles, sobe 6 até o telhado;
//   2) um vão de 8 tiles no alto (pulo duplo), o adesivo 1 no arco;
//   3) a escada de corrida na parede: dois vãos de 9 tiles, o segundo muro
//      mais alto que o primeiro, cada pouso 1 tile acima do anterior (uma
//      corrida por pulo: pra emendar, é preciso pousar entre elas). O adesivo
//      2 fica no alto do primeiro pouso: corre no muro e aperta A (pulo da
//      parede) perto do fim;
//   4) do topo da torre, a queda de 8 tiles até a rua (rolar); o adesivo 3
//      fica no caminho da queda;
//   5) o túnel baixo com vapor (deslizar);
//   6) o guindaste até o telhado da bandeira.
export const BAIRRO_27 = buildLevel({
  id: 'bairro-27',
  name: 'Sobe e desce',
  height: 15,
  targetTime: 68,
  sections: [
    // 1) Rua do começo e a chaminé: vão de 3 tiles (cols 11-13), sobe 6 até o
    //    telhado. A parede esquerda (col 10) flutua (2 tiles livres embaixo, dá
    //    pra andar por baixo) e o topo fica livre pra sair. No telhado, o
    //    checkpoint. Largura 24.
    {
      bands: [
        [0, 4, dot(24)],
        [5, 6, dot(10) + '#' + dot(13)],
        [7, 10, dot(10) + '#' + dot(3) + wall(10)],
        [11, 11, dot(14) + wall(10)],
        [12, 12, dot(1) + 'S' + dot(12) + wall(10)],
        [13, 14, wall(24)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 5, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 6, ty: 12 },
        { type: 'coin', id: 'c02', tx: 12, ty: 8 },
        { type: 'coin', id: 'c03', tx: 17, ty: 5 },
        { type: 'checkpoint', id: 'cp1', tx: 20, ty: 6 },
      ],
    },
    // 2) O vão do pulo duplo: 8 tiles, mesma altura. O adesivo 1 paira no arco.
    //    Largura 8.
    {
      bands: [
        [0, 14, dot(8)],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 4, ty: 3 },
      ],
    },
    // 3) Pouso largo (telhado em ty 6); checkpoint a 4 tiles do primeiro muro.
    //    Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 14, wall(9)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 4, ty: 6 },
        { type: 'coin', id: 'c04', tx: 6, ty: 6 },
      ],
    },
    // 4) Escada, degrau 1: vão de 9 tiles, muro nas linhas 2-3 (logo acima da
    //    cabeça do Kem em pé). Largura 9.
    {
      bands: [
        [0, 1, dot(9)],
        [2, 3, graf(9)],
        [4, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c05', tx: 3, ty: 3 },
        { type: 'coin', id: 'c06', tx: 6, ty: 3 },
      ],
    },
    // 5) Primeiro telhado da escada (ty 5), 2 tiles de muro sobre ele. O
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
        { type: 'checkpoint', id: 'cp3', tx: 3, ty: 5 },
      ],
    },
    // 6) Escada, degrau 2: vão de 9 tiles, muro nas linhas 1-2 (mais alto).
    //    Largura 9.
    {
      bands: [
        [0, 0, dot(9)],
        [1, 2, graf(9)],
        [3, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 2 },
        { type: 'coin', id: 'c08', tx: 6, ty: 2 },
      ],
    },
    // 7) Topo da torre (telhado em ty 4), 2 tiles de muro sobre ele;
    //    checkpoint antes da queda de 8 tiles. Largura 12.
    {
      bands: [
        [0, 0, dot(12)],
        [1, 2, graf(2) + dot(10)],
        [3, 4, dot(12)],
        [5, 14, wall(12)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 2, ty: 4 },
        { type: 'coin', id: 'c09', tx: 7, ty: 4 },
      ],
    },
    // 8) A queda de 8 tiles até a rua (rolar): rua larga e lisa. O adesivo 3
    //    fica no caminho da queda. Checkpoint no pouso. Largura 6.
    {
      bands: [
        [0, 12, dot(6)],
        [13, 14, wall(6)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 2, ty: 6 },
        { type: 'checkpoint', id: 'cp5', tx: 4, ty: 12 },
      ],
    },
    // 9) O túnel baixo (deslizar): 5 tiles de corrida até a boca e o cano de
    //    vapor 2 tiles pra dentro. Na saída, o checkpoint antes do guindaste.
    //    Largura 18.
    {
      bands: [
        [0, 4, dot(18)],
        [5, 11, dot(5) + wall(7) + dot(6)],
        [12, 12, dot(18)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'steam', tx: 7, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c10', tx: 9, ty: 12 },
        { type: 'coin', id: 'c11', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp6', tx: 15, ty: 12 },
      ],
    },
    // 10) O guindaste: poço de 2 tiles (cols 5-6) que sobe da rua (ty:13) até o
    //     telhado da torre mais alta (ty:4, rente ao telhado). Largura 12.
    {
      bands: [
        [0, 3, dot(12)],
        [4, 12, dot(7) + wall(5)],
        [13, 14, wall(5) + dot(2) + wall(5)],
      ],
      entities: [
        { type: 'coin', id: 'c12', tx: 2, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 5, ty: 13 }, to: { tx: 5, ty: 4 }, speed: 60 },
      ],
    },
    // 11) Telhado da torre mais alta, com a bandeira. Largura 8.
    {
      bands: [
        [0, 3, dot(8)],
        [4, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 1, ty: 3 },
        { type: 'coin', id: 'c14', tx: 5, ty: 3 },
        { type: 'flag', tx: 3, ty: 3 },
      ],
    },
  ],
});
