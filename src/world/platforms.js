import { TILE } from '../config.js';
import { moveAndCollide, isOnGround } from './collide.js';

const PLATFORM_H = 12;
// Estados em que o Kem está apoiado no chão (e portanto é carregado pela plataforma).
const GROUNDED_STATES = new Set(['ground', 'slide', 'roll', 'stunned']);

export function createPlatform(def) {
  const fromX = def.from.tx * TILE;
  const fromY = def.from.ty * TILE;
  const toX = def.to.tx * TILE;
  const toY = def.to.ty * TILE;
  return {
    w: def.w * TILE,
    h: PLATFORM_H,
    speed: def.speed,
    fromX, fromY, toX, toY,
    length: Math.hypot(toX - fromX, toY - fromY),
    t: 0,
    x: fromX,
    y: fromY,
    dx: 0,
    dy: 0,
  };
}

// Vai e volta sem parar: a posição depende só do tempo, então é fácil de testar.
export function updatePlatform(p, dt) {
  const prevX = p.x;
  const prevY = p.y;
  p.t += dt;
  if (p.length > 0) {
    const period = 2 * p.length;
    const walked = (p.t * p.speed) % period;
    const d = walked <= p.length ? walked : period - walked;
    const k = d / p.length;
    p.x = p.fromX + (p.toX - p.fromX) * k;
    p.y = p.fromY + (p.toY - p.fromY) * k;
  }
  p.dx = p.x - prevX;
  p.dy = p.y - prevY;
}

function overlapsX(kem, p) {
  return kem.x + kem.w / 2 > p.x && kem.x - kem.w / 2 < p.x + p.w;
}

// Plataforma logo embaixo dos pés (com folga, porque a gravidade afunda um
// pouquinho o Kem a cada passo).
export function platformUnder(kem, map) {
  for (const p of map.platforms ?? []) {
    if (overlapsX(kem, p) && kem.y >= p.y - 1 && kem.y <= p.y + 6) return p;
  }
  return null;
}

// Pouso só por cima: vale apenas se os pés estavam acima da superfície no passo anterior.
export function landOnPlatform(kem, prevY, map) {
  if (kem.vy < 0) return false;
  for (const p of map.platforms ?? []) {
    const prevTop = p.y - p.dy;
    if (overlapsX(kem, p) && prevY <= prevTop + 0.5 && kem.y >= p.y) {
      kem.y = p.y;
      kem.vy = 0;
      kem.platform = p;
      return true;
    }
  }
  return false;
}

// "Estou no chão?" para os estados apoiados: tiles OU plataforma.
export function groundCheck(kem, map, hits) {
  if (hits.down || isOnGround(kem, map)) {
    kem.platform = null;
    return true;
  }
  const p = platformUnder(kem, map);
  if (p) {
    kem.y = p.y;
    kem.vy = 0;
    kem.platform = p;
    return true;
  }
  kem.platform = null;
  return false;
}

// Antes da física do Kem: a plataforma leva junto quem está em cima dela.
export function carryOnPlatform(kem, map) {
  const p = kem.platform;
  if (!p) return;
  if (!GROUNDED_STATES.has(kem.state)) {
    kem.platform = null;
    return;
  }
  const { vx, vy } = kem;
  moveAndCollide(kem, p.dx, p.dy, map);
  kem.vx = vx;
  kem.vy = vy;
}
