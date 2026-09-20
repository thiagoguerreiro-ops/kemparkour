import { mergeStars } from '../world/scoring.js';
import { TABS, findItem, freeItemOf } from '../shop/catalog.js';

export const SAVE_KEY = 'kem-parkour-save-v1';
const VERSION = 1;

export function emptySave() {
  return { version: VERSION, levels: {} };
}

// No modo privado do Safari o localStorage pode não existir ou lançar erro:
// nesse caso o jogo usa memória (o progresso vale só enquanto a aba está aberta).
export function browserStorage(get = () => globalThis.localStorage) {
  try {
    const s = get();
    const probe = '__kem_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch {
    const mem = new Map();
    return {
      getItem: (k) => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => { mem.set(k, String(v)); },
      removeItem: (k) => { mem.delete(k); },
    };
  }
}

export function loadSave(storage) {
  try {
    const raw = storage.getItem(SAVE_KEY);
    if (!raw) return emptySave();
    const data = JSON.parse(raw);
    // Campos são aditivos entre Etapas (recordRun preserva o que não conhece).
    // Bumpar VERSION sem escrever uma migração de data.levels[*] antes derruba
    // saves antigos aqui embaixo e os jogadores perdem as estrelas guardadas.
    if (!data || data.version !== VERSION || typeof data.levels !== 'object' || data.levels === null) {
      return emptySave();
    }
    return data;
  } catch {
    return emptySave();
  }
}

export function writeSave(storage, data) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function levelProgress(data, levelId) {
  const p = data?.levels?.[levelId];
  return {
    complete: Boolean(p?.complete),
    stars: mergeStars(p?.stars, null),
    bestTime: typeof p?.bestTime === 'number' ? p.bestTime : null,
    coins: Array.isArray(p?.coins) ? p.coins : [],
  };
}

export function isUnlocked(data, levels, index) {
  if (index <= 0) return true;
  return levelProgress(data, levels[index - 1].id).complete;
}

// Registra uma partida terminada. Devolve um save novo (sem alterar o antigo)
// e o resumo para a tela de fim de fase.
export function recordRun(data, levelId, run) {
  const prev = levelProgress(data, levelId);
  const stars = mergeStars(prev.stars, run.stars);
  const isRecord = prev.bestTime === null || run.timeSec < prev.bestTime;
  const newCoins = run.coinIds.filter((id) => !prev.coins.includes(id));
  return {
    data: {
      ...data,
      levels: {
        ...data.levels,
        [levelId]: {
          ...(data.levels?.[levelId] ?? {}),
          complete: true,
          stars,
          bestTime: isRecord ? run.timeSec : prev.bestTime,
          coins: [...prev.coins, ...newCoins],
        },
      },
    },
    summary: { stars, isRecord, newCoins: newCoins.length },
  };
}

export function totalCoins(data) {
  return Object.values(data?.levels ?? {})
    .reduce((n, p) => n + (Array.isArray(p?.coins) ? p.coins.length : 0), 0);
}

// Estado padrão da loja: só os itens grátis, nada gasto ainda.
function defaultShop() {
  return {
    owned: TABS.map((tab) => freeItemOf(tab)?.id).filter(Boolean),
    equipped: TABS.reduce((acc, tab) => {
      acc[tab] = freeItemOf(tab)?.id ?? null;
      return acc;
    }, {}),
    spent: 0,
  };
}

// Um save sem `shop` (Etapa 2 ou antes) ganha o padrão aqui — as estrelas
// e moedas já guardadas em `data.levels` não são tocadas.
export function shopState(data) {
  const shop = data?.shop;
  if (!shop || typeof shop !== 'object') return defaultShop();
  const def = defaultShop();
  return {
    ...shop,
    owned: Array.isArray(shop.owned) ? shop.owned : def.owned,
    equipped: { ...def.equipped, ...(shop.equipped ?? {}) },
    spent: typeof shop.spent === 'number' && shop.spent >= 0 ? shop.spent : 0,
  };
}

// Moedas pegas menos moedas gastas — nunca negativo.
export function availableCoins(data) {
  return Math.max(0, totalCoins(data) - shopState(data).spent);
}

// Compra um item do catálogo: desconta as moedas e já veste o item na sua
// aba. Devolve o save (novo em caso de sucesso, o mesmo em caso de falha,
// nunca alterado) e um resultado dizendo se deu certo e por quê não, senão.
export function buyItem(data, itemId) {
  const item = findItem(itemId);
  if (!item) return { data, result: { ok: false, reason: 'item-desconhecido' } };

  const shop = shopState(data);
  if (shop.owned.includes(itemId)) {
    return { data, result: { ok: false, reason: 'ja-comprado' } };
  }
  if (item.price > availableCoins(data)) {
    return { data, result: { ok: false, reason: 'sem-moedas' } };
  }

  return {
    data: {
      ...data,
      shop: {
        ...shop,
        owned: [...shop.owned, itemId],
        equipped: { ...shop.equipped, [item.tab]: itemId },
        spent: shop.spent + item.price,
      },
    },
    result: { ok: true },
  };
}

// Dá um item de presente (a Dança do Campeão da Fase 30): entra em
// `shop.owned` sem gastar moedas e sem mudar o que está vestido. Pura e
// idempotente — se já tem o item (ou o id não existe) devolve o mesmo save.
export function grantItem(data, itemId) {
  if (!findItem(itemId)) return data;
  const shop = shopState(data);
  if (shop.owned.includes(itemId)) return data;
  return {
    ...data,
    shop: { ...shop, owned: [...shop.owned, itemId] },
  };
}

// Equipa um item já comprado. Um item nunca comprado não pode ser equipado.
export function equipItem(data, itemId) {
  const item = findItem(itemId);
  if (!item) return { data, result: { ok: false, reason: 'item-desconhecido' } };

  const shop = shopState(data);
  if (!shop.owned.includes(itemId)) {
    return { data, result: { ok: false, reason: 'nao-comprado' } };
  }

  return {
    data: {
      ...data,
      shop: {
        ...shop,
        equipped: { ...shop.equipped, [item.tab]: itemId },
      },
    },
    result: { ok: true },
  };
}
