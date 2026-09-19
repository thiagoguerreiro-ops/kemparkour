import { PHYS, BODY } from '../../config.js';
import { applyGravity, move } from '../physics.js';
import { hasHeadroom } from '../../world/collide.js';
import { groundCheck } from '../../world/platforms.js';

export function landRollOrStun(kem, input, map) {
  if (!kem.can('roll')) return false;
  if (kem.y - kem.apexY < PHYS.ROLL_MIN_FALL) return false;
  if (kem.actionBuffer > 0) {
    kem.actionBuffer = 0;
    const dir = Math.sign(kem.vx) || kem.facing;
    kem.facing = dir;
    kem.vx = dir * Math.max(Math.abs(kem.vx), PHYS.ROLL_SPEED);
    kem.h = BODY.H_LOW;
    kem.setState('roll');
  } else {
    kem.vx = 0;
    kem.setState('stunned');
  }
  return true;
}

export function rollState(kem, dt, input, map) {
  applyGravity(kem, dt);
  const hits = move(kem, dt, map);
  const canStand = hasHeadroom(kem, map, BODY.H);
  if (!groundCheck(kem, map, hits)) {
    if (canStand) kem.h = BODY.H;
    kem.setState('air');
    return;
  }
  if (kem.stateTime >= PHYS.ROLL_TIME && canStand) {
    kem.h = BODY.H;
    kem.setState('ground');
  }
}

export function stunnedState(kem, dt, input, map) {
  kem.vx = 0;
  applyGravity(kem, dt);
  const hits = move(kem, dt, map);
  groundCheck(kem, map, hits);
  if (kem.stateTime >= PHYS.STUN_TIME) kem.setState('ground');
}
