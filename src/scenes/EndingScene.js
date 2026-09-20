import { VIEW } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { countStars } from '../world/scoring.js';
import { CHAMPION_DANCE_ID } from '../world/finale.js';
import { browserStorage, loadSave, levelProgress, totalCoins, shopState } from '../save/save.js';
import { CityBackdrop } from '../render/cityBackdrop.js';
import { THEMES } from '../render/themes.js';
import { DancePlayer } from '../render/dancePlayer.js';
import { findDance } from '../render/dances.js';
import { outfitFor } from '../render/outfits.js';
import { HALF as KEM_HALF } from '../render/kemRenderer.js';
import { MenuButton } from '../ui/menuButton.js';
import { Fireworks } from '../ui/fireworksDisplay.js';
import { createGraffitiTitle, TITLE_FONT } from '../ui/graffitiTitle.js';

// A tela de FIM: aparece depois de zerar a Fase 30 ("Ver o final"). Cidade à
// noite com fogos, o logo do jogo, o obrigado, o total de estrelas e moedas, o
// Kem fazendo a Dança do Campeão e — na placa maior e mais bonita da tela —
// o crédito de quem fez o jogo. Nada mais fica em cima dessa placa.

const CX = 440; // o texto fica um pouco à esquerda pro Kem ter o canto direito
const CREDIT = { y: 372, w: 640, h: 128 };

const THANKS_STYLE = {
  fontFamily: `"${TITLE_FONT}", system-ui, sans-serif`, fontSize: '40px',
  color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 8,
};
const STATS_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '26px', fontStyle: 'bold',
  color: '#ffffff', stroke: '#1d1d24', strokeThickness: 4,
};
const CREDIT_LEAD_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
};
const CREDIT_NAME_STYLE = {
  fontFamily: `"${TITLE_FONT}", system-ui, sans-serif`, fontSize: '68px',
  color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 10,
};

export class EndingScene extends Phaser.Scene {
  constructor() {
    super('Ending');
  }

  create() {
    const save = loadSave(browserStorage());
    const stars = LEVELS.reduce((n, lv) => n + countStars(levelProgress(save, lv.id).stars), 0);
    const maxStars = LEVELS.length * 3;
    const coins = totalCoins(save);

    // Sempre à noite: a última fase é no topo da Cidade à noite.
    this.backdrop = new CityBackdrop(this, THEMES.noite);
    const roofY = this.backdrop.roofY;
    this.fireworks = new Fireworks(this, {
      area: { x0: 60, x1: VIEW.W - 60, yMin: 40, yMax: 300, groundY: roofY },
    });

    createGraffitiTitle(this, CX, 100).setDepth(3);
    this.add.text(CX, 205, 'OBRIGADO POR JOGAR!', THANKS_STYLE)
      .setOrigin(0.5).setAngle(-2).setShadow(3, 3, '#e23b3b', 0, true, true).setDepth(3);

    this._buildStats(CX, 262, stars, maxStars, coins);
    this._buildCredit(CX, CREDIT.y);

    // O Kem dança a Dança do Campeão no canto direito, com a roupa dele.
    const kemScale = 2.1;
    this.dancer = new DancePlayer(this, findDance(CHAMPION_DANCE_ID), outfitFor(shopState(save)));
    this.dancer.container.setScale(kemScale).setDepth(5);
    this.dancer.setBasePosition(868, roofY - KEM_HALF * kemScale);

    const toMap = () => this.scene.start('Map');
    const back = new MenuButton(this, {
      x: CX, y: 500, w: 320, h: 60, fontSize: 28, label: '🗺  Voltar ao mapa', onPress: toMap,
    });
    back.setFocused(true);
    back.g.setDepth(3);
    back.text.setDepth(4);

    this.input.keyboard.on('keydown-SPACE', toMap);
    this.input.keyboard.on('keydown-ENTER', toMap);
    this.input.keyboard.on('keydown-ESC', toMap);
  }

  // Uma placa com as estrelas (N de 90) e as moedas.
  _buildStats(cx, cy, stars, maxStars, coins) {
    const label = `⭐ ${stars} de ${maxStars} estrelas     🪙 ${coins} moedas`;
    const text = this.add.text(cx, cy, label, STATS_STYLE).setOrigin(0.5).setDepth(4);
    const w = text.width + 48;
    const g = this.add.graphics().setDepth(3);
    g.fillStyle(0x1d1d24, 0.72);
    g.fillRoundedRect(cx - w / 2, cy - 26, w, 52, 16);
  }

  // A placa do crédito: a maior e mais chamativa da tela, com borda dupla
  // dourada. Fica numa camada acima de tudo pra nunca ser coberta.
  _buildCredit(cx, cy) {
    const { w, h } = CREDIT;
    const left = cx - w / 2;
    const top = cy - h / 2;
    const g = this.add.graphics().setDepth(200);
    g.fillStyle(0x000000, 0.35);
    g.fillRoundedRect(left + 4, top + 9, w, h, 26);
    g.fillStyle(0x1d1d24, 0.96);
    g.fillRoundedRect(left, top, w, h, 26);
    g.lineStyle(7, 0xffd23f, 1);
    g.strokeRoundedRect(left, top, w, h, 26);
    g.lineStyle(2.5, 0xffffff, 0.55);
    g.strokeRoundedRect(left + 11, top + 11, w - 22, h - 22, 18);

    this.add.text(cx, top + 30, 'Desenvolvido por', CREDIT_LEAD_STYLE)
      .setOrigin(0.5).setDepth(201);
    this.creditName = this.add.text(cx, top + 82, 'Arthur Guerreiro', CREDIT_NAME_STYLE)
      .setOrigin(0.5).setDepth(201).setShadow(4, 4, '#e23b3b', 0, true, true);
    this._fitCredit();
    // O nome está numa fonte de grafite que pode chegar depois da tela:
    // quando ela chegar, confere de novo se o nome ainda cabe na placa.
    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.load(`68px "${TITLE_FONT}"`).then(() => {
        if (!this.creditName?.scene) return;
        this.creditName.updateText();
        this._fitCredit();
      });
    }
  }

  _fitCredit() {
    const maxW = CREDIT.w - 60;
    this.creditName.setScale(1);
    if (this.creditName.width > maxW) this.creditName.setScale(maxW / this.creditName.width);
  }

  update(time, deltaMs) {
    this.backdrop.update(deltaMs);
    this.fireworks.update(deltaMs);
    this.dancer.update(deltaMs);
  }
}
