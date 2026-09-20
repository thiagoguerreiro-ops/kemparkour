import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);

// Fase 28 da Cidade à noite — "Vento de arranha-céu". Todos os movimentos, e
// o vento soprando entre os prédios: ventiladores em todo lugar. Cada
// obstáculo é um movimento diferente (como na Fase 25) com um ventilador
// mexendo com ele, sempre com o POUSO sólido e largo do outro lado (a faixa
// do vento termina antes do pouso). Nenhum obstáculo passa da Fase 20/25; o
// desafio é a sequência, e por isso os checkpoints: um antes de cada
// obstáculo, nunca a mais de 22 tiles um do outro. Medido com a física de
// verdade (ventiladores incluídos):
//   1) vão de 11 tiles no alto, vento a favor (200): pulo duplo com folga;
//   2) vão de 7 tiles com vento contra (190) só nos últimos 5 tiles, logo
//      antes do pouso: pulo duplo, um pouco de cuidado;
//   3) vão de 9 tiles com muro grafitado (corrida na parede); o vento contra
//      (150) fica na ponta do pouso e come cerca de 1 tile da corrida;
//   4) a rua, a chaminé de 3 tiles (wall jump, sobe 6) com um ventilador
//      soprando de lado na boca dela, contra a saída (150);
//   5) o vão de 10 tiles com UMA barra bem no meio (4 tiles acima da beirada
//      do telhado), pouso 3 tiles abaixo e um ventilador atrás dela (140);
//   6) o guindaste até a torre da bandeira.
// Movimentos: todos os 8. Sem dica (a Fase 22 já ensinou a última).
export const BAIRRO_28 = buildLevel({
  id: 'bairro-28',
  name: 'Vento de arranha-céu',
  height: 15,
  targetTime: 68,
  sections: [
    // 1) Telhado do começo (ty 9). O checkpoint fica a 5 tiles da beirada; o
    //    ventilador na última coluna sopra pra frente, sobre o vão.
    //    Largura 10.
    {
      bands: [
        [0, 8, dot(10)],
        [9, 9, '.S' + dot(8)],
        [10, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 2, ty: 9 },
        { type: 'checkpoint', id: 'cp0', tx: 4, ty: 9 },
        { type: 'coin', id: 'c02', tx: 7, ty: 9 },
        { type: 'fan', tx: 9, ty: 9, dir: 1, range: 12, push: 200 },
      ],
    },
    // 2) Vão de 11 tiles com vento a favor. O primeiro adesivo paira no meio,
    //    a 3 tiles do telhado: sai num pulo duplo bem dado. Largura 11.
    {
      bands: [[0, 14, dot(11)]],
      entities: [
        { type: 'coin', id: 'c03', tx: 2, ty: 8 },
        { type: 'sticker', id: 's1', tx: 6, ty: 6 },
      ],
    },
    // 3) Pouso largo (mesmo nível), checkpoint a 8 tiles da beirada.
    //    Largura 11.
    {
      bands: [
        [0, 9, dot(11)],
        [10, 14, wall(11)],
      ],
      entities: [
        { type: 'coin', id: 'c04', tx: 1, ty: 9 },
        { type: 'checkpoint', id: 'cp1', tx: 3, ty: 9 },
        { type: 'coin', id: 'c05', tx: 6, ty: 9 },
      ],
    },
    // 4) Vão de 7 tiles: o ventilador está no telhado do outro lado e sopra
    //    pra trás nos últimos 5 tiles do vão. Largura 7.
    {
      bands: [[0, 14, dot(7)]],
      entities: [{ type: 'coin', id: 'c06', tx: 3, ty: 6 }],
    },
    // 5) Pouso com o ventilador na primeira coluna (a faixa do vento fica toda
    //    dentro do vão). Checkpoint a 7 tiles da beirada do muro. Largura 11.
    {
      bands: [
        [0, 9, dot(11)],
        [10, 14, wall(11)],
      ],
      entities: [
        { type: 'fan', tx: 0, ty: 9, dir: -1, range: 5, push: 190 },
        { type: 'coin', id: 'c07', tx: 6, ty: 9 },
        { type: 'checkpoint', id: 'cp2', tx: 3, ty: 9 },
      ],
    },
    // 6) Vão de 9 tiles com o muro grafitado nas linhas 6-7, começando na
    //    beirada (um pulo já entra nele). Largura 9.
    {
      bands: [
        [0, 5, dot(9)],
        [6, 7, graf(9)],
        [8, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c08', tx: 3, ty: 7 },
        { type: 'coin', id: 'c09', tx: 6, ty: 7 },
      ],
    },
    // 7) Pouso largo do muro (o muro avança 2 tiles sobre ele) com o
    //    ventilador contra a corrida na primeira coluna: a faixa (4 tiles)
    //    fica toda dentro do vão. Checkpoint no meio do telhado. Largura 10.
    {
      bands: [
        [0, 5, dot(10)],
        [6, 7, graf(2) + dot(8)],
        [8, 9, dot(10)],
        [10, 14, wall(10)],
      ],
      entities: [
        { type: 'fan', tx: 0, ty: 9, dir: -1, range: 4, push: 150 },
        { type: 'checkpoint', id: 'cp3', tx: 5, ty: 9 },
        { type: 'coin', id: 'c10', tx: 8, ty: 9 },
      ],
    },
    // 8) Desce 3 tiles pra rua (ty 12) e a chaminé: parede esquerda flutuante
    //    (col 8, dá pra andar por baixo), poço de 3 tiles (cols 9-11) e o
    //    prédio da direita, com o telhado 6 tiles acima da rua (ty 6). A
    //    parede esquerda sobra 2 tiles acima do telhado. O ventilador fica na
    //    borda do telhado e sopra de volta sobre a boca da chaminé (linhas
    //    4-6). O segundo adesivo paira na boca. Checkpoint no telhado, a 7
    //    tiles da próxima beirada. Largura 22.
    {
      bands: [
        [0, 4, dot(22)],
        [5, 6, dot(8) + '#' + dot(13)],
        [7, 10, dot(8) + '#' + dot(3) + wall(10)],
        [11, 12, dot(12) + wall(10)],
        [13, 14, wall(22)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 4, ty: 12 },
        { type: 'coin', id: 'c11', tx: 6, ty: 12 },
        { type: 'sticker', id: 's2', tx: 10, ty: 6 },
        { type: 'fan', tx: 12, ty: 6, dir: -1, range: 3, push: 150 },
        { type: 'checkpoint', id: 'cp5', tx: 15, ty: 6 },
        { type: 'coin', id: 'c12', tx: 19, ty: 6 },
      ],
    },
    // 9) A barra: buraco de 10 tiles do telhado da chaminé (ty 6) até o telhado
    //    de baixo (ty 9). A barra fica na coluna 4, 4 tiles acima da beirada
    //    (o Kem agarra no alto do pulo, num trecho largo) e soltar logo depois
    //    de agarrar já atravessa. O terceiro adesivo paira no arco da soltada
    //    (uns 40% das travessias pegam). Largura 10.
    {
      bands: [
        [0, 1, dot(10)],
        [2, 2, dot(4) + '=' + dot(5)],
        [3, 14, dot(10)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 8, ty: 2 },
        { type: 'coin', id: 'c13', tx: 3, ty: 5 },
      ],
    },
    // 10) Telhado do pouso da barra (ty 9, 10 tiles de largura, checkpoint), com
    //     o ventilador atrás da barra na primeira coluna (a faixa do vento fica
    //     no vão), e o guindaste: poço de 2 tiles (cols 10-11) que sobe até a
    //     torre da bandeira (ty:4). Largura 17.
    {
      bands: [
        [0, 3, dot(17)],
        [4, 9, dot(12) + wall(5)],
        [10, 14, wall(10) + dot(2) + wall(5)],
      ],
      entities: [
        { type: 'fan', tx: 0, ty: 9, dir: -1, range: 4, push: 140 },
        { type: 'coin', id: 'c14', tx: 3, ty: 9 },
        { type: 'checkpoint', id: 'cp6', tx: 5, ty: 9 },
        { type: 'coin', id: 'c16', tx: 8, ty: 9 },
        { type: 'platform', w: 2, from: { tx: 10, ty: 10 }, to: { tx: 10, ty: 4 }, speed: 60 },
      ],
    },
    // 11) Telhado da torre da bandeira. Largura 8.
    {
      bands: [
        [0, 3, dot(8)],
        [4, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c15', tx: 1, ty: 3 },
        { type: 'flag', tx: 3, ty: 3 },
      ],
    },
  ],
});
