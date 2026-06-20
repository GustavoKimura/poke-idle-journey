import { ArrowUp } from "lucide-react";
import { usePokeAPI } from "../hooks/usePokeAPI";
import { useGameStore } from "../store/useGameStore";
import {
  GAME_CONFIG,
  calculatePartyUpgradeCost,
  TYPE_WEAKNESSES,
} from "../config/gameConfig";
import { formatNumber } from "../utils/format";

function PartySlot({ id, index }: { id?: number; index: number }) {
  const { data, isLoading } = usePokeAPI(id || 0);
  const score = useGameStore((state) => state.score);
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const pokemonLevels = useGameStore((state) => state.pokemonLevels);
  const isShiny = useGameStore((state) =>
    id ? state.shinyPokemonIds.includes(id) : false,
  );
  const upgradePokemon = useGameStore((state) => state.upgradePokemon);
  const { data: targetData } = usePokeAPI(currentPokemonId);

  const memberLevel = id ? pokemonLevels[id] || 1 : 0;
  const upgradeCost = id ? calculatePartyUpgradeCost(memberLevel) : 0;
  const canAfford = score >= upgradeCost;

  const targetWeaknesses =
    targetData?.types.flatMap((t) => TYPE_WEAKNESSES[t] || []) || [];
  const hasAdvantage =
    id && data?.types.some((t) => targetWeaknesses.includes(t));

  return (
    <div
      className={`relative group w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg flex items-center justify-center overflow-hidden transition-all ${
        id
          ? "bg-black/60 border-pokeYellow shadow-[0_0_8px_rgba(255,222,0,0.3)] cursor-pointer"
          : "bg-black/20 border-white/10"
      }`}
      title={data?.name || "Empty Slot"}
      onClick={() => id && canAfford && upgradePokemon(id)}
    >
      {id && !isLoading && data ? (
        <>
          {isShiny && (
            <div className="absolute top-0 left-0 text-[8px] z-10 pointer-events-none drop-shadow-[0_0_2px_rgba(255,222,0,1)]">
              ✨
            </div>
          )}
          <img
            src={isShiny ? data.shinySprite : data.sprite}
            alt={data.name}
            className="w-11 h-11 object-contain drop-shadow-md transition-transform group-hover:opacity-20"
            draggable="false"
          />
          {hasAdvantage && (
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm z-10 pointer-events-none flex items-center justify-center border-b border-l border-green-300">
              x3
            </div>
          )}
          <span className="absolute bottom-0 right-0 bg-pokeYellow text-black text-[9px] font-black px-1 rounded-tl shadow-sm z-10 pointer-events-none group-hover:hidden">
            Lv.{memberLevel}
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
  const extraPartySlots = useGameStore(
    (state) => state.ascensionUpgrades.party_size || 0,
  );
  const maxPartySize = GAME_CONFIG.MAX_PARTY_SIZE + extraPartySlots;

  return (
    <div className="flex gap-1 sm:gap-2 bg-black/30 p-2 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl">
      {Array.from({ length: maxPartySize }).map((_, i) => (
        <PartySlot key={i} index={i} id={party[i]} />
      ))}
    </div>
  );
}
