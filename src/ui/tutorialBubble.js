import { VIEW } from '../config.js';

const Y = 96;

// Balão de dica que aparece quando o Kem chega perto de um movimento novo.
export class TutorialBubble {
  constructor(scene) {
    this.bg = scene.add.graphics().setScrollFactor(0).setDepth(110).setVisible(false);
    this.text = scene.add.text(VIEW.W / 2, Y, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '26px',
      fontStyle: 'bold',
      color: '#1d1d24',
      align: 'center',
      wordWrap: { width: 620 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(111).setVisible(false);
    this.current = null;
  }

  show(message) {
    if (this.current === message) return;
    this.current = message;
    this.text.setText(message).setVisible(true);
    const w = this.text.width + 44;
    const h = this.text.height + 28;
    this.bg.clear();
    this.bg.fillStyle(0xffffff, 0.95);
    this.bg.fillRoundedRect(VIEW.W / 2 - w / 2, Y - h / 2, w, h, 16);
    this.bg.lineStyle(3, 0x1d1d24, 1);
    this.bg.strokeRoundedRect(VIEW.W / 2 - w / 2, Y - h / 2, w, h, 16);
    this.bg.setVisible(true);
  }

  hide() {
    if (this.current === null) return;
    this.current = null;
    this.text.setVisible(false);
    this.bg.setVisible(false);
  }
}
