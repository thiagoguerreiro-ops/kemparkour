// Catálogo da loja (Etapa 3, Bloco 3): dados puros, sem Phaser.
// Os ids são guardados no save para sempre (owned/equipped) — nunca renomeie
// ou reaproveite um id depois de publicado; se um item mudar, crie um novo id.

export const TABS = ['roupa', 'acessorio', 'danca'];

export const CATALOG = [
  { id: 'roupa-preta', tab: 'roupa', name: 'Moletom preto', price: 0 },
  { id: 'roupa-vermelha', tab: 'roupa', name: 'Moletom vermelho', price: 35 },
  { id: 'roupa-verde-limao', tab: 'roupa', name: 'Moletom verde-limão', price: 40 },
  { id: 'roupa-branca', tab: 'roupa', name: 'Moletom branco de neve', price: 70 },

  { id: 'acessorio-nenhum', tab: 'acessorio', name: 'Nenhum', price: 0 },
  { id: 'bone-para-tras', tab: 'acessorio', name: 'Boné para trás', price: 30 },
  { id: 'oculos-escuros', tab: 'acessorio', name: 'Óculos escuros', price: 35 },
  { id: 'mochila', tab: 'acessorio', name: 'Mochila', price: 55 },

  { id: 'danca-kem', tab: 'danca', name: 'Dança do Kem', price: 0 },
  { id: 'danca-robo', tab: 'danca', name: 'Robô', price: 45 },
  { id: 'danca-parafuso', tab: 'danca', name: 'Parafuso', price: 45 },
];

export function itemsByTab(tab) {
  return CATALOG.filter((item) => item.tab === tab);
}

export function findItem(itemId) {
  return CATALOG.find((item) => item.id === itemId) ?? null;
}

// O item grátis de cada aba (o visual original), para voltar sempre ao padrão.
export function freeItemOf(tab) {
  return itemsByTab(tab).find((item) => item.price === 0) ?? null;
}
