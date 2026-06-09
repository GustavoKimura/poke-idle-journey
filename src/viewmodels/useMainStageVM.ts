import { useCallback, useMemo, useRef, useEffect, useState } from "react";
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

export function useMainStageVM() {
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
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

  const canAfford = useGameStore(
    (state) => state.score >= calculateNextPokemonCost(state.currentPokemonId),
  );

  const isBossLevel =
    currentPokemonId % 10 === 0 &&
    currentPokemonId !== GAME_CONFIG.MAX_POKEMON_ID;
  const canUnlock =
    canAfford && !isBossLevel && currentPokemonId < GAME_CONFIG.MAX_POKEMON_ID;
  const isMaxLevel = currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID;

  const intervalRef = useRef<number | null>(null);
  const prevPokemonId = useRef(currentPokemonId);

  const comboRef = useRef(0);
  const comboTimeoutRef = useRef<number | null>(null);

  const [isCatching, setIsCatching] = useState(false);
  const [spawnFlash, setSpawnFlash] = useState(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null)
        window.clearInterval(intervalRef.current);
      if (comboTimeoutRef.current !== null)
        window.clearTimeout(comboTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (currentPokemonId < GAME_CONFIG.MAX_POKEMON_ID) {
      fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemonId + 1}`).catch(
        () => {},
      );
    }
  }, [currentPokemonId]);

  useEffect(() => {
    if (currentPokemonId > prevPokemonId.current) {
      prevPokemonId.current = currentPokemonId;
      if (useGameStore.getState().isVfxEnabled) {
        const startTimer = window.setTimeout(() => setSpawnFlash(true), 0);
        const endTimer = window.setTimeout(() => setSpawnFlash(false), 500);
        return () => {
          clearTimeout(startTimer);
          clearTimeout(endTimer);
        };
      }
    } else if (currentPokemonId < prevPokemonId.current) {
      prevPokemonId.current = currentPokemonId;
    }
  }, [currentPokemonId]);

  const triggerClick = useCallback(
    (clientX: number, clientY: number, targetElem: HTMLElement | null) => {
      const state = useGameStore.getState();
      const isCritical = Math.random() < GAME_CONFIG.CRIT_CHANCE;
      const critMultiplier = isCritical ? GAME_CONFIG.CRIT_MULTIPLIER : 1;

      comboRef.current += 1;
      const currentCombo = comboRef.current;
      const comboMultiplier = 1 + currentCombo * 0.02;

      const partyMult =
        1 + state.party.length * GAME_CONFIG.PARTY_MEMBER_MULTIPLIER;
      const gainedValue =
        state.clickPower *
        state.multiplier *
        partyMult *
        (1 + state.rareCandies) *
        critMultiplier *
        comboMultiplier;

      if (comboTimeoutRef.current) window.clearTimeout(comboTimeoutRef.current);
      comboTimeoutRef.current = window.setTimeout(() => {
        comboRef.current = 0;
        const comboEl = document.getElementById("combo-meter");
        if (comboEl) {
          comboEl.style.opacity = "0";
          comboEl.style.transform = "scale(0.8) translateY(-50%)";
        }
      }, 2000);

      const comboEl = document.getElementById("combo-meter");
      const comboText = document.getElementById("combo-text");
      const comboFill = document.getElementById("combo-fill");
      const comboMultText = document.getElementById("combo-mult");

      if (
        comboEl &&
        comboText &&
        comboFill &&
        comboMultText &&
        currentCombo >= 5
      ) {
        comboEl.style.opacity = "1";
        comboEl.style.transform = "scale(1) translateY(-50%)";
        comboText.textContent = `${currentCombo}`;
        comboMultText.textContent = `x${comboMultiplier.toFixed(2)}`;

        comboText.classList.remove("animate-shake");
        void comboText.offsetWidth;
        comboText.classList.add("animate-shake");

        comboFill.style.transition = "none";
        comboFill.style.height = "100%";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            comboFill.style.transition = "height 2s linear";
            comboFill.style.height = "0%";
          });
        });
      }

      state.click(critMultiplier, comboMultiplier);
      playClickSound(isCritical);

      if (state.isVfxEnabled) {
        if (isCritical && targetElem) {
          const imgElement = targetElem.querySelector("img");
          if (imgElement) {
            imgElement.classList.remove("animate-shake");
            void imgElement.offsetWidth;
            imgElement.classList.add("animate-shake");
          }
        }

        window.dispatchEvent(
          new CustomEvent("SPAWN_TEXT", {
            detail: {
              x: clientX,
              y: clientY,
              value: gainedValue,
              isCritical,
              isBoss: state.isBossActive,
            },
          }),
        );
      }
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
    const currentScore = useGameStore.getState().score;
    if (
      currentScore >= nextPokemonCost &&
      !isBossLevel &&
      currentPokemonId < GAME_CONFIG.MAX_POKEMON_ID &&
      !isCatching
    ) {
      if (useGameStore.getState().isVfxEnabled) {
        setIsCatching(true);
        playCatchSound();
        setTimeout(() => {
          useGameStore.getState().unlockNextPokemon();
          setIsCatching(false);
        }, 800);
      } else {
        useGameStore.getState().unlockNextPokemon();
        playCatchSound();
      }
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

  const TYPE_COLORS: Record<string, string> = {
    normal: "from-gray-600",
    fire: "from-red-900",
    water: "from-blue-800",
    electric: "from-yellow-700",
    grass: "from-green-800",
    ice: "from-cyan-700",
    fighting: "from-orange-900",
    poison: "from-purple-900",
    ground: "from-yellow-900",
    flying: "from-indigo-700",
    psychic: "from-pink-800",
    bug: "from-lime-800",
    rock: "from-stone-700",
    ghost: "from-violet-900",
    dragon: "from-indigo-900",
    dark: "from-gray-900",
    steel: "from-slate-700",
    fairy: "from-rose-800",
  };

  const bgGradient = pokemon?.types?.[0]
    ? TYPE_COLORS[pokemon.types[0]] || "from-pokeDarkBlue"
    : "from-pokeDarkBlue";

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
    isCatching,
    spawnFlash,
    bgGradient,
    handlePointerDown,
    stopHold,
    handleStartBoss,
    handleCatch,
    handlePrestige,
  };
}
