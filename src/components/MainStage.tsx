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
    isBossLevel,
    isBossActive,
    bossHp,
    bossMaxHp,
    bossTimeLeft,
    isCatching,
    spawnFlash,
    bgGradient,
    handlePointerDown,
    stopHold,
    handleStartBoss,
    handleCatch,
    handlePrestige,
  } = useMainStageVM();

  return (
    <main
      className={`flex-1 relative flex flex-col items-center justify-center transition-colors duration-1000 overflow-hidden bg-gradient-to-b ${
        isBossActive
          ? "from-red-950"
          : isBossLevel
            ? "from-orange-950"
            : bgGradient
      } to-black`}
    >
      <div
        className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-500 ${
          spawnFlash ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-8 flex flex-col items-center gap-2 z-10 w-full px-8">
        <span
          className={`font-bold tracking-widest uppercase ${isBossLevel ? "text-pokeRed" : "text-gray-400"}`}
        >
          {isBossLevel ? "Gym Leader Target" : "Current Target"}
        </span>
        <div className="bg-black/40 border border-white/10 px-6 py-2 rounded-full flex gap-4 items-center shadow-lg mb-4">
          <span className="text-pokeYellow font-bold">#{currentPokemonId}</span>
          <span className="text-white capitalize font-medium">
            {pokemon?.name || "Loading..."}
          </span>
        </div>

        {isBossActive && (
          <div className="flex flex-col items-center gap-2 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
            <div className="flex justify-between w-full text-sm font-black text-pokeRed uppercase tracking-wider">
              <span>Boss HP</span>
              <span className="font-mono text-lg text-white">
                {Math.max(0, bossTimeLeft).toFixed(1)}s
              </span>
            </div>
            <div className="w-full bg-black/60 h-6 rounded-full overflow-hidden border-2 border-white/10 shadow-lg relative">
              <div
                className="bg-gradient-to-r from-red-600 to-pokeRed h-full transition-all ease-linear"
                style={{ width: `${Math.max(0, (bossHp / bossMaxHp) * 100)}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/80 drop-shadow">
                {formatNumber(bossHp)} / {formatNumber(bossMaxHp)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div
        className={`relative cursor-pointer transition-all duration-75 active:scale-90 active:brightness-150 hover:scale-105 z-10 ${
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
            className={`w-80 h-80 drop-shadow-2xl select-none transition-all duration-200 ${
              isCatching ? "animate-suck-in" : "hover:brightness-125"
            }`}
            draggable="false"
          />
        )}
      </div>

      <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10">
        {!isMaxLevel ? (
          isBossLevel ? (
            !isBossActive && (
              <div className="flex flex-col items-center gap-3">
                <span className="text-sm text-gray-300 font-semibold text-center max-w-xs">
                  This target is too strong! You must deal massive damage in 15
                  seconds to catch it.
                </span>
                <Button
                  onClick={handleStartBoss}
                  variant="danger"
                  className="animate-pulse px-8 py-4 text-lg"
                >
                  Challenge Gym Boss
                </Button>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-gray-400 font-semibold uppercase">
                Next Capture:{" "}
                <span className="text-pokeRed font-bold">
                  ${formatNumber(nextPokemonCost)}
                </span>
              </span>
              <div className="flex gap-4">
                <Button
                  onClick={handleCatch}
                  disabled={!canUnlock || isCatching}
                >
                  Catch Next Pokemon
                </Button>
                {currentPokemonId >= GAME_CONFIG.PRESTIGE_MIN_ID && (
                  <Button
                    variant="outline"
                    onClick={handlePrestige}
                    className="bg-transparent border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]"
                  >
                    Prestige (+{calculatePrestigeReward(currentPokemonId)}{" "}
                    Candy)
                  </Button>
                )}
              </div>
            </div>
          )
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
