import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 12 do Centro — "Andaimes". Um passo além da Fase 11 (o respiro do
// bairro), do nível da Fase 10 ("Entre as paredes") — não mais difícil que
// ela. Sobe uma torre de andaimes com beirada e chaminé, pega carona num
// guindaste de obra cronometrado com um cano de vapor, atravessa um vão de
// telhado com ventilador a favor, e desce de volta pra rua até a bandeira.
// Só jump, deslizar, beirada e wall jump — nenhum movimento novo.
export const BAIRRO_12 = buildLevel({
  id: 'bairro-12',
  name: 'Andaimes',
  height: 15,
  targetTime: 54,
  sections: [
    // 1) Rua e o primeiro andaime: muro de 4 tiles (beirada), 2 tiles livres
    //    acima da quina. No topo, o primeiro adesivo — reta, sem armadilha.
    {
      bands: [
        [0, 8, dot(22)],
        [9, 11, dot(16) + wall(6)],
        [12, 12, '.' + 'S' + dot(14) + wall(6)],
        [13, 14, wall(22)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 3, ty: 12 },
        { type: 'coin', id: 'c02', tx: 9, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 17, ty: 8 },
        { type: 'sticker', id: 's1', tx: 19, ty: 8 },
        { type: 'coin', id: 'c03', tx: 20, ty: 8 },
      ],
    },
    // 2) Telhados do andaime: vão de 4 tiles pedindo corrida entre duas
    //    lajes, depois desce (cai) de volta pra rua. Coberto pelo cp0.
    {
      bands: [
        [0, 8, dot(12)],
        [9, 11, wall(3) + dot(4) + wall(3) + dot(2)],
        [12, 12, wall(3) + dot(4) + wall(3) + dot(2)],
        [13, 14, wall(3) + dot(4) + wall(5)],
      ],
      entities: [
        { type: 'coin', id: 'c04', tx: 8, ty: 8 },
      ],
    },
    // 3) A chaminé: parede esquerda "flutua" (cols 4-6, só linhas 3-10 — dá
    //    pra andar por baixo dela até o vão), parede direita encosta no chão
    //    (cols 10-12) e de fato bloqueia — vão de 3 tiles (cols 7-9), sobe
    //    até o topo aberto. Sem vapor aqui, só a revisão do wall jump.
    {
      bands: [
        [0, 2, dot(16)],
        [3, 10, dot(4) + wall(3) + dot(3) + wall(3) + dot(3)],
        [11, 12, dot(10) + wall(3) + dot(3)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 1, ty: 12 },
        { type: 'coin', id: 'c05', tx: 2, ty: 12 },
        { type: 'coin', id: 'c06', tx: 14, ty: 12 },
      ],
    },
    // 4) O guindaste de obra: um cano de vapor na aproximação (offMs 2400,
    //    tempo de sobra pra esperar) e o poço do elevador (cols 10-11),
    //    subindo da rua (ty:13) até o telhado alto (ty:5). O segundo
    //    adesivo só dá pra pegar subindo nele até o topo e saltando pro
    //    telhado no momento certo — errar cedo só devolve pra rua, sem
    //    perigo.
    {
      bands: [
        [0, 5, dot(16)],
        [6, 11, dot(12) + wall(4)],
        [12, 12, dot(12) + wall(4)],
        [13, 14, wall(10) + dot(2) + wall(4)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c07', tx: 2, ty: 12 },
        { type: 'steam', tx: 5, ty: 12, dir: 'up', length: 3, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c08', tx: 8, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 10, ty: 13 }, to: { tx: 10, ty: 5 }, speed: 50 },
        { type: 'sticker', id: 's2', tx: 13, ty: 5 },
        { type: 'coin', id: 'c09', tx: 14, ty: 5 },
      ],
    },
    // 5) Telhado com vento a favor: vão de 6 tiles largo demais pra pular
    //    sem ajuda do ventilador, que sopra na mesma direção da travessia.
    {
      bands: [
        [0, 5, dot(14)],
        [6, 12, wall(4) + dot(6) + wall(4)],
        [13, 14, wall(4) + dot(6) + wall(4)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 5 },
        { type: 'coin', id: 'c10', tx: 2, ty: 5 },
        { type: 'fan', tx: 3, ty: 5, dir: 1, range: 10, push: 220 },
        { type: 'coin', id: 'c11', tx: 11, ty: 5 },
      ],
    },
    // 6) Desce de volta pra rua: corredor aberto, queda segura (não
    //    machuca) até o chão firme.
    {
      bands: [
        [0, 12, dot(10)],
        [13, 14, wall(10)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 1, ty: 12 },
        { type: 'coin', id: 'c12', tx: 5, ty: 12 },
      ],
    },
    // 7) Reta final até a bandeira, com o terceiro adesivo no caminho.
    {
      bands: [
        [0, 12, dot(16)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 3, ty: 12 },
        { type: 'coin', id: 'c14', tx: 8, ty: 12 },
        { type: 'sticker', id: 's3', tx: 11, ty: 12 },
        { type: 'coin', id: 'c15', tx: 13, ty: 12 },
        { type: 'flag', tx: 14, ty: 12 },
      ],
    },
  ],
});
