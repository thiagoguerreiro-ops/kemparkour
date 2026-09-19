import { bodyBox } from './collide.js';

const TRIGGER_HALF_W = 16;
const TRIGGER_H = 96;

export function createCheckpoints(defs) {
  return {
    list: defs.map((d) => ({ id: d.id, x: d.x, y: d.y, lit: false })),
    activeId: null,
  };
}

// Acende o checkpoint tocado pela primeira vez e o transforma no ponto de volta do Kem.
export function touchCheckpoints(cps, kem) {
  const b = bodyBox(kem);
  for (const c of cps.list) {
    if (c.lit) continue;
    const hit = b.right > c.x - TRIGGER_HALF_W && b.left < c.x + TRIGGER_HALF_W
      && b.bottom > c.y - TRIGGER_H && b.top < c.y;
    if (!hit) continue;
    c.lit = true;
    cps.activeId = c.id;
    kem.spawn = { x: c.x, y: c.y };
    return c.id;
  }
  return null;
}
