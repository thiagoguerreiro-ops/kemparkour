import { VIEW } from '../config.js';
import { CITY } from './palette.js';
import { hash } from './tileRenderer.js';

// Cenário de fundo das telas de menu: céu, sol, nuvens que passam devagar,
// silhueta da cidade e um telhado na frente (onde o Kem fica em pé).
// É o mesmo céu e as mesmas cores do jogo, para a tela inicial parecer o
// mesmo mundo das fases — e não um cartaz solto.
//
// Sem estado global: cada cena cria o seu. `update(deltaMs)` só move as nuvens.

const ROOF_Y = 470; // linha onde o Kem pisa
const SKYLINE_Y = 300; // as silhuetas mais altas chegam até aqui

export class CityBackdrop {
  constructor(scene) {
    this.scene = scene;
    this.clouds = [];

    const sky = scene.add.graphics().setDepth(-40);
    sky.fillGradientStyle(CITY.skyTop, CITY.skyTop, CITY.skyBottom, CITY.skyBottom, 1);
    sky.fillRect(0, 0, VIEW.W, VIEW.H);

    // Sol atrás de tudo, no alto à direita.
    const sun = scene.add.graphics().setDepth(-39);
    sun.fillStyle(0xfff0b8, 0.55);
    sun.fillCircle(792, 118, 86);
    sun.fillStyle(0xffe27a, 1);
    sun.fillCircle(792, 118, 56);

    // Nuvens: três blocos arredondados que atravessam a tela devagar.
    for (let i = 0; i < 3; i++) {
      const g = scene.add.graphics().setDepth(-38);
      const w = 120 + (hash(i, 7) % 90);
      const h = 26 + (hash(i, 8) % 14);
      g.fillStyle(0xffffff, 0.85);
      g.fillRoundedRect(0, 0, w, h, h / 2);
      g.fillRoundedRect(w * 0.25, -h * 0.45, w * 0.5, h, h / 2);
      g.x = (hash(i, 9) % VIEW.W) - w;
      g.y = 60 + i * 52;
      this.clouds.push({ g, w, speed: 8 + (hash(i, 10) % 10) });
    }

    // Silhueta da cidade, em duas camadas: a de trás mais clara e mais baixa.
    this._skyline(scene, -30, 0xbcd9ee, 1, 110, 60, 2);
    this._skyline(scene, -20, 0x93b8d2, 1, 180, 100, 5);

    // Telhado da frente, onde o Kem dança.
    const roof = scene.add.graphics().setDepth(-10);
    roof.fillStyle(CITY.building, 1);
    roof.fillRect(0, ROOF_Y, VIEW.W, VIEW.H - ROOF_Y);
    roof.fillStyle(CITY.roof, 1);
    roof.fillRect(0, ROOF_Y - 10, VIEW.W, 10);
    roof.fillStyle(CITY.buildingShade, 1);
    for (let x = 0; x < VIEW.W; x += 64) roof.fillRect(x + 58, ROOF_Y + 10, 6, VIEW.H - ROOF_Y);
  }

  // Uma fileira de prédios com janelas acesas. `seed` mantém o desenho igual
  // toda vez que a tela abre (nada de cidade piscando a cada partida).
  _skyline(scene, depth, color, alpha, maxH, minH, seed) {
    const g = scene.add.graphics().setDepth(depth);
    for (let x = 0, i = 0; x < VIEW.W + 80; i++) {
      const w = 54 + (hash(i, seed) % 66);
      const h = minH + (hash(i, seed + 1) % (maxH - minH));
      const top = ROOF_Y - h;
      g.fillStyle(color, alpha);
      g.fillRect(x, top, w, h);
      if (top > SKYLINE_Y - 40) {
        g.fillStyle(CITY.window, 0.55);
        for (let wy = top + 14; wy < ROOF_Y - 20; wy += 26) {
          for (let wx = x + 12; wx < x + w - 14; wx += 22) {
            if (hash(wx, wy + seed) % 3 === 0) g.fillRect(wx, wy, 10, 12);
          }
        }
      }
      x += w + 6;
    }
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
  }
}
