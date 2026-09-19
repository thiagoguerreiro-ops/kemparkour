import { PHYS } from '../../config.js';
import { move, inputDir } from '../physics.js';
import { overlapsRunWall } from '../../world/collide.js';
import { startJump } from './basic.js';

export function tryWallRun(kem, dt, input, map) {
  if (!kem.can('wallrun') || kem.wallrunUsed) return false;
  const dir = inputDir(input);
  if (dir === 0 || !overlapsRunWall(kem, map)) return false;
  kem.wallrunUsed = true;
  kem.facing = dir;
  kem.vx = dir * PHYS.WALLRUN_SPEED;
  kem.vy = 0;
  kem.setState('wallrun');
  return true;
}

export function wallRunState(kem, dt, input, map) {
  if (kem.jumpBuffer > 0) {
    startJump(kem, PHYS.WALLRUN_JUMP_VY);
    return;
  }
  const ended = kem.stateTime >= PHYS.WALLRUN_TIME
    || inputDir(input) !== kem.facing
    || !overlapsRunWall(kem, map);
  if (ended) {
    kem.setState('air');
    return;
  }
  kem.vx = kem.facing * PHYS.WALLRUN_SPEED;
  kem.vy = 0;
  const hits = move(kem, dt, map);
  kem.apexY = kem.y;
  if (hits.left || hits.right) kem.setState('air');
}
