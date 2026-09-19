import { BODY } from '../config.js';
import { parseLevel } from '../world/tilemap.js';
import { parseEntities } from '../world/entities.js';
import { steamRect, STEAM_WARN_MS } from '../world/hazards.js';
import { MOVES, MOVE_UNLOCK_LEVEL } from '../player/moves.js';
import { computeReachability, isReachableTile, isReachableItem } from './reachability.js';

// Movimento que esta fase ensina pela primeira vez (ou null).
export function newMoveAt(number) {
  return MOVES.find((m) => MOVE_UNLOCK_LEVEL[m] === number) ?? null;
}

// Varre o percurso de from até to (em passos de tile, cobrindo a largura `w`
// da plataforma) procurando um bloco sólido na linha logo acima de onde a
// plataforma passa — é ali que o corpo do Kem carregado fica. Serve tanto
// para "o caminho não pode atravessar uma parede no eixo em que carrega o
// Kem" (plataforma horizontal) quanto para "sem teto sólido no caminho"
// (plataforma vertical): as duas regras são o mesmo problema físico, visto
// de eixos diferentes.
function platformPathBlocked(map, p) {
  const dx = p.to.tx - p.from.tx;
  const dy = p.to.ty - p.from.ty;
  const steps = Math.max(Math.abs(dx), Math.abs(dy), 1);
  for (let s = 0; s <= steps; s++) {
    const k = s / steps;
    const tx = Math.round(p.from.tx + dx * k);
    const ty = Math.round(p.from.ty + dy * k);
    for (let w = 0; w < p.w; w++) {
      const cx = tx + w;
      if (map.isSolid(cx, ty - 1) || map.isSolid(cx, ty - 2)) return true;
    }
  }
  return false;
}

// O corpo do Kem parado (pés em y, centrado em x) sobrepõe o jato do vapor?
function steamCoversSpot(s, x, y) {
  const box = { left: x - BODY.W / 2, right: x + BODY.W / 2, top: y - BODY.H, bottom: y };
  const r = steamRect(s);
  return box.left < r.right && box.right > r.left && box.top < r.bottom && box.bottom > r.top;
}

// Confere o que dá para conferir sozinho. Se a fase é possível de terminar,
// isso se confirma jogando.
export function validateLevel(level, number) {
  const problems = [];
  let map;
  let ents;
  try {
    map = parseLevel(level.rows);
  } catch (e) {
    return [`grade: ${e.message}`];
  }
  try {
    ents = parseEntities(level.entities);
  } catch (e) {
    return [`entidades: ${e.message}`];
  }

  if (!(level.targetTime > 0)) problems.push('targetTime precisa ser um número positivo');
  if (ents.stickers.length !== 3) problems.push(`precisa de 3 adesivos, tem ${ents.stickers.length}`);

  const inside = (tx, ty) => tx >= 0 && tx < map.width && ty >= 0 && ty < map.height;
  const free = (label, tx, ty) => {
    if (!inside(tx, ty)) problems.push(`${label} fora do mapa (${tx}, ${ty})`);
    else if (map.isSolid(tx, ty)) problems.push(`${label} dentro de um bloco sólido (${tx}, ${ty})`);
  };
  const standing = (label, tx, ty) => {
    free(label, tx, ty);
    if (inside(tx, ty + 1) && !map.isSolid(tx, ty + 1)) problems.push(`${label} sem chão embaixo (${tx}, ${ty})`);
  };

  ents.checkpoints.forEach((c) => standing(`checkpoint ${c.id}`, c.tx, c.ty));
  standing('bandeira', ents.flag.tx, ents.flag.ty);
  ents.coins.forEach((c) => free(`moeda ${c.id}`, c.tx, c.ty));
  ents.stickers.forEach((s) => free(`adesivo ${s.id}`, s.tx, s.ty));
  ents.steams.forEach((s, i) => free(`vapor ${i + 1}`, s.tx, s.ty));
  ents.fans.forEach((f, i) => free(`ventilador ${i + 1}`, f.tx, f.ty));
  ents.platforms.forEach((p, i) => {
    free(`plataforma ${i + 1} (início)`, p.from.tx, p.from.ty);
    free(`plataforma ${i + 1} (fim)`, p.to.tx, p.to.ty);
  });

  ents.tutorials.forEach((t) => {
    free(`dica '${t.move}'`, t.tx, t.ty);
    const unlock = MOVE_UNLOCK_LEVEL[t.move];
    if (unlock === undefined) problems.push(`dica ensina movimento desconhecido '${t.move}'`);
    else if (unlock > number) problems.push(`dica ensina '${t.move}', que só libera na fase ${unlock}`);
    else if (unlock !== number) problems.push(`dica ensina '${t.move}', que já foi ensinado na fase ${unlock}`);
  });

  const novo = newMoveAt(number);
  if (novo && !ents.tutorials.some((t) => t.move === novo)) {
    problems.push(`a fase ${number} precisa de uma dica para o movimento novo '${novo}'`);
  }

  // Plataformas: o caminho de from até to não pode atravessar uma parede
  // (eixo horizontal) nem ter um teto sólido no caminho (eixo vertical).
  ents.platforms.forEach((p, i) => {
    if (platformPathBlocked(map, p)) {
      problems.push(`plataforma ${i + 1}: o caminho de 'from' até 'to' atravessa um bloco sólido (parede ou teto)`);
    }
  });

  // Vapor sempre alcançando o início ou um checkpoint é um soft-lock: o Kem
  // respawna ali e pode tomar o jato de novo sem chance de escapar. Também
  // reclama se não há tempo de aviso antes do jato ligar.
  ents.steams.forEach((s, i) => {
    if (s.offMs < STEAM_WARN_MS) {
      problems.push(`vapor ${i + 1}: offMs (${s.offMs}ms) é menor que o aviso mínimo de ${STEAM_WARN_MS}ms`);
    }
    if (steamCoversSpot(s, map.spawn.x, map.spawn.y)) {
      problems.push(`vapor ${i + 1} cobre o início da fase (soft-lock)`);
    }
    ents.checkpoints.forEach((c) => {
      if (steamCoversSpot(s, c.x, c.y)) {
        problems.push(`vapor ${i + 1} cobre o checkpoint ${c.id} (soft-lock)`);
      }
    });
  });

  // Alcançabilidade: nada adianta a fase ser bem formada se não dá pra
  // terminar. BFS com física de verdade a partir do início; ver reachability.js.
  const items = [...ents.stickers, ...ents.coins];
  const reach = computeReachability(map, map.spawn, number, items, {
    platforms: ents.platforms,
    fans: ents.fans,
  });
  if (reach.capped) {
    problems.push('verificador de alcançabilidade excedeu o limite de passos simulados (fase grande/complexa demais pra checar)');
  } else {
    if (!isReachableTile(reach, ents.flag.tx, ents.flag.ty)) {
      problems.push('bandeira não é alcançável a partir do início');
    }
    ents.checkpoints.forEach((c) => {
      if (!isReachableTile(reach, c.tx, c.ty)) problems.push(`checkpoint ${c.id} não é alcançável`);
    });
    ents.stickers.forEach((s) => {
      if (!isReachableItem(reach, s.id)) problems.push(`adesivo ${s.id} não é alcançável`);
    });
    ents.coins.forEach((c) => {
      if (!isReachableItem(reach, c.id)) problems.push(`moeda ${c.id} não é alcançável`);
    });
  }

  return problems;
}
