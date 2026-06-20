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
  MAX_PARTY_SIZE: 6,
  PARTY_MEMBER_MULTIPLIER: 0.5,
  SHINY_CHANCE: 0.005,
};

export const ASCENSION_UPGRADES = [
  {
    id: "click_power",
    name: "Ascended Power",
    desc: "+100% Global Multiplier per level",
    baseCost: 1,
    costMultiplier: 1.5,
    maxLevel: 999,
  },
  {
    id: "crit_chance",
    name: "Precision Strike",
    desc: "+1% Critical Hit Chance per level",
    baseCost: 2,
    costMultiplier: 2,
    maxLevel: 25,
  },
  {
    id: "boss_time",
    name: "Time Dilation",
    desc: "+1s Boss Timer per level",
    baseCost: 3,
    costMultiplier: 2,
    maxLevel: 15,
  },
  {
    id: "party_size",
    name: "Leadership",
    desc: "+1 Max Party Size",
    baseCost: 10,
    costMultiplier: 5,
    maxLevel: 2,
  },
];

export const calculateAscensionCost = (
  baseCost: number,
  costMultiplier: number,
  level: number,
): number => {
  return Math.floor(baseCost * Math.pow(costMultiplier, level));
};

export const TYPE_BADGE_COLORS: Record<string, string> = {
  normal: "bg-[#A8A878] text-white border-[#A8A878]",
  fire: "bg-[#F08030] text-white border-[#F08030]",
  water: "bg-[#6890F0] text-white border-[#6890F0]",
  electric: "bg-[#F8D030] text-black border-[#F8D030]",
  grass: "bg-[#78C850] text-white border-[#78C850]",
  ice: "bg-[#98D8D8] text-black border-[#98D8D8]",
  fighting: "bg-[#C03028] text-white border-[#C03028]",
  poison: "bg-[#A040A0] text-white border-[#A040A0]",
  ground: "bg-[#E0C068] text-black border-[#E0C068]",
  flying: "bg-[#A890F0] text-white border-[#A890F0]",
  psychic: "bg-[#F85888] text-white border-[#F85888]",
  bug: "bg-[#A8B820] text-white border-[#A8B820]",
  rock: "bg-[#B8A038] text-white border-[#B8A038]",
  ghost: "bg-[#705898] text-white border-[#705898]",
  dragon: "bg-[#7038F8] text-white border-[#7038F8]",
  dark: "bg-[#705848] text-white border-[#705848]",
  steel: "bg-[#B8B8D0] text-black border-[#B8B8D0]",
  fairy: "bg-[#EE99AC] text-black border-[#EE99AC]",
};

export const TYPE_HEX_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

export const TYPE_ICONS: Record<string, string> = {
  normal: "⏺",
  fire: "🔥",
  water: "💧",
  electric: "⚡",
  grass: "🌿",
  ice: "❄️",
  fighting: "🥊",
  poison: "☠️",
  ground: "⛰️",
  flying: "💨",
  psychic: "👁️",
  bug: "🐛",
  rock: "🪨",
  ghost: "👻",
  dragon: "🐉",
  dark: "🌙",
  steel: "⚙️",
  fairy: "✨",
};

export const TYPE_WEAKNESSES: Record<string, string[]> = {
  normal: ["fighting"],
  fire: ["water", "ground", "rock"],
  water: ["electric", "grass"],
  electric: ["ground"],
  grass: ["fire", "ice", "poison", "flying", "bug"],
  ice: ["fire", "fighting", "rock", "steel"],
  fighting: ["flying", "psychic", "fairy"],
  poison: ["ground", "psychic"],
  ground: ["water", "grass", "ice"],
  flying: ["electric", "ice", "rock"],
  psychic: ["bug", "ghost", "dark"],
  bug: ["fire", "flying", "rock"],
  rock: ["water", "grass", "fighting", "ground", "steel"],
  ghost: ["ghost", "dark"],
  dragon: ["ice", "dragon", "fairy"],
  dark: ["fighting", "bug", "fairy"],
  steel: ["fire", "fighting", "ground"],
  fairy: ["poison", "steel"],
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
  {
    id: "7",
    name: "Pokedex Scholar",
    baseCost: 5000000,
    costMultiplier: 1.5,
    count: 0,
    type: "synergy",
    effect: 0.01,
  },
  {
    id: "8",
    name: "Shiny Charm",
    baseCost: 50000000,
    costMultiplier: 1.5,
    count: 0,
    type: "synergy",
    effect: 0.05,
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

export const calculateMultipleUpgradeCost = (
  baseCost: number,
  costMultiplier: number,
  count: number,
  amount: number,
): number => {
  if (amount <= 0) return 0;
  if (amount === 1)
    return Math.floor(baseCost * Math.pow(costMultiplier, count));
  const c = baseCost * Math.pow(costMultiplier, count);
  return Math.floor(
    (c * (Math.pow(costMultiplier, amount) - 1)) / (costMultiplier - 1),
  );
};

export const calculateMaxAffordable = (
  score: number,
  baseCost: number,
  costMultiplier: number,
  count: number,
): { maxAmount: number; totalCost: number } => {
  const c = baseCost * Math.pow(costMultiplier, count);
  if (score < Math.floor(c)) return { maxAmount: 0, totalCost: 0 };
  const maxAmount = Math.floor(
    Math.log((score * (costMultiplier - 1)) / c + 1) / Math.log(costMultiplier),
  );
  let safeAmount = maxAmount;
  let safeCost = calculateMultipleUpgradeCost(
    baseCost,
    costMultiplier,
    count,
    safeAmount,
  );
  while (safeCost > score && safeAmount > 0) {
    safeAmount--;
    safeCost = calculateMultipleUpgradeCost(
      baseCost,
      costMultiplier,
      count,
      safeAmount,
    );
  }
  return { maxAmount: safeAmount, totalCost: safeCost };
};

export const calculateUpgradeCost = (
  baseCost: number,
  costMultiplier: number,
  count: number,
): number => {
  return calculateMultipleUpgradeCost(baseCost, costMultiplier, count, 1);
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

export const calculatePrestigeReward = (
  currentId: number,
  totalClicks: number = 0,
): number => {
  if (currentId < GAME_CONFIG.PRESTIGE_MIN_ID) return 0;
  const clickBonus = Math.floor(Math.sqrt(totalClicks / 500));
  const stageBonus = Math.floor((currentId - 40) / 10);
  const total = stageBonus + clickBonus;
  if (currentId >= GAME_CONFIG.MAX_POKEMON_ID) {
    return total + 5;
  }
  return total;
};

export const calculatePartyUpgradeCost = (level: number): number => {
  return Math.floor(50000 * Math.pow(2, level - 1));
};
