import type { Upgrade } from "../types/game";

export const GAME_CONFIG = {
  MAX_POKEMON_ID: 151,
  OFFLINE_MIN_SECONDS: 5,
  SAVE_INTERVAL_MS: 10000,
  CRIT_CHANCE: 0.05,
  CRIT_MULTIPLIER: 3,
  BASE_POKEMON_COST: 1000,
  POKEMON_COST_MULTIPLIER: 1.25,
  PRESTIGE_REWARD: 1,
  POKEMON_MULTIPLIER_REWARD: 0.1,
};

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: "1",
    name: "Extra Pokeball",
    baseCost: 10,
    costMultiplier: 1.15,
    count: 0,
    type: "active",
    effect: 1,
  },
  {
    id: "2",
    name: "Youngster Trainer",
    baseCost: 50,
    costMultiplier: 1.15,
    count: 0,
    type: "passive",
    effect: 2,
  },
  {
    id: "3",
    name: "Local Gym",
    baseCost: 500,
    costMultiplier: 1.15,
    count: 0,
    type: "passive",
    effect: 25,
  },
  {
    id: "4",
    name: "Pokemon Daycare",
    baseCost: 5000,
    costMultiplier: 1.15,
    count: 0,
    type: "passive",
    effect: 150,
  },
  {
    id: "5",
    name: "Silph Co. Scope",
    baseCost: 50000,
    costMultiplier: 1.18,
    count: 0,
    type: "active",
    effect: 500,
  },
  {
    id: "6",
    name: "Master Ball Factory",
    baseCost: 1000000,
    costMultiplier: 1.2,
    count: 0,
    type: "passive",
    effect: 10000,
  },
];

export const calculateUpgradeCost = (
  baseCost: number,
  costMultiplier: number,
  count: number,
): number => {
  return Math.floor(baseCost * Math.pow(costMultiplier, count));
};

export const calculateNextPokemonCost = (currentId: number): number => {
  return Math.floor(
    GAME_CONFIG.BASE_POKEMON_COST *
      Math.pow(GAME_CONFIG.POKEMON_COST_MULTIPLIER, currentId - 1),
  );
};
