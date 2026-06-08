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
  togglePokedex: () => void;
  click: (critMultiplier?: number) => void;
  buyUpgrade: (id: string) => void;
  addPassiveIncome: (amount: number) => void;
  unlockNextPokemon: () => void;
  prestige: () => void;
  hardReset: () => void;
  updateSaveTime: () => void;
  setOfflineEarnings: (amount: number) => void;
  claimOfflineEarnings: () => void;
}
