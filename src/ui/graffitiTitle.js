// O logo do jogo, escrito em letra de grafite: "KEM" amarelo em cima e
// "PARKOUR" branco embaixo, inclinado, com sombra 3D em camadas (vermelho,
// roxo e preto). Escolhido pelo Thiago e pelo Arthur (opção A, trocando o
// rosa por vermelho).
//
// O Phaser não sabe fazer várias sombras num texto só, então cada camada é
// uma cópia do texto deslocada na diagonal, desenhada atrás da de frente.
//
// A fonte (Sedgwick Ave Display, licença OFL em assets/fonts/) é carregada
// pelo index.html. Se a tela abrir antes dela chegar, o texto nasce com a
// fonte reserva e é redesenhado assim que ela fica pronta.

export const TITLE_FONT = 'Sedgwick Ave Display';

const FACE_STROKE = '#1d1d24';
const LAYERS = [
  { dx: 12, dy: 12, color: '#1d1d24' }, // preto, a mais funda
  { dx: 8, dy: 8, color: '#7a5cff' }, // roxo
  { dx: 4, dy: 4, color: '#e23b3b' }, // vermelho
];

const LINES = [
  { text: 'KEM', y: -40, size: 92, color: '#ffd23f' },
  { text: 'PARKOUR', y: 38, size: 64, color: '#ffffff' },
];

export function createGraffitiTitle(scene, x, y, { angle = -6 } = {}) {
  const container = scene.add.container(x, y);
  const texts = [];

  for (const line of LINES) {
    const style = {
      fontFamily: `"${TITLE_FONT}", system-ui, sans-serif`,
      fontSize: `${line.size}px`,
      stroke: FACE_STROKE,
      strokeThickness: 10,
    };
    for (const layer of LAYERS) {
      const t = scene.add.text(layer.dx, line.y + layer.dy, line.text, { ...style, color: layer.color, stroke: layer.color })
        .setOrigin(0.5);
      container.add(t);
      texts.push(t);
    }
    const face = scene.add.text(0, line.y, line.text, { ...style, color: line.color }).setOrigin(0.5);
    container.add(face);
    texts.push(face);
  }

  container.setAngle(angle);

  // Redesenha quando a fonte de grafite terminar de carregar.
  if (typeof document !== 'undefined' && document.fonts) {
    document.fonts.load(`92px "${TITLE_FONT}"`).then(() => {
      if (!container.scene) return; // a cena já foi embora
      for (const t of texts) t.updateText();
    });
  }

  return container;
}
