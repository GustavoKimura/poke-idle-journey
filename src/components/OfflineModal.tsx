import { Clock, Zap } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";

export function OfflineModal() {
  const offlineEarnings = useGameStore((state) => state.offlineEarnings);
  const claimOfflineEarnings = useGameStore(
    (state) => state.claimOfflineEarnings,
  );

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
