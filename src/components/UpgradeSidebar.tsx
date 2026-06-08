import { formatNumber } from "../utils/format";
import {
  useUpgradeItemVM,
  useUpgradesListVM,
} from "../viewmodels/useUpgradesVM";
import type { Upgrade } from "../types/game";
import { getMilestoneMultiplier, getNextMilestone } from "../config/gameConfig";

function UpgradeItem({ upgrade }: { upgrade: Upgrade }) {
  const { currentCost, canAfford, handleBuy } = useUpgradeItemVM(upgrade);

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
          Lvl {upgrade.count}
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
            className={canAfford ? "text-white" : "text-pokeRed font-semibold"}
          >
            {formatNumber(currentCost)}
          </span>
        </div>
        <span className="text-sm text-blue-300 font-medium">
          +{formatNumber(upgrade.effect * currentMultiplier)}{" "}
          {upgrade.type === "active" ? "/ click" : "/ sec"}
        </span>
      </div>
    </button>
  );
}

export function UpgradeSidebar() {
  const { upgrades } = useUpgradesListVM();

  return (
    <aside className="w-96 bg-pokeDarkBlue border-l-4 border-pokeYellow/20 flex flex-col h-full shadow-2xl z-10">
      <div className="p-6 bg-black/20 border-b border-white/5">
        <h2 className="text-2xl font-black text-white tracking-widest uppercase text-center drop-shadow-md">
          Upgrades
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {upgrades.map((upgrade) => (
          <UpgradeItem key={upgrade.id} upgrade={upgrade} />
        ))}
      </div>
    </aside>
  );
}
