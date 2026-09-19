import { PHYS } from '../config.js';
import { moveAndCollide } from '../world/collide.js';

export function approach(v, target, delta) {
  return v < target ? Math.min(v + delta, target) : Math.max(v - delta, target);
}

export function inputDir(input) {
  return (input.right ? 1 : 0) - (input.left ? 1 : 0);
}

// Acelera na direção pedida até RUN_MAX; sem direção, freia. Acima de RUN_MAX
// (vindo de slide, barra ou wall run) desacelera devagar em vez de cortar.
export function steer(kem, dt, input, accel, decel) {
  const locked = kem.controlLock > 0;
  const dir = locked ? 0 : inputDir(input);
  if (dir !== 0) {
    kem.facing = dir;
    const along = dir * kem.vx;
    if (along < PHYS.RUN_MAX) kem.vx = dir * Math.min(PHYS.RUN_MAX, along + accel * dt);
  } else if (!locked) {
    kem.vx = approach(kem.vx, 0, decel * dt);
  }
  if (Math.abs(kem.vx) > PHYS.RUN_MAX) {
    kem.vx = approach(kem.vx, Math.sign(kem.vx) * PHYS.RUN_MAX, PHYS.OVERSPEED_DECAY * dt);
  }
}

export function applyGravity(kem, dt, maxFall = PHYS.MAX_FALL) {
  kem.vy = Math.min(maxFall, kem.vy + PHYS.GRAVITY * dt);
}

export function move(kem, dt, map) {
  return moveAndCollide(kem, kem.vx * dt, kem.vy * dt, map);
}
