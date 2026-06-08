import { useGameStore } from "../store/useGameStore";
import { playUpgradeSound } from "../utils/audio";
import { calculateUpgradeCost } from "../config/gameConfig";

export function useUpgradeItemVM(id: string) {
  const upgrade = useGameStore(
    (state) => state.upgrades.find((u) => u.id === id)!,
  );

  const currentCost = calculateUpgradeCost(
    upgrade.baseCost,
    upgrade.costMultiplier,
    upgrade.count,
  );

  const canAfford = useGameStore((state) => state.score >= currentCost);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  const handleBuy = () => {
    if (canAfford) {
      buyUpgrade(upgrade.id);
      playUpgradeSound();
    }
  };

  return {
    upgrade,
    currentCost,
    canAfford,
    handleBuy,
  };
}
