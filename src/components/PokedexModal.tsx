import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import { X, Sparkles, Scale } from "lucide-react";

function PokedexEntry({ id }: { id: number }) {
  const { data, isLoading } = usePokeAPI(id);

  if (isLoading || !data) {
    return (
      <div className="h-48 bg-white/5 animate-pulse rounded-xl border border-white/10" />
    );
  }

  return (
    <div className="relative group flex flex-col items-center p-3 bg-black/40 rounded-xl border border-white/10 hover:border-pokeYellow transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-pokeYellow/20 overflow-hidden h-48">
      <span className="absolute top-2 left-2 text-[10px] font-black text-gray-400 bg-black/60 px-1.5 py-0.5 rounded">
        #{id.toString().padStart(3, "0")}
      </span>

      {data.shinySprite && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Sparkles size={12} className="text-pokeYellow" />
        </div>
      )}

      <div className="relative w-20 h-20 mt-4 mb-2 shrink-0">
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

      <span className="font-bold capitalize text-white text-center w-full truncate text-sm mb-1">
        {data.name}
      </span>

      <div className="flex flex-wrap justify-center gap-1 mb-2">
        {data.types.map((type) => (
          <span
            key={type}
            className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-pokeDarkBlue text-gray-300 border border-white/10"
          >
            {type}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1 mt-auto text-[10px] text-gray-400">
        <Scale size={10} />
        <span>{(data.weight / 10).toFixed(1)} kg</span>
      </div>
    </div>
  );
}

export function PokedexModal() {
  const isPokedexOpen = useGameStore((state) => state.isPokedexOpen);
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const unlockedPokemonIds = useGameStore((state) => state.unlockedPokemonIds);

  if (!isPokedexOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
      <div className="bg-gradient-to-b from-pokeDarkBlue to-black border-2 border-pokeYellow rounded-3xl w-full max-w-7xl h-[90vh] flex flex-col shadow-[0_0_50px_rgba(255,222,0,0.15)] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 sm:p-6 flex justify-between items-center border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-4">
            <h2 className="text-xl sm:text-3xl font-black uppercase tracking-widest text-white drop-shadow-md">
              Pokédex
            </h2>
            <span className="px-3 py-1 bg-pokeYellow/20 text-pokeYellow font-bold rounded-full text-xs sm:text-sm border border-pokeYellow/30 whitespace-nowrap">
              {unlockedPokemonIds.length} / 151 Captured
            </span>
          </div>
          <button
            onClick={togglePokedex}
            className="text-gray-400 hover:text-pokeRed transition-colors cursor-pointer"
          >
            <X size={32} />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 custom-scrollbar">
          {unlockedPokemonIds.map((id) => (
            <PokedexEntry key={id} id={id} />
          ))}
        </div>
      </div>
    </div>
  );
}
