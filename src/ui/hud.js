import { formatTime } from '../world/scoring.js';

// Cronômetro, moedas e adesivos, no alto à esquerda (longe dos botões de toque).
export class Hud {
  constructor(scene) {
    this.text = scene.add.text(16, 12, '', {
      fontFamily: 'system-ui, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff',
      stroke: '#1d1d24',
      strokeThickness: 5,
    }).setScrollFactor(0).setDepth(100);
  }

  update({ timeSec, coins, stickers, stickerTotal }) {
    this.text.setText(`⏱ ${formatTime(timeSec)}   🪙 ${coins}   😊 ${stickers}/${stickerTotal}`);
  }
}
