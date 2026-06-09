import { useGameStore } from "../store/useGameStore";
import { playUpgradeSound } from "../utils/audio";
import {
  calculateMultipleUpgradeCost,
  calculateMaxAffordable,
} from "../config/gameConfig";

export type BuyMultiplierOption = 1 | 10 | 100 | "max";

export function useUpgradeItemVM(
  id: string,
  buyMultiplier: BuyMultiplierOption,
) {
  const upgrade = useGameStore(
    (state) => state.upgrades.find((u) => u.id === id)!,
  );
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  const fixedCost =
    buyMultiplier !== "max"
      ? calculateMultipleUpgradeCost(
          upgrade.baseCost,
          upgrade.costMultiplier,
          upgrade.count,
          buyMultiplier,
        )
      : 0;

  const maxAffordableStr = useGameStore((state) => {
    if (buyMultiplier !== "max") return "0,0";
    const res = calculateMaxAffordable(
      state.score,
      upgrade.baseCost,
      upgrade.costMultiplier,
      upgrade.count,
    );
    return `${res.maxAmount},${res.totalCost}`;
  });

  const canAffordFixed = useGameStore((state) => {
    if (buyMultiplier === "max") return false;
    return state.score >= fixedCost;
  });

  let actualCost = fixedCost;
  let actualAmount = buyMultiplier !== "max" ? buyMultiplier : 0;
  let canAfford = canAffordFixed;

  if (buyMultiplier === "max") {
    const [maxAmt, totCost] = maxAffordableStr.split(",").map(Number);
    actualCost = totCost;
    actualAmount = maxAmt;
    canAfford = actualAmount > 0;
  }

  const handleBuy = () => {
    if (canAfford) {
      buyUpgrade(upgrade.id, actualAmount);
      playUpgradeSound();
    }
  };

  return {
    upgrade,
    currentCost: actualCost,
    amountToBuy: actualAmount,
    canAfford,
    handleBuy,
  };
}
