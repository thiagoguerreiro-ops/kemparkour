import { VIEW } from '../config.js';

// Botão de voltar, no canto de cima à direita (e tecla Esc no PC).
//
// Mesmo visual das placas do jogo: fundo escuro com borda dourada, uma seta
// amarela e o nome de PARA ONDE ele leva ("MAPA" dentro da fase, "INÍCIO" no
// mapa) — antes era um "✕ Menu" genérico que não dizia pra onde ia.
// Alto o bastante pra dedo de criança no iPhone (52px).

const LABELS = { Map: 'MAPA', Title: 'INÍCIO' };

const H = 52;
const PAD_X = 18;
const ARROW_W = 14;
const GAP = 12;
const RADIUS = 16;
const MARGIN = 14;

const TEXT_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold',
  color: '#ffffff',
};

export function addBackButton(scene, target = 'Map') {
  const label = scene.add.text(0, 0, LABELS[target] ?? 'VOLTAR', TEXT_STYLE)
    .setOrigin(0, 0.5).setScrollFactor(0).setDepth(121);
  const w = PAD_X + ARROW_W + GAP + label.width + PAD_X;
  const left = VIEW.W - MARGIN - w;
  const top = MARGIN;

  // Desenhado em coordenadas de tela (a Graphics fica em 0,0 e não rola com
  // a câmera), então a área de toque usa as mesmas contas.
  const g = scene.add.graphics().setScrollFactor(0).setDepth(120);
  const paint = (down) => {
    const dy = down ? 3 : 0;
    g.clear();
    if (!down) {
      g.fillStyle(0x000000, 0.3);
      g.fillRoundedRect(left, top + 5, w, H, RADIUS);
    }
    g.fillStyle(0x1d1d24, 0.92);
    g.fillRoundedRect(left, top + dy, w, H, RADIUS);
    g.lineStyle(3, 0xffd23f, 0.95);
    g.strokeRoundedRect(left, top + dy, w, H, RADIUS);
    // seta pra esquerda ("voltar")
    const ax = left + PAD_X;
    const cy = top + H / 2 + dy;
    g.lineStyle(5, 0xffd23f, 1);
    g.beginPath();
    g.moveTo(ax + ARROW_W, cy - 10);
    g.lineTo(ax, cy);
    g.lineTo(ax + ARROW_W, cy + 10);
    g.strokePath();
    label.setPosition(ax + ARROW_W + GAP, cy);
  };
  paint(false);

  // A área de toque cobre a placa inteira, não só as letras.
  g.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(left, top, w, H),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true,
  });

  const go = () => scene.scene.start(target);
  g.on('pointerdown', () => paint(true));
  g.on('pointerout', () => paint(false));
  g.on('pointerup', () => { paint(false); go(); });
  scene.input.keyboard.on('keydown-ESC', go);
  return g;
}
