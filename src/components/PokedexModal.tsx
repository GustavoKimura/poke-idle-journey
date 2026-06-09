import { useState } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import {
  Sparkles,
  Scale,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
} from "lucide-react";
import {
  GAME_CONFIG,
  calculatePartyUpgradeCost,
  TYPE_BADGE_COLORS,
} from "../config/gameConfig";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { formatNumber } from "../utils/format";

function PokedexEntry({ id }: { id: number }) {
  const { data, isLoading } = usePokeAPI(id);
  const partyMember = useGameStore((state) =>
    state.party.find((p) => p.id === id),
  );
  const isEquipped = !!partyMember;
  const partyLength = useGameStore((state) => state.party.length);
  const togglePartyMember = useGameStore((state) => state.togglePartyMember);
  const upgradePartyMember = useGameStore((state) => state.upgradePartyMember);

  const upgradeCost = partyMember
    ? calculatePartyUpgradeCost(partyMember.level)
    : 0;
  const canAffordUpgrade = useGameStore((state) => state.score >= upgradeCost);

  const handleToggle = () => {
    if (!isEquipped && partyLength >= GAME_CONFIG.MAX_PARTY_SIZE) return;
    togglePartyMember(id);
  };

  if (isLoading || !data) {
    return (
      <div className="h-56 bg-white/5 animate-pulse rounded-xl border border-white/10" />
    );
  }

  return (
    <div
      className={`relative group flex flex-col items-center p-3 bg-black/40 rounded-xl border transition-all hover:-translate-y-1 hover:shadow-lg overflow-hidden h-56 ${
        isEquipped
          ? "border-pokeYellow shadow-[0_0_15px_rgba(255,222,0,0.2)]"
          : "border-white/10 hover:border-pokeYellow hover:shadow-pokeYellow/20"
      }`}
    >
      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 bg-black/60 px-1.5 py-0.5 rounded z-10 flex gap-1 items-center">
        #{id.toString().padStart(3, "0")}
        {isEquipped && (
          <span className="text-pokeYellow">Lv.{partyMember.level}</span>
        )}
      </span>

      {data.shinySprite && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Sparkles size={12} className="text-pokeYellow" />
        </div>
      )}

      <div className="relative w-20 h-20 mt-4 mb-2 shrink-0 pointer-events-none">
        <img
          src={data.sprite}
          alt={data.name}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0 drop-shadow-md"
        />
        {data.shinySprite && (
          <img
            src={data.shinySprite}
            alt={`${data.name} shiny`}
            className="absolute inset-0 w-full h-full object-contain opacity-0 transition-opacity duration-300 group-hover:opacity-100 drop-shadow-lg"
          />
        )}
      </div>

      <span className="font-bold capitalize text-white text-center w-full truncate text-sm mb-1 pointer-events-none">
        {data.name}
      </span>

      <div className="flex flex-wrap justify-center gap-1 mb-2 pointer-events-none">
        {data.types.map((type) => (
          <span
            key={type}
            className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full border shadow-sm ${TYPE_BADGE_COLORS[type] || "bg-pokeDarkBlue text-gray-300 border-white/10"}`}
          >
            {type}
          </span>
        ))}
      </div>

      <div className="mt-auto w-full flex flex-col gap-1">
        <div
          className={`flex justify-center items-center gap-1 text-[10px] text-gray-400 transition-opacity ${
            isEquipped ? "hidden" : "group-hover:hidden"
          }`}
        >
          <Scale size={10} />
          <span>{(data.weight / 10).toFixed(1)} kg</span>
        </div>

        {isEquipped ? (
          <>
            <button
              onClick={() => upgradePartyMember(id)}
              disabled={!canAffordUpgrade}
              className={`w-full py-1 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1 ${
                canAffordUpgrade
                  ? "bg-green-500 hover:bg-green-400 text-white shadow-[0_0_10px_rgba(34,197,94,0.3)] cursor-pointer"
                  : "bg-black/50 text-gray-500 border border-white/10 cursor-not-allowed"
              }`}
            >
              <ArrowUp size={10} /> ${formatNumber(upgradeCost)}
            </button>
            <button
              onClick={handleToggle}
              className="w-full py-1 rounded-lg text-[9px] font-black uppercase bg-pokeRed/80 hover:bg-pokeRed text-white transition-all cursor-pointer hidden group-hover:block"
            >
              Unequip
            </button>
          </>
        ) : (
          <button
            onClick={handleToggle}
            disabled={partyLength >= GAME_CONFIG.MAX_PARTY_SIZE}
            className={`w-full py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
              partyLength >= GAME_CONFIG.MAX_PARTY_SIZE
                ? "bg-black/50 text-gray-500 cursor-not-allowed border border-white/10 hidden group-hover:block"
                : "bg-black/60 text-white border border-white/20 hover:border-pokeYellow hover:text-pokeYellow hidden group-hover:block"
            }`}
          >
            Equip
          </button>
        )}
      </div>
    </div>
  );
}

export function PokedexModal() {
  const isPokedexOpen = useGameStore((state) => state.isPokedexOpen);
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const unlockedPokemonIds = useGameStore((state) => state.unlockedPokemonIds);
  const partyLength = useGameStore((state) => state.party.length);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  const totalPages = Math.ceil(unlockedPokemonIds.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visiblePokemonIds = unlockedPokemonIds.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));

  const headerRight = (
    <div className="flex gap-2 ml-4">
      <span className="px-3 py-1 bg-blue-900/40 text-blue-300 font-bold rounded-full text-xs sm:text-sm border border-blue-500/30 whitespace-nowrap">
        Party: {partyLength} / {GAME_CONFIG.MAX_PARTY_SIZE}
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
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 flex-1 min-h-[50vh]">
          {visiblePokemonIds.map((id) => (
            <PokedexEntry key={id} id={id} />
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
