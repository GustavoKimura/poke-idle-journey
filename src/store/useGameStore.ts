import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState, Upgrade } from "../types/game";
import {
  GAME_CONFIG,
  INITIAL_UPGRADES,
  ACHIEVEMENTS,
  calculateUpgradeCost,
  calculateNextPokemonCost,
  getMilestoneMultiplier,
  calculatePrestigeReward,
} from "../config/gameConfig";

const recalculateTotals = (upgrades: Upgrade[]) => {
  let clickPower = 1;
  let passiveIncome = 0;
  upgrades.forEach((u) => {
    const mult = getMilestoneMultiplier(u.count);
    if (u.type === "active") {
      clickPower += u.count * u.effect * mult;
    } else {
      passiveIncome += u.count * u.effect * mult;
    }
  });
  return { clickPower, passiveIncome };
};

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      score: 0,
      clickPower: 1,
      passiveIncome: 0,
      multiplier: 1,
      rareCandies: 0,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      unlockedPokemonIds: [1],
      currentPokemonId: 1,
      isPokedexOpen: false,
      lastSaveTime: Date.now(),
      offlineEarnings: 0,
      isHoldToClickEnabled: false,
      totalClicks: 0,
      unlockedAchievements: [],
      isAchievementsOpen: false,
      toggleHoldToClick: () =>
        set((state) => ({ isHoldToClickEnabled: !state.isHoldToClickEnabled })),
      togglePokedex: () =>
        set((state) => ({ isPokedexOpen: !state.isPokedexOpen })),
      toggleAchievements: () =>
        set((state) => ({ isAchievementsOpen: !state.isAchievementsOpen })),
      claimAchievement: (id) =>
        set((state) => {
          if (state.unlockedAchievements.includes(id)) return state;
          const achievement = ACHIEVEMENTS.find((a) => a.id === id);
          if (!achievement) return state;

          let isCompleted = false;
          if (
            achievement.condition === "clicks" &&
            state.totalClicks >= achievement.target
          )
            isCompleted = true;
          if (
            achievement.condition === "income" &&
            state.passiveIncome >= achievement.target
          )
            isCompleted = true;
          if (
            achievement.condition === "pokemon" &&
            state.unlockedPokemonIds.length >= achievement.target
          )
            isCompleted = true;

          if (!isCompleted) return state;

          return {
            unlockedAchievements: [...state.unlockedAchievements, id],
            rareCandies: state.rareCandies + achievement.reward,
          };
        }),
      click: (critMultiplier = 1) =>
        set((state) => ({
          score:
            state.score +
            state.clickPower *
              state.multiplier *
              (1 + state.rareCandies) *
              critMultiplier,
          totalClicks: state.totalClicks + 1,
        })),
      buyUpgrade: (id) =>
        set((state) => {
          const upgradeIndex = state.upgrades.findIndex((u) => u.id === id);
          if (upgradeIndex === -1) return state;

          const upgrade = state.upgrades[upgradeIndex];
          const currentCost = calculateUpgradeCost(
            upgrade.baseCost,
            upgrade.costMultiplier,
            upgrade.count,
          );

          if (state.score < currentCost) return state;

          const newUpgrades = [...state.upgrades];
          newUpgrades[upgradeIndex] = { ...upgrade, count: upgrade.count + 1 };

          const { clickPower, passiveIncome } = recalculateTotals(newUpgrades);

          return {
            score: state.score - currentCost,
            upgrades: newUpgrades,
            clickPower,
            passiveIncome,
          };
        }),
      addPassiveIncome: (amount) =>
        set((state) => ({
          score: state.score + amount,
        })),
      unlockNextPokemon: () =>
        set((state) => {
          const nextId = state.currentPokemonId + 1;
          if (state.currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID)
            return state;

          const cost = calculateNextPokemonCost(state.currentPokemonId);

          return {
            score: state.score - cost,
            currentPokemonId: nextId,
            unlockedPokemonIds: [...state.unlockedPokemonIds, nextId],
            multiplier:
              state.multiplier +
              GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId,
          };
        }),
      prestige: () =>
        set((state) => {
          if (state.currentPokemonId < GAME_CONFIG.PRESTIGE_MIN_ID)
            return state;

          const reward = calculatePrestigeReward(state.currentPokemonId);

          return {
            score: 0,
            clickPower: 1,
            passiveIncome: 0,
            multiplier: 1,
            rareCandies: state.rareCandies + reward,
            upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
            unlockedPokemonIds: [1],
            currentPokemonId: 1,
            offlineEarnings: 0,
            lastSaveTime: Date.now(),
          };
        }),
      hardReset: () => {
        set({
          score: 0,
          clickPower: 1,
          passiveIncome: 0,
          multiplier: 1,
          rareCandies: 0,
          upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
          unlockedPokemonIds: [1],
          currentPokemonId: 1,
          isPokedexOpen: false,
          offlineEarnings: 0,
          isHoldToClickEnabled: false,
          totalClicks: 0,
          unlockedAchievements: [],
          isAchievementsOpen: false,
          lastSaveTime: Date.now(),
        });

        setTimeout(() => {
          window.location.reload();
        }, 100);
      },
      updateSaveTime: () => set({ lastSaveTime: Date.now() }),
      setOfflineEarnings: (amount) => set({ offlineEarnings: amount }),
      claimOfflineEarnings: () =>
        set((state) => ({
          score: state.score + state.offlineEarnings,
          offlineEarnings: 0,
          lastSaveTime: Date.now(),
        })),
    }),
    {
      name: "poke-idle-storage",
      version: 6,
      migrate: (persistedState: unknown) => {
        const state = {
          ...(persistedState as Record<string, unknown>),
        } as Partial<GameState>;

        if (typeof state.score !== "number" || Number.isNaN(state.score))
          state.score = 0;
        if (
          typeof state.multiplier !== "number" ||
          Number.isNaN(state.multiplier)
        )
          state.multiplier = 1;
        if (
          typeof state.rareCandies !== "number" ||
          Number.isNaN(state.rareCandies)
        )
          state.rareCandies = 0;
        if (
          typeof state.currentPokemonId !== "number" ||
          Number.isNaN(state.currentPokemonId)
        )
          state.currentPokemonId = 1;
        if (!Array.isArray(state.unlockedPokemonIds))
          state.unlockedPokemonIds = [1];
        if (
          typeof state.lastSaveTime !== "number" ||
          Number.isNaN(state.lastSaveTime)
        )
          state.lastSaveTime = Date.now();
        if (
          typeof state.offlineEarnings !== "number" ||
          Number.isNaN(state.offlineEarnings)
        )
          state.offlineEarnings = 0;
        if (typeof state.isHoldToClickEnabled !== "boolean")
          state.isHoldToClickEnabled = false;

        if (
          typeof state.totalClicks !== "number" ||
          Number.isNaN(state.totalClicks)
        )
          state.totalClicks = 0;
        if (!Array.isArray(state.unlockedAchievements))
          state.unlockedAchievements = [];

        if (Array.isArray(state.upgrades)) {
          state.upgrades = state.upgrades.map((u: Partial<Upgrade>) => {
            const initialMatch = INITIAL_UPGRADES.find(
              (init) => init.id === u.id,
            );
            if (!initialMatch) return u as Upgrade;
            return {
              ...initialMatch,
              ...u,
              count:
                typeof u.count !== "number" || Number.isNaN(u.count)
                  ? 0
                  : u.count,
            };
          });

          INITIAL_UPGRADES.forEach((init) => {
            if (!state.upgrades!.find((u: Upgrade) => u.id === init.id)) {
              state.upgrades!.push({ ...init });
            }
          });
        } else {
          state.upgrades = INITIAL_UPGRADES.map((u) => ({ ...u }));
        }

        const totals = recalculateTotals(state.upgrades!);
        state.clickPower = totals.clickPower;
        state.passiveIncome = totals.passiveIncome;
        state.isPokedexOpen = false;
        state.isAchievementsOpen = false;

        return state as GameState;
      },
    },
  ),
);
