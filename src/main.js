import { CARDS } from "./data/cards.js";
import { ENEMY_NAMES } from "./data/enemies.js";
import { SPRITES } from "./data/sprites.js";
import { GACHA_COST, MAX_COST, RARITY_ORDER, RUN_SAVE_KEY, SAVE_KEY } from "./game/constants.js";
import {
  availableCollection as getAvailableCollection,
  compareCardIds as compareCardIdsBase,
  countCards as countCardsBase,
  deckCost as getDeckCost,
  reconcileDeckWithCollection as reconcileDeckWithCollectionBase,
  removeOne as removeOneBase,
  sortedCardIds as sortedCardIdsBase,
  sortedCountKeys as sortedCountKeysBase
} from "./game/deck.js";
import { loadJson, removeJson, saveJson } from "./game/storage.js";
import { playSpriteAction as playSpriteActionBase } from "./game/sprites.js";
import { generateEnemyCardsByFloor as generateEnemyCardsByFloorBase, checkWin as checkWinBase, pickTargetSuccessRange as pickTargetSuccessRangeBase } from "./game/battle.js";
import { applyCardEffect, isNumericEffect as isNumericEffectBase, needsTarget as needsTargetBase } from "./game/cardEffects.js";
import { keptLoot, rollGold, weightedDrop as weightedDropBase } from "./game/rewards.js";
import { clamp as clampBase, pick as pickBase, randInt as randIntBase } from "./game/random.js";
import { ensureShop as ensureShopBase, generateShop as generateShopBase, rollGacha } from "./game/shop.js";
import { drawFromRunDeck as drawFromRunDeckBase, shuffle as shuffleBase } from "./game/run.js";
import { getElements } from "./ui/dom.js";
import { renderCard as renderCardBase, renderCardSummary as renderCardSummaryBase, renderCollectionCard as renderCollectionCardBase, renderFullCollectionCard as renderFullCollectionCardBase, renderShopCard as renderShopCardBase } from "./ui/cardViews.js";
import { renderIconMarkup } from "./ui/CardIcon.jsx";
import { CoinSpin } from "@pxlkit/gamification";

let initialized = false;

export function initializeGame() {
    if (initialized) return;
    initialized = true;

    const cards = CARDS;
    const enemyNames = ENEMY_NAMES;
    const cardById = Object.fromEntries(cards.map(card => [card.id, card]));
    const rarityOrder = RARITY_ORDER;
    const commonPool = cards.filter(card => card.rarity === "Common").map(card => card.id);
    const gachaPool = cards.filter(card => card.rarity !== "Legendary" && card.id !== "omniscience").map(card => card.id);
    const bossPool = cards.filter(card => ["Rare", "Epic", "Legendary"].includes(card.rarity)).map(card => card.id);
    let state = loadState();
    let run = loadRun();
    let currentView = "home";
    let supplyClaimed = false;
    let selectedHandIndex = 0;

    const els = getElements();
    els.goldIcon.innerHTML = renderIconMarkup(CoinSpin, { className: "gold-icon-svg", size: 32 });
    els.shopGoldIcon.innerHTML = renderIconMarkup(CoinSpin, { className: "shop-gold-icon-svg", size: 32 });

    function defaultState() {
      return {
        gold: 50,
        collection: ["escape", "escape", "fireball", "fireball", "fireball", "fireball", "ice", "ice", "ice", "ice"],
        deck: ["escape", "fireball", "fireball", "ice", "ice"],
        shop: null
      };
    }

    function loadState() {
      const saved = loadJson(SAVE_KEY);
      if (saved && Array.isArray(saved.collection) && Array.isArray(saved.deck)) return saved;
      return defaultState();
    }

    function saveState() {
      saveJson(SAVE_KEY, state);
    }

    function loadRun() {
      const saved = loadJson(RUN_SAVE_KEY);
      if (!saved || !Array.isArray(saved.deck) || !Array.isArray(saved.hand)) return null;
      return normalizeRun(saved);
    }

    function normalizeRun(savedRun) {
      savedRun.used ||= [];
      savedRun.lostCards ||= [];
      savedRun.newCards ||= [];
      savedRun.log ||= [];
      savedRun.pendingTarget = null;
      savedRun.enemyEntering = false;
      if (savedRun.revealResult && !savedRun.awaitingDefeatSettlement && !savedRun.awaitingPostWinChoice) {
        savedRun.revealResult = null;
        savedRun.playerRevealed = false;
        savedRun.locked = false;
      }
      return savedRun;
    }

    function saveRun() {
      if (run) saveJson(RUN_SAVE_KEY, run);
    }

    function clearRun() {
      removeJson(RUN_SAVE_KEY);
    }

    function setBattleMessage(message) {
      if (run) run.message = message;
      els.battleMessage.textContent = message;
    }

    function applyNESStyles() {
      document.querySelectorAll(".panel, .modal").forEach(element => {
        element.classList.add("nes-container", "is-dark");
      });
      document.querySelectorAll("button").forEach(button => {
        button.classList.add("nes-btn");
        if (button.classList.contains("primary")) button.classList.add("is-primary");
      });
      document.querySelectorAll(".log").forEach(element => {
        element.classList.add("nes-container", "is-dark");
      });
    }

    function frameToBackgroundPosition(sprite, frame) {
      const [row, col] = frame;
      return `${-(col - 1) * sprite.frameWidth}px ${-(row - 1) * sprite.frameHeight}px`;
    }

    function playSpriteAction(element, sprite, actionName) {
      return playSpriteActionBase(element, sprite, actionName);
    }

    function countCards(ids) {
      return countCardsBase(ids);
    }

    function deckCost(ids = state.deck) {
      return getDeckCost(ids, cardById);
    }

    function clamp(value) {
      return clampBase(value);
    }

    function randInt(min, max) {
      return randIntBase(min, max);
    }

    function pick(list) {
      return pickBase(list);
    }

    function compareCardIds(a, b) {
      return compareCardIdsBase(a, b, cardById, rarityOrder);
    }

    function sortedCardIds(ids) {
      return sortedCardIdsBase(ids, cardById, rarityOrder);
    }

    function sortedCountKeys(counts) {
      return sortedCountKeysBase(counts, cardById, rarityOrder);
    }

    function removeOne(list, id) {
      removeOneBase(list, id);
    }

    function reconcileDeckWithCollection() {
      reconcileDeckWithCollectionBase(state);
    }

    function availableCollection() {
      return getAvailableCollection(state);
    }

    function weightedGacha() {
      return rollGacha(gachaPool, cardById);
    }

    function generateShop() {
      return generateShopBase(cards);
    }

    function ensureShop() {
      if (ensureShopBase(state, cards)) saveState();
    }

    function weightedDrop(isBoss) {
      return weightedDropBase(
        isBoss,
        commonPool,
        cards.filter(card => card.rarity === "Rare").map(card => card.id),
        cards.filter(card => card.rarity === "Epic").map(card => card.id),
        bossPool
      );
    }

    function pickTargetSuccessRange(floor) {
      return pickTargetSuccessRangeBase(floor);
    }

    function generateEnemyCardsByFloor(floor) {
      return generateEnemyCardsByFloorBase(floor);
    }

    function needsTarget(id) {
      return needsTargetBase(id);
    }

    function needsEmergencySupply() {
      return state.gold < GACHA_COST && state.collection.length === 0;
    }

    function baseSupplyCards() {
      return ["escape", "escape", "fireball", "fireball", "fireball", "fireball", "ice", "ice", "ice", "ice"];
    }

    function renderCard(id, options = {}) {
      return renderCardBase(id, cardById, options);
    }

    function renderCollectionCard(id, count) {
      return renderCollectionCardBase(id, count, cardById);
    }

    function renderFullCollectionCard(id, count) {
      return renderFullCollectionCardBase(id, count, cardById);
    }

    function renderShopCard(item, index) {
      return renderShopCardBase(item, index, cardById);
    }

    function setView(view) {
      currentView = view;
      document.body.classList.toggle("home-active", view === "home");
      document.body.classList.toggle("battle-view-active", view === "battle");
      [els.homeView, els.deckView, els.battleView, els.resultView].forEach(el => el.classList.add("hidden"));
      els[`${view}View`].classList.remove("hidden");
      render();
      if (view === "battle") startBattleSpritesIdle();
      if (view === "home" && needsEmergencySupply()) showEmergencySupplyModal();
    }

    function render() {
      els.gold.textContent = state.gold;
      els.shopGold.textContent = state.gold;
      const cost = deckCost();
      els.deckCost.textContent = `${cost} / ${MAX_COST}`;
      els.deckCost.className = cost > MAX_COST ? "danger" : "";
      els.deckBuildCost.textContent = `${cost} / ${MAX_COST}`;
      els.deckBuildCost.className = cost > MAX_COST ? "danger" : "";
      renderHome();
      renderDeckBuilder();
      if (run) renderBattle();
      saveRun();
    }

    function renderHome() {
      const collectionCounts = countCards(state.collection);
      els.collectionList.innerHTML = sortedCountKeys(collectionCounts).map(id => renderCollectionCard(id, collectionCounts[id])).join("");
      [...els.collectionList.querySelectorAll(".compact-card")].forEach(card => {
        card.addEventListener("click", () => showCardDetail(card.dataset.cardId, collectionCounts[card.dataset.cardId]));
      });
      const deckCounts = countCards(state.deck);
      els.deckSummary.innerHTML = Object.keys(deckCounts).length
        ? `<div class="deck-summary-list">${sortedCountKeys(deckCounts).map(id => `
          <div class="deck-summary-item nes-container is-dark ${cardById[id].rarity}">
            <strong>${cardById[id].name}</strong>
            <span class="deck-summary-count">x${deckCounts[id]}</span>
          </div>
        `).join("")}</div>`
        : "尚未編組。";
      const valid = state.deck.length > 0 && deckCost() <= MAX_COST;
      els.startRunBtn.disabled = !valid;
      els.startRunFromDeck.disabled = !valid;
      const invalidReason = valid
        ? ""
        : state.deck.length === 0
          ? "目前沒有任何卡牌編組"
          : "目前編組大於 Cost 限制";
      els.homeMessage.textContent = invalidReason;
      els.homeMessage.classList.toggle("danger", !!invalidReason);
      els.deckMessage.textContent = invalidReason;
    }

    function renderDeckBuilder() {
      const available = availableCollection();
      const availableCounts = countCards(available);
      const availableIds = sortedCountKeys(availableCounts);
      els.deckCollectionList.innerHTML = availableIds.map(id => renderCollectionCard(id, availableCounts[id])).join("") || "<p class='muted'>沒有可加入的卡牌。</p>";
      [...els.deckCollectionList.querySelectorAll(".compact-card")].forEach((el, index) => {
        const id = availableIds[index];
        bindCardPress(el, id, availableCounts[id], () => addToDeck(id));
      });

      const deckCounts = countCards(state.deck);
      const deckIds = sortedCountKeys(deckCounts);
      els.deckList.innerHTML = deckIds.map(id => renderCollectionCard(id, deckCounts[id])).join("") || "<p class='muted'>尚未選卡。</p>";
      [...els.deckList.querySelectorAll(".compact-card")].forEach((el, index) => {
        const id = deckIds[index];
        bindCardPress(el, id, deckCounts[id], () => removeFromDeck(id));
      });
    }

    function bindCardPress(el, id, count, onPress) {
      let pressTimer = null;
      let longPressed = false;

      const clearPressTimer = () => {
        if (pressTimer) clearTimeout(pressTimer);
        pressTimer = null;
      };

      el.addEventListener("pointerdown", () => {
        longPressed = false;
        clearPressTimer();
        pressTimer = setTimeout(() => {
          longPressed = true;
          showCardDetail(id, count);
        }, 520);
      });

      el.addEventListener("pointerup", () => {
        clearPressTimer();
        if (longPressed) return;
        onPress();
      });

      el.addEventListener("pointerleave", clearPressTimer);
      el.addEventListener("pointercancel", clearPressTimer);
      el.addEventListener("contextmenu", event => event.preventDefault());
    }

    function renderBattle() {
      els.floorText.textContent = run.floor;
      els.enemyName.textContent = run.enemyName;
      els.runGold.textContent = run.goldEarned;
      els.winRule.textContent = run.outsideWin ? "Outside" : "Inside";
      els.enemyLeft.textContent = run.scouting && run.visibleEnemyIndex !== 0 ? "?" : run.enemy[0];
      els.enemyRight.textContent = run.scouting && run.visibleEnemyIndex !== 1 ? "?" : run.enemy[1];
      els.playerCard.textContent = run.playerRevealed || run.peekPlayer ? run.player : "?";
      els.playerNumberCard.classList.toggle("player-success", run.revealResult === "success");
      els.playerNumberCard.classList.toggle("player-fail", run.revealResult === "fail");
      els.battlePanel.classList.remove("entering");
      els.enemyLeftCard.classList.toggle("targetable", !!run.pendingTarget && !run.locked && !run.enemyEntering);
      els.enemyRightCard.classList.toggle("targetable", !!run.pendingTarget && !run.locked && !run.enemyEntering);
      els.cancelTargetBtn.classList.toggle("hidden", !run.pendingTarget || run.locked);
      els.settleDefeatBtn.classList.toggle("hidden", !run.awaitingDefeatSettlement);
      els.retreatAfterWinBtn.classList.toggle("hidden", !run.awaitingPostWinChoice);
      els.continueAfterWinBtn.classList.toggle("hidden", !run.awaitingPostWinChoice);
      els.scoutRetreatBtn.classList.toggle("hidden", !run.scouting);
      els.scoutContinueBtn.classList.toggle("hidden", !run.scouting);
      els.targetBanner.classList.toggle("hidden", !run.pendingTarget || run.locked);
      els.targetBanner.textContent = run.pendingTarget ? `選擇 ${cardById[run.pendingTarget.id].name} 要影響的敵方數字` : "";
      els.battleMessage.textContent = run.message || "";
      els.runDeckCount.textContent = run.deck.length;
      els.discardCount.textContent = run.lostCards.length;
      els.usedLog.innerHTML = run.log.length ? run.log.map(item => `- ${item}`).join("<br>") : "尚未使用卡牌。";
      const sortedHand = run.hand.map((id, index) => ({ id, index })).sort((a, b) => compareCardIds(a.id, b.id) || a.index - b.index);
      selectedHandIndex = run.hand.length ? (run.hand[selectedHandIndex] ? selectedHandIndex : sortedHand[0].index) : 0;
      renderMobileHandPreview();
      els.handList.innerHTML = sortedHand.map(item => renderCollectionCard(item.id)).join("") || "<p class='muted'>沒有手牌。</p>";
      const handCardEls = [...els.handList.querySelectorAll(".compact-card")];
      handCardEls.forEach((el, index) => {
        const handIndex = sortedHand[index].index;
        el.classList.toggle("selected", handIndex === selectedHandIndex);
        bindCardPress(el, sortedHand[index].id, null, () => {
          if (window.matchMedia("(max-width: 760px)").matches) {
            selectedHandIndex = handIndex;
            renderMobileHandPreview();
            handCardEls.forEach((cardEl, cardIndex) => {
              cardEl.classList.toggle("selected", sortedHand[cardIndex].index === selectedHandIndex);
            });
            return;
          }
          if (!run.locked && !run.pendingTarget && !run.scouting && !run.enemyEntering) useCard(handIndex);
        });
      });
      els.revealBtn.disabled = run.locked || !!run.pendingTarget || run.scouting || run.enemyEntering;
      els.scoutRetreatBtn.disabled = !!run.enemyEntering;
      els.scoutContinueBtn.disabled = !!run.enemyEntering;
    }

    function renderMobileHandPreview() {
      if (!run.hand.length) {
        els.mobileHandPreview.innerHTML = `<p class="muted">沒有手牌。</p>`;
        return;
      }
      const id = run.hand[selectedHandIndex];
      const card = cardById[id];
      const disabled = run.locked || !!run.pendingTarget || run.scouting || run.enemyEntering;
      els.mobileHandPreview.innerHTML = `
        <div class="mobile-hand-preview-layout">
          <div class="mobile-hand-preview-main">
            <span class="rarity ${card.rarity}">${card.rarity}</span>
            <strong>${card.name}</strong>
            <button id="mobileUseCardBtn" class="nes-btn is-primary" ${disabled ? "disabled" : ""}>發動</button>
          </div>
          <p>${card.desc}</p>
        </div>
      `;
      const button = document.getElementById("mobileUseCardBtn");
      if (button) button.addEventListener("click", () => useCard(selectedHandIndex));
    }

    function addToDeck(id) {
      state.deck.push(id);
      saveState();
      render();
    }

    function removeFromDeck(id) {
      removeOne(state.deck, id);
      saveState();
      render();
    }

    function startRun() {
      if (!state.deck.length || deckCost() > MAX_COST) return;
      const runDeck = [...state.deck];
      shuffle(runDeck);
      run = {
        floor: 1,
        deck: runDeck,
        hand: [],
        used: [],
        lostCards: [],
        newCards: [],
        goldEarned: 0,
        log: [],
        lastCard: null,
        resonance: false,
        stasisReady: false,
        stasisUsed: false,
        playerRevealed: false,
        peekPlayer: false,
        outsideWin: false,
        locked: true,
        pendingTarget: null,
        revealResult: null,
        awaitingDefeatSettlement: false,
        awaitingPostWinChoice: false,
        scouting: false,
        visibleEnemyIndex: null,
        pendingWinGold: 0,
        pendingWinDrop: null,
        enemyEntering: true
      };
      drawFromRunDeck(5);
      newBattle();
      setBattleMessage("討伐開始。看清敵方兩張牌，再決定是否使用手牌。");
      setView("battle");
      startEnemyEntrance(true);
    }

    function shuffle(list) {
      shuffleBase(list);
    }

    function drawFromRunDeck(amount) {
      drawFromRunDeckBase(run, amount);
    }

    function startBattleSpritesIdle() {
      playSpriteAction(els.playerBattleSprite, SPRITES.swordsmanCyan, "idle");
      playSpriteAction(els.enemyBattleSprite, SPRITES.skeletonSoldier, "idle");
    }

    function startEnemyEntrance(unlockAfter = false) {
      if (!run) return;
      run.enemyEntering = true;
      playSpriteAction(els.enemyBattleSprite, SPRITES.skeletonSoldier, "enter").then(() => {
        if (!run) return;
        run.enemyEntering = false;
        if (unlockAfter) run.locked = false;
        render();
      });
    }

    async function playBattleResultAnimation(won) {
      if (won) {
        await playSpriteAction(els.playerBattleSprite, SPRITES.swordsmanCyan, "attack");
        await playSpriteAction(els.enemyBattleSprite, SPRITES.skeletonSoldier, "defend");
        await playSpriteAction(els.enemyBattleSprite, SPRITES.skeletonSoldier, "death");
        return;
      }
      await playSpriteAction(els.enemyBattleSprite, SPRITES.skeletonSoldier, "attack");
      await playSpriteAction(els.playerBattleSprite, SPRITES.swordsmanCyan, "defend");
      await playSpriteAction(els.playerBattleSprite, SPRITES.swordsmanCyan, "death");
    }

    function newBattle() {
      run.enemy = generateEnemyCardsByFloor(run.floor);
      run.player = randInt(0, 100);
      run.enemyName = run.floor === 30 ? "魔王" : enemyNames[Math.min(enemyNames.length - 2, Math.floor((run.floor - 1) / 4))];
      run.playerRevealed = false;
      run.peekPlayer = false;
      run.outsideWin = false;
      run.resonance = false;
      run.stasisReady = false;
      run.stasisUsed = false;
      run.pendingTarget = null;
      run.revealResult = null;
      run.awaitingDefeatSettlement = false;
      run.awaitingPostWinChoice = false;
      run.scouting = false;
      run.visibleEnemyIndex = null;
      run.log = [];
      startBattleSpritesIdle();
    }

    function useCard(index, replayId = null, targetIndex = null) {
      if (run.locked) return;
      const id = replayId || run.hand[index];
      if (!id) return;
      if (needsTarget(id) && targetIndex === null) {
        run.pendingTarget = { index, id, replayId };
        setBattleMessage(`選擇 ${cardById[id].name} 要影響 Enemy Left 或 Enemy Right。`);
        render();
        return;
      }
      if (!replayId) {
        run.hand.splice(index, 1);
        run.used.push(id);
        run.lostCards.push(id);
      }
      const card = cardById[id];
      const multiplier = run.resonance && isNumericEffect(id) ? 2 : 1;
      if (run.resonance && isNumericEffect(id)) run.resonance = false;

      if (id === "escape") return retreat();
      if (id === "echo") {
        const previous = run.lastCard;
        run.log.push(previous ? `${card.name}：再次發動 ${cardById[previous].name}` : `${card.name}：沒有上一張可發動的卡`);
        if (previous) useCard(null, previous);
        return render();
      }

      applyCard(id, multiplier, targetIndex);
      if (id !== "resonance") run.lastCard = id;
      run.log.push(`${card.name}${multiplier > 1 ? " x2" : ""}：${card.desc}`);
      run.pendingTarget = null;
      setBattleMessage(`已發動 ${card.name}。`);
      render();
    }

    function isNumericEffect(id) {
      return isNumericEffectBase(id);
    }

    function chooseEnemyTarget(targetIndex) {
      if (!run || !run.pendingTarget || run.locked) return;
      const pending = run.pendingTarget;
      run.pendingTarget = null;
      useCard(pending.index, pending.replayId, targetIndex);
    }

    function applyCard(id, multiplier, targetIndex = null) {
      applyCardEffect(run, id, multiplier, targetIndex, drawFromRunDeck);
    }

    function checkWin() {
      return checkWinBase(run);
    }

    function reveal() {
      if (run.locked || run.pendingTarget) return;
      run.playerRevealed = true;
      run.locked = true;
      const won = checkWin();
      run.revealResult = won ? "success" : "fail";
      const low = Math.min(run.enemy[0], run.enemy[1]);
      const high = Math.max(run.enemy[0], run.enemy[1]);
      setBattleMessage(won
        ? `成功擊敗魔物！你的 ${run.player} 在 ${low} 與 ${high} 之間。`
        : `被魔物擊敗了！你的 ${run.player} 沒有在 ${low} 與 ${high} 的之間。`);
      render();
      const shouldSkipDeathSequence = !won && run.stasisReady && !run.stasisUsed;
      setTimeout(async () => {
        if (!shouldSkipDeathSequence) await playBattleResultAnimation(won);
        resolveReveal(won);
      }, 350);
    }

    function resolveReveal(won) {
      if (!run) return;
      if (won) return winBattle();
      if (run.stasisReady && !run.stasisUsed) {
        run.stasisUsed = true;
        run.playerRevealed = false;
        run.locked = false;
        run.revealResult = null;
        setBattleMessage("命運凝滯發動：本次戰鬥失敗，但你可以繼續使用手牌後再次戰鬥。");
        render();
        return;
      }
      run.awaitingDefeatSettlement = true;
      run.locked = true;
      setBattleMessage("討伐失敗。確認結果後，點擊「前往結算」進入結算畫面。");
      render();
    }

    function winBattle() {
      const isBoss = run.floor % 10 === 0 || run.floor === 30;
      const gold = rollGold(run.floor);
      run.goldEarned += gold;
      const dropChance = isBoss ? 0.8 : 0.22;
      let dropText = "";
      if (Math.random() < dropChance) {
        const newCard = weightedDrop(isBoss);
        run.newCards.push(newCard);
        dropText = `，獲得 ${cardById[newCard].name}`;
      }
      if (run.floor >= 30) return finishRun("Victory");
      run.awaitingPostWinChoice = true;
      run.locked = true;
      setBattleMessage(`勝利！獲得 ${gold} Gold${dropText}。你可以現在撤退保留 40% 戰利品，或繼續下一層。`);
      render();
    }

    function continueAfterWin() {
      if (!run || !run.awaitingPostWinChoice) return;
      run.awaitingPostWinChoice = false;
      run.floor += 1;
      drawFromRunDeck(1);
      newBattle();
      run.locked = true;
      run.scouting = true;
      run.enemyEntering = true;
      run.visibleEnemyIndex = Math.random() < 0.5 ? 0 : 1;
      setBattleMessage("你進入下一場戰鬥，先看見一張敵方數字。可選擇撤退保留 20% 戰利品，但有 50% 機率撤退失敗。");
      render();
      startEnemyEntrance(false);
    }

    function continueFromScout() {
      if (!run || !run.scouting || run.enemyEntering) return;
      run.scouting = false;
      run.visibleEnemyIndex = null;
      run.locked = false;
      setBattleMessage("戰鬥開始。看清敵方兩張牌，再決定是否使用手牌。");
      render();
    }

    function scoutRetreat() {
      if (!run || !run.scouting || run.enemyEntering) return;
      if (Math.random() < 0.5) {
        run.scouting = false;
        run.visibleEnemyIndex = null;
        run.locked = false;
        setBattleMessage("撤退失敗！你被敵人追上，只能強制進入戰鬥。");
        render();
        return;
      }
      finishRun("Retreat", 0.4);
    }

    function retreat() {
      finishRun("Retreat");
    }

    function finishRun(result, lootRate = 1) {
      const originalDeck = [...state.deck];
      const remainingCards = [...run.deck, ...run.hand];
      const loot = keptLoot(run, result, lootRate);
      run.keptGold = loot.keptGold;
      run.keptNewCards = loot.keptNewCards;
      if (result === "Defeat") {
        originalDeck.forEach(id => removeOne(state.collection, id));
        state.gold += run.keptGold;
        state.collection.push(...run.keptNewCards);
        state.deck = [];
      } else {
        run.lostCards.forEach(id => removeOne(state.collection, id));
        state.gold += run.keptGold;
        state.collection.push(...run.keptNewCards);
        reconcileDeckWithCollection();
      }
      saveState();
      showResult(result, remainingCards, originalDeck);
      run = null;
      clearRun();
      setView("result");
    }

    function names(ids) {
      const counts = countCards(ids);
      return Object.keys(counts).map(id => `${cardById[id].name} x${counts[id]}`).join("、") || "無";
    }

    function renderCardSummary(ids, emptyText = "無") {
      return renderCardSummaryBase(ids, cardById, rarityOrder, emptyText);
    }

    function showResult(result, remainingCards, originalDeck) {
      const resultText = result === "Victory" ? "討伐成功" : result === "Retreat" ? "安全撤退" : "討伐失敗";
      const lost = result === "Defeat" ? originalDeck : run.lostCards;
      els.resultBox.innerHTML = `
        <div>討伐結果：<strong>${resultText}</strong></div>
        <div>挑戰層數：${run.floor}</div>
        <div>賺取金幣：<span class="gold">${run.keptGold ?? run.goldEarned}</span></div>
        <div>獲得卡牌：${renderCardSummary(run.keptNewCards ?? run.newCards)}</div>
        <div>失去卡牌：${renderCardSummary(lost)}</div>
        <div>剩餘卡牌：${result === "Defeat" ? "無，本次討伐編組全數失去" : renderCardSummary(remainingCards)}</div>
      `;
    }

    function openShop() {
      ensureShop();
      els.shopModal.classList.remove("hidden");
      els.shopMessage.textContent = "";
      renderShop();
    }

    function renderShop() {
      ensureShop();
      els.shopItems.innerHTML = state.shop.items.map(renderShopCard).join("");
      [...els.shopItems.querySelectorAll("button[data-shop-index]")].forEach(button => {
        button.addEventListener("click", () => buyShopItem(Number(button.dataset.shopIndex)));
      });
    }

    function showCardDetail(id, count) {
      if (!cardById[id]) return;
      els.cardDetailContent.innerHTML = renderFullCollectionCard(id, count);
      els.cardDetailModal.classList.remove("hidden");
    }

    function buyShopItem(index) {
      ensureShop();
      const item = state.shop.items[index];
      if (!item || item.sold) return;
      if (state.gold < item.price) {
        els.shopMessage.textContent = "Gold 不足，無法購買。";
        return;
      }
      state.gold -= item.price;
      state.collection.push(item.id);
      item.sold = true;
      saveState();
      els.shopMessage.textContent = `購買了 ${cardById[item.id].name}（${cardById[item.id].rarity}）。`;
      render();
      renderShop();
    }

    function shopGacha() {
      performShopGacha(1);
    }

    function shopTenGacha() {
      performShopGacha(10);
    }

    function performShopGacha(amount) {
      const totalCost = GACHA_COST * amount;
      if (state.gold < totalCost) {
        els.shopMessage.textContent = `Gold 不足，無法${amount === 10 ? "十連抽" : "抽卡"}。`;
        return;
      }
      state.gold -= totalCost;
      const gained = Array.from({ length: amount }, () => weightedGacha());
      state.collection.push(...gained);
      saveState();
      els.shopMessage.textContent = "";
      showGachaResult(gained);
      render();
    }

    function showGachaResult(ids) {
      els.gachaResultList.classList.toggle("single", ids.length === 1);
      els.gachaResultList.classList.toggle("ten", ids.length > 1);
      els.gachaResultList.innerHTML = ids.map((id, index) => {
        const html = renderCard(id);
        return html.replace('class="card', `style="animation-delay: ${index * 0.11}s" class="card`);
      }).join("");
      els.gachaResultModal.classList.remove("hidden");
    }

    function showEmergencySupplyModal() {
      supplyClaimed = false;
      els.supplyModal.classList.remove("hidden");
      els.supplyMessage.textContent = "";
      els.confirmSupplyBtn.classList.add("hidden");
      document.querySelectorAll(".chest").forEach(chest => chest.disabled = false);
    }

    function claimEmergencySupply() {
      if (supplyClaimed) return;
      supplyClaimed = true;
      document.querySelectorAll(".chest").forEach(chest => chest.disabled = true);
      const roll = Math.random();
      const gained = baseSupplyCards();
      let tier = "A";
      if (roll >= 0.9) {
        tier = "C";
        gained.push(...randomCardsByRarity("Rare", 2), ...randomCardsByRarity("Epic", 2));
      } else if (roll >= 0.6) {
        tier = "B";
        gained.push(...randomCardsByRarity("Rare", 2));
      }
      state.collection.push(...gained);
      state.deck = [];
      saveState();
      els.supplyMessage.innerHTML = `獲得 ${tier} 補給：<br>${names(gained)}`;
      els.confirmSupplyBtn.classList.remove("hidden");
    }

    function randomCardsByRarity(rarity, amount) {
      const pool = cards.filter(card => card.rarity === rarity).map(card => card.id);
      return Array.from({ length: amount }, () => pick(pool));
    }

    els.showDeckBtn.addEventListener("click", () => setView("deck"));
    els.backHomeFromDeck.addEventListener("click", () => setView("home"));
    els.startRunBtn.addEventListener("click", startRun);
    els.startRunFromDeck.addEventListener("click", startRun);
    els.openShopBtn.addEventListener("click", openShop);
    els.shopGachaBtn.addEventListener("click", shopGacha);
    els.shopTenGachaBtn.addEventListener("click", shopTenGacha);
    els.closeShopBtn.addEventListener("click", () => els.shopModal.classList.add("hidden"));
    els.closeCardDetailBtn.addEventListener("click", () => els.cardDetailModal.classList.add("hidden"));
    els.confirmGachaResultBtn.addEventListener("click", () => els.gachaResultModal.classList.add("hidden"));
    els.heroTitleSprite.addEventListener("click", () => playSpriteAction(els.heroTitleSprite, SPRITES.swordsmanCyan, "attack"));
    els.revealBtn.addEventListener("click", reveal);
    els.settleDefeatBtn.addEventListener("click", () => {
      if (!run || !run.awaitingDefeatSettlement) return;
      finishRun("Defeat");
    });
    els.retreatAfterWinBtn.addEventListener("click", () => {
      if (!run || !run.awaitingPostWinChoice) return;
      finishRun("Retreat", 0.6);
    });
    els.continueAfterWinBtn.addEventListener("click", continueAfterWin);
    els.scoutRetreatBtn.addEventListener("click", scoutRetreat);
    els.scoutContinueBtn.addEventListener("click", continueFromScout);
    els.enemyLeftCard.addEventListener("click", () => chooseEnemyTarget(0));
    els.enemyRightCard.addEventListener("click", () => chooseEnemyTarget(1));
    els.cancelTargetBtn.addEventListener("click", () => {
      if (!run) return;
      run.pendingTarget = null;
      setBattleMessage("已取消選擇目標。");
      render();
    });
    els.returnHomeBtn.addEventListener("click", () => setView("home"));
    els.confirmSupplyBtn.addEventListener("click", () => {
      els.supplyModal.classList.add("hidden");
      render();
    });
    document.querySelectorAll(".chest").forEach(chest => chest.addEventListener("click", claimEmergencySupply));
    els.resetBtn.addEventListener("click", () => {
      if (!confirm("確定要重置存檔？")) return;
      state = defaultState();
      run = null;
      saveState();
      clearRun();
      setView("home");
    });

    saveState();
    applyNESStyles();
    playSpriteAction(els.heroTitleSprite, SPRITES.swordsmanCyan, "idle");
    setView(run ? "battle" : "home");
}
  
