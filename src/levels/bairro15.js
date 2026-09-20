import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 15 do Centro — "Chaminés altas". A vitrine do wall jump no Centro: três
// chaminés de 3-4 tiles de vão, cada uma com uma reviravolta — a primeira tem
// um jato de vapor no meio do vão (espera apagar, como na Fase 10), a segunda
// termina numa quina estreita que só se alcança agarrando a beirada, e na
// terceira um elevador de carga sobe o Kem até a boca. Depois, uma queda alta
// pra rolar (a Fase 13 ensinou o rolamento; errar só custa 1s de tonteira) e
// um telhado curto com ventilador. Do nível da Fase 10 ("Entre as paredes"),
// não mais difícil que ela. Nenhum movimento novo: jump, deslizar, beirada,
// wall jump e rolar.
export const BAIRRO_15 = buildLevel({
  id: 'bairro-15',
  name: 'Chaminés altas',
  height: 15,
  targetTime: 54,
  sections: [
    // 1) Rua, com o checkpoint antes da primeira chaminé. Largura 12.
    {
      bands: [
        [0, 11, dot(12)],
        [12, 12, '.S' + dot(10)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 5, ty: 12 },
        { type: 'coin', id: 'c02', tx: 8, ty: 12 },
        { type: 'checkpoint', id: 'cp0', tx: 10, ty: 12 },
      ],
    },
    // 2) Primeira chaminé: vão de 3 tiles (cols 7-9), sobe 6, com um jato de
    //    vapor no meio do vão (col 8, linhas 7-9) — escalando de parede em
    //    parede o Kem passa rente às paredes, fora do jato, e só cruza o
    //    meio na última troca (espera apagar). A parede esquerda "flutua"
    //    (col 6, linhas 6-10: 2 tiles livres embaixo pra entrar andando; ela
    //    passa 1 tile do telhado, o que dá folga na última troca de parede).
    //    O primeiro adesivo fica junto da parede esquerda, a meia altura do
    //    vão (col 7, linha 7): pega-se escalando, sem ficar em cima do jato.
    //    No topo, telhado e um degrau de 3 tiles descendo de volta pra rua
    //    (sem queda de 7+ tiles). Largura 18.
    {
      bands: [
        [0, 5, dot(18)],
        [6, 6, dot(6) + '#' + dot(11)],
        [7, 9, dot(6) + '#' + dot(3) + wall(5) + dot(3)],
        [10, 10, dot(6) + '#' + dot(3) + wall(8)],
        [11, 12, dot(10) + wall(8)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'steam', tx: 8, ty: 9, dir: 'up', length: 3, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'sticker', id: 's1', tx: 7, ty: 7 },
        { type: 'coin', id: 'c03', tx: 11, ty: 6 },
        { type: 'coin', id: 'c04', tx: 13, ty: 6 },
      ],
    },
    // 3) Segunda chaminé: vão de 4 tiles (cols 7-10), sobe 7. O topo é uma
    //    quina estreita (pilar de 3 tiles, cols 11-13): na última troca de
    //    parede o Kem só chega agarrando a beirada (a parede esquerda, de 6
    //    tiles, passa 1 tile do topo do pilar e dá folga). Depois, dois
    //    degraus de 3 tiles descem de volta pra rua. Largura 20.
    {
      bands: [
        [0, 4, dot(20)],
        [5, 5, dot(6) + '#' + dot(13)],
        [6, 8, dot(6) + '#' + dot(4) + wall(3) + dot(6)],
        [9, 10, dot(6) + '#' + dot(4) + wall(6) + dot(3)],
        [11, 11, dot(11) + wall(6) + dot(3)],
        [12, 12, dot(11) + wall(9)],
        [13, 14, wall(20)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp1', tx: 2, ty: 12 },
        { type: 'coin', id: 'c05', tx: 12, ty: 5 },
        { type: 'coin', id: 'c06', tx: 15, ty: 8 },
      ],
    },
    // 4) Terceira chaminé: o elevador de carga sobe pelo vão (cols 7-9) da
    //    rua (1 tile acima do chão, é só dar um pulinho) até a boca (rente
    //    ao topo, ty:5); a parede esquerda "flutua" (linhas 4-10). Dá pra
    //    escalar de parede em parede também (sobe 8, mais difícil). O
    //    segundo adesivo flutua 4 tiles acima da boca: pulo de cima do
    //    elevador. No topo, um telhado largo com checkpoint e, no fim dele,
    //    a queda alta pra rolar (8 tiles). Largura 18.
    {
      bands: [
        [0, 3, dot(18)],
        [4, 4, dot(6) + '#' + dot(11)],
        [5, 10, dot(6) + '#' + dot(3) + wall(8)],
        [11, 12, dot(10) + wall(8)],
        [13, 14, wall(18)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp2', tx: 2, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 8, ty: 12 }, to: { tx: 8, ty: 5 }, speed: 60 },
        { type: 'sticker', id: 's2', tx: 9, ty: 1 },
        { type: 'checkpoint', id: 'cp3', tx: 12, ty: 4 },
        { type: 'coin', id: 'c07', tx: 13, ty: 4 },
        { type: 'coin', id: 'c08', tx: 16, ty: 4 },
      ],
    },
    // 5) Pouso da queda: 8 tiles rolando (Toque B pouco antes de pousar); o
    //    chão é largo e liso, sem nada em cima do pouso. Largura 12.
    {
      bands: [
        [0, 12, dot(12)],
        [13, 14, wall(12)],
      ],
      entities: [
        { type: 'coin', id: 'c09', tx: 4, ty: 12 },
        { type: 'coin', id: 'c10', tx: 7, ty: 12 },
      ],
    },
    // 6) Telhado curto com ventilador: sobe um andaime de 4 tiles (beirada),
    //    vão de 6 tiles com o vento a favor e o telhado da bandeira. Cair
    //    no vão só devolve pra rua (chão firme). Largura 23.
    {
      bands: [
        [0, 8, dot(23)],
        [9, 12, dot(4) + wall(5) + dot(6) + wall(8)],
        [13, 14, wall(23)],
      ],
      entities: [
        { type: 'checkpoint', id: 'cp4', tx: 5, ty: 8 },
        { type: 'fan', tx: 8, ty: 8, dir: 1, range: 10, push: 220 },
        { type: 'coin', id: 'c11', tx: 6, ty: 8 },
        { type: 'sticker', id: 's3', tx: 12, ty: 7 },
        { type: 'coin', id: 'c12', tx: 18, ty: 8 },
        { type: 'coin', id: 'c13', tx: 20, ty: 8 },
        { type: 'flag', tx: 21, ty: 8 },
      ],
    },
  ],
});
