import { buildLevel } from './build.js';

const dot = (n) => '.'.repeat(n);
const wall = (n) => '#'.repeat(n);

// Fase 14 do Centro — "Guindastes". Um passo além da Fase 11, do nível da
// Fase 10 ("Entre as paredes") — não mais difícil que ela. O tema são os
// guindastes de obra: sobe num elevador de carga, atravessa um vão pendurado
// numa carga que vai e volta, sobe de novo numa carga que anda na diagonal,
// e desce duas vezes das alturas rolando (a Fase 13 ensinou o rolamento; aqui
// ele só reaparece — errar o rolamento custa 1s de tonteira, nunca é
// perigoso). Junta ainda um cano de vapor e um ventilador, como o resto do
// Bairro. Nenhum movimento novo: jump, deslizar e rolar.
export const BAIRRO_14 = buildLevel({
  id: 'bairro-14',
  name: 'Guindastes',
  height: 15,
  targetTime: 60,
  sections: [
    // 1) Rua do canteiro de obras. Largura 9.
    {
      bands: [
        [0, 11, dot(9)],
        [12, 12, '.S' + dot(7)],
        [13, 14, wall(9)],
      ],
      entities: [
        { type: 'coin', id: 'c01', tx: 4, ty: 12 },
        { type: 'coin', id: 'c02', tx: 7, ty: 12 },
      ],
    },
    // 2) O elevador de carga: poço nas colunas 8-9, sobe da rua (ty:13) até
    //    o topo do guindaste (ty:5, rente ao telhado). O primeiro adesivo
    //    fica pouco acima do topo: dá pra pegar com um pulinho ao chegar
    //    lá em cima (errar só devolve pro elevador ou pro telhado). Largura 14.
    {
      bands: [
        [0, 4, dot(14)],
        [5, 12, dot(10) + wall(4)],
        [13, 14, wall(8) + dot(2) + wall(4)],
      ],
      entities: [
        { type: 'coin', id: 'c03', tx: 4, ty: 12 },
        { type: 'platform', w: 2, from: { tx: 8, ty: 13 }, to: { tx: 8, ty: 5 }, speed: 55 },
        { type: 'sticker', id: 's1', tx: 9, ty: 1 },
        { type: 'coin', id: 'c04', tx: 11, ty: 4 },
        { type: 'checkpoint', id: 'cp1', tx: 12, ty: 4 },
      ],
    },
    // 3) A carga do guindaste: vão de 9 tiles entre dois telhados, largo
    //    demais pra pular — só dá pra atravessar de carona na plataforma.
    //    Cair no vão volta pro checkpoint. Largura 20.
    {
      bands: [
        [0, 4, dot(20)],
        [5, 14, wall(3) + dot(9) + wall(8)],
      ],
      entities: [
        { type: 'platform', w: 3, from: { tx: 3, ty: 5 }, to: { tx: 9, ty: 5 }, speed: 50 },
        { type: 'coin', id: 'c05', tx: 14, ty: 4 },
        { type: 'checkpoint', id: 'cp2', tx: 15, ty: 4 },
      ],
    },
    // 4) Primeira queda alta (8 tiles) do fim do telhado: rolando, o Kem
    //    pousa já correndo e salta o buraco de 4 tiles logo depois; tonto,
    //    tem chão de sobra pra levantar e pegar corrida. O segundo adesivo
    //    fica no caminho da queda. Largura 17.
    {
      bands: [
        [0, 12, dot(17)],
        [13, 14, wall(12) + dot(4) + wall(1)],
      ],
      entities: [
        { type: 'sticker', id: 's2', tx: 2, ty: 9 },
        { type: 'coin', id: 'c06', tx: 5, ty: 12 },
        { type: 'checkpoint', id: 'cp3', tx: 8, ty: 12 },
        { type: 'coin', id: 'c07', tx: 16, ty: 12 },
      ],
    },
    // 5) Segunda carga: sobe na diagonal, da rua (1 tile acima do chão) até
    //    o telhado do outro guindaste. Cair só devolve pra rua. Largura 16.
    {
      bands: [
        [0, 4, dot(16)],
        [5, 12, dot(12) + wall(4)],
        [13, 14, wall(16)],
      ],
      entities: [
        { type: 'coin', id: 'c08', tx: 2, ty: 12 },
        { type: 'platform', w: 3, from: { tx: 4, ty: 12 }, to: { tx: 9, ty: 5 }, speed: 60 },
        { type: 'checkpoint', id: 'cp4', tx: 12, ty: 4 },
      ],
    },
    // 6) Telhado com um cano de vapor (2 tiles de jato, dá pra esperar ou
    //    pular), até a beirada da segunda queda. Largura 8.
    {
      bands: [
        [0, 4, dot(8)],
        [5, 14, wall(8)],
      ],
      entities: [
        { type: 'steam', tx: 2, ty: 4, dir: 'up', length: 2, onMs: 1200, offMs: 2400, offsetMs: 0 },
        { type: 'coin', id: 'c09', tx: 5, ty: 4 },
      ],
    },
    // 7) Segunda queda alta (8 tiles) e um túnel baixo logo depois: rolando,
    //    o Kem já está agachado e passa direto; tonto, desliza. Antes do
    //    túnel há 6 tiles livres de corrida. Largura 15.
    {
      bands: [
        [0, 4, dot(15)],
        [5, 11, dot(10) + wall(4) + dot(1)],
        [12, 12, dot(15)],
        [13, 14, wall(15)],
      ],
      entities: [
        { type: 'coin', id: 'c10', tx: 3, ty: 12 },
        { type: 'checkpoint', id: 'cp5', tx: 7, ty: 12 },
        { type: 'coin', id: 'c11', tx: 11, ty: 12 },
        { type: 'coin', id: 'c12', tx: 12, ty: 12 },
      ],
    },
    // 8) Reta final: um vão de 6 tiles com o ventilador soprando a favor
    //    (como o da Fase 12), e a bandeira do outro lado. Largura 17.
    {
      bands: [
        [0, 12, dot(17)],
        [13, 14, wall(4) + dot(6) + wall(7)],
      ],
      entities: [
        { type: 'fan', tx: 3, ty: 12, dir: 1, range: 10, push: 220 },
        { type: 'sticker', id: 's3', tx: 7, ty: 10 },
        { type: 'coin', id: 'c13', tx: 11, ty: 12 },
        { type: 'coin', id: 'c14', tx: 12, ty: 12 },
        { type: 'flag', tx: 14, ty: 12 },
      ],
    },
  ],
});
