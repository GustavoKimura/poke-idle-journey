import type { Upgrade } from "../types/game";
import { getMilestoneMultiplier } from "../config/gameConfig";

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
