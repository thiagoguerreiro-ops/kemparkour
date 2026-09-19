import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 11 do Centro — "Chegando no Centro". Abre o segundo bairro: prédios
// altos, andaimes, guindaste (elevador de obra) e uma balsa sobre um vão
// largo, no fim de tarde. É o respiro do bairro novo: um pouco mais fácil
// que a Fase 10 ("Entre as paredes"), do nível da Fase 8/9. Nenhum
// movimento novo — só jump, deslizar, beirada e wall jump, como na Fase 10.
export const BAIRRO_11 = buildLevel({
  id: 'bairro-11',
  name: 'Chegando no Centro',
  height: 15,
  targetTime: 50,
  sections: [
    // 1) Chão da rua e o primeiro andaime: um muro de 4 tiles (beirada), já
    //    conhecido do Bairro do Kem (largura 28: rua 0-11, andaime 12-27).
    //    No telhado, uma saliência de 2 tiles fora do caminho guarda o
    //    primeiro adesivo — dá pra ignorar e seguir andando embaixo dela.
    {
      bands: [
        [0, 6, dot(28)],
        [7, 8, dot(22) + wall(2) + dot(4)],
        [9, 11, dot(12) + wall(16)],
        [12, 12, '.' + 'S' + dot(10) + wall(16)],
        [13, 14, wall(28)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 12 },
        { type: 'coin', id: 'c02', tx: 9, ty: 12 },
        { type: 'coin', id: 'c03', tx: 19, ty: 8 },
        { type: 'sticker', id: 's1', tx: 22, ty: 6 },
        { type: 'checkpoint', id: 'cp0', tx: 24, ty: 8 },
      ],
    },
    // 2) Corre pelos telhados: vão de 4 tiles (cols 3-6) pedindo corrida
    //    entre dois andaimes (cols 0-2 e 7-9), depois desce (cai) de volta
    //    pra rua (cols 10-11). Largura 12.
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
    // 3) O guindaste (elevador de obra): sobe da rua (ty:13) até o telhado
    //    alto (ty:5). O poço do elevador (cols 6-7) fica livre em toda a
    //    altura pro guindaste passar. O segundo adesivo só dá pra pegar
    //    subindo nele até o topo. Largura 16.
    {
      bands: [
        [0, 5, dot(16)],
        [6, 11, dot(8) + wall(4) + dot(4)],
        [12, 12, dot(8) + wall(4) + dot(4)],
        [13, 14, wall(6) + dot(2) + wall(8)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 1, ty: 12 },
        { type: 'coin', id: 'c05', tx: 3, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 6, ty: 13 }, to: { tx: 6, ty: 5 }, speed: 50 },
        { type: 'sticker', id: 's2', tx: 9, ty: 5 },
        { type: 'coin', id: 'c06', tx: 11, ty: 5 },
      ],
    },
    // 4) Chaminé de revisão do wall jump: parede esquerda "flutua" (col 6,
    //    só linhas 7-10 — dá pra andar por baixo dela até o vão), parede
    //    direita encosta no chão (col 10, linhas 7-14, bloqueia de verdade)
    //    — vão de 3 tiles (cols 7-9), sobe 6. Igual ao padrão da Fase 10.
    //    No topo, telhado curto (cols 10-14) e depois cai de volta pra rua
    //    (cols 15-17). Largura 18.
    {
      bands: [
        [0, 6, dot(18)],
        [7, 10, dot(6) + wall(1) + dot(3) + wall(5) + dot(3)],
        [11, 12, dot(10) + wall(5) + dot(3)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 1, ty: 12 },
        { type: 'coin', id: 'c07', tx: 3, ty: 12 },
        { type: 'coin', id: 'c08', tx: 12, ty: 6 },
      ],
    },
    // 5) A balsa: vão de 8 tiles (cols 2-9), largo demais pra pular. A
    //    superfície fica rente ao chão (ty:13). O terceiro adesivo só dá
    //    pra pegar pulando de cima dela, sobre o vão. Largura 14.
    {
      bands: [
        [0, 12, dot(14)],
        [13, 14, wall(2) + dot(8) + wall(4)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp3', tx: 1, ty: 12 },
        { type: 'platform', w: 3, from: { tx: 2, ty: 13 }, to: { tx: 7, ty: 13 }, speed: 60 },
        { type: 'sticker', id: 's3', tx: 5, ty: 9 },
        { type: 'coin', id: 'c09', tx: 11, ty: 12 },
        { type: 'coin', id: 'c10', tx: 12, ty: 12 },
      ],
    },
    // 6) Um cano de vapor ao ar livre, ritmo tranquilo. Largura 6.
    {
      bands: [
        [0, 12, dot(6)],
        [13, 14, wall(6)],
      ],
      entities: [
        { type: 'coin', id: 'c11', tx: 1, ty: 12 },
        { type: 'steam', tx: 3, ty: 12, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c12', tx: 5, ty: 12 },
      ],
    },
    // 7) Reta final tranquila, pra respirar antes da chegada. Largura 2.
    {
      bands: [
        [0, 12, dot(2)],
        [13, 14, wall(2)],
      ],
      entities: [
        { type: 'coin', id: 'c13', tx: 0, ty: 12 },
      ],
    },
    // 8) Chegada ao Centro. Largura 4.
    {
      bands: [
        [0, 12, dot(4)],
        [13, 14, wall(4)],
      ],
      entities: [
        { type: 'flag', tx: 2, ty: 12 },
      ],
    },
  ],
});
