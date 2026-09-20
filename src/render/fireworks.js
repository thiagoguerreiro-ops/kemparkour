// Matemática pura dos fogos de artifício (sem Phaser): dá pra testar com
// `node --test`. Um foguete sobe até um ponto do céu, explode em várias
// faíscas que caem com a gravidade e vão sumindo. `Fireworks` (em
// src/ui/fireworksDisplay.js) só desenha o que estas funções calculam.

export const FIREWORK_COLORS = [
  0xffd23f, // amarelo
  0xe23b3b, // vermelho
  0x7a5cff, // roxo
  0xffffff, // branco
  0x5ecbff, // azul-céu
];

export const SPARKS_PER_BURST = 24;
export const MAX_SPARKS = 300; // teto de faíscas vivas ao mesmo tempo (iPhone)
export const LAUNCH_EVERY_S = 0.4;
export const RISE_S = 0.55; // quanto o foguete demora pra subir
export const BURST_S = 1.5; // quanto as faíscas duram depois da explosão
export const FIREWORK_S = RISE_S + BURST_S;

const GRAVITY = 240; // px/s² puxando as faíscas pra baixo
const DRAG = 1.6; // as faíscas perdem velocidade rápido (estouro que "abre e para")

// Sorteio com semente (mulberry32): mesmo número -> mesmos fogos, o que deixa
// os testes previsíveis. No jogo a semente vem de Math.random.
export function seededRand(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Um fogo novo: de onde o foguete sai (x0, y0, embaixo), onde explode
// (x, y, no céu), a cor e a velocidade da explosão. `area` = { x0, x1, yMin,
// yMax, groundY } — o retângulo do céu onde as explosões podem acontecer.
export function createFirework(rand, area, colors = FIREWORK_COLORS) {
  const x = area.x0 + rand() * (area.x1 - area.x0);
  const y = area.yMin + rand() * (area.yMax - area.yMin);
  const color = colors[Math.floor(rand() * colors.length) % colors.length];
  return {
    x0: x + (rand() - 0.5) * 60,
    y0: area.groundY,
    x,
    y,
    color,
    speed: 160 + rand() * 100,
    phase: rand() * Math.PI * 2,
    count: SPARKS_PER_BURST,
  };
}

// Onde está o foguete (subindo, devagar no fim) `age` segundos depois do
// lançamento; null quando já explodiu.
export function rocketAt(fw, age) {
  if (age < 0 || age >= RISE_S) return null;
  const k = age / RISE_S;
  const e = 1 - (1 - k) * (1 - k); // sobe rápido e desacelera
  return { x: fw.x0 + (fw.x - fw.x0) * e, y: fw.y0 + (fw.y - fw.y0) * e };
}

// A faísca `i` do fogo `fw`, `age` segundos depois do lançamento. Escreve
// em `out` ({x, y, alpha, size}) pra não criar objeto a cada quadro; devolve
// `out`, ou null se ainda não explodiu / já sumiu.
export function sparkAt(fw, i, age, out = {}) {
  const t = age - RISE_S;
  if (t < 0 || t >= BURST_S) return null;
  // Duas "camadas" de faíscas (rápidas e lentas) formam uma bola cheia.
  const ring = i % 2 === 0 ? 1 : 0.62;
  const angle = fw.phase + (i / fw.count) * Math.PI * 2;
  const v = fw.speed * ring;
  // Velocidade com atrito: deslocamento = v * (1 - e^(-k t)) / k.
  const travel = (1 - Math.exp(-DRAG * t)) / DRAG;
  out.x = fw.x + Math.cos(angle) * v * travel;
  out.y = fw.y + Math.sin(angle) * v * travel + 0.5 * GRAVITY * t * t;
  const life = t / BURST_S;
  out.alpha = 1 - life * life;
  out.size = 7 - 4 * life;
  return out;
}

// Quantas faíscas ainda estão vivas.
export function activeSparks(fw, age) {
  const t = age - RISE_S;
  return t >= 0 && t < BURST_S ? fw.count : 0;
}

export function isDone(fw, age) {
  return age >= FIREWORK_S;
}

// Pode lançar mais um fogo sem passar do teto de faíscas? (Conta também as
// faíscas que ainda vão nascer dos foguetes que estão subindo.)
export function canLaunch(fireworks, ages, extra = SPARKS_PER_BURST) {
  let n = 0;
  for (let i = 0; i < fireworks.length; i++) {
    if (ages[i] < FIREWORK_S) n += fireworks[i].count;
  }
  return n + extra <= MAX_SPARKS;
}
