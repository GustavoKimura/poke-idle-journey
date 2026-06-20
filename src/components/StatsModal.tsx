import {
  BarChart3,
  TrendingUp,
  Zap,
  Users,
  Sparkles,
  Activity,
} from "lucide-react";
import { Modal } from "./ui/Modal";
import { useGameStore } from "../store/useGameStore";
import { formatNumber } from "../utils/format";
import {
  calculatePartyMultiplier,
  calculateTypeSynergyMultiplier,
  getActiveSynergies,
} from "../utils/calculations";
import { ParticleManager } from "../utils/ParticleManager";
import { useEffect, useState } from "react";
import { TYPE_BADGE_COLORS, TYPE_ICONS } from "../config/gameConfig";

export function StatsModal() {
  const isOpen = useGameStore((state) => state.isStatsOpen);
  const toggle = useGameStore((state) => state.toggleStats);

  const [liveDps, setLiveDps] = useState(0);

  const clickPower = useGameStore((state) => state.clickPower);
  const passiveIncome = useGameStore((state) => state.passiveIncome);
  const baseMultiplier = useGameStore((state) => state.multiplier);
  const rareCandies = useGameStore((state) => state.rareCandies);
  const totalClicks = useGameStore((state) => state.totalClicks);
  const ascensionUpgrades = useGameStore((state) => state.ascensionUpgrades);
  const party = useGameStore((state) => state.party);
  const pokemonLevels = useGameStore((state) => state.pokemonLevels);
  const shinyPokemonIds = useGameStore((state) => state.shinyPokemonIds);

  const partyMult = calculatePartyMultiplier(
    party,
    pokemonLevels,
    shinyPokemonIds,
  );
  const synergyMult = calculateTypeSynergyMultiplier(party);
  const ascensionMult =
    1 + rareCandies * 0.1 + (ascensionUpgrades.click_power || 0) * 1.0;
  const displayMult = baseMultiplier * partyMult * synergyMult * ascensionMult;

  const activeSynergies = getActiveSynergies(party);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      const clickDamage = ParticleManager.flushDamage();
      const pdps = passiveIncome * displayMult;
      setLiveDps(clickDamage + pdps);
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, passiveIncome, displayMult]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={toggle}
      title="Empire Statistics"
      icon={<BarChart3 size={28} className="text-blue-400" />}
      maxWidth="lg"
      closeOnOutsideClick
    >
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-4 flex flex-col items-center">
          <span className="text-blue-300 font-bold uppercase tracking-widest text-xs mb-1 flex items-center gap-2">
            <Activity size={14} /> Total Output Multiplier
          </span>
          <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]">
            x
            {displayMult < 100
              ? displayMult.toFixed(2)
              : formatNumber(displayMult)}
          </span>
          <div className="flex gap-2 text-[10px] text-gray-400 mt-2 font-mono bg-black/40 px-2 py-1 rounded">
            <span>Base: {baseMultiplier.toFixed(1)}</span>
            <span>Party: {partyMult.toFixed(1)}</span>
            <span>Syn: {synergyMult.toFixed(1)}</span>
            <span>Asc: {ascensionMult.toFixed(1)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <Zap size={12} className="text-yellow-400" /> Base Click
            </span>
            <span className="text-lg font-black text-white">
              ${formatNumber(clickPower)}
            </span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <TrendingUp size={12} className="text-green-400" /> Base Passive
            </span>
            <span className="text-lg font-black text-white">
              ${formatNumber(passiveIncome)}/s
            </span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <Sparkles size={12} className="text-pink-400" /> Unspent Candies
            </span>
            <span className="text-lg font-black text-pink-400">
              {rareCandies}
            </span>
          </div>
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col">
            <span className="text-gray-400 text-xs font-bold uppercase mb-1 flex items-center gap-1">
              <Users size={12} className="text-blue-400" /> Total Clicks
            </span>
            <span className="text-lg font-black text-blue-400">
              {formatNumber(totalClicks)}
            </span>
          </div>
        </div>

        {activeSynergies.length > 0 && (
          <div className="bg-black/40 border border-white/10 rounded-xl p-4">
            <span className="text-gray-400 text-xs font-bold uppercase mb-2 block">
              Active Type Synergies
            </span>
            <div className="flex flex-wrap gap-2">
              {activeSynergies.map((s) => (
                <span
                  key={s.type}
                  className={`text-xs font-black px-2 py-1 rounded shadow-sm flex items-center gap-1 ${TYPE_BADGE_COLORS[s.type]}`}
                >
                  <span>{TYPE_ICONS[s.type]}</span> +{s.bonus * 100}%
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-green-400 text-xs font-bold uppercase">
              Live DPS
            </span>
            <span className="text-xs text-gray-400">Clicking + Passive</span>
          </div>
          <span className="text-2xl font-black text-green-400 animate-pulse">
            ${formatNumber(liveDps)}/s
          </span>
        </div>
      </div>
    </Modal>
  );
}
