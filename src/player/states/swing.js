import { PHYS } from '../../config.js';
import { inputDir } from '../physics.js';

export function trySwingGrab(kem, dt, input, map) {
  if (!kem.can('swing') || kem.grabCooldown > 0) return false;
  const handX = kem.x;
  const handY = kem.y - kem.h;
  const bar = map.bars.find((b) => Math.hypot(b.x - handX, b.y - handY) <= PHYS.BAR_GRAB_RADIUS);
  if (!bar) return false;
  kem.swing = { bar, angle: 0, omega: kem.vx / PHYS.SWING_RADIUS };
  kem.vx = 0;
  kem.vy = 0;
  kem.airJumps = 1;
  kem.setState('swing');
  placeOnSwing(kem);
  return true;
}

function placeOnSwing(kem) {
  const { bar, angle } = kem.swing;
  kem.x = bar.x + Math.sin(angle) * PHYS.SWING_RADIUS;
  kem.y = bar.y + Math.cos(angle) * PHYS.SWING_RADIUS;
}

function releaseSwing(kem, boost) {
  const { angle, omega } = kem.swing;
  const r = PHYS.SWING_RADIUS;
  kem.vx = omega * r * Math.cos(angle);
  kem.vy = -omega * r * Math.sin(angle) + boost;
  if (kem.vx !== 0) kem.facing = Math.sign(kem.vx);
  kem.swing = null;
  kem.jumpHeld = false;
  kem.grabCooldown = PHYS.SWING_REGRAB;
  kem.setState('air');
}

// Pêndulo. Segurar uma direção só dá impulso quando o balanço vai para esse lado
// (como numa gangorra de parquinho), então segurar ▶ faz o balanço crescer.
export function swingState(kem, dt, input, map) {
  if (kem.jumpBuffer > 0) {
    kem.jumpBuffer = 0;
    releaseSwing(kem, PHYS.SWING_RELEASE_BOOST);
    return;
  }
  if (kem.actionBuffer > 0) {
    kem.actionBuffer = 0;
    releaseSwing(kem, 0);
    return;
  }
  const s = kem.swing;
  const dir = inputDir(input);
  if (dir !== 0) kem.facing = dir;
  let alpha = -(PHYS.GRAVITY / PHYS.SWING_RADIUS) * Math.sin(s.angle);
  if (dir !== 0 && (dir * s.omega > 0 || Math.abs(s.omega) < 0.5)) alpha += dir * PHYS.SWING_PUMP;
  s.omega += alpha * dt;
  s.omega *= 1 - PHYS.SWING_DAMPING * dt;
  s.angle += s.omega * dt;
  if (Math.abs(s.angle) > PHYS.SWING_MAX_ANGLE) {
    s.angle = Math.sign(s.angle) * PHYS.SWING_MAX_ANGLE;
    s.omega = 0;
  }
  placeOnSwing(kem);
  kem.apexY = kem.y;
}
