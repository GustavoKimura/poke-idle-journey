import { Clock, Zap, TrendingUp, Timer } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

export function OfflineModal() {
  const offlineEarnings = useGameStore((state) => state.offlineEarnings);
  const offlineSeconds = useGameStore((state) => state.offlineSeconds);
  const claimOfflineEarnings = useGameStore(
    (state) => state.claimOfflineEarnings,
  );

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <Modal isOpen={offlineEarnings > 0} title="Welcome Back!">
      <div className="flex flex-col items-center text-center pb-2">
        <div className="w-20 h-20 bg-pokeYellow/20 rounded-full flex items-center justify-center mb-6 border border-pokeYellow/50 text-pokeYellow animate-pulse relative">
          <Clock size={40} />
          <Zap
            size={24}
            className="absolute -bottom-2 -right-2 text-green-400"
          />
        </div>

        <p className="text-gray-300 mb-6 leading-relaxed">
          While you were away, your Pokémon and trainers continued working hard.
          Here is what they gathered:
        </p>

        <div className="w-full space-y-3 mb-8">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 font-semibold">
              <Timer size={18} />
              <span>Time Offline</span>
            </div>
            <span className="text-white font-bold text-lg">
              {formatTime(offlineSeconds)}
            </span>
          </div>

          <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-6 flex flex-col items-center gap-2 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
            <span className="text-sm font-semibold text-green-400/80 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp size={16} />
              Total Earnings
            </span>
            <span className="text-4xl font-black text-green-400 drop-shadow-md">
              +${formatNumber(offlineEarnings)}
            </span>
          </div>
        </div>

        <Button
          fullWidth
          onClick={claimOfflineEarnings}
          className="text-lg py-4"
        >
          Claim & Play
        </Button>
      </div>
    </Modal>
  );
}
