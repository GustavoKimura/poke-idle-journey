import { useState } from "react";
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

export function Header() {
  const {
    score,
    passiveIncome,
    multiplier,
    rareCandies,
    party,
    isSoundEnabled,
    toggleSound,
    togglePokedex,
    toggleAchievements,
    unlockedAchievements,
    totalClicks,
    unlockedPokemonIds,
  } = useGameStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const partyMult = 1 + party.length * GAME_CONFIG.PARTY_MEMBER_MULTIPLIER;

  const claimableCount = ACHIEVEMENTS.filter((a) => {
    if (unlockedAchievements.includes(a.id)) return false;
    if (a.condition === "clicks") return totalClicks >= a.target;
    if (a.condition === "income") return passiveIncome >= a.target;
    if (a.condition === "pokemon") return unlockedPokemonIds.length >= a.target;
    return false;
  }).length;

  return (
    <>
      <header className="flex justify-between items-center p-6 bg-pokeDarkBlue border-b-4 border-pokeYellow/20 shadow-lg z-10">
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="PokeIdle Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-lg"
              draggable="false"
            />
            <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest hidden lg:block">
              Poke<span className="text-pokeYellow">Idle</span>
            </h1>
          </div>

          <div className="w-px h-12 bg-white/10 hidden sm:block"></div>

          <div className="flex flex-col">
            <span className="text-pokeYellow font-bold text-xs sm:text-sm uppercase tracking-wider">
              PokeDollars
            </span>
            <span className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">
              {formatNumber(score)}
            </span>
          </div>
        </div>

        <div className="flex gap-4 sm:gap-6">
          <div className="hidden lg:flex gap-8 bg-black/20 p-4 rounded-xl border border-white/10">
            <div className="flex flex-col items-center">
              <span className="text-gray-400 text-sm font-semibold uppercase">
                Passive Income
              </span>
              <span className="text-2xl font-bold text-green-400">
                +{formatNumber(passiveIncome)}/s
              </span>
            </div>
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
              {claimableCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pokeRed text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-pokeRed/50 animate-pulse">
                  {claimableCount}
                </span>
              )}
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
              {party.length < GAME_CONFIG.MAX_PARTY_SIZE &&
                unlockedPokemonIds.length > party.length && (
                  <span className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-ping" />
                )}
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
