export interface Upgrade {
  id: string;
  name: string;
  baseCost: number;
  costMultiplier: number;
  count: number;
  type: "active" | "passive" | "synergy";
  effect: number;
}

export interface GameState {
  score: number;
  clickPower: number;
  passiveIncome: number;
  multiplier: number;
  rareCandies: number;
  upgrades: Upgrade[];
  unlockedPokemonIds: number[];
  currentPokemonId: number;
  party: number[];
  isPokedexOpen: boolean;
  lastSaveTime: number;
  offlineEarnings: number;
  offlineSeconds: number;
  isHoldToClickEnabled: boolean;
  isSoundEnabled: boolean;
  isVfxEnabled: boolean;
  totalClicks: number;
  unlockedAchievements: string[];
  isAchievementsOpen: boolean;
  isBossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossTimeLeft: number;
  toggleHoldToClick: () => void;
  toggleSound: () => void;
  toggleVfx: () => void;
  togglePokedex: () => void;
  togglePartyMember: (id: number) => void;
  toggleAchievements: () => void;
  claimAchievement: (id: string) => void;
  startBossFight: () => void;
  damageBoss: (amount: number) => void;
  tickBoss: (deltaTime: number) => void;
  click: (
    critMultiplier?: number,
    comboMultiplier?: number,
    typeMultiplier?: number,
  ) => void;
  buyUpgrade: (id: string, amount?: number) => void;
  addPassiveIncome: (amount: number) => void;
  unlockNextPokemon: () => void;
  prestige: () => void;
  hardReset: () => void;
  updateSaveTime: () => void;
  setOfflineEarnings: (amount: number, seconds: number) => void;
  claimOfflineEarnings: () => void;
}
