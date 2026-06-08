import type { Upgrade } from "../types/game";

export const GAME_CONFIG = {
  MAX_POKEMON_ID: 151,
  OFFLINE_MIN_SECONDS: 5,
  SAVE_INTERVAL_MS: 10000,
  CRIT_CHANCE: 0.05,
  CRIT_MULTIPLIER: 3,
  BASE_POKEMON_COST: 1000,
  POKEMON_COST_MULTIPLIER: 1.25,
  PRESTIGE_MIN_ID: 50,
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

export interface Achievement {
  id: string;
  name: string;
  description: string;
  reward: number;
  condition: "clicks" | "income" | "pokemon";
  target: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "c1",
    name: "Warm Up",
    description: "Click 100 times",
    reward: 1,
    condition: "clicks",
    target: 100,
  },
  {
    id: "c2",
    name: "Clicker Novice",
    description: "Click 1,000 times",
    reward: 2,
    condition: "clicks",
    target: 1000,
  },
  {
    id: "c3",
    name: "Auto Clicker",
    description: "Click 10,000 times",
    reward: 3,
    condition: "clicks",
    target: 10000,
  },
  {
    id: "p1",
    name: "Collector",
    description: "Catch 10 Pokémon",
    reward: 1,
    condition: "pokemon",
    target: 10,
  },
  {
    id: "p2",
    name: "Ranger",
    description: "Catch 50 Pokémon",
    reward: 2,
    condition: "pokemon",
    target: 50,
  },
  {
    id: "p3",
    name: "Master",
    description: "Catch 100 Pokémon",
    reward: 3,
    condition: "pokemon",
    target: 100,
  },
  {
    id: "p4",
    name: "Champion",
    description: "Catch 151 Pokémon",
    reward: 5,
    condition: "pokemon",
    target: 151,
  },
  {
    id: "i1",
    name: "Passive Income",
    description: "Reach $1,000/sec",
    reward: 1,
    condition: "income",
    target: 1000,
  },
  {
    id: "i2",
    name: "Business Owner",
    description: "Reach $1M/sec",
    reward: 2,
    condition: "income",
    target: 1000000,
  },
  {
    id: "i3",
    name: "Tycoon",
    description: "Reach $1B/sec",
    reward: 3,
    condition: "income",
    target: 1000000000,
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

export const getMilestoneMultiplier = (count: number): number => {
  let mult = 1;
  if (count >= 10) mult *= 2;
  if (count >= 25) mult *= 2;
  if (count >= 50) mult *= 2;
  if (count >= 100) mult *= 2;
  return mult;
};

export const getNextMilestone = (count: number): number | null => {
  if (count < 10) return 10;
  if (count < 25) return 25;
  if (count < 50) return 50;
  if (count < 100) return 100;
  return null;
};

export const calculatePrestigeReward = (currentId: number): number => {
  if (currentId < GAME_CONFIG.PRESTIGE_MIN_ID) return 0;
  if (currentId >= GAME_CONFIG.MAX_POKEMON_ID) {
    return Math.floor((currentId - 40) / 10) + 5;
  }
  return Math.floor((currentId - 40) / 10);
};
