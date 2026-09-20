import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
// Uma linha de largura w com barras ('=') nas colunas `cols`.
const bars = (w, ...cols) => Array.from({ length: w }, (_, i) => (cols.includes(i) ? '=' : '.')).join('');

// Fase 26 da Cidade à noite — "Cabos de neon". A fase das barras da noite:
// os cabos de neon que cruzam a rua são as barras. Tudo que o Kem já sabe
// aparece na ordem, com checkpoint entre um obstáculo e outro — descer
// rolando, o túnel baixo (deslizar), o andaime (beirada), o vão do pulo duplo
// — e então as barras: uma por cima do cano de vapor, e o guindaste que leva
// ao telhado alto de onde duas barras em sequência atravessam o maior vão.
// Sem corrida na parede aqui (a fase seguinte volta a ela). Nenhum obstáculo
// é mais difícil que os da Fase 10 nem que os das Fases 19 e 25 (as medidas
// são as mesmas); o desafio é a sequência, e por isso tantos checkpoints:
// errar nunca custa mais que um obstáculo. Sem movimento novo e sem dica.
export const BAIRRO_26 = buildLevel({
  id: 'bairro-26',
  name: 'Cabos de neon',
  height: 15,
  targetTime: 66,
  sections: [
    // 1) Telhado do começo e a queda de 8 tiles até a rua (rolar). O primeiro
    //    adesivo fica no caminho da queda. Largura 12 (telhado cols 0-8).
    {
      bands: [
        [0, 3, dot(12)],
        [4, 4, 'S' + dot(11)],
        [5, 12, wall(9) + dot(3)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 3, ty: 4 },
        { type: 'coin', id: 'c02', tx: 6, ty: 4 },
        { type: 'sticker', id: 's1', tx: 11, ty: 7 },
      ],
    },
    // 2) O túnel baixo (deslizar): checkpoint no pouso, 4 tiles de corrida até
    //    a boca e o cano de vapor 2 tiles pra dentro. Na saída, o checkpoint
    //    antes do andaime. Largura 18.
    {
      bands: [
        [0, 4, dot(18)],
        [5, 11, dot(5) + wall(7) + dot(6)],
        [12, 12, dot(18)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 1, ty: 12 },
        { type: 'steam', tx: 7, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c03', tx: 9, ty: 12 },
        { type: 'coin', id: 'c04', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp2', tx: 15, ty: 12 },
      ],
    },
    // 3) O andaime: muro de 5 tiles (beirada), 2 tiles livres acima da quina,
    //    5 tiles de corrida antes. O telhado de cima tem o segundo adesivo
    //    (um pulinho) e o checkpoint antes do vão. Largura 15.
    {
      bands: [
        [0, 7, dot(15)],
        [8, 12, dot(5) + wall(10)],
        [13, 14, wall(15)],
      ],
      entities: [
        { type: 'coin', id: 'c05', tx: 3, ty: 12 },
        { type: 'sticker', id: 's2', tx: 7, ty: 5 },
        { type: 'checkpoint', id: 'cp3', tx: 9, ty: 7 },
      ],
    },
    // 4) O vão do pulo duplo: 9 tiles no alto, com pouso largo do outro lado.
    //    Largura 9.
    {
      bands: [
        [0, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c06', tx: 2, ty: 5 },
        { type: 'coin', id: 'c07', tx: 6, ty: 5 },
      ],
    },
    // 5) Pouso no telhado (9 tiles, checkpoint) e a descida de 5 tiles pra rua.
    //    Largura 16.
    {
      bands: [
        [0, 7, dot(16)],
        [8, 12, wall(9) + dot(7)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 3, ty: 7 },
        { type: 'coin', id: 'c08', tx: 6, ty: 7 },
        { type: 'coin', id: 'c09', tx: 12, ty: 12 },
      ],
    },
    // 6) Um degrau de 2 tiles sobe da rua pro telhadinho de onde sai a
    //    primeira barra. Checkpoint com 5 tiles de corrida até a beirada.
    //    Largura 11.
    {
      bands: [
        [0, 10, dot(11)],
        [11, 12, dot(3) + wall(8)],
        [13, 14, wall(11)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp5', tx: 5, ty: 10 },
      ],
    },
    // 7) A barra sobre o vapor: 8 tiles de vão, uma ilha de 2 no meio (cols
    //    3-4) com um cano de vapor, e a barra (col 2, 5 tiles acima do
    //    telhadinho) passa por cima dele. Largura 8.
    {
      bands: [
        [0, 5, dot(8)],
        [6, 6, bars(8, 2)],
        [7, 12, dot(8)],
        [13, 14, dot(3) + '##' + dot(3)],
      ],
      entities: [
        { type: 'steam', tx: 3, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c10', tx: 6, ty: 7 },
        { type: 'coin', id: 'c11', tx: 7, ty: 10 },
      ],
    },
    // 8) Pouso largo na rua. Largura 7.
    {
      bands: [
        [0, 12, dot(7)],
        [13, 14, wall(7)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp6', tx: 2, ty: 12 },
        { type: 'coin', id: 'c12', tx: 5, ty: 12 },
      ],
    },
    // 9) O guindaste: poço de 2 tiles (cols 0-1) que sobe da rua (ty:13) até
    //    o telhado alto (ty:9). No telhado, o checkpoint. Largura 8.
    {
      bands: [
        [0, 8, dot(8)],
        [9, 14, dot(2) + wall(6)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 0, ty: 13 }, to: { tx: 0, ty: 9 }, speed: 55 },
        { type: 'checkpoint', id: 'cp7', tx: 4, ty: 8 },
      ],
    },
    // 10) O vão maior: 12 tiles do telhado alto até a rua, com duas barras
    //     (a segunda 5 colunas depois e 3 linhas mais baixa). O terceiro
    //     adesivo fica no caminho entre elas. Largura 12.
    {
      bands: [
        [0, 3, dot(12)],
        [4, 4, bars(12, 2)],
        [5, 6, dot(12)],
        [7, 7, bars(12, 7)],
        [8, 14, dot(12)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 9, ty: 6 },
        { type: 'sticker', id: 's3', tx: 3, ty: 5 },
        { type: 'coin', id: 'c14', tx: 11, ty: 9 },
      ],
    },
    // 11) Rua da chegada: checkpoint no pouso e a bandeira. Largura 12.
    {
      bands: [
        [0, 12, dot(12)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp8', tx: 2, ty: 12 },
        { type: 'coin', id: 'c15', tx: 5, ty: 12 },
        { type: 'coin', id: 'c16', tx: 8, ty: 12 },
        { type: 'flag', tx: 9, ty: 12 },
      ],
    },
  ],
});
