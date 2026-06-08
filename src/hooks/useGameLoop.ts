import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";
import { GAME_CONFIG } from "../config/gameConfig";

export function useGameLoop() {
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const uncommittedIncomeRef = useRef<number>(0);
  const lastUptimeRef = useRef<number>(0);

  useEffect(() => {
    const state = useGameStore.getState();
    const now = Date.now();
    const timeDiffSeconds = (now - state.lastSaveTime) / 1000;

    if (
      timeDiffSeconds > GAME_CONFIG.OFFLINE_MIN_SECONDS &&
      state.passiveIncome > 0
    ) {
      const earned =
        state.passiveIncome *
        state.multiplier *
        (1 + state.rareCandies) *
        timeDiffSeconds;
      state.setOfflineEarnings(earned);
    }

    state.updateSaveTime();

    const saveInterval = setInterval(() => {
      useGameStore.getState().updateSaveTime();
    }, GAME_CONFIG.SAVE_INTERVAL_MS);

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
        lastUptimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      const currentState = useGameStore.getState();

      if (
        currentState.passiveIncome > 0 &&
        currentState.offlineEarnings === 0
      ) {
        const incomePerSecond =
          currentState.passiveIncome *
          currentState.multiplier *
          (1 + currentState.rareCandies);

        uncommittedIncomeRef.current += incomePerSecond * deltaTime;
      }

      if (time - lastUptimeRef.current > 200) {
        if (uncommittedIncomeRef.current > 0) {
          currentState.addPassiveIncome(uncommittedIncomeRef.current);
          uncommittedIncomeRef.current = 0;
        }
        lastUptimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(saveInterval);
    };
  }, []);
}
