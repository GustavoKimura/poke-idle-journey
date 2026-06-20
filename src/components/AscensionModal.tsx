import { Sparkles, ArrowUpCircle } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useGameStore } from "../store/useGameStore";
import {
  ASCENSION_UPGRADES,
  calculateAscensionCost,
} from "../config/gameConfig";
import { formatNumber } from "../utils/format";
import { playUpgradeSound } from "../utils/audio";

export function AscensionModal() {
  const isOpen = useGameStore((state) => state.isAscensionModalOpen);
  const toggle = useGameStore((state) => state.toggleAscensionModal);
  const rareCandies = useGameStore((state) => state.rareCandies);
  const ascensionUpgrades = useGameStore((state) => state.ascensionUpgrades);
  const buyAscensionUpgrade = useGameStore(
    (state) => state.buyAscensionUpgrade,
  );

  const handleBuy = (id: string) => {
    buyAscensionUpgrade(id);
    playUpgradeSound();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={toggle}
      title="Ascension Skill Tree"
      icon={<Sparkles size={28} className="text-pink-400" />}
      maxWidth="4xl"
      closeOnOutsideClick
    >
      <div className="flex flex-col items-center mb-6 bg-pink-900/20 p-4 rounded-xl border border-pink-500/30">
        <span className="text-pink-300 font-bold uppercase tracking-widest text-sm mb-1">
          Available Rare Candies
        </span>
        <span className="text-4xl font-black text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
          {formatNumber(rareCandies)}
        </span>
        <p className="text-xs text-pink-200 mt-2 text-center">
          Unspent candies give a passive +10% multiplier. Spend them here for
          massive permanent boosts!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {ASCENSION_UPGRADES.map((upgrade) => {
          const currentLevel = ascensionUpgrades[upgrade.id] || 0;
          const isMax = currentLevel >= upgrade.maxLevel;
          const cost = calculateAscensionCost(
            upgrade.baseCost,
            upgrade.costMultiplier,
            currentLevel,
          );
          const canAfford = rareCandies >= cost && !isMax;

          return (
            <div
              key={upgrade.id}
              className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col justify-between hover:border-pink-500/50 transition-colors shadow-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-white text-lg flex items-center gap-2">
                    {upgrade.name}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1">{upgrade.desc}</p>
                </div>
                <span className="bg-pink-500/20 text-pink-300 text-[10px] font-black px-2 py-1 rounded border border-pink-500/30 whitespace-nowrap">
                  LVL {currentLevel} {isMax ? "(MAX)" : `/ ${upgrade.maxLevel}`}
                </span>
              </div>

              <Button
                variant={canAfford ? "primary" : "ghost"}
                fullWidth
                disabled={!canAfford || isMax}
                onClick={() => handleBuy(upgrade.id)}
                className={
                  canAfford
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-0 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                    : ""
                }
              >
                {isMax ? (
                  "Maxed Out"
                ) : (
                  <>
                    <ArrowUpCircle size={18} />
                    Cost: {formatNumber(cost)} Candies
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
