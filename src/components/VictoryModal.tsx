import { Trophy, Sparkles } from "lucide-react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { useGameStore } from "../store/useGameStore";
import { GAME_CONFIG } from "../config/gameConfig";

export function VictoryModal() {
  const isOpen = useGameStore((state) => state.isVictoryModalOpen);
  const toggle = useGameStore((state) => state.toggleVictoryModal);
  const togglePrestige = useGameStore((state) => state.togglePrestigeModal);

  const handlePrestige = () => {
    toggle();
    togglePrestige();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={toggle}
      title="Pokémon Master!"
      icon={<Trophy size={28} className="text-yellow-400" />}
      maxWidth="lg"
      closeOnOutsideClick
    >
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative mt-4">
          <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-30 animate-pulse rounded-full" />
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Master"
            className="w-32 h-32 drop-shadow-2xl relative z-10"
            draggable="false"
          />
        </div>

        <div>
          <h3 className="text-3xl font-black text-white mb-2 drop-shadow-md">
            Congratulations!
          </h3>
          <p className="text-gray-300">
            You have caught all {GAME_CONFIG.MAX_POKEMON_ID} Pokémon and
            conquered the region. Your clicking journey has become legendary!
          </p>
        </div>

        <div className="bg-yellow-900/30 border border-yellow-500/50 p-4 rounded-xl w-full">
          <p className="text-sm text-yellow-100">
            You can now <strong className="text-yellow-400">Prestige</strong> to
            earn a massive Rare Candy bonus, unlock new Ascension Skills, and
            become even more powerful!
          </p>
        </div>

        <div className="flex gap-4 w-full pt-2">
          <Button variant="ghost" fullWidth onClick={toggle}>
            Keep Playing
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handlePrestige}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white border-none shadow-[0_0_20px_rgba(236,72,153,0.5)]"
          >
            <Sparkles size={18} className="mr-2" /> Prestige Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}
