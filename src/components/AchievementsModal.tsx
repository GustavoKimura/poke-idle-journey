import { Trophy, Check, Gift } from "lucide-react";
import { Modal } from "./ui/Modal";
import { useGameStore } from "../store/useGameStore";
import { ACHIEVEMENTS } from "../config/gameConfig";
import { Button } from "./ui/Button";
import { formatNumber } from "../utils/format";
import { playCatchSound } from "../utils/audio";

export function AchievementsModal() {
  const isAchievementsOpen = useGameStore((state) => state.isAchievementsOpen);
  const toggleAchievements = useGameStore((state) => state.toggleAchievements);
  const unlockedAchievements = useGameStore(
    (state) => state.unlockedAchievements,
  );
  const totalClicks = useGameStore((state) => state.totalClicks);
  const passiveIncome = useGameStore((state) => state.passiveIncome);
  const unlockedPokemonIds = useGameStore((state) => state.unlockedPokemonIds);
  const claimAchievement = useGameStore((state) => state.claimAchievement);

  const getCurrentValue = (condition: string) => {
    if (condition === "clicks") return totalClicks;
    if (condition === "income") return passiveIncome;
    if (condition === "pokemon") return unlockedPokemonIds.length;
    return 0;
  };

  const handleClaim = (id: string) => {
    claimAchievement(id);
    playCatchSound();
  };

  return (
    <Modal
      isOpen={isAchievementsOpen}
      onClose={toggleAchievements}
      title="Achievements"
      icon={<Trophy size={28} className="text-pokeYellow" />}
      maxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const isUnlocked = unlockedAchievements.includes(a.id);
          const currentValue = getCurrentValue(a.condition);
          const isClaimable = !isUnlocked && currentValue >= a.target;
          const progressPercentage = Math.min(
            (currentValue / a.target) * 100,
            100,
          );

          return (
            <div
              key={a.id}
              className={`relative overflow-hidden rounded-xl border-2 p-4 flex flex-col gap-3 transition-all ${
                isUnlocked
                  ? "bg-green-900/20 border-green-500/30"
                  : isClaimable
                    ? "bg-pokeYellow/10 border-pokeYellow shadow-[0_0_15px_rgba(255,222,0,0.2)]"
                    : "bg-black/40 border-white/10 opacity-70"
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4
                    className={`font-bold text-lg flex items-center gap-2 ${isUnlocked ? "text-green-400" : isClaimable ? "text-pokeYellow" : "text-white"}`}
                  >
                    {a.name}
                    {isUnlocked && <Check size={18} />}
                  </h4>
                  <p className="text-sm text-gray-400">{a.description}</p>
                </div>
                <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg border border-white/5 h-fit">
                  <Gift size={14} className="text-pink-400" />
                  <span className="text-pink-400 font-bold text-sm">
                    +{a.reward}
                  </span>
                </div>
              </div>

              {!isUnlocked && !isClaimable && (
                <div className="mt-auto pt-2">
                  <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
                    <span>Progress</span>
                    <span>
                      {formatNumber(currentValue)} / {formatNumber(a.target)}
                    </span>
                  </div>
                  <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-400 h-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {isClaimable && (
                <Button
                  onClick={() => handleClaim(a.id)}
                  className="mt-auto py-2 shadow-[0_0_10px_rgba(255,222,0,0.5)] animate-pulse"
                >
                  Claim Reward
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
