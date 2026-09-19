import { bodyBox } from './collide.js';

const ITEM_HALF = 12;

export function createCollectibles({ coins, stickers }, savedCoinIds = new Set()) {
  return {
    coins: coins.map((c) => ({ id: c.id, x: c.x, y: c.y, taken: false, wasSaved: savedCoinIds.has(c.id) })),
    stickers: stickers.map((s) => ({ id: s.id, x: s.x, y: s.y, taken: false, provisional: false })),
  };
}

function touches(kem, item) {
  const b = bodyBox(kem);
  return b.right > item.x - ITEM_HALF && b.left < item.x + ITEM_HALF
    && b.bottom > item.y - ITEM_HALF && b.top < item.y + ITEM_HALF;
}

export function collect(col, kem) {
  const got = { coins: [], stickers: [] };
  for (const c of col.coins) {
    if (!c.taken && touches(kem, c)) { c.taken = true; got.coins.push(c.id); }
  }
  for (const s of col.stickers) {
    if (!s.taken && touches(kem, s)) { s.taken = true; s.provisional = true; got.stickers.push(s.id); }
  }
  return got;
}

// No checkpoint (e na bandeira) os adesivos pegos deixam de ser provisórios.
export function commitStickers(col) {
  for (const s of col.stickers) s.provisional = false;
}

// No respawn, os adesivos pegos depois do último checkpoint voltam para a fase.
export function restoreStickers(col) {
  const back = [];
  for (const s of col.stickers) {
    if (!s.provisional) continue;
    s.taken = false;
    s.provisional = false;
    back.push(s.id);
  }
  return back;
}

export function takenCoinIds(col) {
  return col.coins.filter((c) => c.taken).map((c) => c.id);
}

export function stickerCount(col) {
  return col.stickers.filter((s) => s.taken).length;
}
