import { useState, useCallback } from "react";
import { useGameStore } from "../store/useGameStore";

interface Particle {
  id: number;
  x: number;
  y: number;
}

export function MainStage() {
  const click = useGameStore((state) => state.click);
  const clickPower = useGameStore((state) => state.clickPower);
  const multiplier = useGameStore((state) => state.multiplier);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleCounter, setParticleCounter] = useState(0);

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

  return (
    <main className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-pokeDarkBlue to-black overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />

      <div
        className="relative cursor-pointer transition-transform duration-75 active:scale-95 hover:scale-105 z-10"
        onClick={handleMainClick}
      >
        <img
          src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png"
          alt="Bulbasaur"
          className="w-80 h-80 drop-shadow-2xl select-none"
          draggable="false"
        />
      </div>

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
