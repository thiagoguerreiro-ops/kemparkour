// Monta uma fase a partir de seções coladas lado a lado. Cada seção descreve
// faixas de linhas [de, até, texto] e entidades com tx relativo ao seu começo.
export function buildLevel({ id, name, height, targetTime, sections }) {
  if (!Array.isArray(sections) || sections.length === 0) throw new Error('Fase sem seções');
  const rows = Array.from({ length: height }, () => '');
  const entities = [];
  let offset = 0;

  sections.forEach((sec, i) => {
    if (!Array.isArray(sec.bands)) throw new Error(`Seção ${i + 1}: falta o campo 'bands'`);
    const secRows = new Array(height).fill(null);
    for (const band of sec.bands) {
      if (
        !Array.isArray(band) || band.length !== 3
        || typeof band[0] !== 'number' || typeof band[1] !== 'number' || typeof band[2] !== 'string'
      ) {
        throw new Error(`Seção ${i + 1}: banda deve ser [número, número, texto]`);
      }
      const [from, to, text] = band;
      for (let r = from; r <= to; r++) {
        if (r < 0 || r >= height) throw new Error(`Seção ${i + 1}: linha ${r} fora da fase`);
        if (secRows[r] !== null) throw new Error(`Seção ${i + 1}: linha ${r} repetida`);
        secRows[r] = text;
      }
    }
    const missing = secRows.indexOf(null);
    if (missing !== -1) throw new Error(`Seção ${i + 1}: falta a linha ${missing}`);
    const width = secRows[0].length;
    if (secRows.some((r) => r.length !== width)) {
      throw new Error(`Seção ${i + 1}: linhas com larguras diferentes`);
    }
    secRows.forEach((r, y) => { rows[y] += r; });
    for (const e of sec.entities ?? []) entities.push(shiftEntity(e, offset));
    offset += width;
  });

  return { id, name, targetTime, rows, entities };
}

function shiftEntity(e, dx) {
  const out = { ...e };
  if (typeof e.tx === 'number') out.tx = e.tx + dx;
  if (e.from) out.from = { tx: e.from.tx + dx, ty: e.from.ty };
  if (e.to) out.to = { tx: e.to.tx + dx, ty: e.to.ty };
  return out;
}
