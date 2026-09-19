import { TILE } from '../config.js';
import { bodyBox } from './collide.js';

// Quanto tempo o cano avisa (treme/solta fumacinha) antes de o jato ligar.
export const STEAM_WARN_MS = 400;
// O jato é um pouco mais fino que o tile, para não parecer injusto.
const JET_MARGIN = 6;
const FAN_ZONE_TILES = 3;

export function steamPhase(s, tMs) {
  const cycle = s.onMs + s.offMs;
  const p = (((tMs + s.offsetMs) % cycle) + cycle) % cycle;
  if (p >= s.offMs) return 'on';
  if (p >= s.offMs - STEAM_WARN_MS) return 'warn';
  return 'off';
}

// O jato começa no tile (tx, ty) e avança `length` tiles na direção `dir`.
export function steamRect(s) {
  const x0 = s.tx * TILE;
  const y0 = s.ty * TILE;
  const len = s.length * TILE;
  switch (s.dir) {
    case 'up':
      return { left: x0 + JET_MARGIN, right: x0 + TILE - JET_MARGIN, top: y0 + TILE - len, bottom: y0 + TILE };
    case 'down':
      return { left: x0 + JET_MARGIN, right: x0 + TILE - JET_MARGIN, top: y0, bottom: y0 + len };
    case 'left':
      return { left: x0 + TILE - len, right: x0 + TILE, top: y0 + JET_MARGIN, bottom: y0 + TILE - JET_MARGIN };
    default: // right
      return { left: x0, right: x0 + len, top: y0 + JET_MARGIN, bottom: y0 + TILE - JET_MARGIN };
  }
}

function overlaps(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

export function steamHits(s, tMs, kem) {
  return steamPhase(s, tMs) === 'on' && overlaps(bodyBox(kem), steamRect(s));
}

// O vento sopra `range` tiles à frente, numa faixa de 3 tiles de altura.
export function fanZone(f) {
  const x0 = f.tx * TILE;
  const bottom = (f.ty + 1) * TILE;
  const top = bottom - FAN_ZONE_TILES * TILE;
  if (f.dir > 0) return { left: x0 + TILE, right: x0 + TILE + f.range * TILE, top, bottom };
  return { left: x0 - f.range * TILE, right: x0, top, bottom };
}

// Empurrão em px/s (o Kem não perde o controle; é um deslocamento somado).
export function fanPush(f, kem) {
  return overlaps(bodyBox(kem), fanZone(f)) ? f.dir * f.push : 0;
}
