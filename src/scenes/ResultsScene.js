import { VIEW } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { formatTime } from '../world/scoring.js';
import { browserStorage, loadSave, writeSave, isUnlocked, shopState, grantItem } from '../save/save.js';
import { CityBackdrop } from '../render/cityBackdrop.js';
import { themeForLevel } from '../render/themes.js';
import { DancePlayer } from '../render/dancePlayer.js';
import { findDance } from '../render/dances.js';
import { outfitFor } from '../render/outfits.js';
import { HALF as KEM_HALF } from '../render/kemRenderer.js';
import { MenuButton } from '../ui/menuButton.js';
import { Fireworks } from '../ui/fireworksDisplay.js';
import { isFinalLevel, CHAMPION_DANCE_ID } from '../world/finale.js';
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
const FINALE_HEADING_STYLE = { ...HEADING_STYLE, fontSize: '50px' };
const PRIZE_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '26px', fontStyle: 'bold',
  color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 5, align: 'center',
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
    const storage = browserStorage();
    let save = loadSave(storage);
    // A grande final (Fase 30): fogos, dança do campeão e o botão "Ver o final".
    const finale = isFinalLevel(level);
    let firstTimeChampion = false;
    if (finale && !shopState(save).owned.includes(CHAMPION_DANCE_ID)) {
      // A primeira vez: a Dança do Campeão vira prêmio do jogador (de graça,
      // sem trocar o que ele está usando) e aparece na loja daqui pra frente.
      firstTimeChampion = true;
      save = grantItem(save, CHAMPION_DANCE_ID);
      writeSave(storage, save);
    }
    const hasNext = levelIndex + 1 < LEVELS.length && isUnlocked(save, LEVELS, levelIndex + 1);

    this.backdrop = new CityBackdrop(this, themeForLevel(levelIndex + 1));

    if (finale) {
      const area = { x0: 60, x1: VIEW.W - 60, yMin: 40, yMax: 300, groundY: this.backdrop.roofY };
      this.fireworks = new Fireworks(this, { area });
    }

    this.add.text(VIEW.W / 2, 44, finale ? 'VOCÊ ZEROU O JOGO!' : 'FASE COMPLETA!', finale ? FINALE_HEADING_STYLE : HEADING_STYLE)
      .setOrigin(0.5).setAngle(-3).setShadow(4, 4, '#e23b3b', 0, true, true);
    this.add.text(VIEW.W / 2, 88, `Fase ${levelIndex + 1} — ${level.name}`, LEVEL_STYLE).setOrigin(0.5);

    this._buildStars(VIEW.W / 2, 128, summary.stars, level);
    this._buildInfo(VIEW.W / 2, 222, level, result, summary);

    // O Kem dança no telhado com a dança escolhida na loja.
    // Na grande final ele faz a Dança do Campeão, seja qual for a dança que
    // ele usa na loja: é o momento especial.
    const equippedDance = findDance(finale ? CHAMPION_DANCE_ID : shopState(save).equipped.danca);
    const kemScale = 2.1;
    // Com a roupa e o acessório que ele comprou na loja.
    this.dancer = new DancePlayer(this, equippedDance, outfitFor(shopState(save)));
    this.dancer.container.setScale(kemScale).setDepth(5);
    this.dancer.setBasePosition(820, this.backdrop.roofY - KEM_HALF * kemScale);

    if (firstTimeChampion) this._buildPrize(VIEW.W / 2 - 110, 386);

    const toMap = () => this.scene.start('Map', { justCompletedIndex: levelIndex, justUnlocked });
    const toGame = (idx) => this.scene.start('Game', { levelIndex: idx });

    const buttons = [];
    buttons.push({ label: '↻  Jogar de novo', onPress: () => toGame(levelIndex) });
    if (hasNext && !finale) buttons.push({ label: '▶  Próxima fase', onPress: () => toGame(levelIndex + 1) });
    buttons.push({ label: '🗺  Mapa', onPress: toMap });
    if (finale) {
      buttons.push({ label: '🎆  Ver o final', onPress: () => this.scene.start('Ending') });
    }

    const xs = buttons.length === 3 ? [175, VIEW.W / 2, 785] : [320, 640];
    const menuButtons = buttons.map((b, i) => new MenuButton(this, {
      // Três botões lado a lado: letra menor que a da tela inicial, senão
      // "Jogar de novo" estoura a placa.
      x: xs[i], y: 496, w: 240, h: 58, fontSize: 24, label: b.label, onPress: b.onPress,
    }));

    // Na grande final o botão importante é "Ver o final": já vem selecionado.
    let focus = finale ? menuButtons.length - 1 : 0;
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

  // A placa do prêmio surpresa da Fase 30 (só na primeira vez): estoura na
  // tela com um "pop" e balança de leve.
  _buildPrize(cx, cy) {
    const w = 520, h = 64;
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.3);
    g.fillRoundedRect(-w / 2 + 3, -h / 2 + 6, w, h, 18);
    g.fillStyle(0x1d1d24, 0.92);
    g.fillRoundedRect(-w / 2, -h / 2, w, h, 18);
    g.lineStyle(4, 0xffd23f, 1);
    g.strokeRoundedRect(-w / 2, -h / 2, w, h, 18);
    const label = this.add.text(0, 0, '🏆 Você ganhou a Dança do Campeão!', PRIZE_STYLE).setOrigin(0.5);
    const banner = this.add.container(cx, cy, [g, label]).setScale(0).setDepth(6);
    this.time.delayedCall(1400, () => {
      this.tweens.add({ targets: banner, scale: 1, duration: 420, ease: 'Back.Out' });
      this.tweens.add({
        targets: banner, angle: 2, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
      });
    });
  }

  update(time, deltaMs) {
    this.backdrop.update(deltaMs);
    this.fireworks?.update(deltaMs);
    this.dancer.update(deltaMs);
  }
}
