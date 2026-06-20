import React, { useState } from "react";
import { formatNumber } from "../utils/format";
import { useUpgradeItemVM } from "../viewmodels/useUpgradesVM";
import type { BuyMultiplierOption } from "../viewmodels/useUpgradesVM";
import { getMilestoneMultiplier, getNextMilestone } from "../config/gameConfig";
import { useGameStore } from "../store/useGameStore";
import { Lock } from "lucide-react";

const MULTIPLIERS: BuyMultiplierOption[] = [1, 10, 100, "max"];

const UpgradeItem = React.memo(
  ({
    id,
    buyMultiplier,
  }: {
    id: string;
    buyMultiplier: BuyMultiplierOption;
  }) => {
    const { upgrade, currentCost, amountToBuy, canAfford, handleBuy } =
      useUpgradeItemVM(id, buyMultiplier);

    const currentMultiplier = getMilestoneMultiplier(upgrade.count);
    const nextMilestone = getNextMilestone(upgrade.count);

    return (
      <button
        onClick={handleBuy}
        disabled={!canAfford}
        className={`w-full p-4 flex flex-col gap-2 rounded-xl border-2 transition-all duration-200 text-left ${
          canAfford
            ? "bg-black/40 border-pokeYellow hover:bg-pokeYellow/10 cursor-pointer"
            : "bg-black/20 border-white/5 opacity-50 cursor-not-allowed"
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span
              className={`font-bold text-lg ${canAfford ? "text-white" : "text-gray-400"}`}
            >
              {upgrade.name}
            </span>
            {currentMultiplier > 1 && (
              <span className="text-[10px] uppercase font-black bg-pokeYellow/20 text-pokeYellow px-1.5 py-0.5 rounded border border-pokeYellow/30 shadow-[0_0_8px_rgba(255,222,0,0.3)]">
                x{currentMultiplier}
              </span>
            )}
          </div>
          <span className="text-xs font-black bg-black/50 px-2 py-1 rounded text-gray-300">
            Lvl {upgrade.count}{" "}
            {amountToBuy > 1 && (
              <span className="text-pokeYellow">(+{amountToBuy})</span>
            )}
          </span>
        </div>

        {nextMilestone && (
          <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-blue-400 h-full transition-all duration-300"
              style={{ width: `${(upgrade.count / nextMilestone) * 100}%` }}
            />
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center gap-1">
            <span className="text-pokeYellow font-bold">$</span>
            <span
              className={
                canAfford ? "text-white" : "text-pokeRed font-semibold"
              }
            >
              {formatNumber(currentCost)}
            </span>
          </div>
          <span className="text-sm text-blue-300 font-medium">
            +
            {formatNumber(
              upgrade.effect *
                currentMultiplier *
                (upgrade.type === "synergy" ? 100 : 1),
            )}
            {upgrade.id === "c3" || upgrade.id === "c4"
              ? "% CpS / click"
              : upgrade.type === "active"
                ? " / click"
                : upgrade.type === "synergy"
                  ? "% / catch"
                  : " / sec"}
          </span>
        </div>
      </button>
    );
  },
);

export function UpgradeSidebar() {
  const upgradeIdsHash = useGameStore((state) =>
    state.upgrades.map((u) => u.id).join(","),
  );

  const highestUnlocked = useGameStore(
    (state) => state.historicalUnlockedPokemonIds.length,
  );
  const hasPrestiged = useGameStore((state) => state.rareCandies > 0);
  const showUpgrades = highestUnlocked >= 3 || hasPrestiged;

  const [buyMultiplier, setBuyMultiplier] = useState<BuyMultiplierOption>(1);

  if (!showUpgrades) {
    return (
      <aside className="w-full lg:w-96 h-[45%] lg:h-full shrink-0 bg-pokeDarkBlue border-t-4 lg:border-t-0 lg:border-l-4 border-pokeYellow/20 flex flex-col shadow-2xl z-20">
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-black/40 border border-white/5 m-4 rounded-2xl">
          <Lock size={48} className="mb-4 text-gray-500 animate-pulse" />
          <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest mb-2">
            Locked Area
          </h2>
          <p className="text-gray-500 text-sm">
            Defeat 3 Pokémon to unlock the Trainer Upgrades store.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-96 h-[45%] lg:h-full shrink-0 bg-pokeDarkBlue border-t-4 lg:border-t-0 lg:border-l-4 border-pokeYellow/20 flex flex-col shadow-2xl z-20">
      <div className="p-4 bg-black/20 border-b border-white/5 flex flex-col gap-4">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase text-center drop-shadow-md mt-2">
          Upgrades
        </h2>
        <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
          {MULTIPLIERS.map((mult) => (
            <button
              key={mult}
              onClick={() => setBuyMultiplier(mult)}
              className={`flex-1 py-1.5 text-xs font-black uppercase rounded-md transition-all ${
                buyMultiplier === mult
                  ? "bg-pokeYellow text-black shadow-[0_0_10px_rgba(255,222,0,0.3)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {typeof mult === "number" ? `x${mult}` : mult}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {upgradeIdsHash.split(",").map((id) => (
          <UpgradeItem key={id} id={id} buyMultiplier={buyMultiplier} />
        ))}
      </div>
    </aside>
  );
}
