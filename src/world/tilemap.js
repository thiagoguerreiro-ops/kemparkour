import { TILE } from '../config.js';

const EMPTY = 0;
const SOLID = 1;
const RUNWALL = 2;
const LEGEND = { '.': EMPTY, ' ': EMPTY, '#': SOLID, W: RUNWALL, '=': EMPTY, S: EMPTY };

export class TileMap {
  constructor(width, height, cells, spawn, bars) {
    this.width = width;
    this.height = height;
    this.cells = cells;
    this.spawn = spawn;
    this.bars = bars;
    this.widthPx = width * TILE;
    this.heightPx = height * TILE;
  }

  isSolid(tx, ty) {
    if (tx < 0 || tx >= this.width) return true;
    if (ty < 0 || ty >= this.height) return false;
    return this.cells[ty * this.width + tx] === SOLID;
  }

  isRunWall(tx, ty) {
    if (tx < 0 || tx >= this.width || ty < 0 || ty >= this.height) return false;
    return this.cells[ty * this.width + tx] === RUNWALL;
  }
}

export function parseLevel(rows) {
  if (!Array.isArray(rows) || rows.length === 0) throw new Error('Fase vazia');
  const width = rows[0].length;
  const height = rows.length;
  const cells = new Uint8Array(width * height);
  const bars = [];
  let spawn = null;
  rows.forEach((row, ty) => {
    if (row.length !== width) {
      throw new Error(`Linha ${ty} tem ${row.length} colunas, esperado ${width}`);
    }
    for (let tx = 0; tx < width; tx++) {
      const ch = row[tx];
      if (!(ch in LEGEND)) throw new Error(`Caractere desconhecido '${ch}' em (${tx}, ${ty})`);
      cells[ty * width + tx] = LEGEND[ch];
      if (ch === '=') bars.push({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });
      if (ch === 'S') {
        if (spawn) throw new Error('Mais de um S na fase');
        spawn = { x: tx * TILE + TILE / 2, y: (ty + 1) * TILE };
      }
    }
  });
  if (!spawn) throw new Error('Fase sem S (início)');
  return new TileMap(width, height, cells, spawn, bars);
}
