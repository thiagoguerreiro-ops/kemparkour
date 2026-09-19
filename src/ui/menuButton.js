// Botão grande de menu: retângulo arredondado desenhado com Graphics + texto.
// Serve para a tela inicial, o mapa e a loja (Blocos 2 e 3), por isso mora em
// src/ui e não dentro de uma cena.
//
// Tamanho pensado para dedo de criança em iPhone: 300x68 por padrão, bem acima
// dos 44px mínimos de alvo de toque.

const FACE = 0x1d1d24;
const FACE_FOCUS = 0xe0a300;
const SHADOW = 0x000000;

const LABEL_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '34px', fontStyle: 'bold',
  color: '#ffffff',
};

export class MenuButton {
  constructor(scene, { x, y, w = 300, h = 68, label, onPress, fontSize = 34 }) {
    this.scene = scene;
    this.box = { x, y, w, h };
    this.focused = false;

    this.g = scene.add.graphics();
    this.text = scene.add.text(x, y, label, { ...LABEL_STYLE, fontSize: `${fontSize}px` }).setOrigin(0.5);
    this.text.setShadow(0, 3, '#00000066', 4, false, true);
    this._paint();

    // A área de toque é o retângulo inteiro, não só as letras.
    this.g.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.g.on('pointerover', () => this.setFocused(true));
    this.g.on('pointerdown', () => this._press(true));
    this.g.on('pointerup', () => { this._press(false); onPress(); });
    this.g.on('pointerout', () => this._press(false));
    this.onPress = onPress;
  }

  setLabel(label) {
    this.text.setText(label);
    return this;
  }

  setFocused(on) {
    this.focused = on;
    this._paint();
    return this;
  }

  _press(down) {
    this.text.y = this.box.y + (down ? 3 : 0);
    this._paint(down);
  }

  _paint(down = false) {
    const { x, y, w, h } = this.box;
    const left = x - w / 2;
    const top = y - h / 2 + (down ? 3 : 0);
    this.g.clear();
    if (!down) {
      this.g.fillStyle(SHADOW, 0.3);
      this.g.fillRoundedRect(left, top + 6, w, h, 18);
    }
    this.g.fillStyle(this.focused ? FACE_FOCUS : FACE, 1);
    this.g.fillRoundedRect(left, top, w, h, 18);
    this.g.lineStyle(3, 0xffffff, this.focused ? 0.9 : 0.35);
    this.g.strokeRoundedRect(left, top, w, h, 18);
  }
}
