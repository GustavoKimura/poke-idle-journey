import type { Upgrade } from "../types/game";
import { getMilestoneMultiplier, GAME_CONFIG } from "../config/gameConfig";
import { getPokemonDataSync } from "../hooks/usePokeAPI";

export const recalculateTotals = (
  upgrades: Upgrade[],
  unlockedCount: number,
) => {
  let baseClick = 1;
  let basePassive = 0;
  let synergyBonus = 0;
  let passiveToClickPct = 0;

  upgrades.forEach((u) => {
    const mult = getMilestoneMultiplier(u.count);
    if (u.type === "active") {
      if (u.id === "c3" || u.id === "c4") {
        passiveToClickPct += u.count * (u.effect / 100) * mult;
      } else {
        baseClick += u.count * u.effect * mult;
      }
    } else if (u.type === "passive") {
      basePassive += u.count * u.effect * mult;
    } else if (u.type === "synergy") {
      synergyBonus += u.count * u.effect * unlockedCount;
    }
  });

  const finalPassive = basePassive * (1 + synergyBonus);
  const finalClick =
    (baseClick + finalPassive * passiveToClickPct) * (1 + synergyBonus);

  return {
    clickPower: finalClick,
    passiveIncome: finalPassive,
  };
};

export const getAwakeningTier = (level: number) => {
  if (level >= 100)
    return {
      name: "Diamond",
      mult: 10,
      color:
        "border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)] bg-cyan-900/40 text-cyan-300",
    };
  if (level >= 50)
    return {
      name: "Gold",
      mult: 5,
      color:
        "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] bg-yellow-900/40 text-yellow-300",
    };
  if (level >= 25)
    return {
      name: "Silver",
      mult: 3,
      color:
        "border-gray-300 shadow-[0_0_15px_rgba(209,213,219,0.5)] bg-gray-700/40 text-gray-200",
    };
  if (level >= 10)
    return {
      name: "Bronze",
      mult: 2,
      color:
        "border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.5)] bg-orange-900/40 text-orange-300",
    };
  return {
    name: "Basic",
    mult: 1,
    color: "border-pokeYellow bg-black/60 text-white",
  };
};

export const calculatePartyMultiplier = (
  party: number[],
  pokemonLevels: Record<number, number>,
  shinyPokemonIds: number[],
): number => {
  return (
    1 +
    party.reduce((acc, pId) => {
      const isShiny = shinyPokemonIds.includes(pId);
      const level = pokemonLevels[pId] || 1;
      const tier = getAwakeningTier(level);
      const baseMult =
        GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * (isShiny ? 2 : 1) * tier.mult;
      return acc + baseMult * level;
    }, 0)
  );
};

export const calculateTypeSynergyMultiplier = (party: number[]): number => {
  const typeCounts: Record<string, number> = {};
  party.forEach((id) => {
    const data = getPokemonDataSync(id);
    if (data) {
      data.types.forEach((t) => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
    }
  });

  let synergyMult = 1;
  Object.values(typeCounts).forEach((count) => {
    if (count >= 8) synergyMult += 2.0;
    else if (count >= 6) synergyMult += 1.0;
    else if (count >= 3) synergyMult += 0.5;
  });

  return synergyMult;
};

export const getActiveSynergies = (
  party: number[],
): { type: string; count: number; bonus: number }[] => {
  const typeCounts: Record<string, number> = {};
  party.forEach((id) => {
    const data = getPokemonDataSync(id);
    if (data) {
      data.types.forEach((t) => {
        typeCounts[t] = (typeCounts[t] || 0) + 1;
      });
    }
  });

  const active: { type: string; count: number; bonus: number }[] = [];
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count >= 8) active.push({ type, count, bonus: 2.0 });
    else if (count >= 6) active.push({ type, count, bonus: 1.0 });
    else if (count >= 3) active.push({ type, count, bonus: 0.5 });
  });
  return active;
};

export const calculateShinyChance = (
  upgrades: Upgrade[],
  ascensionUpgrades: Record<string, number>,
): number => {
  const shinyCharm = upgrades.find(
    (u) => u.id === "s2" || u.name === "Shiny Charm",
  );
  const charmCount = shinyCharm ? shinyCharm.count : 0;

  const ascensionCount = ascensionUpgrades.shiny_luck || 0;

  const charmBonus = charmCount * 0.001;
  const ascensionBonus = ascensionCount * 0.005;

  return GAME_CONFIG.SHINY_CHANCE + charmBonus + ascensionBonus;
};
