import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

export function useGameLoop() {
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (deltaTime > 0) {
        const state = useGameStore.getState();
        if (state.passiveIncome > 0) {
          state.addPassiveIncome(
            state.passiveIncome *
              state.multiplier *
              (1 + state.rareCandies) *
              deltaTime,
          );
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}
