import { TILE } from '../config.js';
import { parseLevel } from './tilemap.js';
import { bodyBox, moveAndCollide } from './collide.js';
import { parseEntities } from './entities.js';
import { createPlatform, updatePlatform, carryOnPlatform } from './platforms.js';
import { steamHits, fanPush } from './hazards.js';
import { createCheckpoints, touchCheckpoints } from './checkpoints.js';
import {
  createCollectibles, collect, commitStickers, restoreStickers, takenCoinIds, stickerCount,
} from './collectibles.js';
import { runStars } from './scoring.js';
import { Kem } from '../player/kem.js';
import { movesForLevel } from '../player/moves.js';

export const TUTORIAL_SECONDS = 6;
const FLAG_HALF_W = 16;
const FLAG_H = 96;

// Como saber que o jogador acabou de usar o movimento que a dica ensina.
const MOVE_USED = {
  jump: (kem) => kem.state === 'air' && kem.vy < 0,
  slide: (kem) => kem.state === 'slide',
  ledge: (kem) => kem.state === 'ledge',
  walljump: (kem) => kem.controlLock > 0,
  roll: (kem) => kem.state === 'roll',
  // O pulo duplo gasta o pulo extra no ar (recarrega no chão).
  doublejump: (kem) => kem.state === 'air' && kem.airJumps === 0,
  swing: (kem) => kem.state === 'swing',
  wallrun: (kem) => kem.state === 'wallrun',
};

export class LevelRun {
  constructor(level, { number, savedCoinIds = new Set() } = {}) {
    this.level = level;
    this.number = number;
    this.map = parseLevel(level.rows);

    const ents = parseEntities(level.entities);
    this.platforms = ents.platforms.map(createPlatform);
    this.map.platforms = this.platforms;
    this.steams = ents.steams;
    this.fans = ents.fans;
    this.flag = ents.flag;
    this.checkpoints = createCheckpoints(ents.checkpoints);
    this.collectibles = createCollectibles(ents, savedCoinIds);
    this.tutorials = ents.tutorials.map((t) => ({
      ...t,
      left: t.tx * TILE,
      right: (t.tx + t.w) * TILE,
      top: (t.ty - 2) * TILE,
      bottom: (t.ty + 1) * TILE,
      state: 'waiting',
      shownAt: 0,
    }));

    this.kem = new Kem(this.map.spawn, movesForLevel(number));
    this.clock = 0;
    this.timeSec = 0;
    this.started = false;
    this.finished = false;
    this.respawnsSeen = this.kem.respawns;
  }

  // Um passo de física. Devolve o que aconteceu, para som e efeitos.
  step(dt, input) {
    const events = {
      respawned: false, checkpoint: null, coins: [], stickers: [], stickersBack: [], finished: false,
    };
    if (this.finished) return events;

    this.clock += dt;
    if (!this.started && (input.left || input.right || input.jump || input.action)) this.started = true;
    if (this.started) this.timeSec += dt;

    for (const p of this.platforms) updatePlatform(p, dt);
    carryOnPlatform(this.kem, this.map);

    this.kem.update(dt, input, this.map);

    for (const f of this.fans) {
      const push = fanPush(f, this.kem);
      if (push === 0) continue;
      const { vx, vy } = this.kem;
      moveAndCollide(this.kem, push * dt, 0, this.map);
      this.kem.vx = vx;
      this.kem.vy = vy;
    }

    const tMs = this.clock * 1000;
    if (this.steams.some((s) => steamHits(s, tMs, this.kem))) this.kem.respawn();

    if (this.kem.respawns !== this.respawnsSeen) {
      this.respawnsSeen = this.kem.respawns;
      events.respawned = true;
      events.stickersBack = restoreStickers(this.collectibles);
    }

    const cp = touchCheckpoints(this.checkpoints, this.kem);
    if (cp) {
      commitStickers(this.collectibles);
      events.checkpoint = cp;
    }

    const got = collect(this.collectibles, this.kem);
    events.coins = got.coins;
    events.stickers = got.stickers;

    this.updateTutorials();

    if (this.touchesFlag()) {
      this.finished = true;
      commitStickers(this.collectibles);
      events.finished = true;
    }
    return events;
  }

  touchesFlag() {
    const b = bodyBox(this.kem);
    const f = this.flag;
    return b.right > f.x - FLAG_HALF_W && b.left < f.x + FLAG_HALF_W
      && b.bottom > f.y - FLAG_H && b.top < f.y;
  }

  updateTutorials() {
    const b = bodyBox(this.kem);
    for (const t of this.tutorials) {
      if (t.state === 'waiting') {
        const inside = b.right > t.left && b.left < t.right && b.bottom > t.top && b.top < t.bottom;
        if (inside) {
          t.state = 'showing';
          t.shownAt = this.clock;
        }
      } else if (t.state === 'showing') {
        const used = MOVE_USED[t.move]?.(this.kem) ?? false;
        if (used || this.clock - t.shownAt >= TUTORIAL_SECONDS) t.state = 'done';
      }
    }
  }

  activeTutorial() {
    return this.tutorials.find((t) => t.state === 'showing') ?? null;
  }

  hud() {
    return {
      timeSec: this.timeSec,
      coins: takenCoinIds(this.collectibles).length,
      stickers: stickerCount(this.collectibles),
      stickerTotal: this.collectibles.stickers.length,
    };
  }

  result() {
    const stickers = stickerCount(this.collectibles);
    return {
      timeSec: this.timeSec,
      stickers,
      coinIds: takenCoinIds(this.collectibles),
      stars: runStars({
        finished: this.finished,
        timeSec: this.timeSec,
        targetTime: this.level.targetTime,
        stickers,
      }),
    };
  }
}
