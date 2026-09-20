import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);

// Fase 22 do Centro — "Muros grafitados". Ensina a corrida na parede: os
// muros grafitados (W) são de fundo, o Kem atravessa; no ar, encostando num,
// segurando ◀/▶, ele corre reto pela parede (uns 1,0 s, ~10 tiles) até sair
// do muro. Uma corrida por pulo; A durante a corrida pula (wall jump).
// Do nível da Fase 10 quando ela ensinou o wall jump: a dica vem antes do
// primeiro vão, o checkpoint fica a poucos passos, o pouso é largo e errar só
// custa uma corridinha de volta. O muro sempre COMEÇA na beirada do vão e
// avança um pouco sobre o pouso, então vários tempos de pulo funcionam (dá
// pra pular do chão desde uns 4 tiles antes da beirada até em cima dela).
// Nenhum telhado de chegada fica mais alto que o caminho da corrida, então a
// corrida nunca bate na quina. Os vãos crescem devagar e a torre vai subindo:
//   1) vão de 9 tiles, muro baixo (a primeira vez, a mais folgada);
//   2) vão de 9 tiles, muro mais alto, e o pouso é um telhado 2 tiles acima
//      (o adesivo 1 fica no alto: corre no muro e pula da parede);
//   3) vão de 8 tiles rumo a um telhado 1 tile mais alto ainda;
//   4) vão de 10 tiles com ventilador a favor, o adesivo 3 na corrida;
//   5) o último prédio, de 4 tiles (beirada), com a bandeira.
// Movimentos: tudo até a Fase 21 + a corrida na parede. Sem barras aqui.
export const BAIRRO_22 = buildLevel({
  id: 'bairro-22',
  name: 'Muros grafitados',
  height: 15,
  targetTime: 58,
  sections: [
    // 1) Rua do começo: a dica aparece logo, checkpoint a 6 tiles da beirada.
    //    Largura 17.
    {
      bands: [
        [0, 11, dot(17)],
        [12, 12, 'S' + dot(16)],
        [13, 14, wall(17)],
      ],
      entities: [
        { type: 'tutorial', tx: 2, ty: 12, w: 13, move: 'wallrun', text: 'Muro grafitado! Pule nele segurando ▶ e o Kem corre pela parede!' },
        { type: 'coin', id: 'c01', tx: 5, ty: 12 },
        { type: 'coin', id: 'c02', tx: 8, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 11, ty: 12 },
      ],
    },
    // 2) Primeiro vão: 9 tiles, muro nas linhas 8-9 (logo acima da cabeça do
    //    Kem em pé; um pulo normal já entra nele). Largura 9.
    {
      bands: [
        [0, 7, dot(9)],
        [8, 9, graf(9)],
        [10, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 3, ty: 9 },
        { type: 'coin', id: 'c04', tx: 6, ty: 9 },
      ],
    },
    // 3) Pouso largo na rua; o muro ainda avança 2 tiles sobre ele. Checkpoint
    //    antes do próximo vão (5 tiles de corrida). Largura 9.
    {
      bands: [
        [0, 7, dot(9)],
        [8, 9, graf(2) + dot(7)],
        [10, 12, dot(9)],
        [13, 14, wall(9)],
      ],
      entities: [
        { type: 'coin', id: 'c05', tx: 2, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 4, ty: 12 },
      ],
    },
    // 4) Segundo vão: 9 tiles, muro um pouco mais alto (linhas 7-8). Do
    //    outro lado o pouso é um telhado 2 tiles acima da rua. Largura 9.
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
    // 5) Telhado (ty 11), 6 tiles de muro sobre ele (o checkpoint fica debaixo
    //    do muro; cp2 é o "meio" da fase). O primeiro adesivo paira uns 3 tiles
    //    acima do telhado, bem no fim da corrida: corre no muro e aperta A (pula
    //    da parede) perto do fim; também dá pra pegar parado embaixo, com um
    //    pulo reto, sem segurar ◀/▶ (senão o Kem começa a correr no muro).
    //    Depois é só cair no telhado, chão firme. Largura 10.
    {
      bands: [
        [0, 6, dot(10)],
        [7, 8, graf(6) + dot(4)],
        [9, 10, dot(10)],
        [11, 14, wall(10)],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 2, ty: 8 },
        { type: 'checkpoint', id: 'cp2', tx: 4, ty: 10 },
        { type: 'coin', id: 'c08', tx: 7, ty: 10 },
      ],
    },
    // 6) Vão de 8 tiles, muro nas linhas 6-7, rumo a um telhado 1 tile mais
    //    alto (ty 10). Largura 8.
    {
      bands: [
        [0, 5, dot(8)],
        [6, 7, graf(8)],
        [8, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 3, ty: 7 },
        { type: 'coin', id: 'c10', tx: 6, ty: 7 },
      ],
    },
    // 7) Telhado da torre (ty 10) com o ventilador (col 6) que sopra pro
    //    próximo vão; o vento só pega a partir do último tile do telhado. O
    //    segundo adesivo é um pulo logo ao lado do checkpoint. Largura 8.
    {
      bands: [
        [0, 5, dot(8)],
        [6, 7, graf(2) + dot(6)],
        [8, 9, dot(8)],
        [10, 14, wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 2, ty: 9 },
        { type: 'fan', tx: 6, ty: 9, dir: 1, range: 12, push: 220 },
        { type: 'sticker', id: 's2', tx: 3, ty: 7 },
      ],
    },
    // 8) Vão de 10 tiles com o ventilador a favor, muro nas linhas 5-6. O
    //    terceiro adesivo fica no caminho da corrida (logo abaixo do muro):
    //    quem corre no muro pega de brinde e cai no pouso. Largura 10.
    {
      bands: [
        [0, 4, dot(10)],
        [5, 6, graf(10)],
        [7, 14, dot(10)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 4, ty: 7 },
        { type: 'coin', id: 'c11', tx: 7, ty: 6 },
      ],
    },
    // 9) Pouso largo no telhado (ty 10), 2 tiles de muro sobre ele; checkpoint
    //    a 10 tiles do último prédio. Largura 12.
    {
      bands: [
        [0, 4, dot(12)],
        [5, 6, graf(2) + dot(10)],
        [7, 9, dot(12)],
        [10, 14, wall(12)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 2, ty: 9 },
        { type: 'coin', id: 'c12', tx: 5, ty: 9 },
        { type: 'coin', id: 'c13', tx: 8, ty: 9 },
      ],
    },
    // 10) O último prédio: parede de 4 tiles (beirada), a bandeira no alto.
    //     Largura 8.
    {
      bands: [
        [0, 5, dot(8)],
        [6, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c14', tx: 2, ty: 5 },
        { type: 'flag', tx: 5, ty: 5 },
      ],
    },
  ],
});
