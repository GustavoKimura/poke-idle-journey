import { useGameStore } from "../store/useGameStore";

export function Header() {
  const { score, passiveIncome, multiplier } = useGameStore();

  return (
    <header className="flex justify-between items-center p-6 bg-pokeDarkBlue border-b-4 border-pokeYellow/20 shadow-lg z-10">
      <div className="flex flex-col">
        <span className="text-pokeYellow font-bold text-xl uppercase tracking-wider">
          PokeDollars
        </span>
        <span className="text-5xl font-black text-white drop-shadow-md">
          {Math.floor(score)}
        </span>
      </div>
      <div className="flex gap-8 bg-black/20 p-4 rounded-xl border border-white/10">
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-sm font-semibold uppercase">
            Passive Income
          </span>
          <span className="text-2xl font-bold text-green-400">
            +{passiveIncome}/s
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-gray-400 text-sm font-semibold uppercase">
            Multiplier
          </span>
          <span className="text-2xl font-bold text-blue-400">
            x{multiplier}
          </span>
        </div>
      </div>
    </header>
  );
}
