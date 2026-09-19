// Dados puros das dancinhas do Kem. Cada dança é uma lista de poses no MESMO
// formato que `kemRenderer.js` usa pra desenhar o Kem numa postura (o que
// `poseFor` devolve): rotation, center, lean, crouch, stars, legs e arms.
// Nenhum Phaser aqui — só dados — pra dar pra testar com `node --test` e pra
// ser fácil acrescentar danças novas (a Loja escolhe uma pelo id).

const BASE = { rotation: 0, center: null, lean: 0, crouch: 0, stars: false };

// A dança original do Kem: um balanço de corpo inteiro, de pé, em loop.
const DANCA_KEM = {
  id: 'danca-kem',
  name: 'Dança do Kem',
  frameMs: 220,
  poses: [
    { ...BASE, lean: -5, crouch: -1, legs: [[0.3, -0.2], [-0.5, 0.1]], arms: [[-2.3, 0.6], [1.0, 0.3]] },
    { ...BASE, lean: -1, crouch: -4, legs: [[0.1, 0], [-0.1, 0]], arms: [[-1.4, 1.4], [1.4, 1.4]] },
    { ...BASE, lean: 5, crouch: -1, legs: [[0.5, -0.1], [-0.3, 0.2]], arms: [[1.0, 0.3], [-2.3, 0.6]] },
    { ...BASE, lean: 1, crouch: -4, legs: [[-0.1, 0], [0.1, 0]], arms: [[1.4, 1.4], [-1.4, 1.4]] },
  ],
};

// Robô: braços dobrados em ângulo reto (nada de curva), passinhos curtos e
// uma batida seca de cabeça a cada passo — tudo travado, feito máquina.
const DANCA_ROBO = {
  id: 'danca-robo',
  name: 'Robô',
  frameMs: 230,
  poses: [
    { ...BASE, lean: 1, crouch: 0, legs: [[0.3, -0.1], [-0.15, 0.05]], arms: [[-1.57, 0], [0.15, 0.2]] },
    { ...BASE, lean: 0, crouch: 3, legs: [[0.05, 0], [-0.05, 0]], arms: [[0.1, 0.1], [-0.1, 0.1]] },
    { ...BASE, lean: -1, crouch: 0, legs: [[-0.15, 0.05], [0.3, -0.1]], arms: [[0.15, 0.2], [1.57, 0]] },
    { ...BASE, lean: 0, crouch: -3, legs: [[0.05, 0], [-0.05, 0]], arms: [[0.1, 0.1], [-0.1, 0.1]] },
    { ...BASE, lean: 0, crouch: -1, legs: [[0.1, 0], [-0.1, 0]], arms: [[1.4, 0], [1.4, 0]] },
    { ...BASE, lean: 0, crouch: 3, legs: [[0.05, 0], [-0.05, 0]], arms: [[0.1, 0.1], [-0.1, 0.1]] },
  ],
};

// Parafuso: o corpo inteiro gira feito um parafuso entrando na madeira, com
// os braços esticados pra cima. É a única dança que usa `rotation`; o
// centro sobe um pouco pra ele girar no meio do corpo, não nos pés.
const DANCA_PARAFUSO = {
  id: 'danca-parafuso',
  name: 'Parafuso',
  frameMs: 105,
  poses: Array.from({ length: 8 }, (_, i) => ({
    ...BASE,
    rotation: (i * Math.PI) / 4,
    center: { x: 0, y: -6 },
    crouch: i % 2 === 0 ? -1 : 1,
    legs: i % 2 === 0 ? [[0.25, -0.2], [-0.25, 0.2]] : [[-0.2, 0.15], [0.2, -0.15]],
    arms: [[Math.PI, 0], [Math.PI, 0]],
  })),
};

export const DANCES = [DANCA_KEM, DANCA_ROBO, DANCA_PARAFUSO];

export function findDance(id) {
  return DANCES.find((d) => d.id === id) ?? DANCES[0];
}
