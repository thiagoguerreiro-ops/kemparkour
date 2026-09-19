import { TILE } from '../config.js';
import { steamPhase, steamRect, fanZone } from '../world/hazards.js';

const COLORS = {
  post: 0x5e6670,
  lampOff: 0xb8c0cc,
  lampOn: 0x3ddc84,
  flag: 0xff5fa2,
  coin: 0xffc93c,
  coinTaken: 0xffe9a3,
  stickerFace: 0xffd23f,
  stickerEdge: 0xffffff,
  ink: 0x222222,
  steam: 0xffffff,
  metal: 0x8a939e,
  metalDark: 0x5e6670,
  platformTop: 0xffd08a,
};

export class EntityRenderer {
  constructor(scene) {
    this.g = scene.add.graphics().setDepth(5);
    this.time = 0;
  }

  draw(run, dt) {
    this.time += dt;
    const g = this.g;
    g.clear();
    this.drawCheckpoints(g, run);
    this.drawFlag(g, run);
    this.drawCoins(g, run);
    this.drawStickers(g, run);
    this.drawSteams(g, run);
    this.drawFans(g, run);
    this.drawPlatforms(g, run);
  }

  drawCheckpoints(g, run) {
    for (const c of run.checkpoints.list) {
      g.fillStyle(COLORS.post, 1);
      g.fillRect(c.x - 3, c.y - 56, 6, 56);
      g.fillStyle(c.lit ? COLORS.lampOn : COLORS.lampOff, 1);
      g.fillRoundedRect(c.x - 14, c.y - 72, 28, 18, 5);
    }
  }

  drawFlag(g, run) {
    const f = run.flag;
    g.fillStyle(COLORS.post, 1);
    g.fillRect(f.x - 3, f.y - 96, 6, 96);
    const wave = Math.sin(this.time * 4) * 4;
    g.fillStyle(COLORS.flag, 1);
    g.fillTriangle(f.x + 3, f.y - 96, f.x + 3, f.y - 64, f.x + 42 + wave, f.y - 80);
  }

  drawCoins(g, run) {
    for (const c of run.collectibles.coins) {
      if (c.taken) continue;
      const spin = Math.abs(Math.cos(this.time * 3 + c.x * 0.02));
      g.fillStyle(c.wasSaved ? COLORS.coinTaken : COLORS.coin, c.wasSaved ? 0.6 : 1);
      g.fillEllipse(c.x, c.y, 18 * Math.max(0.25, spin), 18);
    }
  }

  drawStickers(g, run) {
    for (const s of run.collectibles.stickers) {
      if (s.taken) continue;
      const y = s.y + Math.sin(this.time * 2.5 + s.x * 0.01) * 3;
      g.fillStyle(COLORS.stickerEdge, 1);
      g.fillCircle(s.x, y, 13);
      g.fillStyle(COLORS.stickerFace, 1);
      g.fillCircle(s.x, y, 11);
      g.fillStyle(COLORS.ink, 1);
      g.fillCircle(s.x - 4, y - 3, 1.8);
      g.fillCircle(s.x + 4, y - 3, 1.8);
      g.lineStyle(2, COLORS.ink, 1);
      g.beginPath();
      g.arc(s.x, y + 1, 6, 0.3, Math.PI - 0.3);
      g.strokePath();
    }
  }

  drawSteams(g, run) {
    const tMs = run.clock * 1000;
    for (const s of run.steams) {
      const phase = steamPhase(s, tMs);
      const x0 = s.tx * TILE;
      const y0 = s.ty * TILE;
      // bico do cano, na base do jato
      g.fillStyle(COLORS.metalDark, 1);
      if (s.dir === 'up') g.fillRect(x0 + 4, y0 + TILE - 8, 24, 8);
      else if (s.dir === 'down') g.fillRect(x0 + 4, y0, 24, 8);
      else if (s.dir === 'left') g.fillRect(x0 + TILE - 8, y0 + 4, 8, 24);
      else g.fillRect(x0, y0 + 4, 8, 24);

      if (phase === 'on') {
        const r = steamRect(s);
        g.fillStyle(COLORS.steam, 0.75);
        g.fillRect(r.left, r.top, r.right - r.left, r.bottom - r.top);
      } else if (phase === 'warn') {
        g.fillStyle(COLORS.steam, 0.45);
        for (let i = 0; i < 3; i++) {
          const k = (this.time * 2 + i * 0.4) % 1;
          g.fillCircle(x0 + TILE / 2, y0 + TILE / 2 - k * 12, 4 + k * 3);
        }
      }
    }
  }

  drawFans(g, run) {
    for (const f of run.fans) {
      const x0 = f.tx * TILE;
      const y0 = f.ty * TILE;
      g.fillStyle(COLORS.metal, 1);
      g.fillRoundedRect(x0 + 3, y0 + 3, TILE - 6, TILE - 6, 5);
      const cx = x0 + TILE / 2;
      const cy = y0 + TILE / 2;
      const a = this.time * 12;
      g.lineStyle(3, COLORS.metalDark, 1);
      for (let i = 0; i < 3; i++) {
        const t = a + (i * Math.PI * 2) / 3;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(t) * 9, cy + Math.sin(t) * 9);
        g.strokePath();
      }
      const zone = fanZone(f);
      g.lineStyle(2, COLORS.steam, 0.4);
      for (let i = 0; i < 3; i++) {
        const y = zone.top + 18 + i * 26;
        const shift = ((this.time * 120 * f.dir) % (TILE * 2) + TILE * 2) % (TILE * 2);
        const x = f.dir > 0 ? zone.left + shift : zone.right - shift;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + f.dir * 18, y);
        g.strokePath();
      }
    }
  }

  drawPlatforms(g, run) {
    for (const p of run.platforms) {
      g.fillStyle(COLORS.metal, 1);
      g.fillRect(p.x, p.y, p.w, p.h);
      g.fillStyle(COLORS.platformTop, 1);
      g.fillRect(p.x, p.y, p.w, 4);
    }
  }
}
