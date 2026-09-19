import { TILE } from '../config.js';

const REQUIRED = {
  checkpoint: ['id', 'tx', 'ty'],
  flag: ['tx', 'ty'],
  coin: ['id', 'tx', 'ty'],
  sticker: ['id', 'tx', 'ty'],
  steam: ['tx', 'ty', 'dir', 'length', 'onMs', 'offMs'],
  fan: ['tx', 'ty', 'dir', 'range', 'push'],
  platform: ['w', 'from', 'to', 'speed'],
  tutorial: ['tx', 'ty', 'w', 'move', 'text'],
};
const STEAM_DIRS = ['up', 'down', 'left', 'right'];

// Campos numéricos esperados por tipo (além de tx/ty, que todo tipo com
// posição tem). Uma string aqui ('1' em vez de 1) passaria despercebida
// pelas contas de pixel mais adiante, então é rejeitada já na leitura.
const NUMERIC_FIELDS = {
  checkpoint: ['tx', 'ty'],
  flag: ['tx', 'ty'],
  coin: ['tx', 'ty'],
  sticker: ['tx', 'ty'],
  steam: ['tx', 'ty', 'length', 'onMs', 'offMs'],
  fan: ['tx', 'ty', 'range', 'push'],
  platform: ['w', 'speed'],
  tutorial: ['tx', 'ty', 'w'],
};

const feet = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: (ty + 1) * TILE });
const center = (tx, ty) => ({ x: tx * TILE + TILE / 2, y: ty * TILE + TILE / 2 });

function checkNumber(where, field, value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${where}: o campo '${field}' precisa ser um número`);
  }
}

function checkPositive(where, field, value) {
  checkNumber(where, field, value);
  if (!(value > 0)) throw new Error(`${where}: o campo '${field}' precisa ser maior que 0`);
}

export function parseEntities(list) {
  const out = {
    checkpoints: [], flag: null, coins: [], stickers: [],
    steams: [], fans: [], platforms: [], tutorials: [],
  };
  const ids = new Set();

  (list ?? []).forEach((e, i) => {
    const where = `Entidade ${i + 1} (${e.type})`;
    const required = REQUIRED[e.type];
    if (!required) throw new Error(`Entidade ${i + 1}: tipo desconhecido '${e.type}'`);
    for (const field of required) {
      if (e[field] === undefined) throw new Error(`${where}: falta o campo '${field}'`);
    }
    if (e.id !== undefined) {
      if (ids.has(e.id)) throw new Error(`${where}: id '${e.id}' repetido`);
      ids.add(e.id);
    }

    for (const field of NUMERIC_FIELDS[e.type] ?? []) checkNumber(where, field, e[field]);
    if (e.offsetMs !== undefined) checkNumber(where, 'offsetMs', e.offsetMs);
    if (e.type === 'platform') {
      checkNumber(where, 'from.tx', e.from?.tx);
      checkNumber(where, 'from.ty', e.from?.ty);
      checkNumber(where, 'to.tx', e.to?.tx);
      checkNumber(where, 'to.ty', e.to?.ty);
    }
    if (e.type === 'steam') checkPositive(where, 'length', e.length);
    if (e.type === 'fan') checkPositive(where, 'range', e.range);
    if (e.type === 'platform') {
      checkPositive(where, 'w', e.w);
      if (e.speed < 0) {
        throw new Error(`${where}: o campo 'speed' não pode ser negativo (a plataforma nunca voltaria)`);
      }
    }

    switch (e.type) {
      case 'checkpoint':
        out.checkpoints.push({ id: e.id, tx: e.tx, ty: e.ty, ...feet(e.tx, e.ty) });
        break;
      case 'flag':
        if (out.flag) throw new Error(`${where}: mais de uma bandeira na fase`);
        out.flag = { tx: e.tx, ty: e.ty, ...feet(e.tx, e.ty) };
        break;
      case 'coin':
        out.coins.push({ id: e.id, tx: e.tx, ty: e.ty, ...center(e.tx, e.ty) });
        break;
      case 'sticker':
        out.stickers.push({ id: e.id, tx: e.tx, ty: e.ty, ...center(e.tx, e.ty) });
        break;
      case 'steam':
        if (!STEAM_DIRS.includes(e.dir)) throw new Error(`${where}: direção '${e.dir}' inválida`);
        out.steams.push({
          tx: e.tx, ty: e.ty, dir: e.dir, length: e.length,
          onMs: e.onMs, offMs: e.offMs, offsetMs: e.offsetMs ?? 0,
        });
        break;
      case 'fan':
        if (e.dir !== 1 && e.dir !== -1) throw new Error(`${where}: dir deve ser 1 ou -1`);
        out.fans.push({ tx: e.tx, ty: e.ty, dir: e.dir, range: e.range, push: e.push });
        break;
      case 'platform':
        out.platforms.push({ w: e.w, from: { ...e.from }, to: { ...e.to }, speed: e.speed });
        break;
      case 'tutorial':
        out.tutorials.push({ tx: e.tx, ty: e.ty, w: e.w, move: e.move, text: e.text });
        break;
    }
  });

  if (!out.flag) throw new Error('Fase sem bandeira (flag)');
  return out;
}
