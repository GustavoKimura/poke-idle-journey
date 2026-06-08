import { formatNumber } from "../utils/format";
import { useMainStageVM } from "../viewmodels/useMainStageVM";
import { Button } from "./ui/Button";
import { GAME_CONFIG, calculatePrestigeReward } from "../config/gameConfig";

export function MainStage() {
  const {
    pokemon,
    isLoading,
    currentPokemonId,
    nextPokemonCost,
    canUnlock,
    isMaxLevel,
    handlePointerDown,
    stopHold,
    handleCatch,
    handlePrestige,
  } = useMainStageVM();

  return (
    <main className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-b from-pokeDarkBlue to-black overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-8 flex flex-col items-center gap-2 z-10">
        <span className="text-gray-400 font-bold tracking-widest uppercase">
          Current Target
        </span>
        <div className="bg-black/40 border border-white/10 px-6 py-2 rounded-full flex gap-4 items-center shadow-lg">
          <span className="text-pokeYellow font-bold">#{currentPokemonId}</span>
          <span className="text-white capitalize font-medium">
            {pokemon?.name || "Loading..."}
          </span>
        </div>
      </div>

      <div
        className={`relative cursor-pointer transition-transform duration-75 active:scale-95 hover:scale-105 z-10 ${
          isLoading ? "opacity-50" : "opacity-100"
        }`}
        onPointerDown={handlePointerDown}
        onPointerUp={stopHold}
        onPointerLeave={stopHold}
        onContextMenu={(e) => {
          e.preventDefault();
          stopHold();
        }}
      >
        {pokemon?.sprite && (
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-80 h-80 drop-shadow-2xl select-none hover:brightness-125 transition-all duration-200"
            draggable="false"
          />
        )}
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10">
        {!isMaxLevel ? (
          <div className="flex flex-col items-center gap-4">
            <span className="text-sm text-gray-400 font-semibold uppercase">
              Next Capture:{" "}
              <span className="text-pokeRed font-bold">
                ${formatNumber(nextPokemonCost)}
              </span>
            </span>
            <div className="flex gap-4">
              <Button onClick={handleCatch} disabled={!canUnlock}>
                Catch Next Pokemon
              </Button>
              {currentPokemonId >= GAME_CONFIG.PRESTIGE_MIN_ID && (
                <Button
                  variant="outline"
                  onClick={handlePrestige}
                  className="bg-transparent border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                >
                  Prestige (+{calculatePrestigeReward(currentPokemonId)} Candy)
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            <span className="text-sm text-pink-400 font-black uppercase tracking-widest animate-pulse">
              Maximum Level Reached!
            </span>
            <Button
              onClick={handlePrestige}
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-2 border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
            >
              Prestige (+{calculatePrestigeReward(currentPokemonId)} Rare Candy)
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
