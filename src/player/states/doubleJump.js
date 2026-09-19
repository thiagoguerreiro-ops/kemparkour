import { PHYS } from '../../config.js';
import { startJump } from './basic.js';

export function tryDoubleJump(kem, dt, input, map) {
  if (!kem.can('doublejump') || kem.jumpBuffer <= 0 || kem.airJumps <= 0) return false;
  kem.airJumps -= 1;
  startJump(kem, PHYS.DOUBLE_JUMP_VY);
  return true;
}
