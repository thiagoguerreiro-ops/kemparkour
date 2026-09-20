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

// Dança do Campeão: a dancinha secreta da grande final (Fase 30). Braços pro
// alto, soquinhos no ar, um agachadinho, um pulo com giro completo (o
// `rotation` vai de 0 a 2π em três quadros) e a pose de vitória no fim.
// Só aparece na tela de fim da Fase 30 — a loja só lista depois de ganha.
const DANCA_CAMPEAO = {
  id: 'danca-campeao',
  name: 'Dança do Campeão',
  frameMs: 180,
  poses: [
    // braços em V, pernas abertas
    { ...BASE, lean: 0, crouch: -1, legs: [[0.3, -0.1], [-0.3, 0.1]], arms: [[2.7, 0.2], [-2.7, -0.2]] },
    // soquinho pra cima com o braço da frente
    { ...BASE, lean: 3, crouch: 2, legs: [[0.3, -0.5], [-0.25, 0.2]], arms: [[Math.PI, 0], [0.7, 1.6]] },
    // braços em V de novo
    { ...BASE, lean: 0, crouch: -1, legs: [[-0.3, 0.1], [0.3, -0.1]], arms: [[2.7, 0.2], [-2.7, -0.2]] },
    // soquinho pra cima com o outro braço
    { ...BASE, lean: -3, crouch: 2, legs: [[0.25, -0.2], [-0.3, -0.5]], arms: [[0.7, 1.6], [Math.PI, 0]] },
    // agacha pra pular, braços pra trás
    { ...BASE, lean: 2, crouch: 6, legs: [[0.7, -1.1], [-0.4, -0.9]], arms: [[-0.7, 0.2], [-0.9, 0.2]] },
    // pulo: sobe com os braços pro alto
    { ...BASE, center: { x: 0, y: -16 }, lean: 0, crouch: -2, legs: [[0.9, -1.5], [-0.3, -0.6]], arms: [[Math.PI, 0], [Math.PI, 0]] },
    // giro no ar (1/3 e 2/3 da volta)
    { ...BASE, rotation: (2 * Math.PI) / 3, center: { x: 0, y: -18 }, crouch: -1, legs: [[0.5, -1.2], [-0.2, -0.8]], arms: [[Math.PI, 0], [Math.PI, 0]] },
    { ...BASE, rotation: (4 * Math.PI) / 3, center: { x: 0, y: -14 }, crouch: -1, legs: [[0.5, -1.2], [-0.2, -0.8]], arms: [[Math.PI, 0], [Math.PI, 0]] },
    // aterrissa agachado
    { ...BASE, lean: 1, crouch: 5, legs: [[0.6, -1.0], [-0.4, -0.8]], arms: [[1.2, 1.0], [-1.2, 1.0]] },
    // pose de campeão: braços bem abertos pro alto
    { ...BASE, lean: 2, crouch: -2, legs: [[0.3, 0], [-0.3, 0]], arms: [[2.5, 0.5], [-2.5, -0.5]] },
  ],
};

export const DANCES = [DANCA_KEM, DANCA_ROBO, DANCA_PARAFUSO, DANCA_CAMPEAO];

export function findDance(id) {
  return DANCES.find((d) => d.id === id) ?? DANCES[0];
}
