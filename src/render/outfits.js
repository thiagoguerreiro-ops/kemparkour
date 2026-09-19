// Roupas e acessórios da loja (Etapa 3, Bloco 3), como dados: cores para
// cada `roupa-*` do catálogo, e sinalizadores para cada acessório que
// `drawKem` (kemRenderer.js) sabe desenhar por cima do Kem.
//
// Sem Phaser aqui — só dados e funções puras — para dar pra testar com
// `node --test` e pra loja e o jogo usarem exatamente o mesmo visual.

import { OUTFIT_DEFAULT } from './palette.js';

// Só a cor do moletom muda entre roupas — calça azul-clara, tênis branco,
// carinha amarela e a pele continuam sempre iguais (pedido do Thiago).
const ROUPA_COLORS = {
  'roupa-preta': {}, // o original, já é o OUTFIT_DEFAULT
  'roupa-vermelha': { hoodie: 0xd9453a, hoodieShade: 0x8a241d },
  'roupa-verde-limao': { hoodie: 0x7ed321, hoodieShade: 0x4c8a12 },
  'roupa-branca': { hoodie: 0xf6f8fb, hoodieShade: 0xc9d0d8 },
};

// Cada acessório liga um sinalizador que `drawKem` usa para desenhar (ou
// não) um boné, óculos escuros ou mochila. Campos ausentes = nada muda,
// então quem já chama `drawKem` sem outfit continua funcionando igual.
const ACESSORIO_FLAGS = {
  'acessorio-nenhum': {},
  'bone-para-tras': { cap: true },
  'oculos-escuros': { sunglasses: true },
  mochila: { backpack: true },
};

// A roupa (isolada, sem acessório) de um item da aba "roupa" — usada nos
// retratos da loja, para mostrar só a peça que está sendo vendida.
export function outfitForRoupa(itemId) {
  return { ...OUTFIT_DEFAULT, ...(ROUPA_COLORS[itemId] ?? {}) };
}

// O acessório (isolado, sobre a roupa original) de um item da aba
// "acessorio" — mesma ideia, para o retrato mostrar só o acessório.
export function outfitForAcessorio(itemId) {
  return { ...OUTFIT_DEFAULT, ...(ACESSORIO_FLAGS[itemId] ?? {}) };
}

// O visual completo do Kem equipado: roupa + acessório do save. Ids
// desconhecidos (save de uma Etapa futura, ou dado corrompido) caem no
// visual original — nunca quebra o desenho.
export function outfitFor(shopState) {
  const roupa = ROUPA_COLORS[shopState?.equipped?.roupa] ?? {};
  const acessorio = ACESSORIO_FLAGS[shopState?.equipped?.acessorio] ?? {};
  return { ...OUTFIT_DEFAULT, ...roupa, ...acessorio };
}
