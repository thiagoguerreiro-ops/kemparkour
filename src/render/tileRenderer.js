import { TILE, VIEW } from '../config.js';
import { THEMES } from './themes.js';

// Número pseudoaleatório fixo por posição (as janelas não "piscam" entre partidas).
export function hash(a, b) {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

// O céu e os prédios do fundo (parallax), de acordo com o bairro da fase.
// `theme.bairro` (padrão) desenha exatamente como antes da Etapa 5 — nenhum
// pixel das Fases 1-10 muda.
export function drawBackground(scene, map, theme = THEMES.bairro) {
  const sky = scene.add.graphics().setScrollFactor(0).setDepth(-20);
  sky.fillGradientStyle(theme.skyTop, theme.skyTop, theme.skyBottom, theme.skyBottom, 1);
  sky.fillRect(0, 0, VIEW.W, VIEW.H);

  if (theme.stars) drawStars(sky, 105);

  const far = scene.add.graphics().setScrollFactor(0.3, 0).setDepth(-10);
  far.fillStyle(theme.far, 1);
  const span = map.widthPx * 0.3 + VIEW.W;
  for (let x = 0, i = 0; x < span; i += 1) {
    const w = 50 + (hash(i, 1) % 70);
    const h = 90 + (hash(i, 2) % 200);
    const top = VIEW.H - h;
    far.fillRect(x, top, w, h);
    if (theme.farKind === 'construction' && hash(i, 20) % 4 === 0) {
      drawScaffolding(far, x, top, w, h);
    }
    if (theme.farKind === 'skyscrapers') {
      drawFarWindows(far, x, top, w, h, i, theme);
      if (hash(i, 21) % 4 === 0) drawAntenna(far, x, top, w, i, theme);
    }
    x += w + (hash(i, 3) % 30);
  }
  if (theme.farKind === 'construction') drawCrane(far, span);
}

// Estrelinhas fixas no céu (mesma posição toda vez que a fase abre).
function drawStars(g, seed) {
  for (let i = 0; i < 44; i++) {
    const x = hash(i, seed) % VIEW.W;
    const y = hash(i, seed + 1) % Math.round(VIEW.H * 0.55);
    const r = 1 + (hash(i, seed + 2) % 2);
    g.fillStyle(0xffffff, 0.4 + (hash(i, seed + 3) % 60) / 100);
    g.fillCircle(x, y, r);
  }
}

// Andaime: uma grade fininha sobre o prédio, como obra em construção.
function drawScaffolding(g, x, top, w, h) {
  g.lineStyle(2, 0xd9d0c2, 0.5);
  for (let sy = top + 14; sy < top + h; sy += 22) {
    g.beginPath();
    g.moveTo(x, sy);
    g.lineTo(x + w, sy);
    g.strokePath();
  }
  for (let sx = x + 6; sx < x + w; sx += 20) {
    g.beginPath();
    g.moveTo(sx, top);
    g.lineTo(sx, top + h);
    g.strokePath();
  }
}

// O guindaste do Centro: um mastro, uma lança e um gancho, no fundo da fase.
function drawCrane(g, span) {
  const x = Math.min(span - 60, 170);
  const topY = VIEW.H - 320;
  const baseY = VIEW.H - 40;
  g.lineStyle(6, 0xffce54, 1);
  g.beginPath();
  g.moveTo(x, baseY);
  g.lineTo(x, topY);
  g.strokePath();
  g.lineStyle(5, 0xffce54, 1);
  g.beginPath();
  g.moveTo(x - 20, topY + 10);
  g.lineTo(x + 130, topY);
  g.strokePath();
  g.lineStyle(2, 0x5e6670, 0.8);
  g.beginPath();
  g.moveTo(x + 108, topY);
  g.lineTo(x + 108, topY + 46);
  g.strokePath();
}

// Janelas espalhadas nos prédios do fundo, acesas na Cidade à noite.
function drawFarWindows(g, x, top, w, h, i, theme) {
  g.fillStyle(theme.window, 0.7);
  for (let wy = top + 12; wy < top + h - 10; wy += 20) {
    for (let wx = x + 8; wx < x + w - 8; wx += 16) {
      if (hash(wx, wy + i) % 3 === 0) g.fillRect(wx, wy, 8, 10);
    }
  }
}

// Uma antena no topo do prédio, com uma luz colorida na ponta.
function drawAntenna(g, x, top, w, i, theme) {
  const ax = x + w * 0.5;
  g.lineStyle(2, 0xd9d0c2, 0.8);
  g.beginPath();
  g.moveTo(ax, top);
  g.lineTo(ax, top - 22);
  g.strokePath();
  const color = theme.signColors[hash(i, 30) % theme.signColors.length] ?? 0xffffff;
  g.fillStyle(color, 1);
  g.fillCircle(ax, top - 22, 3.5);
}

export function drawTiles(scene, map, theme = THEMES.bairro) {
  const g = scene.add.graphics().setDepth(0);
  for (let ty = 0; ty < map.height; ty++) {
    for (let tx = 0; tx < map.width; tx++) {
      const x = tx * TILE;
      const y = ty * TILE;
      if (map.isRunWall(tx, ty)) {
        g.fillStyle((tx + ty) % 2 === 0 ? theme.runwallA : theme.runwallB, 0.45);
        g.fillRect(x, y, TILE, TILE);
        continue;
      }
      if (!map.isSolid(tx, ty)) continue;
      g.fillStyle(theme.building, 1);
      g.fillRect(x, y, TILE, TILE);
      if (!map.isSolid(tx - 1, ty)) {
        g.fillStyle(theme.buildingShade, 1);
        g.fillRect(x, y, 3, TILE);
      }
      if (!map.isSolid(tx, ty - 1)) {
        g.fillStyle(theme.roof, 1);
        g.fillRect(x, y, TILE, 6);
      } else if (map.isSolid(tx, ty + 1) && hash(tx, ty) % 3 === 0) {
        g.fillStyle(theme.window, 1);
        g.fillRect(x + 9, y + 8, 14, 16);
      }
    }
  }
  for (const bar of map.bars) {
    g.fillStyle(theme.bar, 1);
    g.fillRoundedRect(bar.x - 20, bar.y - 4, 40, 8, 4);
    g.fillStyle(theme.barCap, 1);
    g.fillCircle(bar.x - 20, bar.y, 5);
    g.fillCircle(bar.x + 20, bar.y, 5);
  }
  return g;
}
