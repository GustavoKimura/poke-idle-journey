import type { StateCreator } from "zustand";
import type { GameState, BossSlice } from "../../types/game";
import { GAME_CONFIG, calculateNextPokemonCost } from "../../config/gameConfig";
import { playCatchSound } from "../../utils/audio";
import { recalculateTotals } from "../../utils/calculations";

export const createBossSlice: StateCreator<GameState, [], [], BossSlice> = (
  set,
) => ({
  isBossActive: false,
  bossHp: 0,
  bossMaxHp: 0,
  bossTimeLeft: 0,
  startBossFight: () =>
    set((state) => {
      const cost = calculateNextPokemonCost(state.currentPokemonId);
      const maxHp = cost * 1.5;
      return {
        isBossActive: true,
        bossMaxHp: maxHp,
        bossHp: maxHp,
        bossTimeLeft: 15,
      };
    }),
  damageBoss: (amount) =>
    set((state) => {
      if (!state.isBossActive) return state;
      const newHp = state.bossHp - amount;
      if (newHp <= 0) {
        playCatchSound();
        const newUnlocked = [
          ...state.unlockedPokemonIds,
          state.currentPokemonId + 1,
        ];
        const { clickPower, passiveIncome } = recalculateTotals(
          state.upgrades,
          newUnlocked.length,
        );
        return {
          isBossActive: false,
          currentPokemonId: state.currentPokemonId + 1,
          unlockedPokemonIds: newUnlocked,
          multiplier:
            state.multiplier +
            GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId,
          score: state.score + state.bossMaxHp * 2,
          bossHp: 0,
          clickPower,
          passiveIncome,
        };
      }
      return { bossHp: newHp };
    }),
  tickBoss: (deltaTime) =>
    set((state) => {
      if (!state.isBossActive) return state;
      const newTime = state.bossTimeLeft - deltaTime;
      if (newTime <= 0) {
        return { isBossActive: false };
      }
      return { bossTimeLeft: newTime };
    }),
});
