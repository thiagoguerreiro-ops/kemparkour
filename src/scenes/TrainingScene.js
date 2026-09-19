import { PHYS, VIEW, TILE } from '../config.js';
import { parseLevel } from '../world/tilemap.js';
import { Kem } from '../player/kem.js';
import { MOVES } from '../player/moves.js';
import { InputTracker, mergeHeld } from '../player/input.js';
import { createFixedStepper } from '../core/fixedStep.js';
import { KemRenderer } from '../render/kemRenderer.js';
import { drawBackground, drawTiles } from '../render/tileRenderer.js';
import { TouchControls } from '../ui/touchControls.js';
import { TEST_LEVEL } from '../levels/testLevel.js';
import { addBackButton } from '../ui/backButton.js';

// Liga o texto de depuração (estado + fps) no HUD; desligado por padrão para não
// mostrar nomes de estado em inglês ao jogador.
const DEBUG_HUD = false;

export class TrainingScene extends Phaser.Scene {
  constructor() {
    super('Training');
  }

  create() {
    this.map = parseLevel(TEST_LEVEL.rows);
    drawBackground(this, this.map);
    drawTiles(this, this.map);
    for (const label of TEST_LEVEL.labels) {
      this.add.text(label.tx * TILE + 16, 24, label.text, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#1d1d24',
        strokeThickness: 5,
        wordWrap: { width: 560 },
      });
    }

    this.kem = new Kem(this.map.spawn, MOVES);
    this.kemView = new KemRenderer(this);

    this.camTarget = this.add.zone(this.kem.x, this.kem.y - 22, 1, 1);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, this.map.widthPx, this.map.heightPx);
    cam.startFollow(this.camTarget, true, 0.15, 0.15);

    this.keys = this.input.keyboard.createCursorKeys();
    this.restartKey = this.input.keyboard.addKey('R');
    this.touch = new TouchControls(this);
    this.tracker = new InputTracker();
    this.advance = createFixedStepper(PHYS.STEP, 8);
    // "apertou agora" fica guardado até um passo de física consumir (quadros sem passo não perdem o toque)
    this.pending = { jump: false, action: false };

    this.hud = this.add.text(VIEW.W - 12, 12, '', {
      fontFamily: 'monospace', fontSize: '16px', color: '#ffffff', stroke: '#1d1d24', strokeThickness: 4,
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100);
    addBackButton(this);
  }

  update(time, deltaMs) {
    if (Phaser.Input.Keyboard.JustDown(this.restartKey)) this.kem.respawn();
    const k = this.keys;
    const held = mergeHeld(
      {
        left: k.left.isDown,
        right: k.right.isDown,
        jump: k.space.isDown || k.up.isDown,
        action: k.shift.isDown || k.down.isDown,
      },
      this.touch.held(),
    );
    const input = this.tracker.sample(held);
    this.pending.jump = this.pending.jump || input.jumpPressed;
    this.pending.action = this.pending.action || input.actionPressed;

    this.advance(deltaMs / 1000, (dt) => {
      const stepInput = { ...input, jumpPressed: this.pending.jump, actionPressed: this.pending.action };
      this.pending.jump = false;
      this.pending.action = false;
      this.kem.update(dt, stepInput, this.map);
    });

    this.kemView.draw(this.kem, deltaMs / 1000);
    this.camTarget.setPosition(this.kem.x, this.kem.y - 22);
    if (DEBUG_HUD) this.hud.setText(`${this.kem.state}  ${Math.round(this.game.loop.actualFps)} fps`);
  }
}
