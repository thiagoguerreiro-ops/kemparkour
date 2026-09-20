import { PHYS } from '../config.js';
import { OUTFIT_DEFAULT } from './palette.js';

// Metade da altura em pé. O desenho é centrado: os pés ficam +HALF abaixo
// da origem, a cabeça -HALF acima. Quem posiciona o Kem numa tela (tela
// inicial, mapa) precisa disso pra encostar os pés no chão.
export const HALF = 22;

const IDLE = { legs: [[0.08, 0], [-0.08, 0]], arms: [[0.15, 0.2], [-0.12, 0.2]] };

function runPose(phase) {
  const s = Math.sin(phase);
  const c = Math.cos(phase);
  return {
    lean: 2.5,
    crouch: -1.5 * Math.abs(c),
    legs: [[0.8 * s, -(0.3 + 0.9 * Math.max(0, c))], [-0.8 * s, -(0.3 + 0.9 * Math.max(0, -c))]],
    arms: [[-0.9 * s, 1.3], [0.9 * s, 1.3]],
  };
}

export function poseFor(kem, anim) {
  const f = kem.facing;
  const t = anim.t;
  const base = { rotation: 0, center: null, lean: 0, crouch: 0, stars: false, ...IDLE };
  switch (kem.state) {
    case 'ground':
      if (Math.abs(kem.vx) < 20) return { ...base, crouch: Math.sin(t * 2.5) * 0.6 };
      return { ...base, ...runPose(anim.phase) };
    case 'wallrun':
      return { ...base, ...runPose(anim.phase), lean: 4 };
    case 'air':
      if (kem.vy < 0) {
        return { ...base, legs: [[0.9, -1.5], [-0.3, -0.6]], arms: [[2.7, 0.3], [2.2, 0.5]] };
      }
      return {
        ...base,
        legs: [[0.4, -0.7], [-0.2, -0.3]],
        arms: [[2.0 + 0.3 * Math.sin(t * 18), 0.2], [-2.0 - 0.3 * Math.sin(t * 18), -0.2]],
      };
    case 'slide':
      return { ...base, rotation: -1.25 * f, legs: [[1.4, 0], [1.1, -0.4]], arms: [[-0.5, 0], [2.5, 0]] };
    case 'roll':
      return {
        ...base,
        rotation: f * (kem.stateTime / PHYS.ROLL_TIME) * Math.PI * 2,
        center: { x: 0, y: -11 },
        crouch: 8,
        legs: [[1.9, -2.5], [1.7, -2.3]],
        arms: [[1.5, 1.3], [1.3, 1.3]],
      };
    case 'stunned':
      return {
        ...base,
        crouch: 3,
        lean: Math.sin(t * 8) * 2,
        stars: true,
        legs: [[0.5, -1.2], [-0.1, -0.8]],
        arms: [[0.5, 0.5], [-0.5, 0.5]],
      };
    case 'ledge':
      return { ...base, lean: 2, legs: [[0.15, -0.3], [-0.1, -0.5]], arms: [[3.0, 0], [3.3, 0]] };
    case 'wallslide':
      return { ...base, lean: -1, legs: [[0.8, -1.2], [0.3, -0.7]], arms: [[2.8, 0.2], [0.8, 1.0]] };
    case 'swing': {
      const kick = kem.swing ? Math.max(-0.6, Math.min(0.6, kem.swing.omega * 0.08)) : 0;
      return {
        ...base,
        rotation: kem.swing ? -kem.swing.angle : 0,
        legs: [[0.2 + kick, -0.3], [kick, -0.5]],
        arms: [[Math.PI, 0], [Math.PI, 0]],
      };
    }
    default:
      return base;
  }
}

function limb(g, x, y, a1, l1, a2, l2, width, color) {
  const kx = x + Math.sin(a1) * l1;
  const ky = y + Math.cos(a1) * l1;
  const ex = kx + Math.sin(a1 + a2) * l2;
  const ey = ky + Math.cos(a1 + a2) * l2;
  g.lineStyle(width, color, 1);
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(kx, ky);
  g.lineTo(ex, ey);
  g.strokePath();
  g.fillStyle(color, 1);
  g.fillCircle(kx, ky, width / 2);
  return { x: ex, y: ey };
}

// --- enfeites opcionais da Loja ------------------------------------------------
// Tudo abaixo só desenha quando o outfit liga o sinalizador (stripes, neonA,
// hardHat, ledVisor, headphones, ...). Sem eles `drawKem` fica idêntico.

const LED_COLORS = [0xff4d6d, 0xffd23f, 0x5be37d, 0x39f0ff, 0xff3df2];

// Faixa horizontal atravessando o tronco na altura `y` (segue a inclinação).
function torsoBand(g, hipY, neck, y, thick, color) {
  const bottom = hipY + 1;
  const k = (y - bottom) / (neck.y - bottom);
  g.fillStyle(color, 1);
  g.fillRect(neck.x * k - 6, y - thick / 2, 12, thick);
}

// Risquinho atravessando um braço a `frac` do caminho de um segmento (que sai
// de (x, y) com ângulo `a` e comprimento `len`).
function armBand(g, x, y, a, len, frac, width, thick, color, alpha = 1) {
  const bx = x + Math.sin(a) * len * frac;
  const by = y + Math.cos(a) * len * frac;
  const dx = Math.cos(a) * width / 2;
  const dy = -Math.sin(a) * width / 2;
  g.lineStyle(thick, color, alpha);
  g.beginPath();
  g.moveTo(bx - dx, by - dy);
  g.lineTo(bx + dx, by + dy);
  g.strokePath();
}

// Faixas refletivas (colete) ou punho de neon nas mangas — desenhadas por
// cima do braço, antes da mão.
function sleeveTrim(g, o, x, y, a1, a2) {
  if (o.stripes) {
    armBand(g, x, y, a1, 8, 0.5, 6, 1.7, o.stripes);
    armBand(g, x + Math.sin(a1) * 8, y + Math.cos(a1) * 8, a1 + a2, 8, 0.5, 6, 1.7, o.stripes);
  }
  if (o.neonA !== undefined) {
    const ex = x + Math.sin(a1) * 8;
    const ey = y + Math.cos(a1) * 8;
    armBand(g, ex, ey, a1 + a2, 8, 0.72, 7, 3.4, o.neonB, 0.3);
    armBand(g, ex, ey, a1 + a2, 8, 0.72, 6, 1.3, o.neonB);
  }
}

// Linha de neon: um halo largo e fraquinho por baixo e o fio brilhante por cima.
function neonLine(g, color, x1, y1, x2, y2) {
  g.lineStyle(3.4, color, 0.3);
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.strokePath();
  g.lineStyle(1.2, color, 1);
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.strokePath();
}

// Pontos de um arco de elipse (para desenhar cúpulas e faixas de cabeça).
function arcPoints(cx, cy, rx, ry, from, to, steps = 14) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    pts.push({ x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry });
  }
  return pts;
}

export function drawKem(g, p, o, t = 0) {
  g.clear();
  const hipY = 2 + p.crouch;
  const neck = { x: p.lean, y: -11 + p.crouch };

  // membros de trás (mais escuros)
  const backFoot = limb(g, 0, hipY, p.legs[1][0], 10, p.legs[1][1], 10, 6, o.pantsShade);
  g.fillStyle(o.shoesShade, 1);
  g.fillEllipse(backFoot.x + 2, backFoot.y, 9, 5);
  const backHand = limb(g, neck.x, neck.y + 2, p.arms[1][0], 8, p.arms[1][1], 8, 5, o.hoodieShade);
  sleeveTrim(g, o, neck.x, neck.y + 2, p.arms[1][0], p.arms[1][1]);
  g.fillStyle(o.skin, 1);
  g.fillCircle(backHand.x, backHand.y, 2.6);

  // mochila (acessório opcional, da Loja): desenhada atrás do tronco, então
  // só a beirada aparece pra fora — um bocado de mochila nas costas.
  if (o.backpack) {
    g.fillStyle(0x3a3f4a, 1);
    g.fillRoundedRect(-11, hipY - 15, 7, 16, 3);
    g.fillStyle(0x2a2e37, 1);
    g.fillRoundedRect(-9.5, hipY - 13, 4, 5, 1.5);
  }

  // tronco: moletom preto com o rosto feliz
  g.fillStyle(o.hoodie, 1);
  g.fillPoints([
    { x: -6, y: hipY + 1 },
    { x: 6, y: hipY + 1 },
    { x: neck.x + 6, y: neck.y },
    { x: neck.x - 6, y: neck.y },
  ], true);
  g.fillStyle(o.pants, 1);
  g.fillRect(-6, hipY - 1, 12, 4);
  // colete refletivo: duas faixas prateadas atravessando o peito
  if (o.stripes) {
    torsoBand(g, hipY, neck, neck.y + 1.7, 1.7, o.stripes);
    torsoBand(g, hipY, neck, hipY - 2, 1.7, o.stripes);
  }
  // moletom neon: contorno brilhante (ciano de um lado, magenta do outro)
  if (o.neonA !== undefined) {
    neonLine(g, o.neonA, -5.6, hipY + 0.6, neck.x - 5.6, neck.y + 0.5);
    neonLine(g, o.neonB, 5.6, hipY + 0.6, neck.x + 5.6, neck.y + 0.5);
    neonLine(g, o.neonA, -5.6, hipY - 1.4, 5.6, hipY - 1.4);
  }
  const cx = neck.x * 0.6 + 1.5;
  const cy = (hipY + neck.y) / 2 - 1;
  g.fillStyle(o.smiley, 1);
  g.fillCircle(cx, cy, 3.6);
  g.fillStyle(0x222222, 1);
  g.fillCircle(cx - 1.2, cy - 1, 0.6);
  g.fillCircle(cx + 1.2, cy - 1, 0.6);
  g.lineStyle(0.8, 0x222222, 1);
  g.beginPath();
  g.arc(cx, cy + 0.2, 2, 0.35, Math.PI - 0.35);
  g.strokePath();

  // cabeça: capuz, rosto e óculos
  const hx = neck.x + 1;
  const hy = neck.y - 6.5;
  g.fillStyle(o.hoodie, 1);
  g.fillCircle(hx - 1.2, hy - 0.5, 7.5);
  if (o.neonA !== undefined) {
    g.lineStyle(3.4, o.neonA, 0.3);
    g.strokeCircle(hx - 1.2, hy - 0.5, 7.5);
    g.lineStyle(1.2, o.neonA, 1);
    g.strokeCircle(hx - 1.2, hy - 0.5, 7.5);
  }
  g.fillStyle(o.skin, 1);
  g.fillCircle(hx + 1.6, hy + 0.8, 5.2);
  g.lineStyle(1.5, o.hoodieShade, 1);
  g.beginPath();
  g.arc(hx + 1.6, hy + 0.8, 5.8, -2.2, 1.9);
  g.strokePath();
  g.fillStyle(o.glasses, 1);
  g.fillRect(hx + 1.5, hy - 0.8, 5.6, 2.8);
  g.fillStyle(o.lens, 1);
  g.fillRect(hx + 2.2, hy - 0.3, 4.2, 1.8);
  g.lineStyle(1, o.glasses, 1);
  g.beginPath();
  g.moveTo(hx - 2, hy);
  g.lineTo(hx + 1.5, hy);
  g.strokePath();

  // óculos escuros (acessório opcional, da Loja): por cima dos óculos normais.
  if (o.sunglasses) {
    g.fillStyle(0x111111, 1);
    g.fillRoundedRect(hx + 1.1, hy - 1.2, 6.4, 3.4, 1);
  }

  // boné para trás (acessório opcional, da Loja): a aba fica do lado de trás
  // da cabeça (oposto do rosto), como um boné usado ao contrário.
  if (o.cap) {
    g.fillStyle(0x1e3a5f, 1);
    g.fillCircle(hx - 1.2, hy - 4.2, 6.2);
    g.fillStyle(0x14283f, 1);
    g.fillEllipse(hx - 7.4, hy - 2.6, 6.5, 3.4);
  }

  // capacete de obra (acessório opcional, da Loja): cúpula amarela com uma
  // cristazinha no alto e aba reta em volta.
  if (o.hardHat) {
    const hcx = hx - 0.4;
    const base = hy - 2;
    g.fillStyle(0xffc21a, 1);
    g.fillPoints(arcPoints(hcx, base, 6.9, 7.2, Math.PI, Math.PI * 2), true);
    g.fillStyle(0xffe066, 1);
    g.fillRoundedRect(hcx - 3.2, base - 8.8, 6.4, 2.6, 1.2);
    g.fillStyle(0xe59f00, 1);
    g.fillRoundedRect(hcx - 8.2, base - 0.4, 17.6, 2, 1);
  }

  // óculos de LED (acessório opcional, da Loja): viseira larga e escura com
  // uma fileira de luzinhas coloridas que piscam.
  if (o.ledVisor) {
    const vx = hx - 2.5;
    const vy = hy - 2.2;
    g.fillStyle(0x39f0ff, 0.28);
    g.fillRoundedRect(vx - 1.2, vy - 1.2, 13.4, 6.8, 3);
    g.fillStyle(0x12121c, 1);
    g.fillRoundedRect(vx, vy, 11, 4.4, 2);
    const shift = Math.floor(t * 6);
    for (let i = 0; i < 5; i++) {
      g.fillStyle(LED_COLORS[(i + shift) % LED_COLORS.length], 1);
      g.fillCircle(vx + 1.9 + i * 1.8, vy + 2.2, 0.85);
    }
  }

  // fones de ouvido (acessório opcional, da Loja): arco por cima do capuz e
  // duas conchas grandes nas orelhas.
  if (o.headphones) {
    const fx = hx - 2.6;
    const fy = hy + 1.4;
    const band = arcPoints(fx, fy, 6, 9.6, Math.PI, Math.PI * 2, 18);
    g.lineStyle(4, 0x2a2e37, 1);
    g.strokePoints(band, false, false);
    g.lineStyle(2.2, 0xdfe3ea, 1);
    g.strokePoints(band, false, false);
    for (const [ux, uy, col, rim] of [[fx - 6, fy, 0xb5202b, 0xe23b3b], [fx + 6, fy, 0xe23b3b, 0xff8a80]]) {
      g.fillStyle(0x2a2e37, 1);
      g.fillEllipse(ux, uy, 6.6, 9);
      g.fillStyle(col, 1);
      g.fillEllipse(ux, uy, 4.6, 7);
      g.fillStyle(rim, 1);
      g.fillEllipse(ux - 0.4, uy - 0.6, 2.2, 3.6);
    }
  }

  // membros da frente
  const frontFoot = limb(g, 0, hipY, p.legs[0][0], 10, p.legs[0][1], 10, 6, o.pants);
  g.fillStyle(o.shoes, 1);
  g.fillEllipse(frontFoot.x + 2, frontFoot.y, 9, 5);
  const frontHand = limb(g, neck.x, neck.y + 2, p.arms[0][0], 8, p.arms[0][1], 8, 5, o.hoodie);
  sleeveTrim(g, o, neck.x, neck.y + 2, p.arms[0][0], p.arms[0][1]);
  g.fillStyle(o.skin, 1);
  g.fillCircle(frontHand.x, frontHand.y, 2.6);

  // estrelinhas de tontura
  if (p.stars) {
    g.fillStyle(0xffe14d, 1);
    for (let i = 0; i < 3; i++) {
      const a = t * 6 + i * 2.09;
      g.fillCircle(hx + Math.cos(a) * 9, hy - 10 + Math.sin(a) * 3, 2.2);
    }
  }
}

export class KemRenderer {
  constructor(scene, outfit = OUTFIT_DEFAULT) {
    this.g = scene.add.graphics();
    this.container = scene.add.container(0, 0, [this.g]).setDepth(10);
    this.outfit = outfit;
    this.anim = { t: 0, phase: 0 };
    // Tamanho do desenho. No jogo é sempre 1; telas de menu (o mapa) usam
    // um Kem maior pra ele não sumir no cenário.
    this.scale = 1;
  }

  draw(kem, dt) {
    this.anim.t += dt;
    const speed = kem.state === 'wallrun' ? PHYS.WALLRUN_SPEED : Math.abs(kem.vx);
    this.anim.phase += dt * speed * 0.045;
    const p = poseFor(kem, this.anim);
    const r = p.rotation;
    const k = this.scale;
    const cx = p.center ? kem.x + p.center.x * k : kem.x + HALF * k * Math.sin(r);
    const cy = p.center ? kem.y + p.center.y * k : kem.y - HALF * k * Math.cos(r);
    this.container.setPosition(cx, cy).setRotation(r).setScale(kem.facing * k, k);
    drawKem(this.g, p, this.outfit, this.anim.t);
  }
}
