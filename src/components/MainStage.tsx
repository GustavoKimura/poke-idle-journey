import { useState, useCallback, useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";

interface Particle {
  id: number;
  x: number;
  y: number;
}

export function MainStage() {
  const click = useGameStore((state) => state.click);
  const clickPower = useGameStore((state) => state.clickPower);
  const multiplier = useGameStore((state) => state.multiplier);
  const score = useGameStore((state) => state.score);
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const unlockNextPokemon = useGameStore((state) => state.unlockNextPokemon);

  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleCounter, setParticleCounter] = useState(0);

  const { data: pokemon, isLoading } = usePokeAPI(currentPokemonId);

  const nextPokemonCost = useMemo(() => {
    return Math.floor(1000 * Math.pow(1.5, currentPokemonId - 1));
  }, [currentPokemonId]);

  const handleMainClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      click();

      const newParticle = { id: particleCounter, x, y };
      setParticles((prev) => [...prev, newParticle]);
      setParticleCounter((prev) => prev + 1);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    },
    [click, particleCounter],
  );

  const canUnlock = score >= nextPokemonCost && currentPokemonId < 151;

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

      {currentPokemonId < 151 && (
        <div className="absolute bottom-12 flex flex-col items-center gap-4 z-10">
          <span className="text-sm text-gray-400 font-semibold uppercase">
            Next Capture:{" "}
            <span className="text-pokeRed font-bold">
              ${nextPokemonCost.toLocaleString()}
            </span>
          </span>
          <button
            onClick={unlockNextPokemon}
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
      )}

      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute text-3xl font-black text-pokeYellow pointer-events-none animate-float-up drop-shadow-lg z-20"
          style={{ left: p.x, top: p.y }}
        >
          +{clickPower * multiplier}
        </span>
      ))}
    </main>
  );
}
