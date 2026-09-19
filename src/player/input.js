export const BUTTONS = ['left', 'right', 'jump', 'action'];

export function mergeHeld(...sources) {
  const out = {};
  for (const b of BUTTONS) out[b] = sources.some((s) => Boolean(s[b]));
  return out;
}

// Transforma "botões segurados" em "segurados + apertou agora".
export class InputTracker {
  constructor() {
    this.prevJump = false;
    this.prevAction = false;
  }

  sample(held) {
    const s = {
      left: Boolean(held.left),
      right: Boolean(held.right),
      jump: Boolean(held.jump),
      action: Boolean(held.action),
    };
    s.jumpPressed = s.jump && !this.prevJump;
    s.actionPressed = s.action && !this.prevAction;
    this.prevJump = s.jump;
    this.prevAction = s.action;
    return s;
  }
}
