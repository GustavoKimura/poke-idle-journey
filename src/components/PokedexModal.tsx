import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import { ChevronLeft, ChevronRight, ArrowUp } from "lucide-react";
import {
  GAME_CONFIG,
  calculatePartyUpgradeCost,
  TYPE_BADGE_COLORS,
  TYPE_ICONS,
} from "../config/gameConfig";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { formatNumber } from "../utils/format";

function PokedexEntry({
  id,
  maxPartySize,
}: {
  id: number;
  maxPartySize: number;
}) {
  const { data, isLoading } = usePokeAPI(id);
  const isEquipped = useGameStore((state) => state.party.includes(id));
  const isShiny = useGameStore((state) => state.shinyPokemonIds.includes(id));
  const memberLevel = useGameStore((state) => state.pokemonLevels[id] || 1);
  const partyLength = useGameStore((state) => state.party.length);
  const togglePartyMember = useGameStore((state) => state.togglePartyMember);
  const upgradePokemon = useGameStore((state) => state.upgradePokemon);
  const discountLevels = useGameStore(
    (state) => state.ascensionUpgrades.party_discount || 0,
  );

  const upgradeCost = calculatePartyUpgradeCost(memberLevel, discountLevels);
  const canAffordUpgrade = useGameStore((state) => state.score >= upgradeCost);

  const handleToggle = () => {
    if (!isEquipped && partyLength >= maxPartySize) return;
    togglePartyMember(id);
  };

  if (isLoading || !data) {
    return (
      <div className="h-[15.5rem] bg-white/5 animate-pulse rounded-xl border border-white/10" />
    );
  }

  return (
    <div
      className={`relative group flex flex-col items-center p-3 bg-black/40 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden h-[15.5rem] ${
        isEquipped
          ? "border-pokeYellow shadow-[0_0_15px_rgba(255,222,0,0.2)]"
          : isShiny
            ? "border-yellow-400/50 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.2)]"
            : "border-white/10 hover:border-pokeYellow hover:shadow-pokeYellow/20"
      }`}
    >
      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 bg-black/60 px-1.5 py-0.5 rounded z-10 flex gap-1 items-center">
        #{id.toString().padStart(3, "0")}
        <span className="text-pokeYellow">Lv.{memberLevel}</span>
      </span>

      {isShiny && (
        <span
          className="absolute top-2 right-2 text-xs z-10 drop-shadow-[0_0_5px_rgba(255,222,0,0.8)]"
          title="Shiny Captured!"
        >
          ✨
        </span>
      )}

      <div className="relative w-20 h-20 mt-4 mb-2 shrink-0 pointer-events-none">
        <img
          src={isShiny ? data.shinySprite : data.sprite}
          alt={data.name}
          className="absolute inset-0 w-full h-full object-contain drop-shadow-md"
        />
      </div>

      <span className="font-bold capitalize text-white text-center w-full truncate text-sm mb-1 pointer-events-none flex items-center justify-center gap-1">
        {data.name}
      </span>

      <div className="flex flex-wrap justify-center gap-1 mb-2 pointer-events-none">
        {data.types.map((type) => (
          <span
            key={type}
            className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${TYPE_BADGE_COLORS[type] || "bg-pokeDarkBlue text-gray-300 border-white/10"}`}
          >
            <span className="text-xs">{TYPE_ICONS[type]}</span>
            {type}
          </span>
        ))}
      </div>

      <div className="mt-auto w-full flex flex-col gap-1.5 pt-2 border-t border-white/5">
        <button
          onClick={() => upgradePokemon(id)}
          disabled={!canAffordUpgrade}
          className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
            canAffordUpgrade
              ? "bg-green-500 hover:bg-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)] cursor-pointer"
              : "bg-black/50 text-gray-500 border border-white/10 cursor-not-allowed"
          }`}
        >
          <ArrowUp size={12} /> ${formatNumber(upgradeCost)}
        </button>
        <button
          onClick={handleToggle}
          disabled={!isEquipped && partyLength >= maxPartySize}
          className={`w-full py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
            isEquipped
              ? "bg-pokeRed/80 hover:bg-pokeRed text-white"
              : partyLength >= maxPartySize
                ? "bg-black/50 text-gray-500 border border-white/10 cursor-not-allowed"
                : "bg-black/60 text-white border border-white/20 hover:border-pokeYellow hover:text-pokeYellow"
          }`}
        >
          {isEquipped ? "Unequip" : "Equip"}
        </button>
      </div>
    </div>
  );
}

export function PokedexModal() {
  const isPokedexOpen = useGameStore((state) => state.isPokedexOpen);
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const unlockedPokemonIds = useGameStore((state) => state.unlockedPokemonIds);
  const partyLength = useGameStore((state) => state.party.length);
  const extraPartySlots = useGameStore(
    (state) => state.ascensionUpgrades.party_size || 0,
  );

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const totalPages = Math.ceil(unlockedPokemonIds.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visiblePokemonIds = unlockedPokemonIds.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const maxPartySize = GAME_CONFIG.MAX_PARTY_SIZE + extraPartySlots;

  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  const headerRight = (
    <div className="flex gap-2 ml-4">
      <span className="px-3 py-1 bg-blue-900/40 text-blue-300 font-bold rounded-full text-xs sm:text-sm border border-blue-500/30 whitespace-nowrap">
        Party: {partyLength} / {maxPartySize}
      </span>
      <span className="px-3 py-1 bg-pokeYellow/20 text-pokeYellow font-bold rounded-full text-xs sm:text-sm border border-pokeYellow/30 whitespace-nowrap hidden sm:inline-block">
        {unlockedPokemonIds.length} / {GAME_CONFIG.MAX_POKEMON_ID} Captured
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isPokedexOpen}
      onClose={togglePokedex}
      title="Pokédex"
      maxWidth="7xl"
      headerRight={headerRight}
      closeOnOutsideClick
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 flex-1 min-h-[50vh]">
          {visiblePokemonIds.map((id) => (
            <PokedexEntry key={id} id={id} maxPartySize={maxPartySize} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/10 shrink-0">
            <Button
              variant="glass"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="px-4 py-2"
            >
              <ChevronLeft size={24} />
            </Button>
            <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              Page <span className="text-white text-lg">{currentPage}</span> of{" "}
              <span className="text-white text-lg">{totalPages}</span>
            </span>
            <Button
              variant="glass"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="px-4 py-2"
            >
              <ChevronRight size={24} />
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
