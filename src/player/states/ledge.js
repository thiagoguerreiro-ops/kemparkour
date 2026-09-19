import { PHYS, TILE, BODY } from '../../config.js';
import { inputDir } from '../physics.js';
import { bodyHitsSolid } from '../../world/collide.js';

// Beirada = quina de um tile sólido encostado no Kem, com 2 tiles livres em cima,
// perto da altura das mãos (topo da caixa).
export function findLedge(kem, map) {
  const dir = kem.facing;
  const probeX = dir > 0 ? kem.x + kem.w / 2 + 1 : kem.x - kem.w / 2 - 1;
  const tx = Math.floor(probeX / TILE);
  if (tx < 0 || tx >= map.width) return null; // borda do mapa não é beirada
  const handY = kem.y - kem.h;
  const ty = Math.round(handY / TILE);
  const cornerY = ty * TILE;
  if (Math.abs(handY - cornerY) > PHYS.LEDGE_GRAB_RANGE) return null;
  if (!map.isSolid(tx, ty) || map.isSolid(tx, ty - 1) || map.isSolid(tx, ty - 2)) return null;
  const cornerX = dir > 0 ? tx * TILE : (tx + 1) * TILE;
  return { dir, cornerX, cornerY };
}

export function tryLedgeGrab(kem, dt, input, map) {
  if (!kem.can('ledge') || kem.grabCooldown > 0 || kem.vy < 0) return false;
  const ledge = findLedge(kem, map);
  if (!ledge) return false;
  const oldX = kem.x;
  const oldY = kem.y;
  kem.x = ledge.cornerX - ledge.dir * kem.w / 2;
  kem.y = ledge.cornerY + PHYS.LEDGE_HANG_DROP + kem.h;
  if (bodyHitsSolid(kem, map)) {
    kem.x = oldX;
    kem.y = oldY;
    return false;
  }
  kem.ledge = ledge;
  kem.vx = 0;
  kem.vy = 0;
  kem.airJumps = 1;
  kem.setState('ledge');
  return true;
}

export function ledgeState(kem, dt, input, map) {
  const ledge = kem.ledge;
  if (kem.jumpBuffer > 0) {
    kem.jumpBuffer = 0;
    const oldX = kem.x;
    const oldY = kem.y;
    kem.x = ledge.cornerX + ledge.dir * (kem.w / 2 + 2);
    kem.y = ledge.cornerY;
    if (!bodyHitsSolid(kem, map)) {
      kem.ledge = null;
      kem.wallrunUsed = false;
      kem.h = BODY.H;
      kem.setState('ground');
      return;
    }
    kem.x = oldX;
    kem.y = oldY;
  }
  if (kem.actionBuffer > 0 || inputDir(input) === -ledge.dir) {
    kem.actionBuffer = 0;
    kem.ledge = null;
    kem.grabCooldown = PHYS.LEDGE_REGRAB;
    kem.setState('air');
  }
}
