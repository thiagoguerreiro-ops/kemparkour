import { PHYS } from '../config.js';
import { LEVELS } from '../levels/levels.js';
import { LevelRun } from '../world/levelRun.js';
import { InputTracker, mergeHeld } from '../player/input.js';
import { createFixedStepper } from '../core/fixedStep.js';
import { KemRenderer } from '../render/kemRenderer.js';
import { drawBackground, drawTiles } from '../render/tileRenderer.js';
import { EntityRenderer } from '../render/entityRenderer.js';
import { outfitFor } from '../render/outfits.js';
import { TouchControls } from '../ui/touchControls.js';
import { Hud } from '../ui/hud.js';
import { TutorialBubble } from '../ui/tutorialBubble.js';
import { addBackButton } from '../ui/backButton.js';
import { browserStorage, loadSave, levelProgress, recordRun, shopState, writeSave } from '../save/save.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  init(data) {
    this.levelIndex = data?.levelIndex ?? 0;
  }

  create() {
    this.level = LEVELS[this.levelIndex];
    this.storage = browserStorage();
    const save = loadSave(this.storage);
    const saved = levelProgress(save, this.level.id);
    // Guardado para o mapa saber se terminar esta fase destrava a próxima
    // agora (pela primeira vez) — é quando o Kem deve andar até lá.
    this.wasCompleteBefore = saved.complete;
    this.run = new LevelRun(this.level, {
      number: this.levelIndex + 1,
      savedCoinIds: new Set(saved.coins),
    });

    const map = this.run.map;
    drawBackground(this, map);
    drawTiles(this, map);
    this.entityView = new EntityRenderer(this);
    this.kemView = new KemRenderer(this, outfitFor(shopState(save)));

    const kem = this.run.kem;
    this.camTarget = this.add.zone(kem.x, kem.y - 22, 1, 1);
    const cam = this.cameras.main;
    cam.setBounds(0, 0, map.widthPx, map.heightPx);
    cam.startFollow(this.camTarget, true, 0.15, 0.15);

    this.keys = this.input.keyboard.createCursorKeys();
    this.touch = new TouchControls(this);
    this.tracker = new InputTracker();
    this.advance = createFixedStepper(PHYS.STEP, 8);
    // "apertou agora" fica guardado até um passo de física consumir.
    this.pending = { jump: false, action: false };

    this.hud = new Hud(this);
    this.bubble = new TutorialBubble(this);
    addBackButton(this);
    this.done = false;
  }

  update(time, deltaMs) {
    if (this.done) return;
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

    const dtSec = deltaMs / 1000;
    this.advance(dtSec, (dt) => {
      const stepInput = { ...input, jumpPressed: this.pending.jump, actionPressed: this.pending.action };
      this.pending.jump = false;
      this.pending.action = false;
      this.run.step(dt, stepInput);
    });

    const kem = this.run.kem;
    this.entityView.draw(this.run, dtSec);
    this.kemView.draw(kem, dtSec);
    this.camTarget.setPosition(kem.x, kem.y - 22);
    this.hud.update(this.run.hud());

    const tip = this.run.activeTutorial();
    if (tip) this.bubble.show(tip.text);
    else this.bubble.hide();

    if (this.run.finished) this.finish();
  }

  finish() {
    this.done = true;
    const result = this.run.result();
    const { data, summary } = recordRun(loadSave(this.storage), this.level.id, result);
    writeSave(this.storage, data);
    const justUnlocked = !this.wasCompleteBefore;
    this.scene.start('Results', { levelIndex: this.levelIndex, result, summary, justUnlocked });
  }
}
