import { VIEW } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { formatTime } from '../world/scoring.js';
import { browserStorage, loadSave, isUnlocked, shopState } from '../save/save.js';
import { CityBackdrop } from '../render/cityBackdrop.js';
import { DancePlayer } from '../render/dancePlayer.js';
import { findDance } from '../render/dances.js';
import { outfitFor } from '../render/outfits.js';
import { HALF as KEM_HALF } from '../render/kemRenderer.js';
import { MenuButton } from '../ui/menuButton.js';
import { TITLE_FONT } from '../ui/graffitiTitle.js';

// Tela de fim de fase: mostra as 3 estrelas aparecendo uma a uma (com um
// popzinho), o tempo, as moedas, e o Kem dançando no telhado com a dança que
// o jogador escolheu na loja — o motivo de rejogar fica visível na hora.

const STAR_ORDER = ['complete', 'fast', 'allStickers'];
const STAR_R = 22;
const STAR_R_IN = 9;

const HEADING_STYLE = {
  fontFamily: `"${TITLE_FONT}", system-ui, sans-serif`, fontSize: '46px',
  color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 9,
};
const LEVEL_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '24px', fontStyle: 'bold',
  color: '#ffffff', stroke: '#1d1d24', strokeThickness: 5,
};
const STAR_LABEL_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '14px', fontStyle: 'bold',
  color: '#ffffff', stroke: '#1d1d24', strokeThickness: 4, align: 'center',
  wordWrap: { width: 150 },
};
const INFO_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold',
  color: '#ffffff', stroke: '#1d1d24', strokeThickness: 4,
};
const RECORD_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold',
  color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 5,
};

// Pontos de uma estrela de 5 pontas, centrada em (cx, cy) — mesmo desenho do
// mapa (`MapScene`), pra estrela ganha parecer sempre a mesma estrela.
function starPoints(cx, cy, outerR, innerR) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = -Math.PI / 2 + i * (Math.PI / 5);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

function starLabel(key, level) {
  if (key === 'complete') return 'Terminou';
  if (key === 'fast') return `Rápido: menos de ${Math.round(level.targetTime)}s`;
  return 'Os 3 adesivos';
}

export class ResultsScene extends Phaser.Scene {
  constructor() {
    super('Results');
  }

  init(data) {
    this.info = data ?? {};
  }

  create() {
    const { levelIndex, result, summary, justUnlocked } = this.info;
    const level = LEVELS[levelIndex];
    const save = loadSave(browserStorage());
    const hasNext = levelIndex + 1 < LEVELS.length && isUnlocked(save, LEVELS, levelIndex + 1);

    this.backdrop = new CityBackdrop(this);

    this.add.text(VIEW.W / 2, 44, 'FASE COMPLETA!', HEADING_STYLE)
      .setOrigin(0.5).setAngle(-3).setShadow(4, 4, '#e23b3b', 0, true, true);
    this.add.text(VIEW.W / 2, 88, `Fase ${levelIndex + 1} — ${level.name}`, LEVEL_STYLE).setOrigin(0.5);

    this._buildStars(VIEW.W / 2, 128, summary.stars, level);
    this._buildInfo(VIEW.W / 2, 222, level, result, summary);

    // O Kem dança no telhado com a dança escolhida na loja.
    const equippedDance = findDance(shopState(save).equipped.danca);
    const kemScale = 2.1;
    // Com a roupa e o acessório que ele comprou na loja.
    this.dancer = new DancePlayer(this, equippedDance, outfitFor(shopState(save)));
    this.dancer.container.setScale(kemScale).setDepth(5);
    this.dancer.setBasePosition(820, this.backdrop.roofY - KEM_HALF * kemScale);

    const toMap = () => this.scene.start('Map', { justCompletedIndex: levelIndex, justUnlocked });
    const toGame = (idx) => this.scene.start('Game', { levelIndex: idx });

    const buttons = [];
    buttons.push({ label: '↻  Jogar de novo', onPress: () => toGame(levelIndex) });
    if (hasNext) buttons.push({ label: '▶  Próxima fase', onPress: () => toGame(levelIndex + 1) });
    buttons.push({ label: '🗺  Mapa', onPress: toMap });

    const xs = buttons.length === 3 ? [175, VIEW.W / 2, 785] : [320, 640];
    const menuButtons = buttons.map((b, i) => new MenuButton(this, {
      // Três botões lado a lado: letra menor que a da tela inicial, senão
      // "Jogar de novo" estoura a placa.
      x: xs[i], y: 496, w: 240, h: 58, fontSize: 24, label: b.label, onPress: b.onPress,
    }));

    let focus = 0;
    const paint = () => menuButtons.forEach((b, i) => b.setFocused(i === focus));
    paint();
    const move = (delta) => {
      focus = (focus + delta + menuButtons.length) % menuButtons.length;
      paint();
    };
    this.input.keyboard.on('keydown-LEFT', () => move(-1));
    this.input.keyboard.on('keydown-UP', () => move(-1));
    this.input.keyboard.on('keydown-RIGHT', () => move(1));
    this.input.keyboard.on('keydown-DOWN', () => move(1));
    const confirm = () => menuButtons[focus].onPress();
    this.input.keyboard.on('keydown-SPACE', confirm);
    this.input.keyboard.on('keydown-ENTER', confirm);
    this.input.keyboard.on('keydown-ESC', toMap);
  }

  // As 3 estrelas, aparecendo uma a uma com um popzinho — cheias e douradas
  // quando ganhas, ocas e cinzas quando não, com uma legenda dizendo pra que
  // cada uma serve.
  _buildStars(cx, cy, stars, level) {
    STAR_ORDER.forEach((key, i) => {
      const x = cx + (i - 1) * 150;
      const earned = Boolean(stars?.[key]);
      const g = this.add.graphics();
      const pts = starPoints(0, 0, STAR_R, STAR_R_IN);
      g.fillStyle(earned ? 0xffd23f : 0xd9dde3, 1);
      g.fillPoints(pts, true);
      g.lineStyle(2.5, earned ? 0xb3790a : 0x8a939e, 1);
      g.strokePoints(pts, true);

      const label = this.add.text(0, STAR_R + 14, starLabel(key, level), STAR_LABEL_STYLE)
        .setOrigin(0.5, 0);

      const wrap = this.add.container(x, cy, [g, label]).setScale(0).setAlpha(0);
      this.time.delayedCall(260 + i * 320, () => {
        this.tweens.add({ targets: wrap, scale: 1, alpha: 1, duration: 380, ease: 'Back.Out' });
      });
    });
  }

  _buildInfo(cx, top, level, result, summary) {
    const alvo = Math.round(level.targetTime);
    const timeLine = `⏱ Tempo: ${formatTime(result.timeSec, true)}  (alvo ${alvo}s)${result.stars.fast ? ' ✓' : ''}`;
    const coinLine = `🪙 Moedas: ${result.coinIds.length} (${summary.newCoins} ${summary.newCoins === 1 ? 'nova' : 'novas'})`;
    const stickerLine = `😊 Adesivos: ${result.stickers}/3`;

    const panel = this.add.graphics();
    const w = 560, h = summary.isRecord ? 118 : 82;
    panel.fillStyle(0x1d1d24, 0.65);
    panel.fillRoundedRect(cx - w / 2, top, w, h, 16);

    let y = top + 14;
    if (summary.isRecord) {
      const record = this.add.text(cx, y, '🏆 NOVO RECORDE!', RECORD_STYLE).setOrigin(0.5, 0).setScale(0);
      this.time.delayedCall(900, () => {
        this.tweens.add({ targets: record, scale: 1, duration: 320, ease: 'Back.Out' });
      });
      y += 34;
    }
    this.add.text(cx, y, timeLine, INFO_STYLE).setOrigin(0.5, 0);
    y += 30;
    this.add.text(cx, y, `${coinLine}    ${stickerLine}`, INFO_STYLE).setOrigin(0.5, 0);
  }

  update(time, deltaMs) {
    this.backdrop.update(deltaMs);
    this.dancer.update(deltaMs);
  }
}
