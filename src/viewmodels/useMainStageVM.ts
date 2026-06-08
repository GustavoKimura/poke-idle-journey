import { useCallback, useMemo } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import {
  playClickSound,
  playCatchSound,
  playPrestigeSound,
} from "../utils/audio";
import { GAME_CONFIG, calculateNextPokemonCost } from "../config/gameConfig";
import { formatNumber } from "../utils/format";

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

      if (isCritical) {
        const imgElement = e.currentTarget.querySelector("img");
        if (imgElement) {
          imgElement.classList.remove("animate-shake");
          void imgElement.offsetWidth;
          imgElement.classList.add("animate-shake");
        }
      }

      const particle = document.createElement("div");
      particle.className = "fixed z-50 pointer-events-none";
      particle.style.left = `${e.clientX}px`;
      particle.style.top = `${e.clientY}px`;
      particle.style.transform = "translate(-50%, -50%)";

      const textSpan = document.createElement("span");
      textSpan.className = `font-black animate-float-up drop-shadow-lg flex flex-col items-center ${
        isCritical ? "text-5xl text-pokeRed" : "text-3xl text-pokeYellow"
      }`;

      if (isCritical) {
        const critSpan = document.createElement("span");
        critSpan.className =
          "text-xl block -mt-6 mb-1 text-white uppercase tracking-widest drop-shadow-[0_0_5px_rgba(238,21,21,0.8)]";
        critSpan.textContent = "Critical!";
        textSpan.appendChild(critSpan);
      }

      const valueNode = document.createTextNode(
        `+${formatNumber(gainedValue)}`,
      );
      textSpan.appendChild(valueNode);

      particle.appendChild(textSpan);
      document.body.appendChild(particle);

      setTimeout(() => {
        particle.remove();
      }, 1000);
    },
    [click, clickPower, multiplier, rareCandies],
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
    currentPokemonId,
    nextPokemonCost,
    canUnlock,
    isMaxLevel,
    handleMainClick,
    handleCatch,
    handlePrestige,
  };
}
