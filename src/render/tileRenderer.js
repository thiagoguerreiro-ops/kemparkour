import { TILE, VIEW } from '../config.js';
import { CITY } from './palette.js';

// Número pseudoaleatório fixo por posição (as janelas não "piscam" entre partidas).
export function hash(a, b) {
  let h = Math.imul(a, 374761393) + Math.imul(b, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export function drawBackground(scene, map) {
  const sky = scene.add.graphics().setScrollFactor(0).setDepth(-20);
  sky.fillGradientStyle(CITY.skyTop, CITY.skyTop, CITY.skyBottom, CITY.skyBottom, 1);
  sky.fillRect(0, 0, VIEW.W, VIEW.H);

  const far = scene.add.graphics().setScrollFactor(0.3, 0).setDepth(-10);
  far.fillStyle(CITY.far, 1);
  const span = map.widthPx * 0.3 + VIEW.W;
  for (let x = 0, i = 0; x < span; i += 1) {
    const w = 50 + (hash(i, 1) % 70);
    const h = 90 + (hash(i, 2) % 200);
    far.fillRect(x, VIEW.H - h, w, h);
    x += w + (hash(i, 3) % 30);
  }
}

export function drawTiles(scene, map) {
  const g = scene.add.graphics().setDepth(0);
  for (let ty = 0; ty < map.height; ty++) {
    for (let tx = 0; tx < map.width; tx++) {
      const x = tx * TILE;
      const y = ty * TILE;
      if (map.isRunWall(tx, ty)) {
        g.fillStyle((tx + ty) % 2 === 0 ? CITY.runwallA : CITY.runwallB, 0.45);
        g.fillRect(x, y, TILE, TILE);
        continue;
      }
      if (!map.isSolid(tx, ty)) continue;
      g.fillStyle(CITY.building, 1);
      g.fillRect(x, y, TILE, TILE);
      if (!map.isSolid(tx - 1, ty)) {
        g.fillStyle(CITY.buildingShade, 1);
        g.fillRect(x, y, 3, TILE);
      }
      if (!map.isSolid(tx, ty - 1)) {
        g.fillStyle(CITY.roof, 1);
        g.fillRect(x, y, TILE, 6);
      } else if (map.isSolid(tx, ty + 1) && hash(tx, ty) % 3 === 0) {
        g.fillStyle(CITY.window, 1);
        g.fillRect(x + 9, y + 8, 14, 16);
      }
    }
  }
  for (const bar of map.bars) {
    g.fillStyle(CITY.bar, 1);
    g.fillRoundedRect(bar.x - 20, bar.y - 4, 40, 8, 4);
    g.fillStyle(CITY.barCap, 1);
    g.fillCircle(bar.x - 20, bar.y, 5);
    g.fillCircle(bar.x + 20, bar.y, 5);
  }
  return g;
}
