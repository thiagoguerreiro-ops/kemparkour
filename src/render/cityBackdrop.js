import { VIEW } from '../config.js';
import { THEMES } from './themes.js';
import { hash } from './tileRenderer.js';

// Cenário de fundo das telas de menu: céu, sol (ou lua e estrelas, à noite),
// nuvens que passam devagar, silhueta da cidade e um telhado na frente (onde
// o Kem fica em pé). É o mesmo céu e as mesmas cores das fases, pra tela
// inicial, mapa e loja parecerem o mesmo mundo do bairro mostrado — e não um
// cartaz solto.
//
// Sem estado global: cada cena cria o seu. `update(deltaMs)` move as nuvens
// e pisca as antenas da Cidade à noite.

const ROOF_Y = 470; // linha onde o Kem pisa
const SKYLINE_Y = 300; // as silhuetas mais altas chegam até aqui
const BLINK_MS = 700;

export class CityBackdrop {
  constructor(scene, theme = THEMES.bairro) {
    this.scene = scene;
    this.theme = theme;
    this.clouds = [];
    this.blinkers = [];
    this.blinkT = 0;
    // Tudo que este pano de fundo criou, pra dar pra tirar da cena inteiro
    // de uma vez (o mapa troca de bairro e refaz o pano de fundo).
    this.objects = [];

    const sky = this._g(scene, -40);
    sky.fillGradientStyle(theme.skyTop, theme.skyTop, theme.skyBottom, theme.skyBottom, 1);
    sky.fillRect(0, 0, VIEW.W, VIEW.H);

    if (theme.stars) {
      for (let i = 0; i < 50; i++) {
        const x = hash(i, 205) % VIEW.W;
        const y = hash(i, 206) % (SKYLINE_Y + 40);
        const r = 1 + (hash(i, 207) % 2);
        sky.fillStyle(0xffffff, 0.35 + (hash(i, 208) % 55) / 100);
        sky.fillCircle(x, y, r);
      }
    }

    // Sol (de dia) ou lua (à noite), atrás de tudo, no alto à direita.
    const sun = this._g(scene, -39);
    if (theme.sun) {
      sun.fillStyle(0xfff0b8, 0.55);
      sun.fillCircle(792, 118, 86);
      sun.fillStyle(0xffe27a, 1);
      sun.fillCircle(792, 118, 56);
    } else {
      sun.fillStyle(0xfff8e0, 0.35);
      sun.fillCircle(792, 108, 70);
      sun.fillStyle(0xf5eecb, 1);
      sun.fillCircle(792, 108, 46);
      sun.fillStyle(theme.skyTop, 1);
      sun.fillCircle(808, 96, 40);
    }

    // Nuvens: três blocos arredondados que atravessam a tela devagar.
    const cloudColor = theme.stars ? 0x6a68c4 : 0xffffff;
    for (let i = 0; i < 3; i++) {
      const g = this._g(scene, -38);
      const w = 120 + (hash(i, 7) % 90);
      const h = 26 + (hash(i, 8) % 14);
      g.fillStyle(cloudColor, theme.stars ? 0.5 : 0.85);
      g.fillRoundedRect(0, 0, w, h, h / 2);
      g.fillRoundedRect(w * 0.25, -h * 0.45, w * 0.5, h, h / 2);
      g.x = (hash(i, 9) % VIEW.W) - w;
      g.y = 60 + i * 52;
      this.clouds.push({ g, w, speed: 8 + (hash(i, 10) % 10) });
    }

    // Silhueta da cidade, em duas camadas: a de trás mais clara e mais baixa.
    this._skyline(scene, -30, theme.skylineBack, 1, 110, 60, 2);
    this._skyline(scene, -20, theme.skylineFront, 1, 180, 100, 5);

    if (theme.farKind === 'construction') this._crane(scene, -19);

    // Telhado da frente, onde o Kem dança.
    const roof = this._g(scene, -10);
    roof.fillStyle(theme.building, 1);
    roof.fillRect(0, ROOF_Y, VIEW.W, VIEW.H - ROOF_Y);
    roof.fillStyle(theme.roof, 1);
    roof.fillRect(0, ROOF_Y - 10, VIEW.W, 10);
    roof.fillStyle(theme.buildingShade, 1);
    for (let x = 0; x < VIEW.W; x += 64) roof.fillRect(x + 58, ROOF_Y + 10, 6, VIEW.H - ROOF_Y);
  }

  // Uma fileira de prédios com janelas acesas. `seed` mantém o desenho igual
  // toda vez que a tela abre (nada de cidade piscando a cada partida) — só as
  // luzes da antena da Cidade à noite piscam de verdade, em `update`.
  _skyline(scene, depth, color, alpha, maxH, minH, seed) {
    const theme = this.theme;
    const g = this._g(scene, depth);
    for (let x = 0, i = 0; x < VIEW.W + 80; i++) {
      const w = 54 + (hash(i, seed) % 66);
      const h = minH + (hash(i, seed + 1) % (maxH - minH));
      const top = ROOF_Y - h;
      g.fillStyle(color, alpha);
      g.fillRect(x, top, w, h);
      if (top > SKYLINE_Y - 40) {
        g.fillStyle(theme.window, 0.55);
        for (let wy = top + 14; wy < ROOF_Y - 20; wy += 26) {
          for (let wx = x + 12; wx < x + w - 14; wx += 22) {
            if (hash(wx, wy + seed) % 3 === 0) g.fillRect(wx, wy, 10, 12);
          }
        }
        if (theme.farKind === 'construction' && hash(i, seed + 40) % 3 === 0) {
          g.lineStyle(1.5, 0xffe9d6, 0.4);
          for (let sy = top + 10; sy < ROOF_Y - 10; sy += 20) {
            g.beginPath();
            g.moveTo(x, sy);
            g.lineTo(x + w, sy);
            g.strokePath();
          }
        }
        if (theme.farKind === 'skyscrapers') {
          if (hash(i, seed + 41) % 3 === 0) {
            const signColor = theme.signColors[hash(i, seed + 42) % theme.signColors.length];
            g.fillStyle(signColor, 0.85);
            g.fillRoundedRect(x + 8, top + h * 0.4, Math.min(34, w - 16), 12, 3);
          }
          if (hash(i, seed + 43) % 4 === 0) this._addBlinker(scene, depth, x + w / 2, top, seed + i);
        }
      }
      x += w + 6;
    }
    return g;
  }

  // Uma antena com luz que pisca (guardada à parte, pra ligar/desligar sem
  // redesenhar a cidade inteira a cada quadro).
  _addBlinker(scene, depth, x, top, seed) {
    const mast = this._g(scene, depth);
    mast.lineStyle(2, 0xd9d0c2, 0.8);
    mast.beginPath();
    mast.moveTo(x, top);
    mast.lineTo(x, top - 18);
    mast.strokePath();
    const color = this.theme.signColors[hash(seed, 44) % this.theme.signColors.length];
    const dot = this._g(scene, depth + 1);
    dot.fillStyle(color, 1);
    dot.fillCircle(x, top - 18, 3.5);
    this.blinkers.push({ dot, on: hash(seed, 45) % 2 === 0 });
  }

  _crane(scene, depth) {
    const g = this._g(scene, depth);
    const x = 90;
    const topY = ROOF_Y - 260;
    g.lineStyle(6, 0xffce54, 0.9);
    g.beginPath();
    g.moveTo(x, ROOF_Y - 30);
    g.lineTo(x, topY);
    g.strokePath();
    g.lineStyle(5, 0xffce54, 0.9);
    g.beginPath();
    g.moveTo(x - 20, topY + 10);
    g.lineTo(x + 140, topY);
    g.strokePath();
  }

  // Uma `Graphics` nova, já lembrada em `this.objects` pra `destroy()` poder
  // tirar tudo da cena de uma vez.
  _g(scene, depth) {
    const g = scene.add.graphics().setDepth(depth);
    this.objects.push(g);
    return g;
  }

  // Altura do telhado, para as cenas colocarem o Kem em pé em cima dele.
  get roofY() {
    return ROOF_Y;
  }

  update(deltaMs) {
    const dt = deltaMs / 1000;
    for (const c of this.clouds) {
      c.g.x += c.speed * dt;
      if (c.g.x > VIEW.W) c.g.x = -c.w;
    }

    if (this.blinkers.length) {
      this.blinkT += deltaMs;
      const phase = Math.floor(this.blinkT / BLINK_MS) % 2 === 0;
      for (const b of this.blinkers) b.dot.setVisible(phase === b.on);
    }
  }

  // Tira o pano de fundo inteiro da cena (usado quando o mapa troca de
  // bairro e refaz o `CityBackdrop` com outro tema).
  destroy() {
    for (const obj of this.objects) obj.destroy();
    this.objects = [];
    this.clouds = [];
    this.blinkers = [];
  }
}
