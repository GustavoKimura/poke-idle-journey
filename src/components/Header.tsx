import { useState } from "react";
import { Book, Sparkles, Settings as SettingsIcon } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";
import { SettingsModal } from "./SettingsModal";

export function Header() {
  const { score, passiveIncome, multiplier, rareCandies, togglePokedex } =
    useGameStore();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center p-6 bg-pokeDarkBlue border-b-4 border-pokeYellow/20 shadow-lg z-10">
        <div className="flex flex-col">
          <span className="text-pokeYellow font-bold text-xl uppercase tracking-wider">
            PokeDollars
          </span>
          <span className="text-5xl font-black text-white drop-shadow-md">
            {formatNumber(score)}
          </span>
        </div>
        <div className="flex gap-4 sm:gap-6">
          <div className="hidden sm:flex gap-8 bg-black/20 p-4 rounded-xl border border-white/10">
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
                x{formatNumber(multiplier * (1 + rareCandies))}
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

          <button
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className="flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-pokeYellow hover:bg-pokeYellow/10 hover:text-pokeYellow text-gray-400 w-14 rounded-xl transition-all cursor-pointer"
          >
            <SettingsIcon size={22} />
          </button>

          <button
            onClick={togglePokedex}
            className="flex items-center gap-2 bg-pokeDarkBlue border-2 border-pokeYellow/50 hover:border-pokeYellow hover:bg-pokeYellow/10 text-white px-6 rounded-xl font-bold uppercase transition-all shadow-lg cursor-pointer"
          >
            <Book size={20} className="text-pokeYellow" />
            <span className="hidden sm:inline">Pokédex</span>
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
