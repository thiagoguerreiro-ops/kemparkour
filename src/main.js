import { VIEW } from './config.js';
import { TitleScene } from './scenes/TitleScene.js';
import { MapScene } from './scenes/MapScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { TrainingScene } from './scenes/TrainingScene.js';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#8fd3ff',
  width: VIEW.W,
  height: VIEW.H,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [TitleScene, MapScene, ShopScene, GameScene, ResultsScene, TrainingScene],
});

// No iPhone, quando a tela gira (ou a barra do Safari aparece/some), o
// navegador avisa do novo tamanho ANTES de terminar de mudar a página — e o
// jogo ficava desenhado no tamanho antigo, torto. Então medimos de novo logo
// depois, e mais uma vez um pouco mais tarde, quando tudo já assentou.
const refit = () => {
  game.scale.refresh();
  setTimeout(() => game.scale.refresh(), 150);
  setTimeout(() => game.scale.refresh(), 600);
};
window.addEventListener('orientationchange', refit);
window.addEventListener('resize', refit);
window.visualViewport?.addEventListener('resize', refit);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refit();
});
