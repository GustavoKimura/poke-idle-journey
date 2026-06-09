import { useState, useEffect, useRef } from "react";
import {
  Book,
  Sparkles,
  Settings as SettingsIcon,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";
import { SettingsModal } from "./SettingsModal";
import { ACHIEVEMENTS, GAME_CONFIG } from "../config/gameConfig";

function ScoreDisplay() {
  const scoreRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = useGameStore.subscribe((state) => {
      if (scoreRef.current) {
        scoreRef.current.textContent = `$${formatNumber(state.score)}`;
      }
    });

    if (scoreRef.current) {
      scoreRef.current.textContent = `$${formatNumber(useGameStore.getState().score)}`;
    }

    return unsubscribe;
  }, []);

  return (
    <span
      ref={scoreRef}
      className="text-3xl sm:text-4xl font-black text-white drop-shadow-md"
    >
      $0
    </span>
  );
}

function DpsDisplay() {
  const [currentDps, setCurrentDps] = useState(0);

  useEffect(() => {
    let damageLastSecond = 0;
    const handleDamage = (e: Event) => {
      const customEvent = e as CustomEvent;
      damageLastSecond += customEvent.detail.value;
    };

    window.addEventListener("SPAWN_TEXT", handleDamage);

    const timer = setInterval(() => {
      const state = useGameStore.getState();
      const partyMult =
        1 +
        state.party.reduce(
          (acc, p) => acc + GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * p.level,
          0,
        );
      const passiveDps =
        state.passiveIncome *
        state.multiplier *
        partyMult *
        (1 + state.rareCandies);

      setCurrentDps(damageLastSecond + passiveDps);
      damageLastSecond = 0;
    }, 1000);

    return () => {
      window.removeEventListener("SPAWN_TEXT", handleDamage);
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex flex-col items-center">
      <span className="text-gray-400 text-sm font-semibold uppercase">
        Current DPS
      </span>
      <span className="text-2xl font-bold text-orange-400">
        ${formatNumber(currentDps)}/s
      </span>
    </div>
  );
}

function AchievementBadge() {
  const claimableCount = useGameStore((state) => {
    return ACHIEVEMENTS.filter((a) => {
      if (state.unlockedAchievements.includes(a.id)) return false;
      if (a.condition === "clicks") return state.totalClicks >= a.target;
      if (a.condition === "income") return state.passiveIncome >= a.target;
      if (a.condition === "pokemon")
        return state.historicalUnlockedPokemonIds.length >= a.target;
      return false;
    }).length;
  });

  if (claimableCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-pokeRed text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-pokeRed/50 animate-pulse">
      {claimableCount}
    </span>
  );
}

function PokedexBadge() {
  const showBadge = useGameStore((state) => {
    return (
      state.party.length < GAME_CONFIG.MAX_PARTY_SIZE &&
      state.unlockedPokemonIds.length > state.party.length
    );
  });

  if (!showBadge) return null;

  return (
    <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
  );
}

export function Header() {
  const multiplier = useGameStore((state) => state.multiplier);
  const rareCandies = useGameStore((state) => state.rareCandies);
  const partyLevelSum = useGameStore((state) =>
    state.party.reduce(
      (acc, p) => acc + GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * p.level,
      0,
    ),
  );
  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled);

  const toggleSound = useGameStore((state) => state.toggleSound);
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const toggleAchievements = useGameStore((state) => state.toggleAchievements);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const partyMult = 1 + partyLevelSum;

  return (
    <>
      <header className="flex justify-between items-center p-6 bg-pokeDarkBlue border-b-4 border-pokeYellow/20 shadow-lg z-10 shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="PokeIdle Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg"
              draggable="false"
            />
            <div className="hidden lg:flex flex-col">
              <h1 className="text-[26px] font-black text-white uppercase tracking-widest leading-none mb-0.5">
                POKE<span className="text-pokeYellow">IDLE</span>
              </h1>
              <span className="text-[10px] font-bold text-gray-400 tracking-[0.27em] leading-none ml-1 whitespace-nowrap">
                MASTER OF CLICKS
              </span>
            </div>
          </div>

          <div className="w-px h-12 bg-white/10 hidden sm:block"></div>

          <div className="flex flex-col">
            <span className="text-pokeYellow font-bold text-xs sm:text-sm uppercase tracking-wider">
              PokeDollars
            </span>
            <ScoreDisplay />
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <div className="hidden lg:flex gap-8 bg-black/20 p-4 rounded-xl border border-white/10">
            <DpsDisplay />
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm font-semibold uppercase">
                Multiplier
              </span>
              <span className="text-2xl font-bold text-blue-400">
                x{formatNumber(multiplier * partyMult * (1 + rareCandies))}
              </span>
            </div>
            {rareCandies > 0 && (
              <div className="flex flex-col items-center pl-8 border-l border-white/10">
                <span className="text-pink-300 text-sm font-semibold uppercase flex items-center gap-1">
                  <Sparkles size={14} className="text-pink-400" />
                  Rare Candies
                </span>
                <span className="text-2xl font-black text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
                  {rareCandies}
                </span>
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={toggleSound}
              title="Toggle Sound"
              className="flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-pokeYellow hover:bg-pokeYellow/10 hover:text-pokeYellow text-gray-400 w-12 h-12 sm:w-14 sm:h-auto rounded-xl transition-all cursor-pointer"
            >
              {isSoundEnabled ? (
                <Volume2 size={22} />
              ) : (
                <VolumeX size={22} className="text-red-400" />
              )}
            </button>

            <button
              onClick={toggleAchievements}
              title="Achievements"
              className="relative flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-pokeYellow hover:bg-pokeYellow/10 hover:text-pokeYellow text-gray-400 w-12 h-12 sm:w-14 sm:h-auto rounded-xl transition-all cursor-pointer"
            >
              <Trophy size={22} />
              <AchievementBadge />
            </button>

            <button
              onClick={() => setIsSettingsOpen(true)}
              title="Settings"
              className="flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-pokeYellow hover:bg-pokeYellow/10 hover:text-pokeYellow text-gray-400 w-12 h-12 sm:w-14 sm:h-auto rounded-xl transition-all cursor-pointer"
            >
              <SettingsIcon size={22} />
            </button>

            <button
              onClick={togglePokedex}
              className="flex items-center gap-2 bg-pokeDarkBlue border-2 border-pokeYellow/50 hover:border-pokeYellow hover:bg-pokeYellow/10 text-white px-3 sm:px-6 rounded-xl font-bold uppercase transition-all shadow-lg cursor-pointer relative"
            >
              <Book size={20} className="text-pokeYellow" />
              <span className="hidden md:inline">Pokédex</span>
              <PokedexBadge />
            </button>
          </div>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
