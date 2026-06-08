import { useState } from "react";
import { Book, Sparkles, RotateCcw, AlertTriangle } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";

export function Header() {
  const {
    score,
    passiveIncome,
    multiplier,
    rareCandies,
    togglePokedex,
    hardReset,
  } = useGameStore();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const handleConfirmReset = () => {
    hardReset();
    setIsResetModalOpen(false);
  };

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
            onClick={() => setIsResetModalOpen(true)}
            title="Hard Reset"
            className="flex items-center justify-center bg-black/20 border-2 border-white/10 hover:border-pokeRed hover:bg-pokeRed/10 text-gray-400 hover:text-pokeRed w-14 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw size={22} />
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

      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gradient-to-b from-pokeDarkBlue to-black border-2 border-pokeRed rounded-3xl w-full max-w-md p-8 flex flex-col items-center text-center shadow-[0_0_40px_rgba(238,21,21,0.3)] animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-pokeRed/20 rounded-full flex items-center justify-center mb-6 border border-pokeRed/50 text-pokeRed animate-pulse">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">
              Hard Reset
            </h2>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Are you absolutely sure? This will permanently erase{" "}
              <strong className="text-pokeRed font-bold">ALL</strong> your
              progress, including Rare Candies and caught Pokémon. This action
              cannot be undone!
            </p>
            <div className="flex gap-4 w-full">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest bg-black/40 border border-white/10 hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-3 rounded-xl font-bold uppercase tracking-widest bg-pokeRed text-white hover:bg-red-600 shadow-[0_0_15px_rgba(238,21,21,0.5)] transition-all cursor-pointer"
              >
                Erase All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
