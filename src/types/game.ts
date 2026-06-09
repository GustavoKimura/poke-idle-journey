export interface Upgrade {
  id: string;
  name: string;
  baseCost: number;
  costMultiplier: number;
  count: number;
  type: "active" | "passive" | "synergy";
  effect: number;
}

export interface PartyMember {
  id: number;
  level: number;
}

export interface PlayerSlice {
  score: number;
  clickPower: number;
  passiveIncome: number;
  multiplier: number;
  rareCandies: number;
  upgrades: Upgrade[];
  unlockedPokemonIds: number[];
  historicalUnlockedPokemonIds: number[];
  currentPokemonId: number;
  party: number[];
  pokemonLevels: Record<number, number>;
  totalClicks: number;
  unlockedAchievements: string[];
  togglePartyMember: (id: number) => void;
  upgradePokemon: (id: number) => void;
  claimAchievement: (id: string) => void;
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
}

export interface BossSlice {
  isBossActive: boolean;
  bossHp: number;
  bossMaxHp: number;
  bossTimeLeft: number;
  startBossFight: () => void;
  damageBoss: (amount: number) => void;
  tickBoss: (deltaTime: number) => void;
}

export interface SystemSlice {
  isPokedexOpen: boolean;
  isPrestigeModalOpen: boolean;
  isHowToPlayOpen: boolean;
  lastSaveTime: number;
  offlineEarnings: number;
  offlineSeconds: number;
  isHoldToClickEnabled: boolean;
  isSoundEnabled: boolean;
  isVfxEnabled: boolean;
  isAchievementsOpen: boolean;
  toggleHoldToClick: () => void;
  toggleSound: () => void;
  toggleVfx: () => void;
  togglePokedex: () => void;
  toggleAchievements: () => void;
  togglePrestigeModal: () => void;
  toggleHowToPlay: () => void;
  updateSaveTime: () => void;
  setOfflineEarnings: (amount: number, seconds: number) => void;
  claimOfflineEarnings: () => void;
}

export type GameState = PlayerSlice & BossSlice & SystemSlice;
