import { VIEW } from '../config.js';
import { themeForSave } from '../render/themes.js';
import {
  browserStorage, loadSave, writeSave, shopState, availableCoins, buyItem, equipItem, isItemUnlocked,
} from '../save/save.js';
import { LEVELS } from '../levels/levels.js';
import { TABS, visibleItemsByTab } from '../shop/catalog.js';
import { DANCES } from '../render/dances.js';
import { drawKem, poseFor } from '../render/kemRenderer.js';
import { outfitFor, outfitForRoupa, outfitForAcessorio } from '../render/outfits.js';
import { TITLE_FONT } from '../ui/graffitiTitle.js';
import { addBackButton } from '../ui/backButton.js';

// A loja (Etapa 3, Bloco 3): três abas (roupas, acessórios, dancinhas), um
// retrato do Kem usando cada item, e comprar/equipar tocando ou pelo
// teclado. Os dados vêm prontos de `src/shop/catalog.js` e `src/save/save.js`
// (pure): esta cena só desenha e escreve o save depois de cada ação.

const TAB_LABEL = { roupa: 'ROUPAS', acessorio: 'ACESSÓRIOS', danca: 'DANCINHAS' };

// Duas disposições de cartões. Com até 4 itens na aba (Dancinhas) fica uma
// fileira de cartões grandes, como sempre foi. Com mais itens (Roupas: 6,
// Acessórios: 7) viram duas fileiras de cartões menores (216x180, bem acima
// dos 60px de toque mesmo no iPhone), com o retrato do Kem um pouco menor.
const BIG = {
  rows: 1, cardW: 204, cardH: 280, pitchX: 222, pitchY: 0, y0: 306,
  portraitY: -45, portraitScale: 2.1, nameY: 78, statusY: 122, nameSize: 18, statusSize: 22,
};
const COMPACT = {
  rows: 2, cardW: 216, cardH: 180, pitchX: 228, pitchY: 192, y0: 218,
  portraitY: -30, portraitScale: 1.8, nameY: 36, statusY: 68, nameSize: 17, statusSize: 20,
};
const MAX_BIG = 4;

const nameStyle = (L) => ({
  fontFamily: 'system-ui, sans-serif', fontSize: `${L.nameSize}px`, fontStyle: 'bold',
  color: '#ffffff', align: 'center', wordWrap: { width: L.cardW - 24 },
});
const statusStyle = (L) => ({
  fontFamily: 'system-ui, sans-serif', fontSize: `${L.statusSize}px`, fontStyle: 'bold',
  align: 'center', wordWrap: { width: L.cardW - 20 },
});
const LOCK_COLOR = '#ffb84d';
const TAB_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
};
const COIN_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '30px', fontStyle: 'bold', color: '#ffd23f',
};
const TOAST_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '24px', fontStyle: 'bold',
  color: '#ffffff', backgroundColor: '#c0392b', padding: { x: 18, y: 10 },
};

// Postura parada, de pé — a mesma que o Kem fica no chão sem andar
// (`poseFor` com `t: 0` dá o quadro central da respiração).
function idlePose(t = 0) {
  return poseFor({ facing: 1, state: 'ground', vx: 0 }, { t, phase: 0 });
}

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('Shop');
  }

  create() {
    this.storage = browserStorage();
    this.saveData = loadSave(this.storage);
    this.tab = 'roupa';
    this.focusByTab = { roupa: 0, acessorio: 0, danca: 0 };
    this.animT = 0;
    this.toastTimer = null;

    const theme = themeForSave(this.saveData, LEVELS);
    const bg = this.add.graphics().setDepth(-10);
    bg.fillGradientStyle(theme.skyTop, theme.skyTop, theme.skyBottom, theme.skyBottom, 1);
    bg.fillRect(0, 0, VIEW.W, VIEW.H);

    addBackButton(this, 'Title');

    this.add.text(VIEW.W / 2, 34, 'LOJA', {
      fontFamily: `"${TITLE_FONT}", system-ui, sans-serif`, fontSize: '46px',
      color: '#ffd23f', stroke: '#1d1d24', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(10).setAngle(-3).setShadow(4, 4, '#e23b3b', 0, true, true);

    const coinPlaque = this.add.graphics().setDepth(9);
    coinPlaque.fillStyle(0x1d1d24, 0.75);
    coinPlaque.fillRoundedRect(16, 10, 190, 44, 14);
    this.coinText = this.add.text(38, 32, `🪙 ${availableCoins(this.saveData)}`, COIN_STYLE)
      .setOrigin(0, 0.5).setDepth(10);

    this.tabButtons = TABS.map((tab, i) => this._buildTabButton(tab, 200 + i * 280, 88));
    this._paintTabs();

    this.toast = this.add.text(VIEW.W / 2, 512, '', TOAST_STYLE)
      .setOrigin(0.5).setVisible(false).setDepth(60);

    this._buildGrid();

    this.input.keyboard.on('keydown-LEFT', () => this._moveFocus(-1));
    this.input.keyboard.on('keydown-UP', () => this._moveFocusRow(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this._moveFocus(1));
    this.input.keyboard.on('keydown-DOWN', () => this._moveFocusRow(1));
    const act = () => this._activateItem(this.cards[this.focus]?.item);
    this.input.keyboard.on('keydown-SPACE', act);
    this.input.keyboard.on('keydown-ENTER', act);
    this.input.keyboard.on('keydown-Q', () => this._switchTab(-1));
    this.input.keyboard.on('keydown-E', () => this._switchTab(1));
    this.input.keyboard.on('keydown-TAB', (e) => { e?.preventDefault?.(); this._switchTab(1); });
  }

  update(time, deltaMs) {
    this.animT += deltaMs / 1000;
    if (this.cards) for (const card of this.cards) this._drawPortrait(card);
  }

  // --- abas ---------------------------------------------------------

  _buildTabButton(tab, x, y) {
    const w = 260;
    const h = 56;
    const g = this.add.graphics().setDepth(8);
    const text = this.add.text(x, y, TAB_LABEL[tab], TAB_STYLE).setOrigin(0.5).setDepth(9);
    g.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(x - w / 2, y - h / 2, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    g.on('pointerup', () => this._setTab(tab));
    return { tab, x, y, w, h, g, text };
  }

  _paintTabs() {
    for (const b of this.tabButtons) {
      const active = b.tab === this.tab;
      b.g.clear();
      b.g.fillStyle(active ? 0xe0a300 : 0x1d1d24, active ? 1 : 0.82);
      b.g.fillRoundedRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 16);
      b.g.lineStyle(3, 0xffffff, active ? 0.9 : 0.3);
      b.g.strokeRoundedRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h, 16);
    }
  }

  _setTab(tab) {
    if (tab === this.tab) return;
    this.tab = tab;
    this._paintTabs();
    this._buildGrid();
  }

  _switchTab(delta) {
    const i = TABS.indexOf(this.tab);
    this._setTab(TABS[(i + delta + TABS.length) % TABS.length]);
  }

  // --- grade de itens -------------------------------------------------

  _buildGrid() {
    if (this.cards) for (const c of this.cards) c.destroy();
    // Itens secretos (a Dança do Campeão) só aparecem depois de ganhos.
    const items = visibleItemsByTab(this.tab, shopState(this.saveData).owned);
    const L = items.length <= MAX_BIG ? BIG : COMPACT;
    this.cols = L.rows === 1 ? Math.max(1, items.length) : Math.ceil(items.length / L.rows);
    this.cards = items.map((item, i) => {
      const row = Math.floor(i / this.cols);
      const inRow = Math.min(this.cols, items.length - row * this.cols);
      const startX = VIEW.W / 2 - ((inRow - 1) * L.pitchX) / 2;
      return this._buildCard(item, startX + (i - row * this.cols) * L.pitchX, L.y0 + row * L.pitchY, L);
    });
    this.focus = Math.min(this.focusByTab[this.tab] ?? 0, items.length - 1);
    this._paintFocus();
  }

  _buildCard(item, cx, cy, L) {
    const container = this.add.container(cx, cy).setDepth(2);

    const ring = this.add.graphics().setVisible(false);
    ring.lineStyle(4, 0x5ecbff, 1);
    ring.strokeRoundedRect(-L.cardW / 2 - 6, -L.cardH / 2 - 6, L.cardW + 12, L.cardH + 12, 22);

    const bg = this.add.graphics();

    const portraitG = this.add.graphics();
    const portrait = this.add.container(0, L.portraitY, [portraitG]).setScale(L.portraitScale);

    const name = this.add.text(0, L.nameY, item.name, nameStyle(L)).setOrigin(0.5);
    const status = this.add.text(0, L.statusY, '', statusStyle(L)).setOrigin(0.5);

    // Cadeado (só aparece enquanto o item está trancado), no alto do cartão.
    const lock = this.add.graphics().setVisible(false);
    this._drawPadlock(lock, 0, 0);
    lock.setPosition(L.cardW / 2 - 32, -L.cardH / 2 + 34).setScale(1.3);

    container.add([ring, bg, portrait, lock, name, status]);

    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-L.cardW / 2, -L.cardH / 2, L.cardW, L.cardH),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    bg.on('pointerup', () => this._activateItem(item));

    const card = {
      item, L, cx, cy, container, ring, bg, portraitG, portrait, name, status, lock,
      destroy: () => container.destroy(),
    };
    this._paintCard(card);
    this._drawPortrait(card);
    return card;
  }

  // Cadeado desenhado (sem emoji): corpo dourado, argola de aço, buraquinho.
  _drawPadlock(g, x, y) {
    g.lineStyle(4, 0xc9d0d8, 1);
    g.beginPath();
    g.arc(x, y - 7, 7, Math.PI, 0, false);
    g.strokePath();
    g.fillStyle(0xffb84d, 1);
    g.fillRoundedRect(x - 11, y - 6, 22, 18, 4);
    g.lineStyle(2, 0x7a4b00, 1);
    g.strokeRoundedRect(x - 11, y - 6, 22, 18, 4);
    g.fillStyle(0x3a2500, 1);
    g.fillCircle(x, y + 2.5, 2.6);
    g.fillRect(x - 1, y + 3, 2, 5);
  }

  _paintCard(card) {
    const { item, bg, L } = card;
    const shop = shopState(this.saveData);
    const owned = shop.owned.includes(item.id);
    const equipped = shop.equipped[item.tab] === item.id;
    const affordable = item.price <= availableCoins(this.saveData);
    const locked = !owned && !isItemUnlocked(this.saveData, item);

    bg.clear();
    bg.fillStyle(0x000000, 0.25);
    bg.fillRoundedRect(-L.cardW / 2 + 3, -L.cardH / 2 + 6, L.cardW, L.cardH, 18);
    bg.fillStyle(0x1d1d24, equipped ? 1 : locked ? 0.7 : 0.88);
    bg.fillRoundedRect(-L.cardW / 2, -L.cardH / 2, L.cardW, L.cardH, 18);
    if (locked) bg.lineStyle(4, 0xffb84d, 0.45);
    else bg.lineStyle(4, equipped ? 0xffd23f : 0xffffff, equipped ? 1 : 0.25);
    bg.strokeRoundedRect(-L.cardW / 2, -L.cardH / 2, L.cardW, L.cardH, 18);

    // Trancado: o Kem aparece apagadinho (a criança vê o que está buscando).
    card.lock.setVisible(locked);
    card.portrait.setAlpha(locked ? 0.5 : 1);
    card.name.setAlpha(locked ? 0.75 : 1);

    let text;
    let color;
    if (locked) { text = item.unlock.hint; color = LOCK_COLOR; }
    else if (equipped) { text = 'EM USO'; color = '#ffd23f'; }
    else if (owned && item.secret) { text = '🏆 Prêmio!'; color = '#8be08b'; }
    else if (owned) { text = '✓ Comprado'; color = '#8be08b'; }
    else { text = `🪙 ${item.price}`; color = affordable ? '#ffffff' : '#8a939e'; }
    card.status.setText(text).setColor(color);
  }

  // O retrato: a roupa/acessório isolados (pra comparar itens da mesma aba),
  // ou a dança — animada quadro a quadro quando ela já existe em dados
  // (Bloco 4 acrescenta robô e parafuso; até lá caem na postura parada).
  _drawPortrait(card) {
    const { item, portraitG } = card;
    let outfit;
    let pose;
    if (item.tab === 'roupa') {
      outfit = outfitForRoupa(item.id);
      pose = idlePose(this.animT);
    } else if (item.tab === 'acessorio') {
      outfit = outfitForAcessorio(item.id);
      pose = idlePose(this.animT);
    } else {
      outfit = outfitFor(shopState(this.saveData));
      const dance = DANCES.find((d) => d.id === item.id);
      if (dance) {
        const idx = Math.floor((this.animT * 1000) / dance.frameMs) % dance.poses.length;
        pose = dance.poses[idx];
      } else {
        pose = idlePose(this.animT);
      }
    }
    drawKem(portraitG, pose, outfit, this.animT);
  }

  // --- foco de teclado --------------------------------------------------

  _paintFocus() {
    this.cards.forEach((c, i) => c.ring.setVisible(i === this.focus));
  }

  _moveFocus(delta) {
    if (!this.cards.length) return;
    this.focus = Math.max(0, Math.min(this.cards.length - 1, this.focus + delta));
    this.focusByTab[this.tab] = this.focus;
    this._paintFocus();
  }

  // Cima/baixo: com uma fileira só anda um cartão (como sempre); com duas
  // fileiras pula uma fileira — e no fim de uma fileira mais curta cai no último.
  _moveFocusRow(dir) {
    if (!this.cards.length) return;
    if (this.cols >= this.cards.length) { this._moveFocus(dir); return; }
    const last = this.cards.length - 1;
    let target = this.focus + dir * this.cols;
    if (target > last && Math.floor(this.focus / this.cols) < Math.floor(last / this.cols)) target = last;
    if (target < 0 || target > last) return;
    this._moveFocus(target - this.focus);
  }

  // --- comprar / equipar --------------------------------------------------

  _activateItem(item) {
    if (!item) return;
    const shop = shopState(this.saveData);
    const owned = shop.owned.includes(item.id);
    const equipped = shop.equipped[item.tab] === item.id;
    if (equipped) return;
    const card = this.cards.find((c) => c.item.id === item.id);

    // Trancado: só um tremidinho e a dica de onde chegar.
    if (!owned && !isItemUnlocked(this.saveData, item)) {
      this._shake(card);
      this._toast(item.unlock.hint);
      return;
    }

    if (owned) {
      const { data, result } = equipItem(this.saveData, item.id);
      if (result.ok) this._applySave(data, card);
      return;
    }

    const coins = availableCoins(this.saveData);
    if (item.price > coins) {
      this._shake(card);
      const missing = item.price - coins;
      this._toast(`Faltam ${missing} ${missing === 1 ? 'moeda' : 'moedas'}`);
      return;
    }

    const { data, result } = buyItem(this.saveData, item.id);
    if (result.ok) this._applySave(data, card);
  }

  _applySave(data, card) {
    const before = availableCoins(this.saveData);
    this.saveData = data;
    writeSave(this.storage, this.saveData);
    const after = availableCoins(this.saveData);
    this.tweens.addCounter({
      from: before, to: after, duration: 400, ease: 'Cubic.easeOut',
      onUpdate: (tw) => this.coinText.setText(`🪙 ${Math.round(tw.getValue())}`),
    });
    for (const c of this.cards) this._paintCard(c);
    if (card) this._pop(card);
  }

  _pop(card) {
    this.tweens.add({
      targets: card.container, scale: 1.08, duration: 90, yoyo: true, ease: 'Sine.easeOut',
    });
  }

  _shake(card) {
    if (!card || card.shaking) return;
    card.shaking = true;
    const baseX = card.container.x;
    this.tweens.add({
      targets: card.container, x: baseX + 8, duration: 55, yoyo: true, repeat: 5,
      ease: 'Sine.easeInOut',
      onComplete: () => { card.container.x = baseX; card.shaking = false; },
    });
  }

  _toast(message) {
    this.toast.setText(message).setVisible(true);
    if (this.toastTimer) this.toastTimer.remove(false);
    this.toastTimer = this.time.delayedCall(1500, () => this.toast.setVisible(false));
  }
}
