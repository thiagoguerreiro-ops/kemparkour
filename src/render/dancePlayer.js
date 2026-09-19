import { drawKem } from './kemRenderer.js';
import { OUTFIT_DEFAULT } from './palette.js';

// Toca uma dança de `src/render/dances.js` em loop, reaproveitando o mesmo
// desenho do Kem do jogo (`drawKem`). A dança é dado puro (sem Phaser); esta
// classe é a parte com Phaser que sabe colocar isso na tela — usada na tela
// inicial (em loop), nos resultados e no mapa (Blocos 2 e 4).
export class DancePlayer {
  constructor(scene, dance, outfit = OUTFIT_DEFAULT) {
    this.g = scene.add.graphics();
    this.container = scene.add.container(0, 0, [this.g]);
    this.outfit = outfit;
    this.dance = dance;
    this.base = { x: 0, y: 0 };
    this.t = 0;
    this.frame = 0;
    this.elapsedMs = 0;
    this._draw();
  }

  setBasePosition(x, y) {
    this.base = { x, y };
    this._applyTransform();
    return this;
  }

  setDance(dance) {
    this.dance = dance;
    this.frame = 0;
    this.elapsedMs = 0;
    this._draw();
    return this;
  }

  update(deltaMs) {
    this.t += deltaMs / 1000;
    this.elapsedMs += deltaMs;
    const frameMs = this.dance.frameMs;
    while (this.elapsedMs >= frameMs) {
      this.elapsedMs -= frameMs;
      this.frame = (this.frame + 1) % this.dance.poses.length;
    }
    this._draw();
  }

  _applyTransform() {
    const pose = this.dance.poses[this.frame];
    const r = pose.rotation ?? 0;
    const cx = this.base.x + (pose.center ? pose.center.x : 0);
    const cy = this.base.y + (pose.center ? pose.center.y : 0);
    this.container.setPosition(cx, cy).setRotation(r);
  }

  _draw() {
    this._applyTransform();
    const pose = this.dance.poses[this.frame];
    drawKem(this.g, pose, this.outfit, this.t);
  }

  destroy() {
    this.container.destroy();
  }
}
