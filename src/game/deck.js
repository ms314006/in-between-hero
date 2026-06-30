export function countCards(ids) {
  return ids.reduce((map, id) => {
    map[id] = (map[id] || 0) + 1;
    return map;
  }, {});
}

export function removeOne(list, id) {
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
}

export function deckCost(ids, cardById) {
  return ids.reduce((sum, id) => sum + cardById[id].cost, 0);
}

export function availableCollection(state) {
  const available = [...state.collection];
  state.deck.forEach(id => removeOne(available, id));
  return available;
}

export function reconcileDeckWithCollection(state) {
  const remaining = [...state.collection];
  state.deck = state.deck.filter(id => {
    const index = remaining.indexOf(id);
    if (index < 0) return false;
    remaining.splice(index, 1);
    return true;
  });
}

export function compareCardIds(a, b, cardById, rarityOrder) {
  const rarityDiff = rarityOrder[cardById[a].rarity] - rarityOrder[cardById[b].rarity];
  return rarityDiff || a.localeCompare(b);
}

export function sortedCardIds(ids, cardById, rarityOrder) {
  return [...ids].sort((a, b) => compareCardIds(a, b, cardById, rarityOrder));
}

export function sortedCountKeys(counts, cardById, rarityOrder) {
  return Object.keys(counts).sort((a, b) => compareCardIds(a, b, cardById, rarityOrder));
}
