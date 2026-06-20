import { useEffect, useState, useRef } from "react";
import { Clock, Zap, TrendingUp, Timer, Sparkles } from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { playTickSound, playCashSound, playUpgradeSound } from "../utils/audio";
import { triggerHitStop } from "../utils/hitStop";

export function OfflineModal() {
  const offlineEarnings = useGameStore((state) => state.offlineEarnings);
  const offlineSeconds = useGameStore((state) => state.offlineSeconds);
  const rareCandies = useGameStore((state) => state.rareCandies);
  const claimOfflineEarnings = useGameStore(
    (state) => state.claimOfflineEarnings,
  );

  const [displayedEarnings, setDisplayedEarnings] = useState(0);
  const lastTickRef = useRef(0);

  useEffect(() => {
    if (offlineEarnings > 0) {
      let startTime: number;
      const duration = 2000;
      let animationFrame: number;

      const animate = (time: number) => {
        if (!startTime) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const easeProgress =
          progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        const currentVal = offlineEarnings * easeProgress;
        setDisplayedEarnings(currentVal);

        const currentFormatted = formatNumber(currentVal);
        const targetFormatted = formatNumber(offlineEarnings);

        if (
          currentFormatted !== targetFormatted &&
          time - lastTickRef.current > 50
        ) {
          playTickSound();
          lastTickRef.current = time;
        }

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        }
      };
      animationFrame = requestAnimationFrame(animate);

      return () => cancelAnimationFrame(animationFrame);
    } else {
      setTimeout(() => setDisplayedEarnings(0), 0);
    }
  }, [offlineEarnings]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  const handleClaim = (boost: boolean) => {
    if (boost) {
      playUpgradeSound();
      if (useGameStore.getState().isVfxEnabled) triggerHitStop(150);
    } else {
      playCashSound();
    }
    claimOfflineEarnings(boost);
  };

  return (
    <Modal isOpen={offlineEarnings > 0} title="Welcome Back!" hideCloseButton>
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
              +${formatNumber(displayedEarnings)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full">
          <Button
            fullWidth
            onClick={() => handleClaim(false)}
            className="text-lg py-4"
          >
            Claim & Play
          </Button>
          <Button
            variant={rareCandies >= 1 ? "outline" : "ghost"}
            fullWidth
            disabled={rareCandies < 1}
            onClick={() => handleClaim(true)}
            className={
              rareCandies >= 1
                ? "border-pink-500 text-pink-400 hover:bg-pink-500 hover:text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] py-4"
                : "py-4"
            }
          >
            <Sparkles size={20} className="mr-2" />
            Double Earnings (Cost: 1 Candy)
          </Button>
        </div>
      </div>
    </Modal>
  );
}
