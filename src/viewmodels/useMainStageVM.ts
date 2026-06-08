import { useState, useCallback, useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import {
  playClickSound,
  playCatchSound,
  playPrestigeSound,
} from "../utils/audio";
import { GAME_CONFIG, calculateNextPokemonCost } from "../config/gameConfig";

interface Particle {
  id: number;
  x: number;
  y: number;
  isCritical: boolean;
  value: number;
}

export function useMainStageVM() {
  const {
    click,
    clickPower,
    multiplier,
    rareCandies,
    score,
    currentPokemonId,
    unlockNextPokemon,
    prestige,
  } = useGameStore();

  const [particles, setParticles] = useState<Particle[]>([]);
  const [particleCounter, setParticleCounter] = useState(0);

  const { data: pokemon, isLoading } = usePokeAPI(currentPokemonId);

  const nextPokemonCost = useMemo(
    () => calculateNextPokemonCost(currentPokemonId),
    [currentPokemonId],
  );

  const canUnlock =
    score >= nextPokemonCost && currentPokemonId < GAME_CONFIG.MAX_POKEMON_ID;
  const isMaxLevel = currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID;

  const handleMainClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const isCritical = Math.random() < GAME_CONFIG.CRIT_CHANCE;
      const critMultiplier = isCritical ? GAME_CONFIG.CRIT_MULTIPLIER : 1;
      const gainedValue =
        clickPower * multiplier * (1 + rareCandies) * critMultiplier;

      click(critMultiplier);
      playClickSound(isCritical);

      const newParticle = {
        id: particleCounter,
        x: e.clientX,
        y: e.clientY,
        isCritical,
        value: gainedValue,
      };

      setParticles((prev) => [...prev, newParticle]);
      setParticleCounter((prev) => prev + 1);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
      }, 1000);
    },
    [click, clickPower, multiplier, rareCandies, particleCounter],
  );

  const handleCatch = () => {
    if (canUnlock) {
      unlockNextPokemon();
      playCatchSound();
    }
  };

  const handlePrestige = () => {
    if (
      window.confirm(
        `Are you sure you want to prestige? You will lose all your current resources, upgrades, and caught Pokémon, but you will receive ${GAME_CONFIG.PRESTIGE_REWARD} Rare Candy (+100% global multiplier permanently)!`,
      )
    ) {
      prestige();
      playPrestigeSound();
    }
  };

  return {
    pokemon,
    isLoading,
    particles,
    currentPokemonId,
    nextPokemonCost,
    canUnlock,
    isMaxLevel,
    handleMainClick,
    handleCatch,
    handlePrestige,
  };
}
