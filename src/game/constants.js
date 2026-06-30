export const MAX_COST = 30;
export const GACHA_COST = 20;
export const SAVE_KEY = "in-between-hero-mvp-save";
export const RUN_SAVE_KEY = "in-between-hero-mvp-run";

export const RARITY_ORDER = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3
};

export const GAP_RANGES_BY_STAGE = [
  [
    { range: [90, 100], weight: 50 },
    { range: [80, 90], weight: 20 },
    { range: [60, 80], weight: 15 },
    { range: [40, 60], weight: 5 },
    { range: [20, 40], weight: 0 }
  ],
  [
    { range: [90, 100], weight: 45 },
    { range: [80, 90], weight: 25 },
    { range: [60, 80], weight: 25 },
    { range: [40, 60], weight: 3 },
    { range: [20, 40], weight: 2 }
  ],
  [
    { range: [90, 100], weight: 40 },
    { range: [80, 90], weight: 30 },
    { range: [60, 80], weight: 20 },
    { range: [40, 60], weight: 3 },
    { range: [20, 40], weight: 2 }
  ],
  [
    { range: [90, 100], weight: 35 },
    { range: [80, 90], weight: 25 },
    { range: [60, 80], weight: 25 },
    { range: [40, 60], weight: 8 },
    { range: [20, 40], weight: 2 }
  ],
  [
    { range: [90, 100], weight: 35 },
    { range: [80, 90], weight: 10 },
    { range: [60, 80], weight: 35 },
    { range: [40, 60], weight: 10 },
    { range: [20, 40], weight: 10 }
  ],
  [
    { range: [90, 100], weight: 30 },
    { range: [80, 90], weight: 10 },
    { range: [60, 80], weight: 30 },
    { range: [40, 60], weight: 15 },
    { range: [20, 40], weight: 10 }
  ]
];
