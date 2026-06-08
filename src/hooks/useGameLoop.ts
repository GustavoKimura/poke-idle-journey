import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

export function useGameLoop() {
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const state = useGameStore.getState();
    const now = Date.now();
    const timeDiffSeconds = (now - state.lastSaveTime) / 1000;

    if (timeDiffSeconds > 60 && state.passiveIncome > 0) {
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
    }, 10000);

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (deltaTime > 0) {
        const currentState = useGameStore.getState();
        if (
          currentState.passiveIncome > 0 &&
          currentState.offlineEarnings === 0
        ) {
          currentState.addPassiveIncome(
            currentState.passiveIncome *
              currentState.multiplier *
              (1 + currentState.rareCandies) *
              deltaTime,
          );
        }
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
