import { useEffect, useRef } from "react";
import { useGameStore } from "../store/useGameStore";

export function useGameLoop() {
  const addPassiveIncome = useGameStore((state) => state.addPassiveIncome);
  const passiveIncome = useGameStore((state) => state.passiveIncome);
  const multiplier = useGameStore((state) => state.multiplier);

  const lastTimeRef = useRef<number>(0);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (passiveIncome === 0) return;

    const loop = (time: number) => {
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = time;
      }

      const deltaTime = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      if (deltaTime > 0) {
        addPassiveIncome(passiveIncome * multiplier * deltaTime);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    requestRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(requestRef.current);
  }, [passiveIncome, multiplier, addPassiveIncome]);
}
