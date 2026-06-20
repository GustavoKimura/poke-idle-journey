import { useState, useEffect } from "react";
import { Sword } from "lucide-react";
import { usePokeAPI } from "../hooks/usePokeAPI";
import { useGameStore } from "../store/useGameStore";
import { GAME_CONFIG, TYPE_WEAKNESSES } from "../config/gameConfig";
import { getAwakeningTier } from "../utils/calculations";

function PartySlot({ id, index }: { id?: number; index: number }) {
  const { data, isLoading } = usePokeAPI(id || 0);
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const pokemonLevels = useGameStore((state) => state.pokemonLevels);
  const isShiny = useGameStore((state) =>
    id ? state.shinyPokemonIds.includes(id) : false,
  );
  const triggerPartyAbility = useGameStore(
    (state) => state.triggerPartyAbility,
  );
  const upgradePokemon = useGameStore((state) => state.upgradePokemon);
  const score = useGameStore((state) => state.score);
  const cdEnd = useGameStore((state) =>
    id ? state.partyCooldowns[id] || 0 : 0,
  );

  const { data: targetData } = usePokeAPI(currentPokemonId);

  const [cdLeft, setCdLeft] = useState(0);

  useEffect(() => {
    if (!id) return;
    const timer = setInterval(() => {
      setCdLeft(Math.max(0, cdEnd - Date.now()));
    }, 100);
    return () => clearInterval(timer);
  }, [id, cdEnd]);

  const isOnCd = cdLeft > 0;
  const cdPct = isOnCd ? (cdLeft / 30000) * 100 : 0;
  const memberLevel = id ? pokemonLevels[id] || 1 : 0;
  const tier = getAwakeningTier(memberLevel);
  const upgradeCost = id ? Math.floor(50000 * Math.pow(2, memberLevel - 1)) : 0;
  const canAfford = score >= upgradeCost;

  const targetWeaknesses =
    targetData?.types.flatMap((t) => TYPE_WEAKNESSES[t] || []) || [];
  const hasAdvantage =
    id && data?.types.some((t) => targetWeaknesses.includes(t));

  const handleClick = (e: React.MouseEvent) => {
    if (!id) return;
    if (e.shiftKey) {
      if (canAfford) upgradePokemon(id);
    } else {
      if (!isOnCd) triggerPartyAbility(id);
    }
  };

  return (
    <div
      className={`relative group w-10 h-10 sm:w-12 sm:h-12 border-2 rounded-lg flex items-center justify-center overflow-hidden transition-all ${
        id
          ? isOnCd
            ? "bg-black/80 border-gray-600 cursor-not-allowed"
            : `${tier.color} cursor-pointer hover:scale-105`
          : "bg-black/20 border-white/10"
      }`}
      title={
        data?.name
          ? isOnCd
            ? "Ability on Cooldown"
            : "Click: Special Attack | Shift+Click: Upgrade"
          : "Empty Slot"
      }
      onClick={handleClick}
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
            className={`w-11 h-11 object-contain drop-shadow-md transition-transform ${!isOnCd ? "group-hover:opacity-20" : "opacity-40 grayscale"}`}
            draggable="false"
          />
          {hasAdvantage && (
            <div className="absolute top-0 right-0 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm z-10 pointer-events-none flex items-center justify-center border-b border-l border-green-300">
              x3
            </div>
          )}
          <span
            className={`absolute bottom-0 right-0 bg-black/60 text-white text-[9px] font-black px-1 rounded-tl shadow-sm z-10 pointer-events-none ${!isOnCd && "group-hover:hidden"}`}
          >
            Lv.{memberLevel}
          </span>

          {isOnCd && (
            <div className="absolute inset-0 bg-black/50 z-30 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-white text-[10px] font-black z-40 drop-shadow-md">
                {(cdLeft / 1000).toFixed(1)}s
              </span>
              <div
                className="absolute bottom-0 w-full bg-red-500/50 transition-all ease-linear"
                style={{ height: `${cdPct}%` }}
              />
            </div>
          )}

          {!isOnCd && (
            <div className="absolute inset-0 bg-black/80 hidden group-hover:flex flex-col items-center justify-center z-20">
              <Sword size={14} className="text-pokeYellow mb-0.5" />
              <span
                className={`text-[7px] font-black text-center px-1 leading-tight ${canAfford ? "text-green-400" : "text-gray-500"}`}
              >
                Shift: Up
              </span>
            </div>
          )}
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
