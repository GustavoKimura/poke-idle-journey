import type { StateCreator } from "zustand";
import type { GameState, SystemSlice } from "../../types/game";

export const createSystemSlice: StateCreator<GameState, [], [], SystemSlice> = (
  set,
) => ({
  isPokedexOpen: false,
  lastSaveTime: Date.now(),
  offlineEarnings: 0,
  offlineSeconds: 0,
  isHoldToClickEnabled: false,
  isSoundEnabled: true,
  isVfxEnabled: true,
  isAchievementsOpen: false,
  toggleHoldToClick: () =>
    set((state) => ({ isHoldToClickEnabled: !state.isHoldToClickEnabled })),
  toggleSound: () =>
    set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
  toggleVfx: () => set((state) => ({ isVfxEnabled: !state.isVfxEnabled })),
  togglePokedex: () =>
    set((state) => ({ isPokedexOpen: !state.isPokedexOpen })),
  toggleAchievements: () =>
    set((state) => ({ isAchievementsOpen: !state.isAchievementsOpen })),
  updateSaveTime: () => set({ lastSaveTime: Date.now() }),
  setOfflineEarnings: (amount, seconds) =>
    set({
      offlineEarnings: amount,
      offlineSeconds: seconds,
      isBossActive: false,
    }),
  claimOfflineEarnings: () =>
    set((state) => ({
      score: state.score + state.offlineEarnings,
      offlineEarnings: 0,
      offlineSeconds: 0,
      lastSaveTime: Date.now(),
    })),
});
