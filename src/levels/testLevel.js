// Fase de treino da Etapa 1: uma seção para cada movimento.
// Cada seção lista faixas de linhas [de, até, texto]; todas as 20 linhas precisam aparecer.
const H = 20;

function section(name, bands) {
  const rows = new Array(H).fill(null);
  for (const [from, to, text] of bands) {
    for (let r = from; r <= to; r++) {
      if (rows[r] !== null) throw new Error(`${name}: linha ${r} repetida`);
      rows[r] = text;
    }
  }
  const missing = rows.indexOf(null);
  if (missing !== -1) throw new Error(`${name}: falta a linha ${missing}`);
  const width = rows[0].length;
  if (rows.some((r) => r.length !== width)) throw new Error(`${name}: linhas com larguras diferentes`);
  return { name, rows, width };
}

function joinSections(sections) {
  const rows = Array.from({ length: H }, (_, r) => sections.map((s) => s.rows[r]).join(''));
  const labels = [];
  let tx = 0;
  for (const s of sections) {
    labels.push({ text: s.name, tx });
    tx += s.width;
  }
  return { rows, labels };
}

const FLOOR20 = '####################';

export const TEST_LEVEL = joinSections([
  section('1. PULO: toque A / Espaço (segure para ir mais alto)', [
    [0, 11, '....................'],
    [12, 12, '..............##....'],
    [13, 13, '..........##..##....'],
    [14, 14, '.S....#...##..##....'],
    [15, 19, FLOOR20],
  ]),
  section('2. DESLIZAR: correndo, toque B / Shift', [
    [0, 13, '......########......'],
    [14, 14, '....................'],
    [15, 19, FLOOR20],
  ]),
  section('3. AGARRAR BEIRADA: automático. A sobe, B solta', [
    [0, 10, '....................'],
    [11, 14, '........########....'],
    [15, 19, FLOOR20],
  ]),
  section('4. WALL JUMP: no ar, encostado na parede, toque A', [
    [0, 2, '................'],
    [3, 11, '....#....#######'],
    [12, 14, '.........#######'],
    [15, 19, '################'],
  ]),
  section('5. ROLAMENTO: toque B logo antes de chegar no chão', [
    [0, 2, '................'],
    [3, 14, '####............'],
    [15, 19, '################'],
  ]),
  section('6. PULO DUPLO: toque A de novo no ar', [
    [0, 14, '....................'],
    [15, 17, '######.........#####'],
    [18, 19, FLOOR20],
  ]),
  section('7. BARRAS: ◀ ▶ balançam, A solta', [
    [0, 9, '....................'],
    [10, 10, '........=...=.......'],
    [11, 14, '....................'],
    [15, 17, '######..........####'],
    [18, 19, FLOOR20],
  ]),
  section('8. CORRER NA PAREDE: pule no muro colorido segurando ▶', [
    [0, 9, '........................'],
    [10, 14, '.......WWWWWWWWWWW......'],
    [15, 17, '######............######'],
    [18, 19, '########################'],
  ]),
  section('FIM! Aperte R para treinar de novo', [
    [0, 14, '............'],
    [15, 19, '############'],
  ]),
]);
