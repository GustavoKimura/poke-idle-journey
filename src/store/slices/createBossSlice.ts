import type { StateCreator } from "zustand";
import type { GameState, BossSlice } from "../../types/game";
import { GAME_CONFIG, calculateNextPokemonCost } from "../../config/gameConfig";
import { playCatchSound } from "../../utils/audio";
import {
  recalculateTotals,
  calculateShinyChance,
} from "../../utils/calculations";

export const createBossSlice: StateCreator<GameState, [], [], BossSlice> = (
  set,
  get,
) => ({
  isBossActive: false,
  bossHp: 0,
  bossMaxHp: 0,
  bossTimeLeft: 0,
  startBossFight: () =>
    set((state) => {
      const cost = calculateNextPokemonCost(state.currentPokemonId);
      const maxHp = cost * 5.0;
      const extraTime = get().ascensionUpgrades.boss_time || 0;
      return {
        isBossActive: true,
        bossMaxHp: maxHp,
        bossHp: maxHp,
        bossTimeLeft: 15 + extraTime,
      };
    }),
  damageBoss: (amount) =>
    set((state) => {
      if (!state.isBossActive) return state;
      const newHp = state.bossHp - amount;
      if (newHp <= 0) {
        playCatchSound();
        const nextId = state.currentPokemonId + 1;
        const isVictory = nextId === GAME_CONFIG.MAX_POKEMON_ID;
        const newUnlocked = [...state.unlockedPokemonIds, nextId];
        const newHistorical = Array.from(
          new Set([...state.historicalUnlockedPokemonIds, nextId]),
        );
        const { clickPower, passiveIncome } = recalculateTotals(
          state.upgrades,
          newUnlocked.length,
        );

        const newShinies = state.isCurrentPokemonShiny
          ? Array.from(
              new Set([...state.shinyPokemonIds, state.currentPokemonId]),
            )
          : state.shinyPokemonIds;

        const nextShiny =
          Math.random() <
          calculateShinyChance(state.upgrades, state.ascensionUpgrades);

        return {
          isBossActive: false,
          currentPokemonId: nextId,
          unlockedPokemonIds: newUnlocked,
          historicalUnlockedPokemonIds: newHistorical,
          shinyPokemonIds: newShinies,
          isCurrentPokemonShiny: nextShiny,
          multiplier:
            state.multiplier +
            GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId,
          score: state.score + state.bossMaxHp * 2,
          bossHp: 0,
          clickPower,
          passiveIncome,
          isVictoryModalOpen: isVictory ? true : state.isVictoryModalOpen,
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
