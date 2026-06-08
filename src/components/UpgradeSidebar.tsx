import { useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { Upgrade } from "../types/game";

function UpgradeItem({ upgrade }: { upgrade: Upgrade }) {
  const score = useGameStore((state) => state.score);
  const buyUpgrade = useGameStore((state) => state.buyUpgrade);

  const currentCost = useMemo(() => {
    return Math.floor(
      upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count),
    );
  }, [upgrade.baseCost, upgrade.costMultiplier, upgrade.count]);

  const canAfford = score >= currentCost;

  return (
    <button
      onClick={() => buyUpgrade(upgrade.id)}
      disabled={!canAfford}
      className={`w-full p-4 flex flex-col gap-2 rounded-xl border-2 transition-all duration-200 text-left ${
        canAfford
          ? "bg-black/40 border-pokeYellow hover:bg-pokeYellow/10 cursor-pointer"
          : "bg-black/20 border-white/5 opacity-50 cursor-not-allowed"
      }`}
    >
      <div className="flex justify-between items-center">
        <span
          className={`font-bold text-lg ${canAfford ? "text-white" : "text-gray-400"}`}
        >
          {upgrade.name}
        </span>
        <span className="text-xs font-black bg-black/50 px-2 py-1 rounded text-gray-300">
          Lvl {upgrade.count}
        </span>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-1">
          <span className="text-pokeYellow font-bold">$</span>
          <span
            className={canAfford ? "text-white" : "text-pokeRed font-semibold"}
          >
            {currentCost.toLocaleString()}
          </span>
        </div>
        <span className="text-sm text-blue-300 font-medium">
          +{upgrade.effect} {upgrade.type === "active" ? "/ click" : "/ sec"}
        </span>
      </div>
    </button>
  );
}

export function UpgradeSidebar() {
  const upgrades = useGameStore((state) => state.upgrades);

  return (
    <aside className="w-96 bg-pokeDarkBlue border-l-4 border-pokeYellow/20 flex flex-col h-full shadow-2xl z-10">
      <div className="p-6 bg-black/20 border-b border-white/5">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase text-center">
          Upgrades
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {upgrades.map((upgrade) => (
          <UpgradeItem key={upgrade.id} upgrade={upgrade} />
        ))}
      </div>
    </aside>
  );
}
