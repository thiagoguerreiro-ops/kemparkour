import { VIEW } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { MAP_POINTS, pointsForPage, pageOf, PAGE_SIZE, PAGE_COUNT } from '../levels/map.js';
import { browserStorage, loadSave, levelProgress, isUnlocked, shopState, availableCoins } from '../save/save.js';
import { countStars } from '../world/scoring.js';
import { CityBackdrop } from '../render/cityBackdrop.js';
import { KemRenderer } from '../render/kemRenderer.js';
import { outfitFor } from '../render/outfits.js';
import { NEIGHBORHOOD_IDS, NEIGHBORHOOD_TITLES, themeForBairro } from '../render/themes.js';
import { TITLE_FONT } from '../ui/graffitiTitle.js';
import { addBackButton } from '../ui/backButton.js';

// O mapa: uma página por bairro, com as 10 fases daquele bairro viradas em
// pontos num caminho em "S". O Kem fica parado no ponto da última fase
// jogada (ou andando até o ponto novo, se acabou de destravar uma fase).
// Substitui a antiga `LevelSelectScene`.

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
const SOON_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '15px', fontStyle: 'bold', align: 'center',
  color: '#ffffff',
};
const PAGE_ARROW_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '40px', fontStyle: 'bold', color: '#ffffff',
};

const POINT_R = 32; // diâmetro 64 — bem acima do alvo mínimo de toque
const WALK_SPEED = 190; // px/s — a mesma sensação de corrida do jogo
const OPEN_FILL = 0xffffff;
const PLAYED_FILL = 0xffe9b0;
const LOCK_FILL = 0x8a939e;
const SOON_FILL = 0x6b7280;
const FOCUS_RING = 0xe0a300;
const STAR_ORDER = ['complete', 'fast', 'allStickers'];
const ARROW_R = 34; // diâmetro 68 — acima do alvo mínimo de toque
const PAGE_SLIDE_MS = 420;
const EDGE_WALK_MARGIN = 46; // até onde o Kem sai da tela na virada de bairro

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

// Onde o Kem pisa quando está "no" ponto local i da página: em cima do
// marquinho redondo, não atravessando o número/estrelas.
function kemSpotForLocal(pts, i) {
  const p = pts[i];
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
    this.save = loadSave(browserStorage());

    addBackButton(this, 'Title');

    // Cabeçalho: total de estrelas / moedas do save — fica em todas as
    // páginas, por cima da troca de bairro.
    const totalStars = LEVELS.reduce((n, lv) => n + countStars(levelProgress(this.save, lv.id).stars), 0);
    const plaque = this.add.graphics().setDepth(9);
    plaque.fillStyle(0x1d1d24, 0.7);
    plaque.fillRoundedRect(16, 10, 250, 40, 12);
    this.add.text(38, 30, `⭐ ${totalStars} de ${LEVELS.length * 3}   🪙 ${availableCoins(this.save)}`, HEADER_STYLE)
      .setOrigin(0, 0.5).setDepth(10);

    this._buildPageArrows();

    this.kemView = new KemRenderer(this, outfitFor(shopState(this.save)));
    this.kemView.scale = 1.8;
    this.kemState = { x: 0, y: 0, vx: 0, vy: 0, facing: 1, state: 'ground', stateTime: 0 };
    this.walk = null;
    this.pendingPageSwitch = null;

    this.page = null;
    this.pageLayer = null;
    this.backdrop = null;
    this.points = [];
    this.focus = 0;

    const startPage = this._initialPage();
    this._buildPage(startPage);
    this._setupKem(this.save, startPage);

    this.input.keyboard.on('keydown-RIGHT', () => this._onArrow(1));
    this.input.keyboard.on('keydown-DOWN', () => this._onArrow(1));
    this.input.keyboard.on('keydown-LEFT', () => this._onArrow(-1));
    this.input.keyboard.on('keydown-UP', () => this._onArrow(-1));
    const confirm = () => this._activate(this.focus);
    this.input.keyboard.on('keydown-SPACE', confirm);
    this.input.keyboard.on('keydown-ENTER', confirm);
  }

  // A página que o mapa abre mostrando: a do próximo nível a jogar, a não
  // ser que a tela de resultado tenha pedido uma página específica — nesse
  // caso o mapa sempre começa na página da fase que acabou de terminar,
  // mesmo quando ela destrava a próxima só num bairro novo (a caminhada até
  // a borda + a troca de página, em `_setupKem`, cuidam da transição ao vivo).
  _initialPage() {
    if (typeof this.info.justCompletedIndex === 'number') {
      return pageOf(this.info.justCompletedIndex);
    }
    return pageOf(this._nextPlayableIndex(this.save));
  }

  // --- setas de página ---------------------------------------------------

  _buildPageArrows() {
    this.prevArrow = this._buildArrow(44, '◀', () => this._changePage(-1));
    this.nextArrow = this._buildArrow(VIEW.W - 44, '▶', () => this._changePage(1));
  }

  _buildArrow(x, glyph, onPress) {
    const y = VIEW.H / 2;
    const g = this.add.graphics().setDepth(15);
    g.fillStyle(0x1d1d24, 0.75);
    g.fillCircle(x, y, ARROW_R);
    g.lineStyle(3, 0xffd23f, 0.9);
    g.strokeCircle(x, y, ARROW_R);
    const label = this.add.text(x, y - 2, glyph, PAGE_ARROW_STYLE).setOrigin(0.5).setDepth(16);
    g.setInteractive({
      hitArea: new Phaser.Geom.Circle(x, y, ARROW_R),
      hitAreaCallback: Phaser.Geom.Circle.Contains,
      useHandCursor: true,
    });
    g.on('pointerup', onPress);
    return { g, label, x, y };
  }

  _paintPageArrows() {
    this.prevArrow.g.setAlpha(this.page > 0 ? 1 : 0.35);
    this.nextArrow.g.setAlpha(this.page < PAGE_COUNT - 1 ? 1 : 0.35);
  }

  _onArrow(delta) {
    if (!this.points.length) return;
    const next = this.focus + delta;
    if (next < 0) { this._changePage(-1, { landOn: 'last' }); return; }
    if (next >= this.points.length) { this._changePage(1, { landOn: 'first' }); return; }
    this.focus = next;
    this._paintFocus();
  }

  _changePage(delta, { landOn } = {}) {
    const target = this.page + delta;
    if (target < 0 || target >= PAGE_COUNT) return;
    const focusIndex = landOn === 'last' ? PAGE_SIZE - 1 : 0;
    this._slideToPage(target, delta >= 0 ? 1 : -1, focusIndex);
  }

  // --- construir/trocar de página -----------------------------------------

  // Monta a página (título, caminho, pontos) dentro de um container próprio,
  // pra dar pra deslizar inteira na troca de bairro.
  _buildPage(page, { x = 0 } = {}) {
    const theme = themeForBairro(page);
    this.backdrop?.destroy();
    this.backdrop = new CityBackdrop(this, theme);

    const layer = this.add.container(x, 0).setDepth(1);
    const bairroId = NEIGHBORHOOD_IDS[page];
    const title = this.add.text(VIEW.W / 2, 40, NEIGHBORHOOD_TITLES[bairroId], TITLE_STYLE)
      .setOrigin(0.5).setDepth(10).setAngle(-3).setShadow(4, 4, '#e23b3b', 0, true, true);
    layer.add(title);

    const path = this.add.graphics().setDepth(-5);
    const pts = pointsForPage(page);
    this._drawPath(path, pts, 14, 0xffffff, 0.55);
    this._drawPath(path, pts, 6, 0xffd08a, 0.9);
    layer.add(path);

    const points = pts.map((p, i) => this._buildPoint(p, page * PAGE_SIZE + i, this.save));
    for (const pt of points) layer.add(pt.container);

    this.page = page;
    this.pageLayer = layer;
    this.points = points;
    this._paintPageArrows();
    return layer;
  }

  // Troca de bairro com um deslize curto: a página nova entra pela direita
  // (avançando) ou pela esquerda (voltando), por cima da antiga.
  _slideToPage(target, dir, focusIndex) {
    if (this.transitioning) return;
    this.transitioning = true;
    const oldLayer = this.pageLayer;
    const startX = dir > 0 ? VIEW.W : -VIEW.W;
    this._buildPage(target, { x: startX });
    this.focus = focusIndex;
    this._paintFocus();
    this.tweens.add({
      targets: this.pageLayer, x: 0, duration: PAGE_SLIDE_MS, ease: 'Cubic.easeOut',
      onComplete: () => { oldLayer?.destroy(true); this.transitioning = false; },
    });
    this.kemState.x = kemSpotForLocal(pointsForPage(target), focusIndex).x;
    this.kemState.y = kemSpotForLocal(pointsForPage(target), focusIndex).y;
    this.kemState.vx = 0;
    this.walk = null;
  }

  _drawPath(g, pts, width, color, alpha) {
    g.lineStyle(width, color, alpha);
    g.beginPath();
    g.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
    g.strokePath();
  }

  // `absoluteIndex` é a posição em `MAP_POINTS`/`LEVELS` (0-based, entre 0 e
  // 29); `p` já é o ponto local daquela página.
  _buildPoint(p, absoluteIndex, save) {
    const mapPoint = MAP_POINTS[absoluteIndex];
    const exists = Boolean(mapPoint.id);
    const level = exists ? LEVELS[absoluteIndex] : null;
    const open = exists && isUnlocked(save, LEVELS, absoluteIndex);
    const progress = exists ? levelProgress(save, level.id) : null;

    const c = this.add.container(p.x, p.y).setDepth(2);
    const g = this.add.graphics();
    const fill = !exists ? SOON_FILL : (!open ? LOCK_FILL : (progress.complete ? PLAYED_FILL : OPEN_FILL));
    g.fillStyle(0x000000, 0.25);
    g.fillCircle(3, 5, POINT_R);
    g.fillStyle(fill, 1);
    g.fillCircle(0, 0, POINT_R);
    g.lineStyle(4, 0x1d1d24, 0.9);
    g.strokeCircle(0, 0, POINT_R);
    c.add(g);

    if (!exists) {
      const soon = this.add.text(0, 0, '🚧\nEm breve!', SOON_STYLE).setOrigin(0.5).setLineSpacing(-2);
      c.add(soon);
    } else {
      const label = this.add.text(0, open ? -2 : 0, open ? String(absoluteIndex + 1) : '🔒',
        open ? NUMBER_STYLE : LOCK_STYLE).setOrigin(0.5);
      c.add(label);
      if (open) c.add(this._buildStars(progress.stars));
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
    const localIndex = absoluteIndex % PAGE_SIZE;
    g.on('pointerup', () => {
      this.focus = localIndex;
      this._paintFocus();
      this._activate(localIndex);
    });

    return { container: c, ring, open: exists && open, exists, absoluteIndex, x: p.x, y: p.y, shaking: false };
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

  _activate(localIndex) {
    const pt = this.points[localIndex];
    if (!pt) return;
    if (!pt.exists || !pt.open) {
      this._shakeLock(pt);
      return;
    }
    this.scene.start('Game', { levelIndex: pt.absoluteIndex });
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

  // Índice absoluto da próxima fase ainda não concluída (ou a última, se já
  // fez tudo que existe hoje).
  _nextPlayableIndex(save) {
    const i = LEVELS.findIndex((lv) => !levelProgress(save, lv.id).complete);
    return i === -1 ? LEVELS.length - 1 : i;
  }

  // Índice absoluto da fase mais avançada já concluída, ou -1 se nenhuma.
  _lastCompletedIndex(save) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (levelProgress(save, LEVELS[i].id).complete) return i;
    }
    return -1;
  }

  _setupKem(save, page) {
    const { justCompletedIndex, justUnlocked } = this.info;
    let standIndex;
    if (typeof justCompletedIndex === 'number' && MAP_POINTS[justCompletedIndex]) {
      standIndex = justCompletedIndex;
    } else {
      const last = this._lastCompletedIndex(save);
      standIndex = last === -1 ? 0 : last;
    }

    const standPts = pointsForPage(pageOf(standIndex));
    const start = kemSpotForLocal(standPts, standIndex % PAGE_SIZE);
    this.kemState.x = start.x;
    this.kemState.y = start.y;
    this.kemState.vx = 0;

    const nextIndex = standIndex + 1;
    if (!justUnlocked || !MAP_POINTS[nextIndex]) {
      // Foco na próxima fase a jogar — mas só se ela estiver nesta mesma
      // página; senão fica no ponto que o jogador acabou de jogar (ex.:
      // replay de uma fase antiga enquanto o progresso real já foi adiante).
      const nextPlayable = this._nextPlayableIndex(save);
      this.focus = pageOf(nextPlayable) === page ? nextPlayable % PAGE_SIZE : standIndex % PAGE_SIZE;
      this._paintFocus();
      return;
    }

    if (pageOf(nextIndex) === page) {
      // Destravou uma fase na mesma página: anda até o ponto novo, como hoje.
      this.walk = { target: kemSpotForLocal(standPts, nextIndex % PAGE_SIZE) };
    } else {
      // Terminou o bairro: anda até a borda do mapa e o próximo bairro entra.
      const exitsLeft = standPts[standIndex % PAGE_SIZE].x <= VIEW.W / 2;
      const edgeX = exitsLeft ? -EDGE_WALK_MARGIN : VIEW.W + EDGE_WALK_MARGIN;
      const slideDir = exitsLeft ? -1 : 1;
      this.walk = {
        target: { x: edgeX, y: start.y },
        onArrive: () => this._slideToPage(pageOf(nextIndex), slideDir, nextIndex % PAGE_SIZE),
      };
    }
    this.focus = nextIndex % PAGE_SIZE;
    this._paintFocus();
  }

  update(time, deltaMs) {
    const dt = deltaMs / 1000;
    this.backdrop?.update(deltaMs);

    if (this.walk) {
      const { target } = this.walk;
      const dx = target.x - this.kemState.x;
      const dy = target.y - this.kemState.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        this.kemState.x = target.x;
        this.kemState.y = target.y;
        this.kemState.vx = 0;
        const arrive = this.walk.onArrive;
        this.walk = null;
        if (arrive) arrive();
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
