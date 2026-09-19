import { PHYS } from '../../config.js';
import { applyGravity, move, inputDir } from '../physics.js';
import { wallSide } from '../../world/collide.js';
import { startJump, land } from './basic.js';
import { tryLedgeGrab } from './ledge.js';

function wallJump(kem, side) {
  kem.vx = -side * PHYS.WALL_JUMP_VX;
  kem.facing = -side;
  kem.controlLock = PHYS.WALL_JUMP_LOCK;
  kem.airJumps = 1;
  startJump(kem, PHYS.WALL_JUMP_VY);
}

export function tryWallJump(kem, dt, input, map) {
  if (!kem.can('walljump') || kem.jumpBuffer <= 0) return false;
  const side = wallSide(kem, map);
  if (side === 0) return false;
  wallJump(kem, side);
  return true;
}

export function tryWallSlide(kem, dt, input, map) {
  if (!kem.can('walljump') || kem.vy <= 0) return false;
  const side = wallSide(kem, map);
  if (side === 0 || inputDir(input) !== side) return false;
  kem.facing = side;
  kem.airJumps = 1;
  kem.setState('wallslide');
  return true;
}

export function wallSlideState(kem, dt, input, map) {
  if (tryLedgeGrab(kem, dt, input, map)) return;
  const side = wallSide(kem, map);
  if (side !== 0 && kem.jumpBuffer > 0) {
    wallJump(kem, side);
    return;
  }
  if (side === 0 || inputDir(input) !== side) {
    kem.setState('air');
    return;
  }
  kem.vx = side * 30; // continua encostado
  applyGravity(kem, dt, PHYS.WALL_SLIDE_MAX);
  const hits = move(kem, dt, map);
  kem.apexY = kem.y; // descida lenta não conta como queda alta
  if (hits.down) land(kem, input, map);
}
