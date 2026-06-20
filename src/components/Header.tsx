import { useState, useEffect, useRef } from "react";
import {
  Book,
  Sparkles,
  Settings as SettingsIcon,
  Trophy,
  Volume2,
  VolumeX,
  HelpCircle,
  BarChart3,
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
    const maxPartySize =
      GAME_CONFIG.MAX_PARTY_SIZE + (state.ascensionUpgrades.party_size || 0);
    return (
      state.party.length < maxPartySize &&
      state.unlockedPokemonIds.length > state.party.length
    );
  });

  if (!showBadge) return null;

  return (
    <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
  );
}

export function Header() {
  const rareCandies = useGameStore((state) => state.rareCandies);
  const isSoundEnabled = useGameStore((state) => state.isSoundEnabled);
  const highestUnlocked = useGameStore(
    (state) => state.historicalUnlockedPokemonIds.length,
  );
  const hasPrestiged = rareCandies > 0;

  const showStats = highestUnlocked >= 3 || hasPrestiged;
  const showPokedex = highestUnlocked >= 2 || hasPrestiged;

  const toggleSound = useGameStore((state) => state.toggleSound);
  const togglePokedex = useGameStore((state) => state.togglePokedex);
  const toggleAchievements = useGameStore((state) => state.toggleAchievements);
  const toggleHowToPlay = useGameStore((state) => state.toggleHowToPlay);
  const toggleAscensionModal = useGameStore(
    (state) => state.toggleAscensionModal,
  );
  const toggleStats = useGameStore((state) => state.toggleStats);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
            <div className="hidden lg:flex flex-col w-[170px] select-none">
              <div className="flex justify-between items-end w-full">
                {"POKEIDLE".split("").map((char, i) => (
                  <span
                    key={i}
                    className={`text-[28px] font-black leading-none ${i > 3 ? "text-pokeYellow" : "text-white"}`}
                  >
                    {char}
                  </span>
                ))}
              </div>
              <div className="flex justify-between w-full mt-1 px-[2px]">
                {"MASTER OF CLICKS".split("").map((char, i) => (
                  <span
                    key={i}
                    className="text-[9px] font-bold text-gray-400 leading-none"
                  >
                    {char === " " ? "\u00A0" : char}
                  </span>
                ))}
              </div>
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

        <div className="flex gap-2 sm:gap-4 items-center">
          {rareCandies > 0 && (
            <button
              onClick={toggleAscensionModal}
              className="hidden lg:flex flex-col items-center px-6 border-r border-white/10 hover:scale-105 transition-transform cursor-pointer"
            >
              <span className="text-pink-300 text-sm font-semibold uppercase flex items-center gap-1 animate-pulse">
                <Sparkles size={14} className="text-pink-400" />
                Skill Tree
              </span>
              <span className="text-2xl font-black text-pink-400 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
                {rareCandies}
              </span>
            </button>
          )}

          {showStats && (
            <button
              onClick={toggleStats}
              title="Statistics"
              className="flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-blue-400 hover:bg-blue-400/10 hover:text-blue-400 text-gray-400 w-12 h-12 sm:w-14 sm:h-auto rounded-xl transition-all cursor-pointer animate-in zoom-in"
            >
              <BarChart3 size={22} />
            </button>
          )}

          <button
            onClick={toggleHowToPlay}
            title="How to Play"
            className="flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-pokeYellow hover:bg-pokeYellow/10 hover:text-pokeYellow text-gray-400 w-12 h-12 sm:w-14 sm:h-auto rounded-xl transition-all cursor-pointer"
          >
            <HelpCircle size={22} />
          </button>

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

          {showPokedex && (
            <button
              onClick={togglePokedex}
              className="flex items-center gap-2 bg-pokeDarkBlue border-2 border-pokeYellow/50 hover:border-pokeYellow hover:bg-pokeYellow/10 text-white px-3 sm:px-6 rounded-xl font-bold uppercase transition-all shadow-lg cursor-pointer relative animate-in zoom-in"
            >
              <Book size={20} className="text-pokeYellow" />
              <span className="hidden md:inline">Pokédex</span>
              <PokedexBadge />
            </button>
          )}
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
