import { PHYS } from '../../config.js';
import { steer, applyGravity, move } from '../physics.js';
import { groundCheck, landOnPlatform } from '../../world/platforms.js';

export function startJump(kem, vy = PHYS.JUMP_VY) {
  kem.vy = vy;
  kem.jumpHeld = true;
  kem.coyote = 0;
  kem.jumpBuffer = 0;
  kem.setState('air');
}

export function land(kem, input, map) {
  kem.airJumps = 1;
  kem.wallrunUsed = false;
  for (const handler of kem.pipeline.land) if (handler(kem, input, map)) return;
  kem.setState('ground');
}

export function groundState(kem, dt, input, map) {
  for (const trigger of kem.pipeline.ground) if (trigger(kem, dt, input, map)) return;
  if (kem.jumpBuffer > 0) {
    startJump(kem);
    return;
  }
  steer(kem, dt, input, PHYS.RUN_ACCEL, PHYS.GROUND_FRICTION);
  applyGravity(kem, dt);
  const hits = move(kem, dt, map);
  if (!groundCheck(kem, map, hits)) {
    kem.setState('air');
    kem.coyote = PHYS.COYOTE_TIME;
  }
}

export function airState(kem, dt, input, map) {
  if (kem.coyote > 0 && kem.jumpBuffer > 0) {
    startJump(kem);
    return;
  }
  for (const trigger of kem.pipeline.air) if (trigger(kem, dt, input, map)) return;
  if (kem.jumpHeld && !input.jump) {
    kem.jumpHeld = false;
    if (kem.vy < PHYS.JUMP_CUT_VY) kem.vy = PHYS.JUMP_CUT_VY;
  }
  steer(kem, dt, input, PHYS.AIR_ACCEL, PHYS.AIR_FRICTION);
  applyGravity(kem, dt);
  const prevY = kem.y;
  const hits = move(kem, dt, map);
  kem.apexY = Math.min(kem.apexY, kem.y);
  if (hits.down || landOnPlatform(kem, prevY, map)) land(kem, input, map);
}
