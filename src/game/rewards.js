import { pick, randInt } from "./random.js";

export function rollGold(floor) {
  const isBoss = floor % 10 === 0 || floor === 30;
  let gold = randInt(7 + floor * 2, 15 + floor * 4);
  if (isBoss) gold *= 3;
  if (Math.random() < 0.05) gold *= 10;
  return gold;
}

export function weightedDrop(isBoss, commonPool, rarePool, epicPool, bossPool) {
  if (isBoss) return pick(bossPool);
  const roll = Math.random();
  if (roll < 0.7) return pick(commonPool);
  if (roll < 0.95) return pick(rarePool);
  return pick(epicPool);
}

export function keptLoot(run, result, lootRate) {
  const effectiveLootRate = result === "Defeat" ? 0.1 : lootRate;
  return {
    keptGold: Math.floor(run.goldEarned * effectiveLootRate),
    keptNewCards: run.newCards.filter(() => Math.random() < effectiveLootRate)
  };
}
