import { Info } from "lucide-react";
import { Modal } from "./ui/Modal";
import { useGameStore } from "../store/useGameStore";
import { GAME_CONFIG } from "../config/gameConfig";

export function HowToPlayModal() {
  const isHowToPlayOpen = useGameStore((state) => state.isHowToPlayOpen);
  const toggleHowToPlay = useGameStore((state) => state.toggleHowToPlay);

  return (
    <Modal
      isOpen={isHowToPlayOpen}
      onClose={toggleHowToPlay}
      title="How to Play"
      icon={<Info size={28} className="text-blue-400" />}
      maxWidth="lg"
      closeOnOutsideClick
    >
      <div className="space-y-4">
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-100 space-y-3">
          <p>
            <strong className="text-green-400">Party System:</strong> Open your
            Pokédex and equip up to {GAME_CONFIG.MAX_PARTY_SIZE} Pokémon
            (expandable). Each level gives a +
            {GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * 100}% global multiplier! You
            can <strong className="text-green-300">Level Up</strong> your party
            members by clicking on them in your roster or Pokédex.
          </p>
          <p>
            <strong className="text-orange-400">Combat Tactics:</strong>{" "}
            Matching your party's types against the current target's weaknesses
            grants a massive{" "}
            <strong className="text-white">x3 Damage Bonus</strong>!
          </p>
          <p>
            <strong className="text-blue-300">Offline Earnings:</strong> Close
            the game and return later! Your trainers will continue to collect
            PokeDollars automatically.
          </p>
          <p>
            <strong className="text-pokeYellow">Prestige System:</strong> Reach
            Pokémon #{GAME_CONFIG.PRESTIGE_MIN_ID} to unlock Prestige. This
            resets your progress but rewards Rare Candies based on how far you
            got and{" "}
            <strong className="text-white">how many clicks you made</strong>!
            Spend your Candies in the{" "}
            <strong className="text-pink-400">Skill Tree</strong> to unlock
            permanent massive multipliers and stats!
          </p>
        </div>
      </div>
    </Modal>
  );
}
