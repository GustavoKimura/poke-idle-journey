export interface Upgrade {
  id: string;
  name: string;
  baseCost: number;
  costMultiplier: number;
  count: number;
  type: "active" | "passive";
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
  isPokedexOpen: boolean;
  lastSaveTime: number;
  offlineEarnings: number;
  offlineSeconds: number;
  isHoldToClickEnabled: boolean;
  totalClicks: number;
  unlockedAchievements: string[];
  isAchievementsOpen: boolean;
  isBossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossTimeLeft: number;
  toggleHoldToClick: () => void;
  togglePokedex: () => void;
  toggleAchievements: () => void;
  claimAchievement: (id: string) => void;
  startBossFight: () => void;
  damageBoss: (amount: number) => void;
  tickBoss: (deltaTime: number) => void;
  click: (critMultiplier?: number) => void;
  buyUpgrade: (id: string) => void;
  addPassiveIncome: (amount: number) => void;
  unlockNextPokemon: () => void;
  prestige: () => void;
  hardReset: () => void;
  updateSaveTime: () => void;
  setOfflineEarnings: (amount: number, seconds: number) => void;
  claimOfflineEarnings: () => void;
}
