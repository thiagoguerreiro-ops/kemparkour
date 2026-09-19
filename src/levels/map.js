// Dados puros do mapa: uma página por bairro, cada uma com os mesmos 10
// pontos em "S" (a rua de baixo, da esquerda pra direita, sobe, e volta por
// cima, da direita pra esquerda). Nenhum Phaser aqui — quem desenha isso é
// `src/scenes/MapScene.js`.
//
// O jogo tem 3 bairros de 10 fases (30 pontos no total), mesmo quando
// `LEVELS` ainda não tem todas as fases prontas — os pontos das fases que
// ainda não existem ficam com `id: null` e a tela mostra "Em breve!" neles.
// Isso deixa o mapa certo desde o Bloco 1 da Etapa 5, antes das fases 11-30
// existirem.

import { LEVELS } from './levels.js';
import { NEIGHBORHOOD_IDS, LEVELS_PER_NEIGHBORHOOD } from '../render/themes.js';

export const PAGE_SIZE = LEVELS_PER_NEIGHBORHOOD;
export const PAGE_COUNT = NEIGHBORHOOD_IDS.length;
export const TOTAL_SLOTS = PAGE_SIZE * PAGE_COUNT;

const ROW_Y = [460, 260];
const COL_X = [100, 290, 480, 670, 860];

// A posição de um ponto dentro da página (índice local 0..9): colunas
// 0..4 na rua de baixo (esquerda->direita), e as mesmas colunas espelhadas
// na rua de cima (direita->esquerda), pra virar um "S" contínuo.
function pointFor(localIndex) {
  const row = Math.floor(localIndex / COL_X.length);
  const colInRow = localIndex % COL_X.length;
  const col = row % 2 === 0 ? colInRow : COL_X.length - 1 - colInRow;
  return { x: COL_X[col], y: ROW_Y[row] };
}

// Uma entrada por vaga de fase (30 no total, 10 por bairro), na mesma ordem
// de `LEVELS` para as que já existem. `id` é `null` para uma fase que ainda
// não foi construída.
export const MAP_POINTS = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
  const level = LEVELS[i] ?? null;
  const page = Math.floor(i / PAGE_SIZE);
  const local = i % PAGE_SIZE;
  return { id: level ? level.id : null, number: i + 1, page, ...pointFor(local) };
});

// Os pontos de uma única página (bairro), na ordem do caminho.
export function pointsForPage(page) {
  const start = page * PAGE_SIZE;
  return MAP_POINTS.slice(start, start + PAGE_SIZE);
}

export function mapPointAt(index) {
  return MAP_POINTS[index] ?? null;
}

export function mapPointFor(levelId) {
  return MAP_POINTS.find((p) => p.id === levelId) ?? null;
}

// A página (bairro) de um índice absoluto de fase (0-based, como em `LEVELS`).
export function pageOf(levelIndex) {
  return Math.floor(levelIndex / PAGE_SIZE);
}
