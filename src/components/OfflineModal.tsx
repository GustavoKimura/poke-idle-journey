import { Clock, Zap } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";

export function OfflineModal() {
  const offlineEarnings = useGameStore((state) => state.offlineEarnings);
  const claimOfflineEarnings = useGameStore(
    (state) => state.claimOfflineEarnings,
  );

  if (offlineEarnings <= 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-gradient-to-b from-pokeDarkBlue to-black border-2 border-pokeYellow rounded-3xl w-full max-w-md p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,222,0,0.2)] animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-pokeYellow/20 rounded-full flex items-center justify-center mb-6 border border-pokeYellow/50 text-pokeYellow animate-pulse relative">
          <Clock size={40} />
          <Zap
            size={24}
            className="absolute -bottom-2 -right-2 text-green-400"
          />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
          Welcome Back!
        </h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          While you were away, your Pokémon and trainers continued working hard.
          They have gathered a massive amount of resources for you!
        </p>

        <div className="bg-black/40 border border-white/10 w-full rounded-xl py-4 mb-8">
          <span className="block text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">
            Offline Earnings
          </span>
          <span className="text-4xl font-black text-green-400 drop-shadow-md">
            +${formatNumber(offlineEarnings)}
          </span>
        </div>

        <button
          onClick={claimOfflineEarnings}
          className="w-full py-4 rounded-xl font-black text-lg uppercase tracking-widest bg-pokeYellow text-black hover:scale-105 shadow-[0_0_20px_rgba(255,222,0,0.4)] transition-all cursor-pointer"
        >
          Claim & Play
        </button>
      </div>
    </div>
  );
}
