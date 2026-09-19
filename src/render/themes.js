// Os três bairros do jogo, como dados puros: cores do céu e dos prédios,
// e alguns sinalizadores que dizem ao desenho (`tileRenderer.js`,
// `cityBackdrop.js`) que enfeite colocar no fundo de cada um.
//
// Sem Phaser aqui — só dados e funções puras — para dar pra testar com
// `node --test` e pra fase, mapa, tela inicial e loja usarem exatamente as
// mesmas cores.
//
// Fases 1-10 são o Bairro do Kem (manhã), 11-20 são o Centro (fim de tarde),
// 21-30 são a Cidade à noite. `bairro` é IGUAL ao `CITY` de hoje — nenhum
// pixel da Fase 1 muda.

import { levelProgress } from '../save/save.js';

export const NEIGHBORHOOD_IDS = ['bairro', 'centro', 'noite'];
export const LEVELS_PER_NEIGHBORHOOD = 10;

export const NEIGHBORHOOD_TITLES = {
  bairro: 'BAIRRO DO KEM',
  centro: 'CENTRO',
  noite: 'CIDADE À NOITE',
};

export const THEMES = {
  // O Bairro do Kem de hoje: manhã, céu azul, casas e muros baixos.
  bairro: {
    id: 'bairro',
    skyTop: 0x6cc4ff,
    skyBottom: 0xd6f0ff,
    far: 0xb3d8ef,
    building: 0xf2a65a,
    buildingShade: 0xd98b43,
    roof: 0xffd08a,
    window: 0xfff3d6,
    bar: 0x8a939e,
    barCap: 0x5e6670,
    runwallA: 0xff5fa2,
    runwallB: 0x7a5cff,
    sun: true,
    stars: false,
    farKind: 'houses',
    signColors: [],
    skylineBack: 0xbcd9ee,
    skylineFront: 0x93b8d2,
  },
  // O Centro: fim de tarde, céu laranja/rosa, prédios altos em obra.
  centro: {
    id: 'centro',
    skyTop: 0xff8a56,
    skyBottom: 0xffd9a0,
    far: 0xd9825f,
    building: 0xe0703f,
    buildingShade: 0xa84f2a,
    roof: 0xffb877,
    window: 0xfff0c2,
    bar: 0x8a939e,
    barCap: 0x5e6670,
    runwallA: 0xff8a3d,
    runwallB: 0xffce54,
    sun: true,
    stars: false,
    farKind: 'construction',
    signColors: [],
    skylineBack: 0xe8b48f,
    skylineFront: 0xd48f63,
  },
  // Cidade à noite: céu roxo com estrelas, arranha-céus com janelas acesas,
  // letreiros coloridos e antenas piscando.
  noite: {
    id: 'noite',
    skyTop: 0x1a1140,
    skyBottom: 0x3d2a66,
    far: 0x2c2154,
    building: 0x352a52,
    buildingShade: 0x1f1836,
    roof: 0x4a3b70,
    window: 0xffe27a,
    bar: 0x9aa0ff,
    barCap: 0x6a68c4,
    runwallA: 0x5ecbff,
    runwallB: 0xff5fa2,
    sun: false,
    stars: true,
    farKind: 'skyscrapers',
    signColors: [0xff5fa2, 0x5ecbff, 0x7ed321, 0xffd23f],
    skylineBack: 0x4a3b70,
    skylineFront: 0x241c3f,
  },
};

// O bairro pelo índice do bairro (0 = Bairro do Kem, 1 = Centro, 2 = Cidade
// à noite). Índices fora da faixa ficam presos na ponta mais perto — nunca
// devolve um tema inexistente.
export function themeForBairro(index) {
  const clamped = Math.max(0, Math.min(NEIGHBORHOOD_IDS.length - 1, Math.floor(index)));
  return THEMES[NEIGHBORHOOD_IDS[clamped]];
}

// O tema de uma fase, pelo número dela (1-10 Bairro do Kem, 11-20 Centro,
// 21-30 Cidade à noite, e por diante caso o jogo cresça mais).
export function themeForLevel(number) {
  const bairroIndex = Math.floor((Math.max(1, number) - 1) / LEVELS_PER_NEIGHBORHOOD);
  return themeForBairro(bairroIndex);
}

// O bairro mais longe que o jogador já alcançou, para a tela inicial mostrar
// o cenário certo: o bairro da próxima fase a jogar (a última concluída,
// mais uma), ou o último bairro se já terminou tudo que existe hoje.
export function themeForSave(save, levels) {
  if (!levels?.length) return THEMES.bairro;
  const i = levels.findIndex((lv) => !levelProgress(save, lv.id).complete);
  const number = i === -1 ? levels.length : i + 1;
  return themeForLevel(number);
}
