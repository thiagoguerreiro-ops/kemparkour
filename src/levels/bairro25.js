import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);
const graf = (n) => 'W'.repeat(n);

// Fase 25 da Cidade à noite — "Todos os movimentos". A primeira das fases que
// juntam tudo: uma rota em que cada obstáculo pede um movimento DIFERENTE,
// numa fila, com um checkpoint entre um e outro — descer rolando, o túnel
// baixo com vapor (deslizar), o andaime (beirada), o vão do pulo duplo, o vão
// da corrida na parede (muro grafitado), UMA barra, a chaminé (wall jump) e o
// guindaste até a bandeira. Do tamanho da Fase 20 (o fecho do Centro): nenhum
// obstáculo é mais difícil que os da Fase 10 nem que os das Fases 18 a 22 (são
// os mesmos, com as mesmas medidas); o desafio é a sequência, e por isso tantos
// checkpoints: errar nunca custa mais que um obstáculo. Sem movimento novo e
// sem dica.
export const BAIRRO_25 = buildLevel({
  id: 'bairro-25',
  name: 'Todos os movimentos',
  height: 15,
  targetTime: 78,
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
    //    O terceiro adesivo paira sobre o vão, no arco do pulo duplo.
    //    Largura 9.
    {
      bands: [
        [0, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c06', tx: 2, ty: 5 },
        { type: 'sticker', id: 's3', tx: 4, ty: 3 },
        { type: 'coin', id: 'c07', tx: 6, ty: 5 },
      ],
    },
    // 5) Pouso no telhado (10 tiles, checkpoint) e a descida de 5 tiles pra rua,
    //    com outro checkpoint antes do vão do muro. Largura 16.
    {
      bands: [
        [0, 7, dot(16)],
        [8, 12, wall(9) + dot(7)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 2, ty: 7 },
        { type: 'coin', id: 'c08', tx: 5, ty: 7 },
        { type: 'coin', id: 'c09', tx: 12, ty: 12 },
        { type: 'checkpoint', id: 'cp5', tx: 11, ty: 12 },
      ],
    },
    // 6) O vão da corrida na parede: 9 tiles, muro grafitado nas linhas 8-9
    //    começando na beirada (um pulo normal já entra nele). Largura 9.
    {
      bands: [
        [0, 7, dot(9)],
        [8, 9, graf(9)],
        [10, 14, dot(9)],
      ],
      entities: [
        { type: 'coin', id: 'c10', tx: 3, ty: 9 },
        { type: 'coin', id: 'c11', tx: 6, ty: 9 },
      ],
    },
    // 7) Pouso largo na rua (o muro ainda avança 2 tiles) e o checkpoint antes
    //    da barra, 6 tiles de corrida até a beirada. Largura 10.
    {
      bands: [
        [0, 7, dot(10)],
        [8, 9, graf(2) + dot(8)],
        [10, 12, dot(10)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp6', tx: 4, ty: 12 },
      ],
    },
    // 8) A barra: buraco de 8 tiles na rua com a barra na coluna 5 (3 tiles
    //    antes da beirada de lá), a 2 tiles acima do chão (agarra com um pulo,
    //    balança, solta pro outro lado). Largura 8.
    {
      bands: [
        [0, 9, dot(8)],
        [10, 10, dot(5) + '=' + dot(2)],
        [11, 14, dot(8)],
      ],
      entities: [
        { type: 'coin', id: 'c12', tx: 5, ty: 8 },
      ],
    },
    // 9) Pouso da barra (rua larga), checkpoint, e a chaminé: vão de 3 tiles
    //    (cols 11-13), sobe 6 até o telhado. A parede esquerda (col 10) flutua
    //    (2 tiles livres embaixo, dá pra andar por baixo) e o topo fica livre
    //    pra sair. No telhado, o checkpoint. Largura 24.
    {
      bands: [
        [0, 4, dot(24)],
        [5, 6, dot(10) + '#' + dot(13)],
        [7, 10, dot(10) + '#' + dot(3) + wall(10)],
        [11, 12, dot(14) + wall(10)],
        [13, 14, wall(24)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp7', tx: 6, ty: 12 },
        { type: 'coin', id: 'c13', tx: 12, ty: 8 },
        { type: 'coin', id: 'c14', tx: 17, ty: 5 },
        { type: 'checkpoint', id: 'cp8', tx: 19, ty: 6 },
      ],
    },
    // 10) O fim do telhado e a descida de 6 tiles de volta pra rua, com o
    //     checkpoint antes do guindaste. Largura 9.
    {
      bands: [
        [0, 6, dot(9)],
        [7, 12, wall(2) + dot(7)],
        [13, 14, wall(9)],
      ],
      entities: [
        { type: 'coin', id: 'c15', tx: 4, ty: 12 },
        { type: 'checkpoint', id: 'cp9', tx: 5, ty: 12 },
      ],
    },
    // 11) O guindaste: poço de 2 tiles (cols 5-6) que sobe da rua (ty:13) até
    //     o telhado da torre mais alta (ty:4, rente ao telhado). Largura 12.
    {
      bands: [
        [0, 3, dot(12)],
        [4, 12, dot(7) + wall(5)],
        [13, 14, wall(5) + dot(2) + wall(5)],
      ],
      entities: [
        { type: 'coin', id: 'c16', tx: 2, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 5, ty: 13 }, to: { tx: 5, ty: 4 }, speed: 60 },
      ],
    },
    // 12) Telhado da torre mais alta, com a bandeira. Largura 8.
    {
      bands: [
        [0, 3, dot(8)],
        [4, 14, wall(8)],
      ],
      entities: [
        { type: 'coin', id: 'c17', tx: 1, ty: 3 },
        { type: 'flag', tx: 3, ty: 3 },
      ],
    },
  ],
});
