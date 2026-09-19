// Dados puros do mapa do bairro: a posição de cada fase no caminho.
// Nenhum Phaser aqui — quem desenha isso é `src/scenes/MapScene.js`.
//
// Bairro 1 (as 10 fases de hoje) é um caminho em "S": vai pela rua de baixo,
// da esquerda pra direita, sobe, e volta por cima, da direita pra esquerda.
// Quando os bairros 2 e 3 (Etapa 4) entrarem, é só acrescentar mais pontos
// depois do décimo — a ordem das fases em `LEVELS` é o que manda.

import { LEVELS } from './levels.js';

const ROW_Y = [460, 260];
const COL_X = [100, 290, 480, 670, 860];

// Colunas 0..4 na rua de baixo (esquerda->direita), e as mesmas colunas
// espelhadas na rua de cima (direita->esquerda), pra virar um "S" contínuo.
function pointFor(index) {
  const row = Math.floor(index / COL_X.length);
  const colInRow = index % COL_X.length;
  const col = row % 2 === 0 ? colInRow : COL_X.length - 1 - colInRow;
  return { x: COL_X[col], y: ROW_Y[row] ?? ROW_Y[ROW_Y.length - 1] };
}

// Uma entrada por fase, na mesma ordem de `LEVELS`.
export const MAP_POINTS = LEVELS.map((level, i) => ({ id: level.id, ...pointFor(i) }));

export function mapPointAt(index) {
  return MAP_POINTS[index] ?? null;
}

export function mapPointFor(levelId) {
  return MAP_POINTS.find((p) => p.id === levelId) ?? null;
}
