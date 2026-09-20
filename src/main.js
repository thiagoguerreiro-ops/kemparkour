import { VIEW } from './config.js';
import { TitleScene } from './scenes/TitleScene.js';
import { MapScene } from './scenes/MapScene.js';
import { ShopScene } from './scenes/ShopScene.js';
import { GameScene } from './scenes/GameScene.js';
import { ResultsScene } from './scenes/ResultsScene.js';
import { TrainingScene } from './scenes/TrainingScene.js';
import { EndingScene } from './scenes/EndingScene.js';

// Tamanho da caixa do jogo medido pela área que o iPhone REALMENTE mostra
// (visualViewport), descontando as áreas protegidas (Dynamic Island, cantos,
// barrinha). No iPhone 17 deitado o iOS dizia que a página era mais alta do
// que a tela visível: o jogo esticava pela largura e cortava em cima e embaixo
// (sumia a placa de estrelas e a do Arthur). Medir pelo visualViewport resolve.
const box = document.getElementById('game');
const probe = document.createElement('div');
probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;'
  + 'padding:env(safe-area-inset-top,0px) env(safe-area-inset-right,0px) '
  + 'env(safe-area-inset-bottom,0px) env(safe-area-inset-left,0px)';
document.body.appendChild(probe);

function fitBox() {
  const vv = window.visualViewport;
  const w = vv ? vv.width : window.innerWidth;
  const h = vv ? vv.height : window.innerHeight;
  const ox = vv ? vv.offsetLeft : 0;
  const oy = vv ? vv.offsetTop : 0;
  const cs = getComputedStyle(probe);
  const t = parseFloat(cs.paddingTop) || 0;
  const r = parseFloat(cs.paddingRight) || 0;
  const b = parseFloat(cs.paddingBottom) || 0;
  const l = parseFloat(cs.paddingLeft) || 0;
  Object.assign(box.style, {
    left: `${ox + l}px`, top: `${oy + t}px`, right: 'auto', bottom: 'auto',
    width: `${Math.max(1, w - l - r)}px`, height: `${Math.max(1, h - t - b)}px`,
  });
}
fitBox();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#8fd3ff',
  width: VIEW.W,
  height: VIEW.H,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  input: { activePointers: 4 },
  scene: [TitleScene, MapScene, ShopScene, GameScene, ResultsScene, EndingScene, TrainingScene],
});

// No iPhone, quando a tela gira (ou a barra do Safari aparece/some), o
// navegador avisa do novo tamanho ANTES de terminar de mudar a página — e o
// jogo ficava desenhado no tamanho antigo, torto. Então medimos de novo logo
// depois, e mais uma vez um pouco mais tarde, quando tudo já assentou.
const refit = () => {
  const again = () => { fitBox(); game.scale.refresh(); };
  again();
  setTimeout(again, 150);
  setTimeout(again, 600);
};
window.addEventListener('orientationchange', refit);
window.addEventListener('resize', refit);
window.visualViewport?.addEventListener('resize', refit);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refit();
});
