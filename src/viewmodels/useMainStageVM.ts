import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import { useGameStore } from "../store/useGameStore";
import {
  usePokeAPI,
  fetchAndCachePokemon,
  getPokemonDataSync,
} from "../hooks/usePokeAPI";
import {
  playClickSound,
  playCatchSound,
  playBossWarningSound,
} from "../utils/audio";
import {
  GAME_CONFIG,
  TYPE_WEAKNESSES,
  calculateNextPokemonCost,
} from "../config/gameConfig";
import { ParticleManager } from "../utils/ParticleManager";
import {
  calculatePartyMultiplier,
  calculateTypeSynergyMultiplier,
} from "../utils/calculations";

export function useMainStageVM() {
  const currentPokemonId = useGameStore((state) => state.currentPokemonId);
  const isHoldToClickEnabled = useGameStore(
    (state) => state.isHoldToClickEnabled,
  );
  const isBossActive = useGameStore((state) => state.isBossActive);
  const party = useGameStore((state) => state.party);

  const { data: pokemon, isLoading } = usePokeAPI(currentPokemonId);

  const [partyLoaded, setPartyLoaded] = useState(false);

  useEffect(() => {
    Promise.all(party.map((id) => fetchAndCachePokemon(id))).then(() => {
      setPartyLoaded((prev) => !prev);
    });
  }, [party]);

  const hasTypeAdvantage = useMemo(() => {
    void partyLoaded;
    if (!pokemon) return false;
    const targetWeaknesses = pokemon.types.flatMap(
      (t) => TYPE_WEAKNESSES[t] || [],
    );

    for (const pId of party) {
      const pData = getPokemonDataSync(pId);
      if (pData && pData.types.some((pt) => targetWeaknesses.includes(pt))) {
        return true;
      }
    }
    return false;
  }, [pokemon, party, partyLoaded]);

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
  const prevBossLevelRef = useRef(false);
  const pointerPos = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const comboRef = useRef(0);
  const comboTimeoutRef = useRef<number | null>(null);

  const [isCatching, setIsCatching] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [spawnFlash, setSpawnFlash] = useState(false);
  const clickTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      pointerPos.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("pointermove", handleGlobalPointerMove);
    return () => {
      window.removeEventListener("pointermove", handleGlobalPointerMove);
      if (intervalRef.current !== null)
        window.clearInterval(intervalRef.current);
      if (comboTimeoutRef.current !== null)
        window.clearTimeout(comboTimeoutRef.current);
      if (clickTimeoutRef.current !== null)
        window.clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isBossLevel && !prevBossLevelRef.current) {
      playBossWarningSound();
    }
    prevBossLevelRef.current = isBossLevel;
  }, [isBossLevel]);

  useEffect(() => {
    if (currentPokemonId < GAME_CONFIG.MAX_POKEMON_ID) {
      fetchAndCachePokemon(currentPokemonId + 1);
    }
  }, [currentPokemonId]);

  useEffect(() => {
    if (currentPokemonId !== prevPokemonId.current) {
      prevPokemonId.current = currentPokemonId;
      if (useGameStore.getState().isVfxEnabled) {
        const startTimer = window.setTimeout(() => setSpawnFlash(true), 0);
        const endTimer = window.setTimeout(() => setSpawnFlash(false), 600);
        return () => {
          clearTimeout(startTimer);
          clearTimeout(endTimer);
        };
      }
    }
  }, [currentPokemonId]);

  const triggerClick = useCallback(
    (clientX: number, clientY: number, targetElem: HTMLElement | null) => {
      const state = useGameStore.getState();

      const extraCritChance = (state.ascensionUpgrades.crit_chance || 0) * 0.01;
      const isCritical =
        Math.random() < GAME_CONFIG.CRIT_CHANCE + extraCritChance;
      const critMultiplier = isCritical ? GAME_CONFIG.CRIT_MULTIPLIER : 1;

      comboRef.current += 1;

      const currentCombo = comboRef.current;
      const comboMultiplier = 1 + currentCombo * 0.02;
      const typeMultiplier = hasTypeAdvantage ? 3 : 1;

      const partyMult = calculatePartyMultiplier(
        state.party,
        state.pokemonLevels,
        state.shinyPokemonIds,
      );
      const synergyMult = calculateTypeSynergyMultiplier(state.party);
      const ascensionMult =
        1 +
        state.rareCandies * 0.1 +
        (state.ascensionUpgrades.click_power || 0) * 1.0;

      const gainedValue =
        state.clickPower *
        state.multiplier *
        partyMult *
        synergyMult *
        ascensionMult *
        critMultiplier *
        comboMultiplier *
        typeMultiplier;

      if (state.isVfxEnabled) {
        setIsClicking(true);
        if (clickTimeoutRef.current)
          window.clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = window.setTimeout(
          () => setIsClicking(false),
          100,
        );
      }

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

        if (state.isVfxEnabled) {
          comboText.classList.remove("animate-shake");
          void comboText.offsetWidth;
          comboText.classList.add("animate-shake");
        }

        comboFill.style.transition = "none";
        comboFill.style.height = "100%";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            comboFill.style.transition = "height 2s linear";
            comboFill.style.height = "0%";
          });
        });
      }

      state.click(critMultiplier, comboMultiplier, typeMultiplier);
      playClickSound(isCritical, comboMultiplier);

      if (state.isVfxEnabled) {
        if (isCritical && targetElem) {
          const imgElement =
            targetElem.querySelector("img") ||
            (targetElem.tagName === "IMG" ? targetElem : null);
          if (imgElement) {
            imgElement.classList.remove("animate-crit-shake");
            void imgElement.offsetWidth;
            imgElement.classList.add("animate-crit-shake");
          }
        }

        ParticleManager.spawn(
          clientX,
          clientY,
          gainedValue,
          isCritical,
          state.isBossActive,
        );
      }
    },
    [hasTypeAdvantage],
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
      pointerPos.current = { x: startX, y: startY };

      triggerClick(startX, startY, target);

      if (isHoldToClickEnabled) {
        stopHold();
        intervalRef.current = window.setInterval(() => {
          const offsetX = pointerPos.current.x + (Math.random() * 40 - 20);
          const offsetY = pointerPos.current.y + (Math.random() * 40 - 20);
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
      if (useGameStore.getState().isVfxEnabled) {
        setIsCatching(true);
        setTimeout(() => setIsCatching(false), 800);
      }
      useGameStore.getState().unlockNextPokemon();
      playCatchSound();
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
    isCatching,
    isClicking,
    spawnFlash,
    bgGradient,
    hasTypeAdvantage,
    handlePointerDown,
    stopHold,
    handleStartBoss,
    handleCatch,
  };
}
