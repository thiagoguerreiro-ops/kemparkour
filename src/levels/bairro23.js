import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);

// Fase 23 da Cidade à noite — "Antenas". A terceira do bairro: torres altas e
// finas, com antenas piscando no topo. Sem movimento novo e sem dica: é uma
// revisão do que o Kem aprendeu, com UMA corrida na parede e DUAS barras
// (cada uma com o vão de 8-9 tiles, a barra na coluna 5 e pouso largo). Um pouco
// mais difícil que a Fase 22, no nível das Fases 18-20; nenhum obstáculo
// passa da dificuldade da Fase 10, e nunca há mais de 25 tiles entre
// checkpoints.
//   1) telhado do começo e três torrezinhas (vãos de 3-4 tiles, um degrau);
//   2) a rua, com UM cano de vapor, e o elevador que sobe a antena (7 tiles);
//   3) o topo da antena, com o ventilador soprando a favor sobre um vão de 7;
//   4) a primeira barra: vão de 9 tiles, barra na coluna 5, dois telhados;
//   5) um telhado mais baixo e a corrida na parede: vão de 10 tiles, muro
//      grafitado de 2 linhas colado na beirada e o pouso no mesmo nível;
//   6) a segunda barra (vão de 8 tiles) e a torre da bandeira.
export const BAIRRO_23 = buildLevel({
  id: 'bairro-23',
  name: 'Antenas',
  height: 15,
  targetTime: 66,
  sections: [
    // 1) Telhado do começo (chão em ty 10). Largura 9.
    {
      bands: [
        [0, 9, dot(9)],
        [10, 10, '.S' + dot(7)],
        [11, 14, wall(9)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 10 },
        { type: 'coin', id: 'c02', tx: 7, ty: 10 },
      ],
    },
    // 2) Três torrezinhas de antena: vãos de 3, 4 e 3 tiles (a segunda torre
    //    um degrau acima, a terceira volta ao nível da primeira). O primeiro
    //    adesivo paira no arco do segundo vão. Largura 20 (torres: cols 3-5,
    //    10-12 e 16-19).
    {
      bands: [
        [0, 8, dot(20)],
        [9, 9, dot(10) + wall(3) + dot(7)],
        [10, 14, dot(3) + wall(3) + dot(4) + wall(3) + dot(3) + wall(4)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 4, ty: 7 },
        { type: 'sticker', id: 's1', tx: 8, ty: 6 },
        { type: 'checkpoint', id: 'cp0', tx: 11, ty: 8 },
        { type: 'coin', id: 'c04', tx: 14, ty: 6 },
        { type: 'coin', id: 'c05', tx: 18, ty: 9 },
      ],
    },
    // 3) A rua, com um cano de vapor entre o checkpoint e o elevador (pula
    //    por cima ou espera apagar). Largura 10.
    {
      bands: [
        [0, 12, dot(10)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 2, ty: 12 },
        { type: 'steam', tx: 6, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c06', tx: 4, ty: 12 },
        { type: 'coin', id: 'c07', tx: 8, ty: 12 },
      ],
    },
    // 4) O elevador: poço de 2 tiles (cols 0-1) que sobe da rua (ty:13) até o
    //    topo da antena (ty:6, rente ao telhado). No topo, o checkpoint e o
    //    ventilador na ponta, soprando pro vão. O segundo adesivo paira sobre
    //    a antena. Largura 6.
    {
      bands: [
        [0, 5, dot(6)],
        [6, 14, dot(2) + wall(4)],
      ],
      entities: [
        { type: 'platform', w: 2, from: { tx: 0, ty: 13 }, to: { tx: 0, ty: 6 }, speed: 55 },
        { type: 'sticker', id: 's2', tx: 3, ty: 2 },
        { type: 'checkpoint', id: 'cp2', tx: 3, ty: 5 },
        { type: 'fan', tx: 5, ty: 5, dir: 1, range: 10, push: 220 },
      ],
    },
    // 5) O vão do ventilador: 7 tiles, o vento a favor. Cair só devolve pro
    //    topo da antena. Largura 7.
    {
      bands: [
        [0, 14, dot(7)],
      ],
      entities: [
        { type: 'coin', id: 'c08', tx: 3, ty: 4 },
      ],
    },
    // 6) Telhado do pouso (chão em ty 6) e o checkpoint, 5 tiles antes da
    //    beirada da primeira barra. Largura 8.
    {
      bands: [
        [0, 6, dot(8)],
        [7, 14, wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 2, ty: 6 },
      ],
    },
    // 7) A primeira barra: vão de 9 tiles, barra na coluna 5 (4 tiles antes
    //    da beirada de lá), 2 tiles acima do chão (agarra com um pulo,
    //    balança, solta pro outro lado). Largura 9.
    {
      bands: [
        [0, 3, dot(9)],
        [4, 4, dot(5) + '=' + dot(3)],
        [5, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 6, ty: 5 },
      ],
    },
    // 8) Pouso: um telhado curto (ty 6) e, três tiles abaixo, o telhado do
    //    checkpoint, a 6 tiles da beirada do vão da corrida. Largura 13.
    {
      bands: [
        [0, 6, dot(13)],
        [7, 9, wall(5) + dot(8)],
        [10, 14, wall(13)],
      ],
      entities: [
        { type: 'coin', id: 'c10', tx: 2, ty: 5 },
        { type: 'checkpoint', id: 'cp4', tx: 7, ty: 9 },
        { type: 'coin', id: 'c11', tx: 10, ty: 9 },
      ],
    },
    // 9) A corrida na parede: vão de 10 tiles com o muro grafitado nas linhas
    //    5-6, colado na beirada (mesma geometria da Fase 22). O terceiro
    //    adesivo fica logo abaixo do muro: quem corre pega de brinde.
    //    Largura 10.
    {
      bands: [
        [0, 4, dot(10)],
        [5, 6, graf(10)],
        [7, 14, dot(10)],
      ],
      entities: [
        { type: 'sticker', id: 's3', tx: 4, ty: 7 },
      ],
    },
    // 10) Pouso largo no mesmo nível (o muro avança 2 tiles) e o checkpoint
    //     antes da segunda barra. Largura 9.
    {
      bands: [
        [0, 4, dot(9)],
        [5, 6, graf(2) + dot(7)],
        [7, 9, dot(9)],
        [10, 14, wall(9)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp5', tx: 3, ty: 9 },
        { type: 'coin', id: 'c12', tx: 6, ty: 9 },
      ],
    },
    // 11) A segunda barra: vão de 8 tiles, barra na coluna 5 (3 tiles antes
    //     da beirada de lá), a 2 tiles acima do chão. Largura 8.
    {
      bands: [
        [0, 6, dot(8)],
        [7, 7, dot(5) + '=' + dot(2)],
        [8, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 6, ty: 6 },
      ],
    },
    // 12) A torre da bandeira. Largura 7.
    {
      bands: [
        [0, 9, dot(7)],
        [10, 14, wall(7)],
      ],
      entities: [
        { type: 'coin', id: 'c14', tx: 1, ty: 9 },
        { type: 'flag', tx: 4, ty: 9 },
      ],
    },
  ],
});
