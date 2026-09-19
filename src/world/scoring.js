const KEYS = ['complete', 'fast', 'allStickers'];

export function runStars({ finished, timeSec, targetTime, stickers }) {
  return {
    complete: Boolean(finished),
    fast: Boolean(finished) && timeSec <= targetTime,
    allStickers: Boolean(finished) && stickers >= 3,
  };
}

// As estrelas somam entre partidas: uma vez ganha, fica para sempre.
export function mergeStars(a, b) {
  const out = {};
  for (const k of KEYS) out[k] = Boolean(a?.[k] || b?.[k]);
  return out;
}

export function countStars(stars) {
  return KEYS.reduce((n, k) => n + (stars?.[k] ? 1 : 0), 0);
}

export function starString(stars) {
  return KEYS.map((k) => (stars?.[k] ? '★' : '☆')).join('');
}

export function formatTime(sec, tenths = false) {
  const total = Math.max(0, sec);
  if (!tenths) {
    const whole = Math.floor(total + 1e-6);
    const m = Math.floor(whole / 60);
    return `${m}:${String(whole - m * 60).padStart(2, '0')}`;
  }
  const dec = Math.floor(total * 10 + 1e-6);
  const m = Math.floor(dec / 600);
  const rest = dec - m * 600;
  const s = Math.floor(rest / 10);
  return `${m}:${String(s).padStart(2, '0')}.${rest - s * 10}`;
}
