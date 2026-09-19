import { VIEW } from '../config.js';
import { browserStorage, levelProgress, loadSave, shopState, availableCoins } from '../save/save.js';
import { LEVELS } from '../levels/levels.js';
import { CityBackdrop } from '../render/cityBackdrop.js';
import { DancePlayer } from '../render/dancePlayer.js';
import { findDance } from '../render/dances.js';
import { outfitFor } from '../render/outfits.js';
import { HALF as KEM_HALF } from '../render/kemRenderer.js';
import { MenuButton } from '../ui/menuButton.js';
import { createGraffitiTitle } from '../ui/graffitiTitle.js';

const BADGE_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '28px', fontStyle: 'bold',
  color: '#ffd23f',
};
const CREDIT_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '24px', fontStyle: 'bold',
  color: '#ffffff',
};

const LONG_PRESS_MS = 1500;

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('Title');
  }

  create() {
    const save = loadSave(browserStorage());
    // Moedas pra gastar na loja (pegas menos gastas), não o total já pego.
    const coins = availableCoins(save);
    const shop = shopState(save);

    this.backdrop = new CityBackdrop(this);

    // O logo em grafite, balançando de leve — a tela nunca fica parada.
    const title = createGraffitiTitle(this, VIEW.W / 2, 124).setScale(1.15).setDepth(10);
    this.tweens.add({
      targets: title, y: 118, duration: 1600,
      yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
    });

    // O Kem dança em pé no telhado, do lado direito.
    // O Kem é desenhado centrado (pés em +HALF), então a base sobe meia altura
    // para ele encostar os pés no telhado em vez de afundar na tela.
    const kemScale = 2.8;
    this.dancer = new DancePlayer(this, findDance(shop.equipped.danca), outfitFor(shop));
    this.dancer.container.setScale(kemScale).setDepth(5);
    this.dancer.setBasePosition(788, this.backdrop.roofY - KEM_HALF * kemScale);

    // Placa de progresso no canto, como um placar: quantas estrelas já ganhou.
    const stars = LEVELS.reduce((n, lv) => {
      const s = levelProgress(save, lv.id).stars;
      return n + (s.complete ? 1 : 0) + (s.fast ? 1 : 0) + (s.allStickers ? 1 : 0);
    }, 0);
    const badge = this.add.graphics().setDepth(9);
    badge.fillStyle(0x1d1d24, 0.65);
    badge.fillRoundedRect(14, 12, 300, 54, 16);
    badge.lineStyle(3, 0xffd23f, 0.9);
    badge.strokeRoundedRect(14, 12, 300, 54, 16);
    this.add.text(164, 39, `⭐ ${stars} de ${LEVELS.length * 3} estrelas`, BADGE_STYLE)
      .setOrigin(0.5).setDepth(10);

    // Botões grandes, à esquerda do Kem.
    const jogar = new MenuButton(this, {
      x: 360, y: 290, label: '▶  JOGAR',
      onPress: () => this.scene.start('Map'),
    });
    const loja = new MenuButton(this, {
      x: 360, y: 380, label: `LOJA   🪙 ${coins}`,
      onPress: () => this.scene.start('Shop'),
    });

    // Rodapé: o crédito do Arthur. Placa própria, na camada mais alta da tela,
    // para nunca ficar atrás de nada e continuar legível no sol do iPhone.
    const plaque = this.add.graphics().setDepth(200);
    const pw = 460;
    const px = (VIEW.W - pw) / 2;
    plaque.fillStyle(0x000000, 0.25);
    plaque.fillRoundedRect(px, VIEW.H - 52, pw, 40, 14);
    plaque.fillStyle(0x1d1d24, 0.8);
    plaque.fillRoundedRect(px, VIEW.H - 56, pw, 40, 14);
    plaque.lineStyle(3, 0xffd23f, 0.9);
    plaque.strokeRoundedRect(px, VIEW.H - 56, pw, 40, 14);
    this.add.text(VIEW.W / 2, VIEW.H - 36, 'Desenvolvido por Arthur Guerreiro', CREDIT_STYLE)
      .setOrigin(0.5).setDepth(201);

    // Toque longo no título: atalho escondido pra Fase de treino (testes).
    title.setSize(440, 190).setInteractive();
    let pressTimer = null;
    const cancelPress = () => {
      if (pressTimer) { pressTimer.remove(false); pressTimer = null; }
    };
    title.on('pointerdown', () => {
      cancelPress();
      pressTimer = this.time.delayedCall(LONG_PRESS_MS, () => this.scene.start('Training'));
    });
    title.on('pointerup', cancelPress);
    title.on('pointerout', cancelPress);

    // Teclado: setas trocam o botão, Espaço/Enter confirma.
    const buttons = [jogar, loja];
    let focus = 0;
    const paint = () => buttons.forEach((b, i) => b.setFocused(i === focus));
    paint();
    const move = (delta) => {
      focus = (focus + delta + buttons.length) % buttons.length;
      paint();
    };
    this.input.keyboard.on('keydown-UP', () => move(-1));
    this.input.keyboard.on('keydown-LEFT', () => move(-1));
    this.input.keyboard.on('keydown-DOWN', () => move(1));
    this.input.keyboard.on('keydown-RIGHT', () => move(1));
    const confirm = () => buttons[focus].onPress();
    this.input.keyboard.on('keydown-SPACE', confirm);
    this.input.keyboard.on('keydown-ENTER', confirm);
  }

  update(time, delta) {
    this.backdrop.update(delta);
    this.dancer.update(delta);
  }
}
