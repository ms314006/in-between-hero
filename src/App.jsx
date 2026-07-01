import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { initializeGame } from "./main.js";

const appMarkup = String.raw`
  <main class="app">
    <div class="topbar">
      <div class="brand">
        <h1><span id="heroTitleSprite" class="sprite-actor hero-title-sprite" aria-hidden="true"></span>In-Between Hero</h1>
      </div>
      <div class="pill-row">
        <span class="pill gold-pill"><span id="goldIcon" class="gold-icon"></span><span id="gold" class="gold">0</span></span>
        <button id="resetBtn" class="nes-btn is-error">重置存檔</button>
      </div>
    </div>

    <section id="homeView" class="grid">
      <div class="panel two-third">
        <h2>首頁</h2>
        <p class="muted">編組 Cost 不超過 30 的討伐牌組，進入 30 層旅程。使用過的卡會永久消失；失敗會失去本次討伐帶入與獲得的所有卡牌和金幣。</p>
        <div class="actions">
          <button id="startRunBtn" class="nes-btn is-primary primary">開始討伐</button>
          <button id="showDeckBtn" class="nes-btn">編組牌庫</button>
          <button id="openShopBtn" class="nes-btn">商店</button>
        </div>
        <p id="homeMessage" class="muted"></p>
      </div>
      <div class="panel third">
        <div class="section-title-row">
          <h3>目前編組</h3>
          <span class="pill">Deck Cost <span id="deckCost">0 / 30</span></span>
        </div>
        <div id="deckSummary" class="log"></div>
      </div>
      <div class="panel">
        <h2>收藏卡牌</h2>
        <div id="collectionList" class="card-list"></div>
      </div>
    </section>

    <section id="deckView" class="grid hidden">
      <div class="panel">
        <h2>編組牌庫</h2>
        <p class="muted">點擊收藏中的卡牌加入編組；點擊編組中的卡牌移回收藏。總 Cost 必須 <= 30。</p>
        <div class="actions">
          <button id="backHomeFromDeck" class="nes-btn">返回首頁</button>
          <button id="startRunFromDeck" class="nes-btn is-primary primary">用目前編組開始討伐</button>
        </div>
        <p id="deckMessage" class="danger"></p>
      </div>
      <div class="panel">
        <div class="section-title-row">
          <h3>本次討伐牌組</h3>
          <span class="pill">Deck Cost <span id="deckBuildCost">0 / 30</span></span>
        </div>
        <div id="deckList" class="card-list"></div>
      </div>
      <div class="panel">
        <h3>可用收藏</h3>
        <div id="deckCollectionList" class="card-list"></div>
      </div>
    </section>

    <section id="battleView" class="grid hidden">
      <div id="battlePanel" class="panel two-third battle-panel">
        <div class="pill-row">
          <span class="pill">Floor <strong id="floorText">1</strong> / 30</span>
          <span class="pill">Enemy <strong id="enemyName">Slime</strong></span>
          <span class="pill">Run Gold <strong id="runGold" class="gold">0</strong></span>
          <span class="pill">Win Rule <strong id="winRule">Inside</strong></span>
        </div>
        <div class="battle-cards">
          <div class="battle-side enemy-side">
            <div class="enemy-number-cluster">
              <div id="enemyLeftCard" class="number-card nes-container with-title">
                <p class="title">LEFT</p>
                <div class="number-card-content"><div id="enemyLeft" class="num">0</div></div>
              </div>
              <div id="enemyRightCard" class="number-card nes-container with-title">
                <p class="title">RIGHT</p>
                <div class="number-card-content"><div id="enemyRight" class="num">0</div></div>
              </div>
            </div>
            <span id="enemyBattleSprite" class="sprite-actor battle-sprite" aria-hidden="true"></span>
          </div>
          <div class="battle-side player-side">
            <span id="playerBattleSprite" class="sprite-actor battle-sprite" aria-hidden="true"></span>
            <div class="player-thought-chain">
              <div class="player-thought-step small" aria-hidden="true"></div>
              <div class="player-thought-step large" aria-hidden="true"></div>
              <div class="player-thought">
                <div id="playerNumberCard" class="number-card nes-container with-title">
                  <p class="title">YOUR</p>
                  <div class="number-card-content"><div id="playerCard" class="num">?</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="actions">
          <button id="revealBtn" class="nes-btn is-primary primary">戰鬥</button>
          <button id="cancelTargetBtn" class="nes-btn hidden">取消選擇</button>
          <button id="settleDefeatBtn" class="nes-btn is-primary hidden primary">前往結算</button>
          <button id="retreatAfterWinBtn" class="nes-btn is-error hidden">撤退</button>
          <button id="continueAfterWinBtn" class="nes-btn is-primary hidden primary">繼續下一層</button>
          <button id="scoutRetreatBtn" class="nes-btn is-error hidden">撤退</button>
          <button id="scoutContinueBtn" class="nes-btn is-primary hidden primary">繼續戰鬥</button>
        </div>
        <div id="targetBanner" class="target-banner hidden"></div>
        <p id="battleMessage" class="muted"></p>
      </div>
      <div class="panel third battle-log-panel nes-container with-title">
        <p class="title">已發動紀錄</p>
        <div id="usedLog" class="log"></div>
      </div>
      <div id="handPanel" class="panel">
        <div class="section-title-row">
          <h2>目前手牌</h2>
          <div class="pill-row">
            <span class="pill">牌庫剩餘 <span id="runDeckCount">0</span></span>
            <span class="pill">棄牌區 <span id="discardCount">0</span></span>
          </div>
        </div>
        <div id="mobileHandPreview" class="mobile-hand-preview"></div>
        <div id="handList" class="card-list"></div>
      </div>
    </section>

    <section id="resultView" class="grid hidden">
      <div class="panel">
        <h2>結算畫面</h2>
        <div id="resultBox" class="result-box"></div>
        <div class="actions">
          <button id="returnHomeBtn" class="nes-btn is-primary primary">回家</button>
        </div>
      </div>
    </section>
    <div id="supplyModal" class="modal-backdrop hidden">
      <div class="modal">
        <h2>緊急補給</h2>
        <p class="muted">你已經沒有 Gold，也沒有可編組卡牌。選擇一個寶箱，補給內容將依機率決定。</p>
        <div class="chests">
          <button class="nes-btn chest" data-chest="1">寶箱 I</button>
          <button class="nes-btn chest" data-chest="2">寶箱 II</button>
          <button class="nes-btn chest" data-chest="3">寶箱 III</button>
        </div>
        <p id="supplyMessage" class="muted"></p>
        <div class="actions">
          <button id="confirmSupplyBtn" class="nes-btn is-primary primary hidden">確認</button>
        </div>
      </div>
    </div>
    <div id="shopModal" class="modal-backdrop hidden">
      <div class="modal">
        <div class="section-title-row">
          <h2>商店</h2>
          <span class="shop-gold-display"><span id="shopGoldIcon" class="shop-gold-icon"></span><span id="shopGold" class="gold">0</span></span>
          <button id="closeShopBtn" class="nes-btn">關閉</button>
        </div>
        <p class="muted">購買目前陳列的卡牌，或花 20 Gold 抽一張隨機卡。</p>
        <div id="shopItems" class="shop-items"></div>
        <div class="actions">
          <button id="shopGachaBtn" class="nes-btn is-primary primary">抽卡 20 Gold</button>
          <button id="shopTenGachaBtn" class="nes-btn is-primary primary">十連抽 200 Gold</button>
        </div>
        <p id="shopMessage" class="muted"></p>
      </div>
    </div>
    <div id="cardDetailModal" class="modal-backdrop hidden">
      <div class="modal card-detail-modal">
        <div class="section-title-row">
          <h2>卡牌詳情</h2>
          <button id="closeCardDetailBtn" class="nes-btn">關閉</button>
        </div>
        <div id="cardDetailContent" class="card-detail-content"></div>
      </div>
    </div>
    <div id="gachaResultModal" class="modal-backdrop hidden">
      <div class="modal">
        <h2>獲得卡牌</h2>
        <div id="gachaResultList" class="gacha-results"></div>
        <div class="actions">
          <button id="confirmGachaResultBtn" class="nes-btn is-primary primary">確認</button>
        </div>
      </div>
    </div>
  </main>
`;

function App() {
  useEffect(() => {
    initializeGame();
  }, []);

  return <div dangerouslySetInnerHTML={{ __html: appMarkup }} />;
}

createRoot(document.getElementById("root")).render(<App />);
