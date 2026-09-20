import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 20 do Centro — "Hora do rush". O fecho do Centro: uma revisão de tudo
// que o Kem aprendeu, numa fase comprida, na ordem — descer rolando, o andaime
// (beirada), a chaminé (wall jump), o vão de 10 tiles (pulo duplo), UMA barra
// (Fase 19), o túnel com vapor (deslizar), o telhado do ventilador e, no fim,
// o guindaste que leva à bandeira, no alto da torre mais alta do Centro.
// Nenhum obstáculo é mais difícil que os da Fase 10 ("Entre as paredes"); o
// que cresce é o comprimento, e por isso há tantos checkpoints (nunca mais de
// 18 tiles entre eles): errar nunca custa muito. Sem movimento novo e sem dica:
// a barra é só a da Fase 19 outra vez, com um vão folgado e o meio bem no meio.
export const BAIRRO_20 = buildLevel({
  id: 'bairro-20',
  name: 'Hora do rush',
  height: 15,
  targetTime: 74,
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
    // 2) Pouso (rua larga e lisa) e o andaime: muro de 5 tiles (beirada),
    //    2 tiles livres acima da quina, 4 tiles de corrida depois do
    //    checkpoint. O segundo adesivo pede um pulinho em cima do andaime.
    //    Largura 19.
    {
      bands: [
        [0, 7, dot(19)],
        [8, 12, dot(8) + wall(5) + dot(6)],
        [13, 14, wall(19)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 2, ty: 12 },
        { type: 'checkpoint', id: 'cp1', tx: 4, ty: 12 },
        { type: 'sticker', id: 's2', tx: 9, ty: 5 },
        { type: 'coin', id: 'c04', tx: 11, ty: 7 },
        { type: 'coin', id: 'c05', tx: 14, ty: 12 },
        { type: 'checkpoint', id: 'cp2', tx: 16, ty: 12 },
      ],
    },
    // 3) A chaminé: vão de 3 tiles (cols 7-9), sobe 6 até o telhado. A parede
    //    esquerda (col 6) flutua (2 tiles livres embaixo, dá pra andar por
    //    baixo) e o topo fica livre pra sair. Largura 18.
    {
      bands: [
        [0, 4, dot(18)],
        [5, 6, dot(6) + '#' + dot(11)],
        [7, 10, dot(6) + '#' + dot(3) + wall(8)],
        [11, 12, dot(10) + wall(8)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'coin', id: 'c06', tx: 3, ty: 12 },
        { type: 'coin', id: 'c07', tx: 8, ty: 8 },
        { type: 'coin', id: 'c08', tx: 12, ty: 6 },
        { type: 'checkpoint', id: 'cp3', tx: 13, ty: 6 },
      ],
    },
    // 4) O vão do pulo duplo: 10 tiles no alto, com o checkpoint 5 tiles antes
    //    da beirada. O terceiro adesivo paira sobre o vão, no arco do pulo
    //    duplo. Largura 10.
    {
      bands: [
        [0, 14, dot(10)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 2, ty: 4 },
        { type: 'sticker', id: 's3', tx: 5, ty: 2 },
        { type: 'coin', id: 'c10', tx: 7, ty: 4 },
      ],
    },
    // 5) Telhado do pouso (8 tiles) e a descida de 6 tiles de volta pra rua.
    //    Dois checkpoints: um no pouso, outro na rua, antes da barra.
    //    Largura 15.
    {
      bands: [
        [0, 6, dot(15)],
        [7, 12, wall(8) + dot(7)],
        [13, 14, wall(15)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 2, ty: 6 },
        { type: 'coin', id: 'c11', tx: 5, ty: 6 },
        { type: 'coin', id: 'c12', tx: 9, ty: 12 },
        { type: 'checkpoint', id: 'cp5', tx: 11, ty: 12 },
      ],
    },
    // 6) A barra: buraco de 10 tiles na rua com a barra perto do meio (col 3), a 2
    //    tiles acima do chão (agarra com um pulo, balança, solta pro outro
    //    lado). Vão folgado e pouso largo do outro lado. Largura 10.
    {
      bands: [
        [0, 9, dot(10)],
        [10, 10, dot(3) + '=' + dot(6)],
        [11, 14, dot(10)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 5, ty: 8 },
      ],
    },
    // 7) O túnel baixo (deslizar): checkpoint no pouso, 4 tiles de corrida
    //    livres até a boca e o cano de vapor 2 tiles pra dentro. Na saída,
    //    o checkpoint antes do andaime. Largura 16.
    {
      bands: [
        [0, 4, dot(16)],
        [5, 11, dot(5) + wall(7) + dot(4)],
        [12, 12, dot(16)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp6', tx: 1, ty: 12 },
        { type: 'steam', tx: 7, ty: 12, dir: 'up', length: 1, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c14', tx: 9, ty: 12 },
        { type: 'coin', id: 'c15', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp7', tx: 14, ty: 12 },
      ],
    },
    // 8) O telhado do ventilador: andaime de 4 tiles (beirada), vão de 6
    //    tiles com o vento a favor e o telhado do outro lado, com checkpoint.
    //    Cair no vão só devolve pra rua (chão firme). Largura 18.
    {
      bands: [
        [0, 8, dot(18)],
        [9, 12, dot(1) + wall(5) + dot(6) + wall(6)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'fan', tx: 5, ty: 8, dir: 1, range: 10, push: 220 },
        { type: 'coin', id: 'c16', tx: 9, ty: 7 },
        { type: 'checkpoint', id: 'cp8', tx: 14, ty: 8 },
      ],
    },
    // 9) O guindaste: depois da descida de 4 tiles, poço de 2 tiles (cols 5-6)
    //    que sobe da rua (ty:13) até o telhado da torre mais alta (ty:4, rente
    //    ao telhado). Largura 12.
    {
      bands: [
        [0, 3, dot(12)],
        [4, 12, dot(7) + wall(5)],
        [13, 14, wall(5) + dot(2) + wall(5)],
      ],
      entities: [
        { type: 'coin', id: 'c17', tx: 2, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 5, ty: 13 }, to: { tx: 5, ty: 4 }, speed: 60 },
      ],
    },
    // 10) Telhado da torre mais alta, com a bandeira. Largura 8.
    {
      bands: [
        [0, 3, dot(8)],
        [4, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c18', tx: 1, ty: 3 },
        { type: 'flag', tx: 3, ty: 3 },
      ],
    },
  ],
});
