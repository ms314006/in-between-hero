import { countCards, sortedCountKeys } from "../game/deck.js";

export function renderCard(id, cardById, options = {}) {
  const card = cardById[id];
  const button = options.buttonLabel ? `<button ${options.disabled ? "disabled" : ""}>${options.buttonLabel}</button>` : "";
  return `
    <div class="card ${card.rarity}">
      <header><strong>${card.name}</strong><span class="rarity ${card.rarity}">${card.rarity}</span></header>
      <p>Cost ${card.cost}｜${card.desc}</p>
      ${options.count ? `<p>持有：${options.count}</p>` : ""}
      ${button}
    </div>
  `;
}

export function renderCollectionCard(id, count, cardById) {
  const card = cardById[id];
  return `
    <div class="collection-card ${card.rarity}" data-card-id="${id}">
      <header><strong>${card.name}</strong><span class="rarity ${card.rarity}">${card.rarity}</span></header>
      <p>持有：${count}</p>
      <p class="collection-card-detail">Cost ${card.cost}｜${card.desc}</p>
    </div>
  `;
}

export function renderShopCard(item, index, cardById) {
  const card = cardById[item.id];
  return `
    <div class="shop-card ${card.rarity}">
      <header><strong>${card.name}</strong><span class="rarity ${card.rarity}">${card.rarity}</span></header>
      <p>Cost ${card.cost}｜${card.desc}</p>
      <button data-shop-index="${index}" ${item.sold ? "disabled" : ""}>${item.sold ? "已售出" : `購買 ${item.price} Gold`}</button>
    </div>
  `;
}

export function renderCardSummary(ids, cardById, rarityOrder, emptyText = "無") {
  const counts = countCards(ids);
  const sortedIds = sortedCountKeys(counts, cardById, rarityOrder);
  if (!sortedIds.length) return emptyText;
  return `<div class="deck-summary-list">${sortedIds.map(id => `
    <div class="deck-summary-item ${cardById[id].rarity}">
      <strong>${cardById[id].name}</strong>
      <span class="deck-summary-count">x${counts[id]}</span>
    </div>
  `).join("")}</div>`;
}
