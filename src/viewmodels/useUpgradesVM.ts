import { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { playUpgradeSound } from "../utils/audio";
import { calculateUpgradeCost } from "../config/gameConfig";
import type { Upgrade } from "../types/game";

export function useUpgradeItemVM(upgrade: Upgrade) {
  const score = useGameStore((state) => state.score);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  const currentCost = useMemo(() => {
    return calculateUpgradeCost(
      upgrade.baseCost,
      upgrade.costMultiplier,
      upgrade.count,
    );
  }, [upgrade.baseCost, upgrade.costMultiplier, upgrade.count]);

  const canAfford = score >= currentCost;

  const handleBuy = () => {
    if (canAfford) {
      buyUpgrade(upgrade.id);
      playUpgradeSound();
    }
  };

  return {
    currentCost,
    canAfford,
    handleBuy,
  };
}

export function useUpgradesListVM() {
  const upgrades = useGameStore((state) => state.upgrades);
  return { upgrades };
}
