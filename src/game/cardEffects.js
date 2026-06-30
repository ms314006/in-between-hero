import { clamp, randInt } from "./random.js";

export function needsTarget(id) {
  return ["fireball", "ice", "blast", "frost", "shuffle", "mirrorSwap", "giant", "shrink", "void", "oracle", "twinMirror"].includes(id);
}

export function isNumericEffect(id) {
  return ["fireball", "ice", "blast", "frost", "giant", "shrink"].includes(id);
}

export function applyCardEffect(run, id, multiplier, targetIndex, drawFromRunDeck) {
  let i;
  switch (id) {
    case "fireball":
      i = targetIndex; run.enemy[i] = clamp(run.enemy[i] + 10 * multiplier); break;
    case "ice":
      i = targetIndex; run.enemy[i] = clamp(run.enemy[i] - 10 * multiplier); break;
    case "blast":
      i = targetIndex; run.enemy[i] = clamp(run.enemy[i] + 20 * multiplier); break;
    case "frost":
      i = targetIndex; run.enemy[i] = clamp(run.enemy[i] - 20 * multiplier); break;
    case "shuffle":
      i = targetIndex; run.enemy[i] = randInt(0, 100); break;
    case "mirrorSwap":
      i = targetIndex; [run.enemy[i], run.player] = [run.player, run.enemy[i]]; break;
    case "giant":
      i = targetIndex; run.enemy[i] = clamp(run.enemy[i] * (2 * multiplier)); break;
    case "shrink":
      i = targetIndex; run.enemy[i] = Math.floor(run.enemy[i] / (2 * multiplier)); break;
    case "void":
      i = targetIndex; run.enemy[i] = 0; break;
    case "oracle":
      i = targetIndex; run.enemy[i] = 100; break;
    case "trueSight":
      run.peekPlayer = true; break;
    case "twinMirror":
      i = targetIndex; run.player = run.enemy[i]; break;
    case "balance":
      [run.deck, run.lostCards] = [run.lostCards, run.deck]; break;
    case "reverse":
      run.outsideWin = true; break;
    case "resonance":
      run.resonance = true; break;
    case "omniscience":
      drawFromRunDeck(3); break;
    case "stasis":
      run.stasisReady = true; break;
    case "chaos":
      run.enemy = [randInt(0, 100), randInt(0, 100)]; break;
    case "world":
      run.enemy = [0, 100]; break;
  }
}
