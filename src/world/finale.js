// A grande final (Fase 30): dados e regras puras, sem Phaser.

// A última fase do jogo, no topo do prédio mais alto. O id é o que vale — o
// número da fase muda de lugar se o jogo crescer, o id não.
export const FINAL_LEVEL_ID = 'bairro-30';

// A dança secreta que o jogador ganha ao zerar o jogo (ver catalog.js).
export const CHAMPION_DANCE_ID = 'danca-campeao';

export function isFinalLevel(level) {
  return level?.id === FINAL_LEVEL_ID;
}
