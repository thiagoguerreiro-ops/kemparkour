import { PHYS, BODY } from '../../config.js';
import { applyGravity, move, inputDir } from '../physics.js';
import { hasHeadroom } from '../../world/collide.js';
import { groundCheck } from '../../world/platforms.js';
import { startJump } from './basic.js';

export function trySlide(kem, dt, input, map) {
  if (!kem.can('slide') || kem.actionBuffer <= 0) return false;
  if (Math.abs(kem.vx) < PHYS.SLIDE_MIN_SPEED) return false;
  kem.actionBuffer = 0;
  kem.h = BODY.H_LOW;
  kem.vx = Math.sign(kem.vx) * Math.max(Math.abs(kem.vx), PHYS.SLIDE_SPEED);
  kem.setState('slide');
  return true;
}

export function slideState(kem, dt, input, map) {
  let dir = Math.sign(kem.vx) || kem.facing;
  const canStand = hasHeadroom(kem, map, BODY.H);
  if (kem.jumpBuffer > 0 && canStand) {
    kem.h = BODY.H;
    startJump(kem);
    return;
  }
  if (kem.stateTime >= PHYS.SLIDE_TIME) {
    if (canStand) {
      kem.h = BODY.H;
      kem.setState('ground');
      return;
    }
    // Preso embaixo de algo: continua deslizando, e o jogador pode escolher o lado.
    const want = inputDir(input);
    if (want !== 0) dir = want;
  }
  kem.facing = dir;
  kem.vx = dir * Math.max(PHYS.SLIDE_MIN_KEEP, Math.abs(kem.vx) - PHYS.SLIDE_FRICTION * dt);
  applyGravity(kem, dt);
  const hits = move(kem, dt, map);
  if (!groundCheck(kem, map, hits)) {
    if (hasHeadroom(kem, map, BODY.H)) kem.h = BODY.H;
    kem.setState('air');
  }
}

export function keepLowIfNoHeadroom(kem, input, map) {
  if (kem.h === BODY.H || hasHeadroom(kem, map, BODY.H)) {
    kem.h = BODY.H;
    return false;
  }
  kem.setState('slide');
  return true;
}
