import { Sparkles, ArrowRight } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useGameStore } from "../store/useGameStore";
import { calculatePrestigeReward } from "../config/gameConfig";

export function PrestigeModal() {
  const isPrestigeModalOpen = useGameStore(
    (state) => state.isPrestigeModalOpen,
  );
  const togglePrestigeModal = useGameStore(
    (state) => state.togglePrestigeModal,
  );
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const totalClicks = useGameStore((state) => state.totalClicks);
  const rareCandies = useGameStore((state) => state.rareCandies);

  const reward = calculatePrestigeReward(currentPokemonId, totalClicks);

  return (
    <Modal
      isOpen={isPrestigeModalOpen}
      onClose={togglePrestigeModal}
      title="Prestige Journey"
      icon={<Sparkles size={28} className="text-pink-400" />}
      maxWidth="lg"
      closeOnOutsideClick
    >
      <div className="space-y-6 flex flex-col items-center text-center">
        <p className="text-gray-300">
          Prestiging will reset your current PokeDollars, Upgrades, Party, and
          Captured Pokémon. In return, you will receive{" "}
          <strong className="text-pink-400">Rare Candies</strong>!
        </p>

        <div className="flex items-center gap-4 bg-black/40 p-6 rounded-2xl border border-white/10 w-full justify-center">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 font-bold uppercase">
              Current Candies
            </span>
            <span className="text-2xl font-black text-white">
              {rareCandies}
            </span>
          </div>
          <ArrowRight className="text-pokeYellow" />
          <div className="flex flex-col items-center">
            <span className="text-xs text-pink-400 font-bold uppercase">
              New Candies
            </span>
            <span className="text-3xl font-black text-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]">
              {rareCandies + reward}
            </span>
          </div>
        </div>

        <div className="w-full bg-pink-900/20 border border-pink-500/30 rounded-xl p-4">
          <p className="text-sm text-pink-100">
            Unspent Rare Candies grant a passive 10% global multiplier, but
            spending them in the{" "}
            <strong className="text-white">Skill Tree</strong> unlocks massive
            permanent boosts!
          </p>
        </div>

        <div className="flex gap-4 w-full pt-4">
          <Button variant="ghost" fullWidth onClick={togglePrestigeModal}>
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={useGameStore.getState().prestige}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-2 border-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.6)]"
          >
            Confirm Prestige
          </Button>
        </div>
      </div>
    </Modal>
  );
}
