// Roda a física em passos de tamanho fixo, não importa a taxa de quadros da tela.
export function createFixedStepper(step, maxSteps) {
  let acc = 0;
  return function advance(frameDt, fn) {
    acc = Math.min(acc + frameDt, step * maxSteps);
    let n = 0;
    while (acc >= step - 1e-9) {
      fn(step, n);
      n += 1;
      acc -= step;
    }
    return n;
  };
}
