import { VIEW } from '../config.js';
import {
  createFirework, rocketAt, sparkAt, isDone, canLaunch, LAUNCH_EVERY_S,
} from '../render/fireworks.js';

// Fogos de artifício de uma cena: lança um foguete a cada ~0,4 s em lugares
// sorteados do céu e desenha tudo numa única `Graphics` (sem imagens nem
// partículas externas). A conta de onde cada faísca está mora em
// src/render/fireworks.js; aqui só se desenha.

const TRAIL_S = 0.07; // o rastro mostra onde a faísca estava há 0,07 s
const DEFAULT_AREA = { x0: 60, x1: VIEW.W - 60, yMin: 50, yMax: 300, groundY: 470 };

export class Fireworks {
  constructor(scene, { depth = -5, area = DEFAULT_AREA, rand = Math.random } = {}) {
    this.g = scene.add.graphics().setDepth(depth);
    this.area = area;
    this.rand = rand;
    this.fireworks = [];
    this.ages = [];
    this.untilNext = 0; // o primeiro sai já
    this.spark = { x: 0, y: 0, alpha: 0, size: 0 };
    this.trail = { x: 0, y: 0, alpha: 0, size: 0 };
  }

  update(deltaMs) {
    // Um quadro muito demorado (aba escondida) não pode virar rajada de fogos.
    const dt = Math.min(deltaMs, 100) / 1000;
    this.untilNext -= dt;
    if (this.untilNext <= 0) {
      if (canLaunch(this.fireworks, this.ages)) {
        this.fireworks.push(createFirework(this.rand, this.area));
        this.ages.push(0);
      }
      this.untilNext = LAUNCH_EVERY_S * (0.7 + this.rand() * 0.6);
    }

    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      this.ages[i] += dt;
      if (isDone(this.fireworks[i], this.ages[i])) {
        this.fireworks.splice(i, 1);
        this.ages.splice(i, 1);
      }
    }
    this._draw();
  }

  _draw() {
    const g = this.g;
    g.clear();
    for (let i = 0; i < this.fireworks.length; i++) {
      const fw = this.fireworks[i];
      const age = this.ages[i];
      const rocket = rocketAt(fw, age);
      if (rocket) {
        // Foguete com um rabinho de 3 pontinhos.
        for (let k = 0; k < 3; k++) {
          const tail = rocketAt(fw, Math.max(0, age - k * 0.035));
          if (!tail) continue;
          g.fillStyle(0xffffff, 0.9 - k * 0.28);
          g.fillRect(tail.x - 2.5 + k * 0.4, tail.y - 2.5 + k * 0.4, 5 - k, 5 - k);
        }
        continue;
      }
      let lastAlpha = -1;
      for (let s = 0; s < fw.count; s++) {
        const p = sparkAt(fw, s, age, this.spark);
        if (!p) break;
        if (p.alpha !== lastAlpha) { g.fillStyle(fw.color, p.alpha); lastAlpha = p.alpha; }
        g.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        // Rastro: a mesma faísca um instante atrás, menor e mais fraquinha.
        const tail = sparkAt(fw, s, age - TRAIL_S, this.trail);
        if (tail) {
          g.fillStyle(fw.color, tail.alpha * 0.4);
          lastAlpha = -1;
          g.fillRect(tail.x - tail.size * 0.35, tail.y - tail.size * 0.35, tail.size * 0.7, tail.size * 0.7);
        }
      }
    }
  }

  destroy() {
    this.g.destroy();
    this.fireworks = [];
    this.ages = [];
  }
}
