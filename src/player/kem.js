import { BODY, PHYS } from '../config.js';
import { MOVES } from './moves.js';
import { groundState, airState } from './states/basic.js';
import { slideState, trySlide, keepLowIfNoHeadroom } from './states/slide.js';
import { ledgeState, tryLedgeGrab } from './states/ledge.js';
import { wallSlideState, tryWallJump, tryWallSlide } from './states/wall.js';
import { tryDoubleJump } from './states/doubleJump.js';
import { rollState, stunnedState, landRollOrStun } from './states/roll.js';
import { swingState, trySwingGrab } from './states/swing.js';
import { wallRunState, tryWallRun } from './states/wallrun.js';

const STATES = {
  ground: groundState,
  air: airState,
  slide: slideState,
  ledge: ledgeState,
  wallslide: wallSlideState,
  roll: rollState,
  stunned: stunnedState,
  swing: swingState,
  wallrun: wallRunState,
};

const PIPELINE = {
  ground: [trySlide],
  air: [tryWallJump, tryLedgeGrab, trySwingGrab, tryWallRun, tryWallSlide, tryDoubleJump],
  // Ordem importa: se não há espaço para ficar de pé, o Kem continua baixo (agachado/rolando)
  // e não pode ser atordoado ficando em pé — por isso keepLowIfNoHeadroom roda antes de landRollOrStun.
  land: [keepLowIfNoHeadroom, landRollOrStun],
};

export class Kem {
  constructor(spawn, unlocked = MOVES) {
    this.spawn = { x: spawn.x, y: spawn.y };
    this.unlocked = new Set(unlocked);
    this.pipeline = PIPELINE;
    this.respawns = 0;
    this.reset();
  }

  reset() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.w = BODY.W;
    this.h = BODY.H;
    this.facing = 1;
    this.state = 'air';
    this.stateTime = 0;
    this.apexY = this.y;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.actionBuffer = 0;
    this.jumpHeld = false;
    this.airJumps = 1;
    this.controlLock = 0;
    this.grabCooldown = 0;
    this.wallrunUsed = false;
    this.ledge = null;
    this.swing = null;
    this.platform = null;
  }

  respawn() {
    this.respawns += 1;
    this.reset();
  }

  can(move) {
    return this.unlocked.has(move);
  }

  setState(name) {
    if (this.state === name) return;
    this.state = name;
    this.stateTime = 0;
    if (name === 'air') this.apexY = this.y;
  }

  update(dt, input, map) {
    this.stateTime += dt;
    this.coyote = Math.max(0, this.coyote - dt);
    this.controlLock = Math.max(0, this.controlLock - dt);
    this.grabCooldown = Math.max(0, this.grabCooldown - dt);
    this.jumpBuffer = input.jumpPressed ? PHYS.JUMP_BUFFER : Math.max(0, this.jumpBuffer - dt);
    this.actionBuffer = input.actionPressed ? PHYS.ACTION_BUFFER : Math.max(0, this.actionBuffer - dt);
    STATES[this.state](this, dt, input, map);
    if (this.y > map.heightPx + PHYS.FALL_OUT_MARGIN) this.respawn();
  }
}
