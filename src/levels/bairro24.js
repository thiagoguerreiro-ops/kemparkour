import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);

// Fase 24 da Cidade à noite — "Neon corrido". A vitrine da corrida na parede
// (Fase 22): três travessias, cada uma com uma volta diferente, mais UM vão de
// pulo duplo e UMA queda pra rolar. Nenhum movimento novo, nenhuma dica, sem
// barras. Nenhum obstáculo passa da dificuldade da Fase 10; os muros são os
// mesmos da Fase 22 (vão de 9, muro logo acima da cabeça, o muro COMEÇA na
// beirada e avança 2 tiles sobre o pouso), só que agora em fila:
//   1) a queda de 8 tiles do telhado do começo até a rua (rolar; o adesivo 2
//      fica no caminho da queda);
//   2) travessia 1 — o muro comprido: vão de 12 tiles, muro de ponta a ponta;
//   3) travessia 2 — a escada da torre: dois vãos de 9 tiles, o segundo muro
//      mais alto que o primeiro, e cada pouso 2 tiles acima do anterior
//      (uma corrida por pulo: pra emendar as duas, é preciso pousar entre
//      elas). O adesivo 1 fica no alto do primeiro pouso: corre no muro e
//      aperta A (pulo da parede) perto do fim;
//   4) o vão de 8 tiles do pulo duplo, no alto da torre (o adesivo 3 paira no
//      arco); 5) travessia 3 — vão de 10 tiles com o muro e o pouso com um
//      cano de vapor logo depois; a bandeira fecha a fase.
export const BAIRRO_24 = buildLevel({
  id: 'bairro-24',
  name: 'Neon corrido',
  height: 15,
  targetTime: 66,
  sections: [
    // 1) Telhado do começo (chão em ty 4). Largura 8.
    {
      bands: [
        [0, 3, dot(8)],
        [4, 4, dot(1) + 'S' + dot(6)],
        [5, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 4 },
        { type: 'coin', id: 'c02', tx: 6, ty: 4 },
      ],
    },
    // 2) A rua (queda de 8 tiles), checkpoint a 5 tiles da beirada. Largura 12.
    {
      bands: [
        [0, 12, dot(12)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'sticker', id: 's2', tx: 2, ty: 6 },
        { type: 'checkpoint', id: 'cp0', tx: 7, ty: 12 },
        { type: 'coin', id: 'c03', tx: 10, ty: 12 },
      ],
    },
    // 3) Travessia 1: vão de 12 tiles, muro nas linhas 8-9 de ponta a ponta.
    //    Largura 12.
    {
      bands: [
        [0, 7, dot(12)],
        [8, 9, graf(12)],
        [10, 14, dot(12)],
      ],
      entities: [
        { type: 'coin', id: 'c04', tx: 4, ty: 9 },
        { type: 'coin', id: 'c05', tx: 8, ty: 9 },
      ],
    },
    // 4) Pouso na rua, o muro ainda avança 2 tiles sobre ele; checkpoint a 6
    //    tiles do próximo vão. Largura 9.
    {
      bands: [
        [0, 7, dot(9)],
        [8, 9, graf(2) + dot(7)],
        [10, 12, dot(9)],
        [13, 14, wall(9)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 3, ty: 12 },
      ],
    },
    // 5) Escada, degrau 1: vão de 9 tiles, muro nas linhas 7-8, rumo a um
    //    telhado 2 tiles acima da rua. Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 8, graf(9)],
        [9, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c06', tx: 3, ty: 8 },
        { type: 'coin', id: 'c07', tx: 6, ty: 8 },
      ],
    },
    // 6) Primeiro telhado da escada (chão em ty 10), 2 tiles de muro sobre
    //    ele. O adesivo 1 paira acima do fim da corrida. Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 8, graf(2) + dot(7)],
        [9, 10, dot(9)],
        [11, 14, wall(9)],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 2, ty: 6 },
        { type: 'checkpoint', id: 'cp2', tx: 3, ty: 10 },
      ],
    },
    // 7) Escada, degrau 2: vão de 9 tiles, muro nas linhas 5-6 (mais alto),
    //    rumo a um telhado outros 2 tiles acima. Largura 9.
    {
      bands: [
        [0, 4, dot(9)],
        [5, 6, graf(9)],
        [7, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c08', tx: 3, ty: 6 },
        { type: 'coin', id: 'c09', tx: 6, ty: 6 },
      ],
    },
    // 8) Topo da torre (chão em ty 8), 2 tiles de muro sobre ele; checkpoint
    //    e corrida até a beirada do vão do pulo duplo. Largura 11.
    {
      bands: [
        [0, 4, dot(11)],
        [5, 6, graf(2) + dot(9)],
        [7, 8, dot(11)],
        [9, 14, wall(11)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 3, ty: 8 },
        { type: 'coin', id: 'c10', tx: 7, ty: 8 },
      ],
    },
    // 9) O vão do pulo duplo: 8 tiles, mesma altura. O adesivo 3 paira no
    //    arco do pulo duplo. Largura 8.
    {
      bands: [
        [0, 14, dot(8)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 4, ty: 4 },
      ],
    },
    // 10) Pouso largo (chão em ty 8); checkpoint a 6 tiles do último vão.
    //     Largura 10.
    {
      bands: [
        [0, 8, dot(10)],
        [9, 14, wall(10)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 3, ty: 8 },
        { type: 'coin', id: 'c11', tx: 6, ty: 8 },
      ],
    },
    // 11) Travessia 3: vão de 10 tiles, muro nas linhas 4-5. Largura 10.
    {
      bands: [
        [0, 3, dot(10)],
        [4, 5, graf(10)],
        [6, 14, dot(10)],
      ],
      entities: [
        { type: 'coin', id: 'c12', tx: 4, ty: 5 },
        { type: 'coin', id: 'c13', tx: 8, ty: 5 },
      ],
    },
    // 12) Pouso com o cano de vapor e a bandeira. Largura 12.
    {
      bands: [
        [0, 3, dot(12)],
        [4, 5, graf(2) + dot(10)],
        [6, 8, dot(12)],
        [9, 14, wall(12)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp5', tx: 1, ty: 8 },
        { type: 'steam', tx: 6, ty: 8, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'flag', tx: 10, ty: 8 },
      ],
    },
  ],
});
