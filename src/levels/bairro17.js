import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 17 do Centro — "Vento no alto". Um passo além da Fase 16, do nível
// da Fase 10 ("Entre as paredes") — não mais difícil que ela. O pulo duplo
// ainda é novidade: aqui ele aparece com folga, sempre com chão largo do
// outro lado, nunca pedindo tempo perfeito. Lá em cima, nos telhados, o
// vento sopra: a favor estica o pulo, contra encurta (medido com a física
// de verdade: o pulo duplo sem vento alcança ~10 tiles de vão; com vento
// contra, o ventilador tira ~3 tiles, então o vão contra é de 7).
//   1) vão de 10 tiles com vento a favor (o ventilador está na beirada);
//   2) vão de 7 tiles com vento contra (o ventilador está do outro lado);
//   3) o guindaste leva o Kem, na diagonal, pro telhado alto;
//   4) um telhado estreito com um cano de vapor;
//   5) desce pra rua e sobe a chaminé pulando de parede em parede; do topo
//      dela, um vão de 7 tiles e mais 2 tiles de altura pedem o pulo duplo
//      até o telhado da bandeira.
// Movimentos: jump, deslizar, beirada, wall jump, rolamento e pulo duplo.
// Sem barras nem corrida na parede ainda. Os pulos pousam no mesmo nível ou
// mais alto que a decolagem; a única descida é andar pra fora do telhado
// estreito (5 tiles, queda segura).
export const BAIRRO_17 = buildLevel({
  id: 'bairro-17',
  name: 'Vento no alto',
  height: 15,
  targetTime: 58,
  sections: [
    // 1) Telhado do começo (chão em ty 10). O checkpoint fica a 5 tiles da
    //    beirada; o ventilador na ponta sopra pra frente, sobre o vão.
    //    Largura 11.
    {
      bands: [
        [0, 9, dot(11)],
        [10, 10, '.S' + dot(9)],
        [11, 14, wall(11)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 3, ty: 10 },
        { type: 'checkpoint', id: 'cp0', tx: 5, ty: 10 },
        { type: 'coin', id: 'c02', tx: 8, ty: 10 },
        { type: 'fan', tx: 10, ty: 10, dir: 1, range: 11, push: 200 },
      ],
    },
    // 2) Primeiro vão: 10 tiles, com vento a favor (sem vento o pulo duplo
    //    alcança ~10; com o vento sobra folga). O primeiro adesivo paira no
    //    meio: sai de brinde num pulo duplo bem dado. Largura 10.
    {
      bands: [
        [0, 14, dot(10)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 2, ty: 8 },
        { type: 'sticker', id: 's1', tx: 5, ty: 6 },
      ],
    },
    // 3) Pouso largo (11 tiles). Checkpoint com 6 tiles de corrida até o
    //    próximo vão. Largura 11.
    {
      bands: [
        [0, 10, dot(11)],
        [11, 14, wall(11)],
      ],
      entities: [
        { type: 'coin', id: 'c04', tx: 2, ty: 10 },
        { type: 'checkpoint', id: 'cp1', tx: 4, ty: 10 },
        { type: 'coin', id: 'c05', tx: 7, ty: 10 },
      ],
    },
    // 4) Segundo vão: 7 tiles, agora com vento contra (o ventilador fica no
    //    telhado do outro lado e sopra pra trás nos últimos 5 tiles do vão).
    //    Só o pulo duplo atravessa, e o vento pede um pouco de cuidado.
    //    Largura 7.
    {
      bands: [
        [0, 14, dot(7)],
      ],
      entities: [
        { type: 'coin', id: 'c06', tx: 3, ty: 7 },
      ],
    },
    // 5) Telhado do guindaste. O ventilador está na primeira coluna (o vento
    //    sopra só pro lado do vão); o checkpoint fica logo antes do
    //    guindaste. Largura 9.
    {
      bands: [
        [0, 10, dot(9)],
        [11, 14, wall(9)],
      ],
      entities: [
        { type: 'fan', tx: 0, ty: 10, dir: -1, range: 5, push: 160 },
        { type: 'coin', id: 'c07', tx: 3, ty: 10 },
        { type: 'checkpoint', id: 'cp2', tx: 5, ty: 10 },
      ],
    },
    // 6) O guindaste: uma carga (plataforma) que sobe na diagonal de um
    //    telhado até o outro, 4 tiles mais alto. Vão de 9 tiles: dá pra
    //    pular também, mas de carona é o caminho fácil. O segundo adesivo
    //    fica no ar sobre a subida. Largura 9.
    {
      bands: [
        [0, 14, dot(9)],
      ],
      entities: [
        { type: 'platform', w: 3, from: { tx: 0, ty: 11 }, to: { tx: 6, ty: 7 }, speed: 55 },
        { type: 'sticker', id: 's2', tx: 4, ty: 6 },
      ],
    },
    // 7) O telhado estreito do alto (chão em ty 6), com um cano de vapor no
    //    meio: dá pra esperar o jato apagar ou pular por cima. O checkpoint
    //    fica a 4 tiles do jato. Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 14, wall(9)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 6 },
        { type: 'coin', id: 'c08', tx: 3, ty: 6 },
        { type: 'steam', tx: 5, ty: 6, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c09', tx: 7, ty: 6 },
      ],
    },
    // 8) Desce de 5 tiles pra rua (queda de andar, segura) e a chaminé: vão
    //    de 4 tiles entre a parede esquerda (que flutua 2 tiles acima do
    //    chão, dá pra entrar por baixo) e o prédio da direita. Sobe 6 tiles
    //    pulando de parede em parede e sai por cima, no telhado do prédio
    //    (chão em ty 5), onde fica o último checkpoint, com 6 tiles de
    //    corrida até a beirada. O terceiro adesivo paira dentro da chaminé.
    //    Largura 18.
    {
      bands: [
        [0, 5, dot(18)],
        [6, 9, dot(6) + '#' + dot(4) + wall(7)],
        [10, 11, dot(11) + wall(7)],
        [12, 14, wall(18)],
      ],
      entities: [
        { type: 'coin', id: 'c10', tx: 3, ty: 11 },
        { type: 'sticker', id: 's3', tx: 8, ty: 6 },
        { type: 'coin', id: 'c11', tx: 9, ty: 8 },
        { type: 'checkpoint', id: 'cp4', tx: 12, ty: 5 },
        { type: 'coin', id: 'c12', tx: 15, ty: 5 },
      ],
    },
    // 9) O vão final: 7 tiles e o outro telhado 2 tiles mais alto — pulo
    //    duplo, com o telhado largo do outro lado. Largura 7.
    {
      bands: [
        [0, 14, dot(7)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 3, ty: 2 },
      ],
    },
    // 10) Telhado da chegada, o mais alto (chão em ty 3), largo, com a
    //     bandeira. Largura 10.
    {
      bands: [
        [0, 3, dot(10)],
        [4, 14, wall(10)],
      ],
      entities: [
        { type: 'coin', id: 'c14', tx: 2, ty: 3 },
        { type: 'coin', id: 'c15', tx: 4, ty: 3 },
        { type: 'flag', tx: 7, ty: 3 },
      ],
    },
  ],
});
