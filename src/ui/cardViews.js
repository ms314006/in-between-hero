import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { countCards, sortedCountKeys } from "../game/deck.js";
import { CardDisplay } from "./CardDisplay.jsx";
import { CompactCardDisplay } from "./CompactCardDisplay.jsx";
import { ShopCardDisplay } from "./ShopCardDisplay.jsx";

export function renderCard(id, cardById, options = {}) {
  const card = cardById[id];
  const button = options.buttonLabel ? `<button class="nes-btn" ${options.disabled ? "disabled" : ""}>${options.buttonLabel}</button>` : "";
  return `
    <div class="card nes-container is-dark ${card.rarity}">
      <header><strong>${card.name}</strong><span class="rarity ${card.rarity}">${card.rarity}</span></header>
      <p>Cost ${card.cost}｜${card.desc}</p>
      ${options.count ? `<p>持有：${options.count}</p>` : ""}
      ${button}
    </div>
  `;
}

export function renderCollectionCard(id, count, cardById) {
  const card = cardById[id];
  return renderToStaticMarkup(createElement(CompactCardDisplay, { id, card, count }));
}

export function renderFullCollectionCard(id, count, cardById) {
  const card = cardById[id];
  return renderToStaticMarkup(createElement(CardDisplay, { id, card, count }));
}

export function renderShopCard(item, index, cardById) {
  const card = cardById[item.id];
  return renderToStaticMarkup(createElement(ShopCardDisplay, { id: item.id, card, item, index }));
}

export function renderCardSummary(ids, cardById, rarityOrder, emptyText = "無") {
  const counts = countCards(ids);
  const sortedIds = sortedCountKeys(counts, cardById, rarityOrder);
  if (!sortedIds.length) return emptyText;
  return `<div class="deck-summary-list">${sortedIds.map(id => `
    <div class="deck-summary-item nes-container is-dark ${cardById[id].rarity}">
      <strong>${cardById[id].name}</strong>
      <span class="deck-summary-count">x${counts[id]}</span>
    </div>
  `).join("")}</div>`;
}
