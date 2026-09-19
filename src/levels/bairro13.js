import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 13 do Centro — ensina o rolamento. Kem começa num telhado alto e cai
// de volta pras ruas do Centro por três vezes: a primeira queda é só pra
// treinar (pouso largo, sem nada depois), a segunda tem um túnel baixo logo
// depois (rolar já deixa o Kem agachado, passa direto por baixo) e a
// terceira tem um buraco pedindo corrida logo depois (rolar guarda a
// velocidade, errar só custa um tranco de 1s — nunca é perigoso). Sobe e
// desce em escadinhas de 2 tiles (nenhum movimento novo aí) e revisita a
// beirada (andaime) e um vapor, como o resto do Bairro. Nenhum movimento
// novo além do rolamento — jump, deslizar, beirada e wall jump continuam
// disponíveis, mas não são exigidos de novo.
export const BAIRRO_13 = buildLevel({
  id: 'bairro-13',
  name: 'Rola na Queda',
  height: 15,
  targetTime: 55,
  sections: [
    // 1) Telhado alto: a dica do rolamento e a beirada pra pular. Largura 14
    //    (chão de apoio cols 0-9, vão/beirada cols 10-13).
    {
      bands: [
        [0, 3, dot(14)],
        [4, 4, 'S' + dot(13)],
        [5, 12, wall(10) + dot(4)],
        [13, 14, wall(14)],
      ],
      entities: [
        { type: 'sticker', id: 's1', tx: 2, ty: 4 },
        { type: 'tutorial', tx: 3, ty: 4, w: 5, move: 'roll', text: 'Caiu de muito alto? Toque B (ou Espaço) pouco antes de pousar pra rolar!' },
        { type: 'coin', id: 'c01', tx: 4, ty: 4 },
        { type: 'coin', id: 'c02', tx: 6, ty: 4 },
        { type: 'checkpoint', id: 'cp0', tx: 8, ty: 4 },
      ],
    },
    // 2) Pouso da primeira queda: chão largo e liso, sem nada logo depois —
    //    o primeiro treino tem que ser seguro. Largura 10.
    {
      bands: [
        [0, 12, dot(10)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 3, ty: 12 },
        { type: 'coin', id: 'c04', tx: 6, ty: 12 },
      ],
    },
    // 3) Revisão: um vapor e a beirada (andaime de 4 tiles, como a Fase 7).
    //    Largura 16.
    {
      bands: [
        [0, 8, dot(16)],
        [9, 11, dot(10) + wall(6)],
        [12, 12, dot(10) + wall(6)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 1, ty: 12 },
        { type: 'coin', id: 'c05', tx: 3, ty: 12 },
        { type: 'coin', id: 'c06', tx: 5, ty: 12 },
        { type: 'steam', tx: 7, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'sticker', id: 's2', tx: 13, ty: 8 },
      ],
    },
    // 4) Escadinha (degraus de 2 tiles, nenhum movimento novo) até o telhado
    //    da segunda queda. Largura 10.
    {
      bands: [
        [0, 4, dot(10)],
        [5, 6, dot(8) + wall(2)],
        [7, 8, dot(6) + wall(4)],
        [9, 10, dot(4) + wall(6)],
        [11, 12, dot(2) + wall(8)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c07', tx: 3, ty: 10 },
        { type: 'coin', id: 'c08', tx: 7, ty: 6 },
        { type: 'checkpoint', id: 'cp2', tx: 9, ty: 4 },
      ],
    },
    // 5) Segunda queda: pouso largo e, alguns passos depois, um túnel baixo
    //    — rolando, o Kem já está agachado e passa direto por baixo; tonto,
    //    só perde um tempinho e passa andando/deslizando. Largura 14.
    {
      bands: [
        [0, 4, dot(14)],
        [5, 11, wall(2) + dot(6) + wall(4) + dot(2)],
        [12, 12, wall(2) + dot(12)],
        [13, 14, wall(14)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 3, ty: 12 },
        { type: 'sticker', id: 's3', tx: 4, ty: 12 },
        { type: 'coin', id: 'c10', tx: 5, ty: 12 },
        { type: 'coin', id: 'c11', tx: 13, ty: 12 },
      ],
    },
    // 6) Segunda escadinha, igual à primeira, até o telhado da terceira
    //    queda. Largura 10.
    {
      bands: [
        [0, 4, dot(10)],
        [5, 6, dot(8) + wall(2)],
        [7, 8, dot(6) + wall(4)],
        [9, 10, dot(4) + wall(6)],
        [11, 12, dot(2) + wall(8)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c12', tx: 3, ty: 10 },
        { type: 'checkpoint', id: 'cp3', tx: 9, ty: 4 },
      ],
    },
    // 7) Terceira queda: pouso largo e, logo depois, um buraco de 3 tiles —
    //    pede corrida. Rolando, o Kem já sai correndo com velocidade pro
    //    pulo; tonto, dá tempo de levantar e correr antes do buraco (o chão
    //    de pouso é bem largo). Largura 14.
    {
      bands: [
        [0, 4, dot(14)],
        [5, 12, wall(2) + dot(12)],
        [13, 14, wall(9) + dot(3) + wall(2)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 4, ty: 12 },
        { type: 'coin', id: 'c14', tx: 6, ty: 12 },
      ],
    },
    // 8) Chegada. Largura 6.
    {
      bands: [
        [0, 12, dot(6)],
        [13, 14, wall(6)],
      ],
      entities: [
        { type: 'coin', id: 'c15', tx: 1, ty: 12 },
        { type: 'flag', tx: 3, ty: 12 },
      ],
    },
  ],
});
