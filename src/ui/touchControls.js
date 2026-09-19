const BUTTONS = [
  { id: 'left', x: 90, y: 455, r: 52, label: '◀' },
  { id: 'right', x: 215, y: 455, r: 52, label: '▶' },
  { id: 'action', x: 745, y: 465, r: 50, label: 'B' },
  { id: 'jump', x: 870, y: 430, r: 60, label: 'A' },
];

// Botões fixos na tela. Cada dedo (ponteiro) ativa o botão em que está,
// então dá para correr e pular ao mesmo tempo, e deslizar o dedo de ◀ para ▶.
export class TouchControls {
  constructor(scene) {
    this.scene = scene;
    this.state = { left: false, right: false, jump: false, action: false };
    this.buttons = BUTTONS.map((b) => {
      const g = scene.add.graphics().setScrollFactor(0).setDepth(100);
      scene.add.text(b.x, b.y, b.label, {
        fontFamily: 'system-ui, sans-serif', fontSize: '34px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
      return { ...b, g };
    });
    this.redraw();
  }

  held() {
    const s = { left: false, right: false, jump: false, action: false };
    for (const p of this.scene.input.manager.pointers) {
      if (!p.isDown) continue;
      for (const b of this.buttons) {
        if (Math.hypot(p.x - b.x, p.y - b.y) <= b.r * 1.25) s[b.id] = true;
      }
    }
    const changed = Object.keys(s).some((k) => s[k] !== this.state[k]);
    this.state = s;
    if (changed) this.redraw();
    return s;
  }

  redraw() {
    for (const b of this.buttons) {
      b.g.clear();
      b.g.fillStyle(0xffffff, this.state[b.id] ? 0.45 : 0.2);
      b.g.fillCircle(b.x, b.y, b.r);
      b.g.lineStyle(3, 0xffffff, 0.6);
      b.g.strokeCircle(b.x, b.y, b.r);
    }
  }
}
