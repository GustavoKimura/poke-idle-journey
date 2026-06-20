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

  upgrades.forEach((u) => {
    const mult = getMilestoneMultiplier(u.count);
    if (u.type === "active") {
      baseClick += u.count * u.effect * mult;
    } else if (u.type === "passive") {
      basePassive += u.count * u.effect * mult;
    } else if (u.type === "synergy") {
      synergyBonus += u.count * u.effect * unlockedCount;
    }
  });

  return {
    clickPower: baseClick * (1 + synergyBonus),
    passiveIncome: basePassive * (1 + synergyBonus),
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
      const mult = isShiny
        ? GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * 2
        : GAME_CONFIG.PARTY_MEMBER_MULTIPLIER;
      return acc + mult * (pokemonLevels[pId] || 1);
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
    if (count >= 6) synergyMult += 1.0;
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
    if (count >= 6) active.push({ type, count, bonus: 1.0 });
    else if (count >= 3) active.push({ type, count, bonus: 0.5 });
  });
  return active;
};
