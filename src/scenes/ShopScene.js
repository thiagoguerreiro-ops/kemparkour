import { VIEW } from '../config.js';
import { CITY } from '../render/palette.js';
import {
  browserStorage, loadSave, writeSave, shopState, availableCoins, buyItem, equipItem,
} from '../save/save.js';
import { TABS, itemsByTab } from '../shop/catalog.js';
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
const CARD_W = 204;
const CARD_H = 280;
const PITCH = 222;
const GRID_Y = 306;
const PORTRAIT_SCALE = 2.1;

const NAME_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '18px', fontStyle: 'bold',
  color: '#ffffff', align: 'center', wordWrap: { width: CARD_W - 28 },
};
const STATUS_STYLE = {
  fontFamily: 'system-ui, sans-serif', fontSize: '22px', fontStyle: 'bold',
};
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

    const bg = this.add.graphics().setDepth(-10);
    bg.fillGradientStyle(CITY.skyTop, CITY.skyTop, CITY.skyBottom, CITY.skyBottom, 1);
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

    this.toast = this.add.text(VIEW.W / 2, 500, '', TOAST_STYLE)
      .setOrigin(0.5).setVisible(false).setDepth(60);

    this._buildGrid();

    this.input.keyboard.on('keydown-LEFT', () => this._moveFocus(-1));
    this.input.keyboard.on('keydown-UP', () => this._moveFocus(-1));
    this.input.keyboard.on('keydown-RIGHT', () => this._moveFocus(1));
    this.input.keyboard.on('keydown-DOWN', () => this._moveFocus(1));
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
    const items = itemsByTab(this.tab);
    const startX = VIEW.W / 2 - ((items.length - 1) * PITCH) / 2;
    this.cards = items.map((item, i) => this._buildCard(item, startX + i * PITCH, GRID_Y));
    this.focus = Math.min(this.focusByTab[this.tab] ?? 0, items.length - 1);
    this._paintFocus();
  }

  _buildCard(item, cx, cy) {
    const container = this.add.container(cx, cy).setDepth(2);

    const ring = this.add.graphics().setVisible(false);
    ring.lineStyle(4, 0x5ecbff, 1);
    ring.strokeRoundedRect(-CARD_W / 2 - 6, -CARD_H / 2 - 6, CARD_W + 12, CARD_H + 12, 22);

    const bg = this.add.graphics();

    const portraitG = this.add.graphics();
    const portrait = this.add.container(0, -45, [portraitG]).setScale(PORTRAIT_SCALE);

    const name = this.add.text(0, 78, item.name, NAME_STYLE).setOrigin(0.5);
    const status = this.add.text(0, 122, '', STATUS_STYLE).setOrigin(0.5);

    container.add([ring, bg, portrait, name, status]);

    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    bg.on('pointerup', () => this._activateItem(item));

    const card = {
      item, cx, cy, container, ring, bg, portraitG, portrait, name, status,
      destroy: () => container.destroy(),
    };
    this._paintCard(card);
    this._drawPortrait(card);
    return card;
  }

  _paintCard(card) {
    const { item, bg } = card;
    const shop = shopState(this.saveData);
    const owned = shop.owned.includes(item.id);
    const equipped = shop.equipped[item.tab] === item.id;
    const affordable = item.price <= availableCoins(this.saveData);

    bg.clear();
    bg.fillStyle(0x000000, 0.25);
    bg.fillRoundedRect(-CARD_W / 2 + 3, -CARD_H / 2 + 6, CARD_W, CARD_H, 18);
    bg.fillStyle(0x1d1d24, equipped ? 1 : 0.88);
    bg.fillRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 18);
    bg.lineStyle(4, equipped ? 0xffd23f : 0xffffff, equipped ? 1 : 0.25);
    bg.strokeRoundedRect(-CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 18);

    let text;
    let color;
    if (equipped) { text = 'EM USO'; color = '#ffd23f'; }
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

  // --- comprar / equipar --------------------------------------------------

  _activateItem(item) {
    if (!item) return;
    const shop = shopState(this.saveData);
    const owned = shop.owned.includes(item.id);
    const equipped = shop.equipped[item.tab] === item.id;
    if (equipped) return;
    const card = this.cards.find((c) => c.item.id === item.id);

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
