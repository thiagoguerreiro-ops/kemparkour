import { TILE } from '../config.js';

const EPS = 1e-6;

export function bodyBox(b) {
  return { left: b.x - b.w / 2, right: b.x + b.w / 2, top: b.y - b.h, bottom: b.y };
}

function boxAny(left, top, right, bottom, test) {
  const tx0 = Math.floor(left / TILE);
  const tx1 = Math.floor((right - EPS) / TILE);
  const ty0 = Math.floor(top / TILE);
  const ty1 = Math.floor((bottom - EPS) / TILE);
  for (let ty = ty0; ty <= ty1; ty++) {
    for (let tx = tx0; tx <= tx1; tx++) if (test(tx, ty)) return true;
  }
  return false;
}

export function boxHitsSolid(map, left, top, right, bottom) {
  return boxAny(left, top, right, bottom, (tx, ty) => map.isSolid(tx, ty));
}

export function bodyHitsSolid(b, map) {
  const { left, top, right, bottom } = bodyBox(b);
  return boxHitsSolid(map, left, top, right, bottom);
}

export function overlapsRunWall(b, map) {
  const { left, top, right, bottom } = bodyBox(b);
  return boxAny(left, top, right, bottom, (tx, ty) => map.isRunWall(tx, ty));
}

export function isOnGround(b, map) {
  const { left, right, bottom } = bodyBox(b);
  return boxHitsSolid(map, left, bottom, right, bottom + 1);
}

// 1 = parede encostada à direita, -1 = à esquerda, 0 = nenhuma
export function wallSide(b, map) {
  const { left, right, top, bottom } = bodyBox(b);
  if (boxHitsSolid(map, right, top + 4, right + 1, bottom - 4)) return 1;
  if (boxHitsSolid(map, left - 1, top + 4, left, bottom - 4)) return -1;
  return 0;
}

export function hasHeadroom(b, map, h) {
  const { left, right } = bodyBox(b);
  return !boxHitsSolid(map, left, b.y - h, right, b.y);
}

function moveX(b, dx, map, hits) {
  if (dx === 0) return;
  b.x += dx;
  const { left, top, right, bottom } = bodyBox(b);
  if (!boxHitsSolid(map, left, top, right, bottom)) return;
  if (dx > 0) {
    b.x = Math.floor((right - EPS) / TILE) * TILE - b.w / 2;
    hits.right = true;
  } else {
    b.x = (Math.floor(left / TILE) + 1) * TILE + b.w / 2;
    hits.left = true;
  }
}

function moveY(b, dy, map, hits) {
  if (dy === 0) return;
  b.y += dy;
  const { left, top, right, bottom } = bodyBox(b);
  if (!boxHitsSolid(map, left, top, right, bottom)) return;
  if (dy > 0) {
    b.y = Math.floor((bottom - EPS) / TILE) * TILE;
    hits.down = true;
  } else {
    b.y = (Math.floor(top / TILE) + 1) * TILE + b.h;
    hits.up = true;
  }
}

// Move em pedaços de no máximo meio tile para nunca atravessar paredes.
export function moveAndCollide(b, dx, dy, map) {
  const hits = { left: false, right: false, up: false, down: false };
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / (TILE / 2)));
  for (let i = 0; i < steps; i++) {
    moveX(b, dx / steps, map, hits);
    moveY(b, dy / steps, map, hits);
  }
  if (hits.left || hits.right) b.vx = 0;
  if (hits.up || hits.down) b.vy = 0;
  return hits;
}
