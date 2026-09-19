import { VIEW } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { MAP_POINTS } from '../levels/map.js';
import { browserStorage, loadSave, levelProgress, isUnlocked, shopState, availableCoins } from '../save/save.js';
import { countStars } from '../world/scoring.js';
import { CityBackdrop } from '../render/cityBackdrop.js';
import { KemRenderer } from '../render/kemRenderer.js';
import { outfitFor } from '../render/outfits.js';
import { TITLE_FONT } from '../ui/graffitiTitle.js';
import { addBackButton } from '../ui/backButton.js';

// O mapa do bairro: as 10 fases viram pontos num caminho, com o Kem parado
// no ponto da última fase jogada (ou andando até o ponto novo, se acabou de
// destravar uma fase). Substitui a antiga `LevelSelectScene`.

const HEADER_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '24px', fontStyle: 'bold',
  color: '#ffffff',
};
// Mesma letra de grafite do logo da tela inicial.
const TITLE_STYLE = {
  fontFamily: `"${TITLE_FONT}", system-ui, sans-serif`, fontSize: '40px',
  color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 8,
};
const NUMBER_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '26px', fontStyle: 'bold',
  color: '#1d1d24',
};
const LOCK_STYLE = { fontFamily: 'system-ui, sans-serif', fontSize: '24px' };

const POINT_R = 32; // diâmetro 64 — bem acima do alvo mínimo de toque
const WALK_SPEED = 190; // px/s — a mesma sensação de corrida do jogo
const OPEN_FILL = 0xffffff;
const PLAYED_FILL = 0xffe9b0;
const LOCK_FILL = 0x8a939e;
const FOCUS_RING = 0xe0a300;
const STAR_ORDER = ['complete', 'fast', 'allStickers'];

// Pontos de uma estrela de 5 pontas, centrada em (cx, cy).
function starPoints(cx, cy, outerR, innerR) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = -Math.PI / 2 + i * (Math.PI / 5);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

// Onde o Kem pisa quando está "no" ponto i: em cima do marquinho redondo,
// não atravessando o número/estrelas.
function kemSpotFor(i) {
  const p = MAP_POINTS[i];
  return { x: p.x, y: p.y - POINT_R };
}

export class MapScene extends Phaser.Scene {
  constructor() {
    super('Map');
  }

  init(data) {
    this.info = data ?? {};
  }

  create() {
    const save = loadSave(browserStorage());
    this.backdrop = new CityBackdrop(this);

    addBackButton(this, 'Title');

    // Cabeçalho: título e o total de estrelas / moedas do save.
    this.add.text(VIEW.W / 2, 40, 'BAIRRO DO KEM', TITLE_STYLE).setOrigin(0.5).setDepth(10)
      .setAngle(-3).setShadow(4, 4, '#e23b3b', 0, true, true);
    const totalStars = LEVELS.reduce((n, lv) => n + countStars(levelProgress(save, lv.id).stars), 0);
    const plaque = this.add.graphics().setDepth(9);
    plaque.fillStyle(0x1d1d24, 0.7);
    plaque.fillRoundedRect(16, 10, 250, 40, 12);
    this.add.text(38, 30, `⭐ ${totalStars} de ${LEVELS.length * 3}   🪙 ${availableCoins(save)}`, HEADER_STYLE)
      .setOrigin(0, 0.5).setDepth(10);

    // O caminho, ligando os pontos na ordem das fases.
    const path = this.add.graphics().setDepth(-5);
    this._drawPath(path, 14, 0xffffff, 0.55);
    this._drawPath(path, 6, 0xffd08a, 0.9);

    // Um ponto por fase.
    this.points = MAP_POINTS.map((p, i) => this._buildPoint(p, i, save));

    // O Kem: em pé no ponto da última fase jogada, ou andando até o ponto
    // novo se acabou de destravar uma fase — a recompensa de terminar.
    this.kemView = new KemRenderer(this, outfitFor(shopState(save)));
    this.kemView.scale = 1.8;
    this.kemState = { x: 0, y: 0, vx: 0, vy: 0, facing: 1, state: 'ground', stateTime: 0 };
    this.walk = null;
    this._setupKem(save);

    // Foco de teclado começa na próxima fase a jogar.
    this.focus = this._nextPlayableIndex(save);
    this._paintFocus();
    this.input.keyboard.on('keydown-RIGHT', () => this._moveFocus(1));
    this.input.keyboard.on('keydown-DOWN', () => this._moveFocus(1));
    this.input.keyboard.on('keydown-LEFT', () => this._moveFocus(-1));
    this.input.keyboard.on('keydown-UP', () => this._moveFocus(-1));
    const confirm = () => this._activate(this.focus);
    this.input.keyboard.on('keydown-SPACE', confirm);
    this.input.keyboard.on('keydown-ENTER', confirm);
  }

  _drawPath(g, width, color, alpha) {
    g.lineStyle(width, color, alpha);
    g.beginPath();
    g.moveTo(MAP_POINTS[0].x, MAP_POINTS[0].y);
    for (let i = 1; i < MAP_POINTS.length; i++) g.lineTo(MAP_POINTS[i].x, MAP_POINTS[i].y);
    g.strokePath();
  }

  _buildPoint(p, i, save) {
    const level = LEVELS[i];
    const open = isUnlocked(save, LEVELS, i);
    const progress = levelProgress(save, level.id);

    const c = this.add.container(p.x, p.y).setDepth(2);
    const g = this.add.graphics();
    const fill = !open ? LOCK_FILL : (progress.complete ? PLAYED_FILL : OPEN_FILL);
    g.fillStyle(0x000000, 0.25);
    g.fillCircle(3, 5, POINT_R);
    g.fillStyle(fill, 1);
    g.fillCircle(0, 0, POINT_R);
    g.lineStyle(4, 0x1d1d24, 0.9);
    g.strokeCircle(0, 0, POINT_R);
    c.add(g);

    const label = this.add.text(0, open ? -2 : 0, open ? String(i + 1) : '🔒',
      open ? NUMBER_STYLE : LOCK_STYLE).setOrigin(0.5);
    c.add(label);

    if (open) {
      c.add(this._buildStars(progress.stars));
    }

    const ring = this.add.graphics().setVisible(false);
    ring.lineStyle(4, FOCUS_RING, 1);
    ring.strokeCircle(0, 0, POINT_R + 6);
    c.add(ring);

    g.setInteractive({
      hitArea: new Phaser.Geom.Circle(0, 0, POINT_R),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      useHandCursor: true,
    });
    g.on('pointerup', () => {
      this.focus = i;
      this._paintFocus();
      this._activate(i);
    });

    return { container: c, ring, open, x: p.x, y: p.y, shaking: false };
  }

  // As 3 estrelas da fase, desenhadas (não em texto): cheias e douradas
  // quando ganhas, ocas e cinzas quando não.
  _buildStars(stars) {
    const g = this.add.graphics();
    const cy = POINT_R + 20;
    STAR_ORDER.forEach((key, i) => {
      const cx = (i - 1) * 20;
      const pts = starPoints(cx, cy, 9, 3.6);
      const earned = Boolean(stars?.[key]);
      g.fillStyle(earned ? 0xffd23f : 0xd9dde3, 1);
      g.fillPoints(pts, true);
      g.lineStyle(1.5, earned ? 0xb3790a : 0x8a939e, 1);
      g.strokePoints(pts, true);
    });
    return g;
  }

  _paintFocus() {
    this.points.forEach((pt, i) => pt.ring.setVisible(i === this.focus));
  }

  _moveFocus(delta) {
    this.focus = Math.max(0, Math.min(this.points.length - 1, this.focus + delta));
    this._paintFocus();
  }

  _activate(index) {
    const pt = this.points[index];
    if (!pt.open) {
      this._shakeLock(pt);
      return;
    }
    this.scene.start('Game', { levelIndex: index });
  }

  _shakeLock(pt) {
    if (pt.shaking) return;
    pt.shaking = true;
    const baseX = pt.container.x;
    this.tweens.add({
      targets: pt.container, x: baseX + 7, duration: 55, yoyo: true, repeat: 5,
      ease: 'Sine.easeInOut',
      onComplete: () => { pt.container.x = baseX; pt.shaking = false; },
    });
  }

  // Índice da próxima fase ainda não concluída (ou a última, se já fez tudo).
  _nextPlayableIndex(save) {
    const i = LEVELS.findIndex((lv) => !levelProgress(save, lv.id).complete);
    return i === -1 ? LEVELS.length - 1 : i;
  }

  // Índice da fase mais avançada já concluída, ou -1 se nenhuma.
  _lastCompletedIndex(save) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (levelProgress(save, LEVELS[i].id).complete) return i;
    }
    return -1;
  }

  _setupKem(save) {
    const { justCompletedIndex, justUnlocked } = this.info;
    let standIndex;
    if (typeof justCompletedIndex === 'number' && MAP_POINTS[justCompletedIndex]) {
      standIndex = justCompletedIndex;
    } else {
      const last = this._lastCompletedIndex(save);
      standIndex = last === -1 ? 0 : last;
    }

    const start = kemSpotFor(standIndex);
    this.kemState.x = start.x;
    this.kemState.y = start.y;
    this.kemState.vx = 0;

    const nextIndex = standIndex + 1;
    if (justUnlocked && MAP_POINTS[nextIndex]) {
      this.walk = kemSpotFor(nextIndex);
    }
  }

  update(time, deltaMs) {
    const dt = deltaMs / 1000;
    this.backdrop.update(deltaMs);

    if (this.walk) {
      const dx = this.walk.x - this.kemState.x;
      const dy = this.walk.y - this.kemState.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        this.kemState.x = this.walk.x;
        this.kemState.y = this.walk.y;
        this.kemState.vx = 0;
        this.walk = null;
      } else {
        const step = Math.min(dist, WALK_SPEED * dt);
        this.kemState.x += (dx / dist) * step;
        this.kemState.y += (dy / dist) * step;
        this.kemState.facing = dx >= 0 ? 1 : -1;
        this.kemState.vx = WALK_SPEED * this.kemState.facing;
      }
    }

    this.kemView.draw(this.kemState, dt);
  }
}
