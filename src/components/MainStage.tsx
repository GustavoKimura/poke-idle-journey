import { useState, useCallback, useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import {
  playClickSound,
  playCatchSound,
  playPrestigeSound,
} from "../utils/audio";
import { formatNumber } from "../utils/format";

interface Particle {
  id: number;
  x: number;
  y: number;
  isCritical: boolean;
}

export function MainStage() {
  const click = useGameStore((state) => state.click);
  const clickPower = useGameStore((state) => state.clickPower);
  const multiplier = useGameStore((state) => state.multiplier);
  const rareCandies = useGameStore((state) => state.rareCandies);
  const score = useGameStore((state) => state.score);
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const unlockNextPokemon = useGameStore((state) => state.unlockNextPokemon);
  const prestige = useGameStore((state) => state.prestige);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleCounter, setParticleCounter] = useState(0);

  const { data: pokemon, isLoading } = usePokeAPI(currentPokemonId);

  const nextPokemonCost = useMemo(() => {
    return Math.floor(1000 * Math.pow(1.25, currentPokemonId - 1));
  }, [currentPokemonId]);

  const handleMainClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const x = e.clientX;
      const y = e.clientY;

      const isCritical = Math.random() < 0.05;
      const critMultiplier = isCritical ? 3 : 1;

      click(critMultiplier);
      playClickSound(isCritical);

      const newParticle = { id: particleCounter, x, y, isCritical };
      setParticles((prev) => [...prev, newParticle]);
      setParticleCounter((prev) => prev + 1);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    },
    [click, particleCounter],
  );

  const canUnlock = score >= nextPokemonCost && currentPokemonId < 151;

  const handleCatch = () => {
    if (canUnlock) {
      unlockNextPokemon();
      playCatchSound();
    }
  };

  const handlePrestige = () => {
    if (
      window.confirm(
        "Are you sure you want to prestige? You will lose all your current resources, upgrades, and caught Pokémon, but you will receive 1 Rare Candy (+100% global multiplier permanently)!",
      )
    ) {
      prestige();
      playPrestigeSound();
    }
  };

  return (
    <main className="flex-1 relative flex flex-col items-center justify-center bg-gradient-to-b from-pokeDarkBlue to-black overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <div className="absolute top-8 flex flex-col items-center gap-2 z-10">
        <span className="text-gray-400 font-bold tracking-widest uppercase">
          Current Target
        </span>
        <div className="bg-black/40 border border-white/10 px-6 py-2 rounded-full flex gap-4 items-center shadow-lg">
          <span className="text-pokeYellow font-bold">#{currentPokemonId}</span>
          <span className="text-white capitalize font-medium">
            {pokemon?.name || "Loading..."}
          </span>
        </div>
      </div>

      <div
        className={`relative cursor-pointer transition-transform duration-75 active:scale-95 hover:scale-105 z-10 ${
          isLoading ? "opacity-50" : "opacity-100"
        }`}
        onClick={handleMainClick}
      >
        {pokemon?.sprite && (
          <img
            src={pokemon.sprite}
            alt={pokemon.name}
            className="w-80 h-80 drop-shadow-2xl select-none"
            draggable="false"
          />
        )}
      </div>

      {currentPokemonId < 151 ? (
        <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10">
          <span className="text-sm text-gray-400 font-semibold uppercase">
            Next Capture:{" "}
            <span className="text-pokeRed font-bold">
              ${formatNumber(nextPokemonCost)}
            </span>
          </span>
          <button
            onClick={handleCatch}
            disabled={!canUnlock}
            className={`px-8 py-3 rounded-full font-bold uppercase tracking-widest transition-all ${
              canUnlock
                ? "bg-pokeYellow text-black hover:scale-105 shadow-[0_0_15px_rgba(255,222,0,0.5)] cursor-pointer"
                : "bg-black/50 text-gray-500 border border-white/10 cursor-not-allowed"
            }`}
          >
            Catch Next Pokemon
          </button>
        </div>
      ) : (
        <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10">
          <span className="text-sm text-pink-400 font-black uppercase tracking-widest animate-pulse">
            Maximum Level Reached!
          </span>
          <button
            onClick={handlePrestige}
            className="px-8 py-3 rounded-full font-black uppercase tracking-widest transition-all bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-105 shadow-[0_0_20px_rgba(236,72,153,0.6)] cursor-pointer border-2 border-pink-300"
          >
            Prestige (+1 Rare Candy)
          </button>
        </div>
      )}

      {particles.map((p) => (
        <div
          key={p.id}
          className="fixed z-50 pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span
            className={`font-black animate-float-up drop-shadow-lg flex flex-col items-center ${
              p.isCritical
                ? "text-5xl text-pokeRed"
                : "text-3xl text-pokeYellow"
            }`}
          >
            {p.isCritical && (
              <span className="text-xl block -mt-6 mb-1 text-white uppercase tracking-widest drop-shadow-[0_0_5px_rgba(238,21,21,0.8)]">
                Critical!
              </span>
            )}
            +
            {formatNumber(
              clickPower *
                multiplier *
                (1 + rareCandies) *
                (p.isCritical ? 3 : 1),
            )}
          </span>
        </div>
      ))}
    </main>
  );
}
