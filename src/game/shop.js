import { GACHA_COST } from "./constants.js";
import { pick } from "./random.js";

export function currentShopSlot() {
  return Math.floor(Date.now() / (10 * 60 * 1000));
}

export function randomShopCards(cards, rarity, amount, price) {
  const pool = cards.filter(card => card.rarity === rarity).map(card => card.id);
  return Array.from({ length: amount }, () => ({ id: pick(pool), price, sold: false }));
}

export function generateShop(cards) {
  return [
    ...randomShopCards(cards, "Common", 5, 40),
    ...randomShopCards(cards, "Rare", 2, 80),
    ...randomShopCards(cards, "Epic", 1, 200)
  ];
}

export function ensureShop(state, cards) {
  const slot = currentShopSlot();
  if (!state.shop || state.shop.slot !== slot || !Array.isArray(state.shop.items)) {
    state.shop = { slot, items: generateShop(cards) };
    return true;
  }
  return false;
}

export function rollGacha(gachaPool, cardById) {
  const roll = Math.random();
  const rarity = roll < 0.72 ? "Common" : roll < 0.94 ? "Rare" : "Epic";
  return pick(gachaPool.filter(id => cardById[id].rarity === rarity));
}

export function gachaCost(amount) {
  return GACHA_COST * amount;
}
