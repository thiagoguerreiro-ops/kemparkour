// Catálogo da loja (Etapa 3, Bloco 3): dados puros, sem Phaser.
// Os ids são guardados no save para sempre (owned/equipped) — nunca renomeie
// ou reaproveite um id depois de publicado; se um item mudar, crie um novo id.
//
// Campos opcionais de um item:
//  - `secret: true`  — só aparece na loja depois de ganho (Dança do Campeão).
//  - `unlock: { afterLevel, hint }` — o item aparece na loja com cadeado e não
//    pode ser comprado até a fase `afterLevel` (o número da fase, 1..30) estar
//    completa; `hint` é o texto que a criança lê no cartão travado.
//    Ver `isItemUnlocked` em src/save/save.js.
//
// PREÇOS (a regra da família: "terminar um bairro pegando quase todas as
// moedas compra uns 2-3 itens dele, nunca tudo"). Moedas por bairro, contadas
// nas fases (entidades `coin`): Bairro do Kem 1-10 = 131, Centro 11-20 = 150,
// Cidade à noite 21-30 = 153; as 30 fases somam 434.
//  - Bairro do Kem: os 3 itens mais baratos custam 100 (76% das 131 moedas), os
//    4 mais baratos 140 — nunca dá pra comprar tudo do bairro.
//  - Centro (2 itens novos): capacete 65 + colete 90 = 155 (103% das 150): com
//    quase todas as moedas do bairro compra 1 item novo e ainda sobra pra um
//    barato antigo; os dois juntos só com a sobra do Bairro do Kem.
//  - Cidade à noite (3 itens novos): fones 50 + óculos de LED 60 + moletom neon
//    90 = 200 (131% das 153): os 2 mais baratos custam 110 (72%), os três nunca
//    cabem só nas moedas do bairro.
//  - A loja inteira custa 355 + 155 + 200 = 710, bem mais que as 434 moedas do jogo todo.

export const TABS = ['roupa', 'acessorio', 'danca'];

// Quem já completou a Fase 10 chegou ao Centro; a Fase 20, à Cidade à noite.
const CENTRO = { afterLevel: 10, hint: 'Chegue no Centro!' };
const NOITE = { afterLevel: 20, hint: 'Chegue na Cidade à noite!' };

export const CATALOG = [
  { id: 'roupa-preta', tab: 'roupa', name: 'Moletom preto', price: 0 },
  { id: 'roupa-vermelha', tab: 'roupa', name: 'Moletom vermelho', price: 35 },
  { id: 'roupa-verde-limao', tab: 'roupa', name: 'Moletom verde-limão', price: 40 },
  { id: 'roupa-branca', tab: 'roupa', name: 'Moletom branco de neve', price: 70 },
  { id: 'colete-refletivo', tab: 'roupa', name: 'Colete refletivo', price: 90, unlock: CENTRO },
  { id: 'moletom-neon', tab: 'roupa', name: 'Moletom neon', price: 90, unlock: NOITE },

  { id: 'acessorio-nenhum', tab: 'acessorio', name: 'Nenhum', price: 0 },
  { id: 'bone-para-tras', tab: 'acessorio', name: 'Boné para trás', price: 30 },
  { id: 'oculos-escuros', tab: 'acessorio', name: 'Óculos escuros', price: 35 },
  { id: 'mochila', tab: 'acessorio', name: 'Mochila', price: 55 },
  { id: 'capacete-de-obra', tab: 'acessorio', name: 'Capacete de obra', price: 65, unlock: CENTRO },
  { id: 'fones-de-ouvido', tab: 'acessorio', name: 'Fones de ouvido', price: 50, unlock: NOITE },
  { id: 'oculos-de-led', tab: 'acessorio', name: 'Óculos de LED', price: 60, unlock: NOITE },

  { id: 'danca-kem', tab: 'danca', name: 'Dança do Kem', price: 0 },
  { id: 'danca-robo', tab: 'danca', name: 'Robô', price: 45 },
  { id: 'danca-parafuso', tab: 'danca', name: 'Parafuso', price: 45 },
  // Surpresa da grande final (Fase 30): ganha de graça ao zerar o jogo. Item
  // `secret` não aparece na loja até estar no save (ver `visibleItemsByTab`)
  // e nunca é o item "padrão" da aba (ver `freeItemOf`).
  { id: 'danca-campeao', tab: 'danca', name: 'Dança do Campeão', price: 0, secret: true },
];

export function itemsByTab(tab) {
  return CATALOG.filter((item) => item.tab === tab);
}

// O que a loja mostra numa aba: tudo, menos os itens secretos que o jogador
// ainda não ganhou (`ownedIds` = os ids do `shop.owned` do save).
export function visibleItemsByTab(tab, ownedIds = []) {
  return itemsByTab(tab).filter((item) => !item.secret || ownedIds.includes(item.id));
}

export function findItem(itemId) {
  return CATALOG.find((item) => item.id === itemId) ?? null;
}

// O item grátis de cada aba (o visual original), para voltar sempre ao padrão.
// Itens secretos também custam 0, mas nunca são o padrão.
export function freeItemOf(tab) {
  return itemsByTab(tab).find((item) => item.price === 0 && !item.secret) ?? null;
}
