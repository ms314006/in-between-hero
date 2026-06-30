import { GAP_RANGES_BY_STAGE } from "./constants.js";
import { randInt } from "./random.js";

export function pickTargetSuccessRange(floor) {
  if (Math.random() < 0.05) return Math.random() < 0.8 ? [95, 100] : [0, 10];

  const stageIndex = Math.min(GAP_RANGES_BY_STAGE.length - 1, Math.floor((floor - 1) / 5));
  const ranges = GAP_RANGES_BY_STAGE[stageIndex];
  const totalWeight = ranges.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const item of ranges) {
    roll -= item.weight;
    if (roll <= 0) return item.range;
  }
  return ranges[ranges.length - 1].range;
}

export function generateEnemyCardsByFloor(floor) {
  const [min, max] = pickTargetSuccessRange(floor);
  const gap = randInt(min, max);
  const low = randInt(0, 100 - gap);
  const pair = [low, low + gap];
  return Math.random() < 0.5 ? pair : [pair[1], pair[0]];
}

export function checkWin(run) {
  const low = Math.min(run.enemy[0], run.enemy[1]);
  const high = Math.max(run.enemy[0], run.enemy[1]);
  const inside = run.player > low && run.player < high;
  return run.outsideWin ? !inside : inside;
}
