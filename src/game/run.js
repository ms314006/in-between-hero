export function drawFromRunDeck(run, amount) {
  for (let i = 0; i < amount; i++) {
    const next = run.deck.shift();
    if (!next) return;
    run.hand.push(next);
  }
}

export function shuffle(list) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
}
