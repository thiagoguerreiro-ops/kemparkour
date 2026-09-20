import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 16 do Centro — "Pulo em dobro". Ensina o pulo duplo (toque A de novo
// no ar). Do nível da Fase 10 quando ela ensinou o wall jump: a dica vem
// antes do primeiro vão, o vão tem checkpoint colado antes e chão largo do
// outro lado, e errar só custa alguns passos de volta. Depois o pedido
// cresce devagar, sempre com folga (o pulo duplo alcança ~13 tiles de vão e
// ~6 de altura; aqui o maior vão é 9):
//   1) vão de 8 tiles na rua (um pulo só alcança 7);
//   2) vão de 6 tiles + telhado 4 tiles mais alto (mais largo E mais alto);
//   3) duas ilhas seguidas: o pulo duplo recarrega ao pousar no chão;
//   4) o guindaste (plataforma) leva pro telhado alto, e lá em cima vem o
//      vão maior da fase (9 tiles) até a bandeira.
// Movimentos: jump, deslizar, beirada, wall jump, rolamento e o novo pulo
// duplo. Sem barras nem corrida na parede ainda.
export const BAIRRO_16 = buildLevel({
  id: 'bairro-16',
  name: 'Pulo em dobro',
  height: 15,
  targetTime: 55,
  sections: [
    // 1) Rua do começo: a dica aparece logo que o Kem anda, e o checkpoint
    //    fica colado no vão (5 tiles de corrida até a beirada). Largura 10.
    {
      bands: [
        [0, 11, dot(10)],
        [12, 12, 'S' + dot(9)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'tutorial', tx: 1, ty: 12, w: 7, move: 'doublejump', text: 'Vão grande? Pule e, no ar, toque A (ou Espaço) de novo: pulo duplo!' },
        { type: 'coin', id: 'c01', tx: 3, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 5, ty: 12 },
        { type: 'coin', id: 'c02', tx: 8, ty: 12 },
      ],
    },
    // 2) Primeiro vão: 8 tiles (um pulo só alcança 7). Buraco até o fundo;
    //    cair só volta pro cp0, a 5 tiles dali. Largura 8.
    {
      bands: [
        [0, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 2, ty: 9 },
        { type: 'coin', id: 'c04', tx: 4, ty: 8 },
        { type: 'coin', id: 'c05', tx: 6, ty: 9 },
      ],
    },
    // 3) Pouso largo (12 tiles). O primeiro adesivo fica no ar acima da rua:
    //    só o pulo duplo chega lá em cima, e depois é só cair no chão.
    //    Checkpoint antes do próximo vão. Largura 12.
    {
      bands: [
        [0, 12, dot(12)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 3, ty: 12 },
        { type: 'coin', id: 'c06', tx: 5, ty: 12 },
        { type: 'sticker', id: 's1', tx: 8, ty: 6 },
        { type: 'coin', id: 'c07', tx: 10, ty: 12 },
      ],
    },
    // 4) Vão de 6 tiles, com um telhado 4 tiles mais alto do outro lado:
    //    mais largo e mais alto ao mesmo tempo. Largura 6.
    {
      bands: [
        [0, 14, dot(6)],
      ],
      entities: [
        { type: 'coin', id: 'c08', tx: 3, ty: 7 },
      ],
    },
    // 5) Telhado do meio (4 tiles acima da rua). O segundo adesivo fica bem
    //    no alto (pulo duplo reto pra cima; cair de volta é seguro).
    //    Largura 10.
    {
      bands: [
        [0, 8, dot(10)],
        [9, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 2, ty: 8 },
        { type: 'sticker', id: 's2', tx: 5, ty: 2 },
        { type: 'coin', id: 'c10', tx: 8, ty: 8 },
      ],
    },
    // 6) Desce (cai 4 tiles) de volta pra rua. Checkpoint antes das ilhas.
    //    Largura 8.
    {
      bands: [
        [0, 12, dot(8)],
        [13, 14, wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 3, ty: 12 },
        { type: 'coin', id: 'c11', tx: 5, ty: 12 },
      ],
    },
    // 7) Primeiro vão das ilhas: 7 tiles. Largura 7.
    {
      bands: [
        [0, 14, dot(7)],
      ],
      entities: [
        { type: 'coin', id: 'c12', tx: 3, ty: 8 },
      ],
    },
    // 8) A ilha (4 tiles de chão): pousar recarrega o pulo duplo. Checkpoint
    //    na ponta, pra errar o segundo vão custar só 3 passos de corrida.
    //    Largura 4.
    {
      bands: [
        [0, 12, dot(4)],
        [13, 14, wall(4)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 0, ty: 12 },
      ],
    },
    // 9) Segundo vão das ilhas: 7 tiles. Largura 7.
    {
      bands: [
        [0, 14, dot(7)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 3, ty: 8 },
      ],
    },
    // 10) Pouso largo na rua (8 tiles) antes do guindaste. Largura 8.
    {
      bands: [
        [0, 12, dot(8)],
        [13, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c14', tx: 3, ty: 12 },
      ],
    },
    // 11) O guindaste: poço de 2 tiles (cols 0-1) que sobe da rua (ty:13)
    //     até o telhado alto (ty:7, rente ao telhado). No telhado alto, o
    //     último checkpoint, 6 tiles antes da beirada. Largura 10.
    {
      bands: [
        [0, 6, dot(10)],
        [7, 14, dot(2) + wall(8)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 0, ty: 13 }, to: { tx: 0, ty: 7 }, speed: 55 },
        { type: 'checkpoint', id: 'cp4', tx: 4, ty: 6 },
        { type: 'coin', id: 'c15', tx: 7, ty: 6 },
      ],
    },
    // 12) O vão maior da fase: 9 tiles, no alto. O terceiro adesivo paira
    //     no ar sobre o vão: sai de brinde num pulo duplo bem dado.
    //     Largura 9.
    {
      bands: [
        [0, 14, dot(9)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 5, ty: 1 },
      ],
    },
    // 13) Telhado da chegada, largo, com a bandeira. Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 14, wall(9)],
      ],
      entities: [
        { type: 'flag', tx: 5, ty: 6 },
      ],
    },
  ],
});
