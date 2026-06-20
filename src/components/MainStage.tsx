import { formatNumber } from "../utils/format";
import { useMainStageVM } from "../viewmodels/useMainStageVM";
import { PartyRoster } from "./PartyRoster";
import { Button } from "./ui/Button";
import {
  GAME_CONFIG,
  TYPE_BADGE_COLORS,
  TYPE_ICONS,
} from "../config/gameConfig";
import { useGameStore } from "../store/useGameStore";

function BossUI() {
  const bossHp = useGameStore((state) => state.bossHp);
  const bossMaxHp = useGameStore((state) => state.bossMaxHp);
  const bossTimeLeft = useGameStore((state) => state.bossTimeLeft);

  return (
    <div className="flex flex-col items-center gap-2 w-full max-w-sm animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between w-full text-sm font-black text-pokeRed uppercase tracking-wider">
        <span>Boss Resistance</span>
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
          ${formatNumber(bossHp)} / ${formatNumber(bossMaxHp)}
        </span>
      </div>
    </div>
  );
}

function PrestigeButton({ currentPokemonId }: { currentPokemonId: number }) {
  const togglePrestigeModal = useGameStore(
    (state) => state.togglePrestigeModal,
  );

  return (
    <Button
      variant={
        currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID ? "primary" : "outline"
      }
      onClick={togglePrestigeModal}
      className={
        currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID
          ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white border-2 border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
          : "bg-transparent border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white shadow-[0_0_10px_rgba(236,72,153,0.3)]"
      }
    >
      Prestige
    </Button>
  );
}

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
    isCatching,
    isClicking,
    spawnFlash,
    bgGradient,
    hasTypeAdvantage,
    handlePointerDown,
    stopHold,
    handleStartBoss,
    handleCatch,
  } = useMainStageVM();

  const isCurrentPokemonShiny = useGameStore(
    (state) => state.isCurrentPokemonShiny,
  );

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
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-4 z-20">
        <PartyRoster />
      </div>

      <div
        id="combo-meter"
        className="absolute left-2 sm:left-8 top-1/2 flex flex-col items-center gap-1 opacity-0 transition-all duration-300 pointer-events-none z-20"
        style={{
          transform: "scale(0.8) translateY(-50%)",
          transformOrigin: "left center",
        }}
      >
        <span className="text-pokeYellow font-black uppercase tracking-widest drop-shadow-md text-sm sm:text-base animate-pulse">
          Combo!
        </span>
        <div className="flex items-baseline gap-1">
          <span
            id="combo-text"
            className="text-5xl sm:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,222,0,0.8)] italic"
          >
            0
          </span>
          <span className="text-3xl sm:text-4xl font-black text-pokeYellow italic">
            x
          </span>
        </div>
        <div className="bg-black/50 px-3 py-1 rounded-full border border-white/10 mt-1">
          <span
            id="combo-mult"
            className="text-xs sm:text-sm font-bold text-green-400 uppercase tracking-wider drop-shadow"
          >
            x1.00
          </span>
        </div>
        <div className="h-32 w-3 sm:w-4 bg-black/80 rounded-full border border-white/20 overflow-hidden relative mt-3 shadow-lg">
          <div
            id="combo-fill"
            className="absolute bottom-0 w-full bg-gradient-to-t from-orange-600 to-pokeYellow shadow-[0_0_10px_rgba(255,222,0,0.8)]"
            style={{ height: "0%" }}
          />
        </div>
      </div>

      <div className="absolute top-24 flex flex-col items-center gap-2 z-10 w-full px-8">
        <span
          className={`font-bold tracking-widest uppercase ${isBossLevel ? "text-pokeRed" : "text-gray-400"}`}
        >
          {isBossLevel ? "Gym Leader Target" : "Current Target"}
        </span>
        <div className="bg-black/40 border border-white/10 px-6 py-2 rounded-full flex gap-4 items-center shadow-lg mb-4 relative">
          <span className="text-pokeYellow font-bold">#{currentPokemonId}</span>
          <span className="text-white capitalize font-medium">
            {pokemon?.name || "Loading..."}
          </span>
          {isCurrentPokemonShiny && (
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-sm bg-yellow-400 text-black border border-yellow-200">
              ✨ SHINY
            </span>
          )}
          {pokemon?.types?.[0] && (
            <span
              className={`text-[10px] uppercase font-black px-2 py-0.5 rounded shadow-sm flex items-center gap-1 ${TYPE_BADGE_COLORS[pokemon.types[0]] || "bg-white/20 text-white border border-white/10"}`}
            >
              <span className="text-xs">{TYPE_ICONS[pokemon.types[0]]}</span>
              {pokemon.types[0]}
            </span>
          )}
          {hasTypeAdvantage && (
            <span className="absolute -top-3 -right-3 bg-green-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-full shadow-lg border border-green-300 animate-bounce whitespace-nowrap flex items-center gap-1">
              <span>🎯</span>
              Type Advantage!
            </span>
          )}
        </div>

        {isBossActive && <BossUI />}
      </div>

      <div
        className={`relative cursor-pointer z-10 mt-8 ${
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
        {isCurrentPokemonShiny && (
          <div className="absolute inset-0 z-0 animate-spin-slow opacity-60 flex items-center justify-center pointer-events-none">
            <div className="w-full h-full bg-[radial-gradient(circle,rgba(255,222,0,0.5)_0%,transparent_60%)] blur-md"></div>
          </div>
        )}
        {pokemon?.sprite && (
          <img
            src={isCurrentPokemonShiny ? pokemon.shinySprite : pokemon.sprite}
            alt={pokemon.name}
            className={`relative z-10 w-64 h-64 sm:w-80 sm:h-80 drop-shadow-2xl select-none transition-transform duration-[50ms] ${
              isCatching
                ? "animate-suck-in"
                : spawnFlash
                  ? "animate-spin-in"
                  : isClicking
                    ? "scale-90 brightness-200 contrast-150 saturate-200"
                    : "hover:brightness-125 hover:scale-105"
            }`}
            draggable="false"
          />
        )}
      </div>

      <div className="absolute bottom-6 sm:bottom-12 flex flex-col items-center gap-4 z-10">
        {!isMaxLevel ? (
          isBossLevel ? (
            !isBossActive && (
              <div className="flex flex-col items-center gap-3 animate-in slide-in-from-bottom-4 relative">
                <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full animate-pulse pointer-events-none" />
                <span className="text-sm text-red-400 font-black uppercase tracking-widest text-center max-w-xs drop-shadow-md">
                  Warning: Gym Leader!
                </span>
                <span className="text-xs text-gray-300 font-semibold text-center max-w-xs mb-2">
                  You must deal massive damage in 15 seconds to win. Prepare
                  your party!
                </span>
                <Button
                  onClick={handleStartBoss}
                  variant="danger"
                  className="animate-pulse px-8 py-4 text-lg shadow-[0_0_30px_rgba(238,21,21,0.5)]"
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
                  <PrestigeButton currentPokemonId={currentPokemonId} />
                )}
              </div>
            </div>
          )
        ) : (
          <>
            <span className="text-sm text-pink-400 font-black uppercase tracking-widest animate-pulse">
              Maximum Level Reached!
            </span>
            <PrestigeButton currentPokemonId={currentPokemonId} />
          </>
        )}
      </div>
    </main>
  );
}
