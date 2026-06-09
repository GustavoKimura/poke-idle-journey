import { ArrowUp } from "lucide-react";
import { usePokeAPI } from "../hooks/usePokeAPI";
import { useGameStore } from "../store/useGameStore";
import { GAME_CONFIG, calculatePartyUpgradeCost } from "../config/gameConfig";
import { formatNumber } from "../utils/format";
import type { PartyMember } from "../types/game";

function PartySlot({ member, index }: { member?: PartyMember; index: number }) {
  const { data, isLoading } = usePokeAPI(member?.id || 0);
  const score = useGameStore((state) => state.score);
  const upgradePartyMember = useGameStore((state) => state.upgradePartyMember);

  const upgradeCost = member ? calculatePartyUpgradeCost(member.level) : 0;
  const canAfford = score >= upgradeCost;

  return (
    <div
      className={`relative group w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg flex items-center justify-center overflow-hidden transition-all ${
        member
          ? "bg-black/60 border-pokeYellow shadow-[0_0_8px_rgba(255,222,0,0.3)] cursor-pointer"
          : "bg-black/20 border-white/10"
      }`}
      title={data?.name || "Empty Slot"}
      onClick={() => member && canAfford && upgradePartyMember(member.id)}
    >
      {member && !isLoading && data ? (
        <>
          <img
            src={data.sprite}
            alt={data.name}
            className="w-11 h-11 object-contain drop-shadow-md transition-transform group-hover:opacity-20"
            draggable="false"
          />
          <span className="absolute bottom-0 right-0 bg-pokeYellow text-black text-[9px] font-black px-1 rounded-tl shadow-sm z-10 pointer-events-none group-hover:hidden">
            Lv.{member.level}
          </span>
          <div className="absolute inset-0 bg-black/60 hidden group-hover:flex flex-col items-center justify-center z-20">
            <ArrowUp
              size={16}
              className={canAfford ? "text-green-400" : "text-gray-500"}
            />
            <span
              className={`text-[8px] font-black ${canAfford ? "text-white" : "text-red-400"}`}
            >
              ${formatNumber(upgradeCost)}
            </span>
          </div>
        </>
      ) : (
        <span className="text-white/10 font-black text-xs">{index + 1}</span>
      )}
    </div>
  );
}

export function PartyRoster() {
  const party = useGameStore((state) => state.party);

  return (
    <div className="flex gap-1 sm:gap-2 bg-black/30 p-2 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
      {Array.from({ length: GAME_CONFIG.MAX_PARTY_SIZE }).map((_, i) => (
        <PartySlot key={i} index={i} member={party[i]} />
      ))}
    </div>
  );
}
