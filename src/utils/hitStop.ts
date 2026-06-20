let hitStopUntil = 0;

export const triggerHitStop = (ms: number) => {
  hitStopUntil = performance.now() + ms;
};

export const isHitStop = () => {
  return performance.now() < hitStopUntil;
};
