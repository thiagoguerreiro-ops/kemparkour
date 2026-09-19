export const MOVES = ['jump', 'slide', 'ledge', 'walljump', 'roll', 'doublejump', 'swing', 'wallrun'];

export const MOVE_UNLOCK_LEVEL = {
  jump: 1,
  slide: 4,
  ledge: 7,
  walljump: 10,
  roll: 13,
  doublejump: 16,
  swing: 19,
  wallrun: 22,
};

export function movesForLevel(level) {
  return MOVES.filter((m) => MOVE_UNLOCK_LEVEL[m] <= level);
}
