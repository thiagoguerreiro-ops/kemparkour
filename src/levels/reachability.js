import { TILE, BODY, PHYS } from '../config.js';
import { bodyHitsSolid, bodyBox, moveAndCollide, wallSide } from '../world/collide.js';
import { createPlatform, updatePlatform, carryOnPlatform } from '../world/platforms.js';
import { fanPush } from '../world/hazards.js';
import { Kem } from '../player/kem.js';
import { InputTracker } from '../player/input.js';
import { movesForLevel } from '../player/moves.js';

// Mesmo raio de coleta usado em src/world/collectibles.js (não exportado de lá).
const ITEM_HALF = 12;

// Estados em que o Kem está apoiado (chão de verdade) e portanto "de pé" num
// tile, igual à lista de src/world/platforms.js (GROUNDED_STATES).
const GROUNDED_STATES = new Set(['ground', 'slide', 'roll', 'stunned']);

const ATTEMPT_TIME = 2.5; // segundos por tentativa
const FULL_JUMP_HOLD = 0.35; // cobre o apex do pulo inteiro (~0.327s)
const SHORT_HOP_HOLD = 0.08;
const SETTLE_TIME = 0.15; // parado (no chão, quase sem vx) por esse tempo = tentativa decidida
const SETTLE_VX = 1;

// Limite de passos de física simulados no total, pra nunca travar a suíte
// numa fase gigante ou mal desenhada (loop sem saída de tentativas).
const STEP_CAP = 8_000_000;

// Segundos correndo antes de apertar o pulo (pulo com corrida).
const RUNUP_DELAYS = [0.1, 0.2, 0.35];

// Segundos correndo antes de tocar B (deslizar precisa de velocidade).
const SLIDE_DELAYS = [0.15, 0.3];
// Quanto tempo o botão B fica apertado num toque.
const ACTION_TAP = 0.05;

// Carona de plataforma: pontos do ciclo testados, quanto tempo fica parado
// em cima antes de pular, e quão perto (em tiles) do percurso a posição de
// partida precisa estar para valer a pena tentar.
const RIDE_PHASES = 6;
const RIDE_DELAYS = [0.5, 1.5, 3.0];
const RIDE_EXTRA_TIME = 2.5;
const NEAR_PLATFORM_TILES = 6;

// Cada tentativa: {dir, jumpHold, delay, edge, slideAt}.
// - delay: quanto tempo correndo antes de começar a segurar o pulo;
// - edge: em vez de um tempo fixo, pula no primeiro passo em que o Kem sai
//   do chão sem ter pulado (o pulo "na beirada", pelo coyote time);
// - slideAt: quanto tempo correndo antes de tocar B (deslizar).
const ATTEMPTS = [];
for (const dir of [-1, 0, 1]) {
  for (const jumpHold of [0, SHORT_HOP_HOLD, FULL_JUMP_HOLD]) {
    ATTEMPTS.push({ dir, jumpHold, delay: 0, edge: false });
  }
}
for (const dir of [-1, 1]) {
  for (const delay of RUNUP_DELAYS) {
    ATTEMPTS.push({ dir, jumpHold: FULL_JUMP_HOLD, delay, edge: false });
  }
  for (const jumpHold of [SHORT_HOP_HOLD, FULL_JUMP_HOLD]) {
    ATTEMPTS.push({ dir, jumpHold, delay: 0, edge: true });
  }
  for (const slideAt of SLIDE_DELAYS) {
    ATTEMPTS.push({ dir, jumpHold: 0, delay: 0, edge: false, slideAt });
  }
}

// Segundos depois do início do primeiro pulo (já solto) até apertar de novo,
// pro pulo duplo (recarregado no chão/parede/barra — ver tryDoubleJump). Um
// tapinha curto solta cedo (dá pra apertar de novo logo, o que rende mais
// altura total: o segundo pulo pega o Kem ainda subindo); um pulo cheio
// segurado só solta depois de FULL_JUMP_HOLD, então o segundo toque precisa
// vir depois disso — mas apertar de novo bem na soltada é o que rende mais
// altura no total (medido: ~3.6 tiles com tapinha, ~6 tiles com pulo cheio).
// Cada lista só tem atrasos maiores que o próprio jumpHold (senão o botão
// nunca solta e não haveria uma segunda borda de "apertou"). Só entram no
// plano de tentativas quando a fase já libera 'doublejump' (movesForLevel).
const DOUBLE_JUMP_DELAYS_AFTER_SHORT_HOP = [0.1, 0.2, 0.3];
const DOUBLE_JUMP_DELAYS_AFTER_FULL_HOLD = [0.4, 0.5, 0.65];

// Mesma ideia do ATTEMPTS básico (parado, com corrida, na beirada), mas só
// pra quem tem pulo duplo: testa as duas durações de primeiro pulo (tapinha
// e pulo cheio) com corrida pros lados e alguns atrasos até o segundo toque.
const DOUBLE_JUMP_ATTEMPTS = [];
for (const [jumpHold, secondDelays] of [
  [SHORT_HOP_HOLD, DOUBLE_JUMP_DELAYS_AFTER_SHORT_HOP],
  [FULL_JUMP_HOLD, DOUBLE_JUMP_DELAYS_AFTER_FULL_HOLD],
]) {
  for (const dir of [-1, 0, 1]) {
    const delays = dir === 0 ? [0] : [0, ...RUNUP_DELAYS];
    for (const delay of delays) {
      for (const secondDelay of secondDelays) {
        DOUBLE_JUMP_ATTEMPTS.push({ dir, jumpHold, delay, edge: false, secondDelay });
      }
    }
  }
  for (const dir of [-1, 1]) {
    for (const secondDelay of secondDelays) {
      DOUBLE_JUMP_ATTEMPTS.push({ dir, jumpHold, delay: 0, edge: true, secondDelay });
    }
  }
}

const tileKey = (tx, ty) => `${tx},${ty}`;

// Um tile (tx, ty) é "de pé" se há chão sólido embaixo e o corpo do Kem cabe
// parado ali (mesma régua do spawn/checkpoint/bandeira: pés na base do tile).
export function standableAt(map, tx, ty) {
  if (tx < 0 || tx >= map.width || ty < 0 || ty >= map.height) return false;
  if (!map.isSolid(tx, ty + 1)) return false;
  const box = { x: tx * TILE + TILE / 2, y: (ty + 1) * TILE, w: BODY.W, h: BODY.H };
  return !bodyHitsSolid(box, map);
}

function tileOfFeet(x, y) {
  return { tx: Math.floor(x / TILE), ty: Math.round(y / TILE) - 1 };
}

function overlapsItem(kem, item) {
  const b = bodyBox(kem);
  return b.right > item.x - ITEM_HALF && b.left < item.x + ITEM_HALF
    && b.bottom > item.y - ITEM_HALF && b.top < item.y + ITEM_HALF;
}

function makeKemAt(tx, ty, unlocked) {
  const x = tx * TILE + TILE / 2;
  const y = (ty + 1) * TILE;
  const kem = new Kem({ x, y }, unlocked);
  kem.x = x;
  kem.y = y;
  kem.vx = 0;
  kem.vy = 0;
  kem.setState('ground');
  return kem;
}

// Plataformas do zero, já adiantadas até `phase` segundos do ciclo, e os
// ventiladores. O mapa passa a enxergar essas plataformas (map.platforms).
function makeWorld(map, extras, phase) {
  const platforms = (extras.platforms ?? []).map(createPlatform);
  for (const p of platforms) {
    if (phase > 0) updatePlatform(p, phase);
    p.dx = 0;
    p.dy = 0;
  }
  map.platforms = platforms;
  return { platforms, fans: extras.fans ?? [] };
}

// Um passo igual ao da partida de verdade (src/world/levelRun.js).
function stepWorld(kem, map, world, input) {
  for (const p of world.platforms) updatePlatform(p, PHYS.STEP);
  carryOnPlatform(kem, map);
  kem.update(PHYS.STEP, input, map);
  for (const f of world.fans) {
    const push = fanPush(f, kem);
    if (push === 0) continue;
    const { vx, vy } = kem;
    moveAndCollide(kem, push * PHYS.STEP, 0, map);
    kem.vx = vx;
    kem.vy = vy;
  }
}

// Tentativa básica (a de sempre): correr/pular/deslizar com tempos fixos.
function basicPolicy({ dir, jumpHold, delay, edge, slideAt = null }) {
  let jumpAt = edge ? null : delay;
  return {
    duration: ATTEMPT_TIME,
    input(t) {
      const holding = jumpHold > 0 && jumpAt !== null && t >= jumpAt && t < jumpAt + jumpHold;
      return {
        left: dir < 0,
        right: dir > 0,
        jump: holding,
        action: slideAt !== null && t >= slideAt && t < slideAt + ACTION_TAP,
      };
    },
    after(t, kem) {
      if (edge && jumpAt === null && kem.state === 'air') jumpAt = t + PHYS.STEP;
    },
    gaveUp() { return false; },
  };
}

// Pulo duplo: igual ao básico (correr/pulo na beirada com atraso), mas
// solta o botão e aperta de novo `secondDelay` segundos depois do primeiro
// pulo — a segunda borda de subida é o que recarrega o ar (tryDoubleJump).
// Sem 'doublejump' liberado esse segundo toque simplesmente não faz nada
// (kem.can('doublejump') volta falso), então a tentativa vira um pulo comum.
function doubleJumpPolicy({ dir, jumpHold, delay, edge, secondDelay }) {
  let jumpAt = edge ? null : delay;
  let secondAt = null;
  return {
    duration: ATTEMPT_TIME,
    input(t) {
      const firstHolding = jumpHold > 0 && jumpAt !== null && t >= jumpAt && t < jumpAt + jumpHold;
      const secondHolding = secondAt !== null && t >= secondAt && t < secondAt + jumpHold;
      return {
        left: dir < 0,
        right: dir > 0,
        jump: firstHolding || secondHolding,
        action: false,
      };
    },
    after(t, kem) {
      if (edge && jumpAt === null && kem.state === 'air') jumpAt = t + PHYS.STEP;
      if (jumpAt !== null && secondAt === null && t >= jumpAt + secondDelay) secondAt = t + PHYS.STEP;
    },
    gaveUp() { return false; },
  };
}

// Carona: sobe na plataforma (andando ou pulando), fica parado `rideDelay`
// segundos sendo levado, e depois corre e pula para o lado `dir`.
function ridePolicy({ dir, mount, rideDelay }) {
  let stage = 'mount';
  let rideStart = 0;
  let leaveStart = 0;
  return {
    duration: ATTEMPT_TIME + rideDelay + RIDE_EXTRA_TIME,
    input(t) {
      if (stage === 'mount') {
        return { left: dir < 0, right: dir > 0, jump: mount === 'jump' && t < FULL_JUMP_HOLD, action: false };
      }
      if (stage === 'ride') return { left: false, right: false, jump: false, action: false };
      return { left: dir < 0, right: dir > 0, jump: t - leaveStart < FULL_JUMP_HOLD, action: false };
    },
    after(t, kem) {
      if (stage === 'mount' && kem.platform) {
        stage = 'ride';
        rideStart = t;
      } else if (stage === 'ride' && t - rideStart >= rideDelay) {
        stage = 'leave';
        leaveStart = t + PHYS.STEP;
      }
    },
    // Se nem conseguiu subir na plataforma no tempo normal, desiste.
    gaveUp(t) { return stage === 'mount' && t > ATTEMPT_TIME; },
  };
}

// Chaminé: pula na direção `dir`; toda vez que encosta (no ar) na parede para
// onde está indo, solta e aperta A de novo (wall jump) e inverte o lado.
function chimneyPolicy({ dir }) {
  let d = dir;
  let pressAt = 0;
  return {
    duration: ATTEMPT_TIME * 2,
    input(t) {
      return { left: d < 0, right: d > 0, jump: t >= pressAt && t < pressAt + FULL_JUMP_HOLD, action: false };
    },
    after(t, kem, map) {
      if (kem.state !== 'ground' && t >= pressAt + 0.05 && wallSide(kem, map) === d) {
        d = -d;
        pressAt = t + 2 * PHYS.STEP;
      }
    },
    gaveUp() { return false; },
  };
}

function platformPeriod(def) {
  const p = createPlatform(def);
  return p.speed > 0 && p.length > 0 ? (2 * p.length) / p.speed : 0;
}

function nearAnyPlatform(tx, ty, defs) {
  return defs.some((d) => {
    const x0 = Math.min(d.from.tx, d.to.tx) - NEAR_PLATFORM_TILES;
    const x1 = Math.max(d.from.tx, d.to.tx) + d.w - 1 + NEAR_PLATFORM_TILES;
    const y0 = Math.min(d.from.ty, d.to.ty) - NEAR_PLATFORM_TILES;
    const y1 = Math.max(d.from.ty, d.to.ty) + NEAR_PLATFORM_TILES;
    return tx >= x0 && tx <= x1 && ty >= y0 && ty <= y1;
  });
}

// Explora, a partir do spawn, o conjunto de posições em que o Kem consegue
// ficar de pé de verdade: busca em largura sobre tiles "de pé", usando a
// física real (Kem + LevelRun-style update) como função de aresta. De cada
// posição já alcançada, tenta um pequeno conjunto determinístico de ações —
// correr pra cada lado, sem pular / pulo curto / pulo cheio parado, pulo
// cheio com corrida (segurando o pulo só depois de um tempo de corrida),
// pulo na beirada (aperta o pulo assim que o Kem sai do chão sem ter
// pulado, pelo coyote time) e deslizar com corrida (toca B depois de um
// tempo correndo, pra já estar rápido o bastante) — por até ATTEMPT_TIME
// segundos, e registra todo tile novo onde o Kem pousa parado, além dos
// tiles que ele atravessa andando (pra corredores compridos contarem sem
// precisar terminar exatamente ali). Se há plataformas por perto, também
// tenta caronas (subir, ficar parado sendo levado, pular pro lado) em vários
// pontos do ciclo da plataforma; com o wall jump liberado, também tenta
// chaminés (pula de parede em parede alternando o lado a cada toque, veja
// chimneyPolicy); com o pulo duplo liberado, também tenta soltar o botão e
// apertar de novo no ar depois de alguns atrasos (veja doubleJumpPolicy).
// Sempre que o Kem fica pendurado numa beirada durante uma tentativa, a
// entrada passa a apertar A em toques alternados até ele subir ou soltar —
// isso vale pra qualquer política, não só pra beirada em si. Ventiladores
// empurram o Kem durante todas as tentativas, igual à partida de verdade. De
// quebra, marca que moedas/adesivos um Kem alcançável chega a tocar (parado
// ou no ar). Uma queda alta que termina "tonto" (rolamento perdido ou não
// liberado ainda) não é queda de verdade: 'stunned' está em GROUNDED_STATES,
// então o tile onde o Kem aterrissa já conta como alcançado (o atordoado só
// trava o jogador por um tempo, ele não morre nem volta pro início).
export function computeReachability(map, spawn, number, items = [], extras = {}) {
  const unlocked = movesForLevel(number);
  const start = tileOfFeet(spawn.x, spawn.y);
  const platformDefs = extras.platforms ?? [];
  const maxPeriod = Math.max(0, ...platformDefs.map(platformPeriod));
  const phases = maxPeriod > 0
    ? Array.from({ length: RIDE_PHASES }, (_, k) => (k * maxPeriod) / RIDE_PHASES)
    : [0];

  const standableCache = new Map();
  const isStandable = (tx, ty) => {
    const key = tileKey(tx, ty);
    if (standableCache.has(key)) return standableCache.get(key);
    const v = standableAt(map, tx, ty);
    standableCache.set(key, v);
    return v;
  };

  const visited = new Set();
  const reachedItems = new Set();
  let stepsUsed = 0;
  let capped = false;

  const markItems = (kem) => {
    for (const item of items) {
      if (!reachedItems.has(item.id) && overlapsItem(kem, item)) reachedItems.add(item.id);
    }
  };

  if (!isStandable(start.tx, start.ty)) {
    return { standable: visited, items: reachedItems, capped: false };
  }
  visited.add(tileKey(start.tx, start.ty));
  const queue = [start];

  outer:
  while (queue.length > 0) {
    const pos = queue.shift();

    // Tentativas desta posição: as básicas (com o mundo no instante 0) e, se
    // houver plataforma por perto, as caronas em vários pontos do ciclo.
    const plans = ATTEMPTS.map((a) => ({ phase: 0, policy: () => basicPolicy(a) }));
    if (platformDefs.length > 0 && nearAnyPlatform(pos.tx, pos.ty, platformDefs)) {
      for (const phase of phases) {
        for (const dir of [-1, 1]) {
          for (const mount of ['walk', 'jump']) {
            for (const rideDelay of RIDE_DELAYS) {
              plans.push({ phase, policy: () => ridePolicy({ dir, mount, rideDelay }) });
            }
          }
        }
      }
    }
    if (unlocked.includes('walljump')) {
      for (const dir of [-1, 1]) plans.push({ phase: 0, policy: () => chimneyPolicy({ dir }) });
    }
    if (unlocked.includes('doublejump')) {
      for (const a of DOUBLE_JUMP_ATTEMPTS) plans.push({ phase: 0, policy: () => doubleJumpPolicy(a) });
    }

    for (const plan of plans) {
      const world = makeWorld(map, extras, plan.phase);
      const policy = plan.policy();
      const kem = makeKemAt(pos.tx, pos.ty, unlocked);
      markItems(kem);

      const tracker = new InputTracker();
      const steps = Math.round(policy.duration / PHYS.STEP);
      let settledFor = 0;

      for (let i = 0; i < steps; i++) {
        const t = i * PHYS.STEP;
        let held = policy.input(t);
        // Pendurado na beirada: aperta A (toques alternados) para subir.
        if (kem.state === 'ledge') held = { left: false, right: false, jump: i % 2 === 0, action: false };
        stepWorld(kem, map, world, tracker.sample(held));
        stepsUsed += 1;
        if (stepsUsed > STEP_CAP) { capped = true; break outer; }
        policy.after(t, kem, map);
        if (policy.gaveUp(t)) break;

        markItems(kem);

        if (GROUNDED_STATES.has(kem.state)) {
          const here = tileOfFeet(kem.x, kem.y);
          const key = tileKey(here.tx, here.ty);
          if (!visited.has(key) && isStandable(here.tx, here.ty)) {
            visited.add(key);
            queue.push(here);
          }
          // Parado em cima de uma plataforma não é "decidido": ela ainda leva o Kem.
          if (!kem.platform) {
            settledFor += PHYS.STEP;
            if (settledFor >= SETTLE_TIME && Math.abs(kem.vx) < SETTLE_VX) break;
          }
        } else {
          settledFor = 0;
        }
      }
    }
  }

  map.platforms = [];
  return { standable: visited, items: reachedItems, capped };
}

export function isReachableTile(reach, tx, ty) {
  return reach.standable.has(tileKey(tx, ty));
}

export function isReachableItem(reach, id) {
  return reach.items.has(id);
}
