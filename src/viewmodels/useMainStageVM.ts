import { useCallback, useMemo, useRef, useEffect } from "react";
import { useGameStore } from "../store/useGameStore";
import { usePokeAPI } from "../hooks/usePokeAPI";
import {
  playClickSound,
  playCatchSound,
  playPrestigeSound,
} from "../utils/audio";
import {
  GAME_CONFIG,
  calculateNextPokemonCost,
  calculatePrestigeReward,
} from "../config/gameConfig";
import { formatNumber } from "../utils/format";

export function useMainStageVM() {
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const score = useGameStore((state) => state.score);
  const isHoldToClickEnabled = useGameStore(
    (state) => state.isHoldToClickEnabled,
  );
  const isBossActive = useGameStore((state) => state.isBossActive);
  const bossHp = useGameStore((state) => state.bossHp);
  const bossMaxHp = useGameStore((state) => state.bossMaxHp);
  const bossTimeLeft = useGameStore((state) => state.bossTimeLeft);

  const { data: pokemon, isLoading } = usePokeAPI(currentPokemonId);

  const nextPokemonCost = useMemo(
    () => calculateNextPokemonCost(currentPokemonId),
    [currentPokemonId],
  );

  const isBossLevel =
    currentPokemonId % 10 === 0 &&
    currentPokemonId !== GAME_CONFIG.MAX_POKEMON_ID;
  const canUnlock =
    score >= nextPokemonCost &&
    !isBossLevel &&
    currentPokemonId < GAME_CONFIG.MAX_POKEMON_ID;
  const isMaxLevel = currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID;

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  const triggerClick = useCallback(
    (clientX: number, clientY: number, targetElem: HTMLElement | null) => {
      const state = useGameStore.getState();
      const isCritical = Math.random() < GAME_CONFIG.CRIT_CHANCE;
      const critMultiplier = isCritical ? GAME_CONFIG.CRIT_MULTIPLIER : 1;

      const partyMult =
        1 + state.party.length * GAME_CONFIG.PARTY_MEMBER_MULTIPLIER;
      const gainedValue =
        state.clickPower *
        state.multiplier *
        partyMult *
        (1 + state.rareCandies) *
        critMultiplier;

      state.click(critMultiplier);
      playClickSound(isCritical);

      if (isCritical && targetElem) {
        const imgElement = targetElem.querySelector("img");
        if (imgElement) {
          imgElement.classList.remove("animate-shake");
          void imgElement.offsetWidth;
          imgElement.classList.add("animate-shake");
        }
      }

      const particle = document.createElement("div");
      particle.className = "fixed z-50 pointer-events-none";
      particle.style.left = `${clientX}px`;
      particle.style.top = `${clientY}px`;
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
    [],
  );

  const stopHold = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      const target = e.currentTarget;
      const startX = e.clientX;
      const startY = e.clientY;

      triggerClick(startX, startY, target);

      if (isHoldToClickEnabled) {
        stopHold();
        intervalRef.current = window.setInterval(() => {
          const offsetX = startX + (Math.random() * 40 - 20);
          const offsetY = startY + (Math.random() * 40 - 20);
          triggerClick(offsetX, offsetY, target);
        }, 150);
      }
    },
    [triggerClick, isHoldToClickEnabled, stopHold],
  );

  const handleStartBoss = () => {
    useGameStore.getState().startBossFight();
  };

  const handleCatch = () => {
    if (canUnlock) {
      useGameStore.getState().unlockNextPokemon();
      playCatchSound();
    }
  };

  const handlePrestige = () => {
    const reward = calculatePrestigeReward(currentPokemonId);
    if (
      window.confirm(
        `Are you sure you want to prestige? You will lose all your current resources, upgrades, and caught Pokémon, but you will receive ${reward} Rare Cand${reward > 1 ? "ies" : "y"} (+${reward * 100}% global multiplier permanently)!`,
      )
    ) {
      useGameStore.getState().prestige();
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
    isBossLevel,
    isBossActive,
    bossHp,
    bossMaxHp,
    bossTimeLeft,
    handlePointerDown,
    stopHold,
    handleStartBoss,
    handleCatch,
    handlePrestige,
  };
}
