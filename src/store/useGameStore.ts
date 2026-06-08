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
import { playCatchSound } from "../utils/audio";

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
      party: [],
      isPokedexOpen: false,
      lastSaveTime: Date.now(),
      offlineEarnings: 0,
      offlineSeconds: 0,
      isHoldToClickEnabled: false,
      isSoundEnabled: true,
      isVfxEnabled: true,
      totalClicks: 0,
      unlockedAchievements: [],
      isAchievementsOpen: false,
      isBossActive: false,
      bossHp: 0,
      bossMaxHp: 0,
      bossTimeLeft: 0,
      toggleHoldToClick: () =>
        set((state) => ({ isHoldToClickEnabled: !state.isHoldToClickEnabled })),
      toggleSound: () =>
        set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
      toggleVfx: () => set((state) => ({ isVfxEnabled: !state.isVfxEnabled })),
      togglePokedex: () =>
        set((state) => ({ isPokedexOpen: !state.isPokedexOpen })),
      togglePartyMember: (id) =>
        set((state) => {
          if (state.party.includes(id)) {
            return { party: state.party.filter((p) => p !== id) };
          }
          if (state.party.length >= GAME_CONFIG.MAX_PARTY_SIZE) return state;
          return { party: [...state.party, id] };
        }),
      toggleAchievements: () =>
        set((state) => ({ isAchievementsOpen: !state.isAchievementsOpen })),
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
            return {
              isBossActive: false,
              currentPokemonId: state.currentPokemonId + 1,
              unlockedPokemonIds: [
                ...state.unlockedPokemonIds,
                state.currentPokemonId + 1,
              ],
              multiplier:
                state.multiplier +
                GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId,
              score: state.score + state.bossMaxHp * 2,
              bossHp: 0,
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
        set((state) => {
          const partyMult =
            1 + state.party.length * GAME_CONFIG.PARTY_MEMBER_MULTIPLIER;
          const amount =
            state.clickPower *
            state.multiplier *
            partyMult *
            (1 + state.rareCandies) *
            critMultiplier;

          const newState: Partial<GameState> = {
            score: state.score + amount,
            totalClicks: state.totalClicks + 1,
          };

          if (state.isBossActive) {
            const newHp = state.bossHp - amount;
            if (newHp <= 0) {
              playCatchSound();
              newState.isBossActive = false;
              newState.currentPokemonId = state.currentPokemonId + 1;
              newState.unlockedPokemonIds = [
                ...state.unlockedPokemonIds,
                state.currentPokemonId + 1,
              ];
              newState.multiplier =
                state.multiplier +
                GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId;
              newState.score = newState.score! + state.bossMaxHp * 2;
              newState.bossHp = 0;
            } else {
              newState.bossHp = newHp;
            }
          }

          return newState;
        }),
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
            party: [],
            offlineEarnings: 0,
            offlineSeconds: 0,
            isBossActive: false,
            bossHp: 0,
            bossMaxHp: 0,
            bossTimeLeft: 0,
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
          party: [],
          isPokedexOpen: false,
          offlineEarnings: 0,
          offlineSeconds: 0,
          isHoldToClickEnabled: false,
          isSoundEnabled: true,
          isVfxEnabled: true,
          totalClicks: 0,
          unlockedAchievements: [],
          isAchievementsOpen: false,
          isBossActive: false,
          bossHp: 0,
          bossMaxHp: 0,
          bossTimeLeft: 0,
          lastSaveTime: Date.now(),
        });

        setTimeout(() => {
          window.location.reload();
        }, 100);
      },
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
    }),
    {
      name: "poke-idle-storage",
      version: 10,
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
        if (!Array.isArray(state.party)) state.party = [];
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
        if (
          typeof state.offlineSeconds !== "number" ||
          Number.isNaN(state.offlineSeconds)
        )
          state.offlineSeconds = 0;
        if (typeof state.isHoldToClickEnabled !== "boolean")
          state.isHoldToClickEnabled = false;
        if (typeof state.isSoundEnabled !== "boolean")
          state.isSoundEnabled = true;
        if (typeof state.isVfxEnabled !== "boolean") state.isVfxEnabled = true;
        if (
          typeof state.totalClicks !== "number" ||
          Number.isNaN(state.totalClicks)
        )
          state.totalClicks = 0;
        if (!Array.isArray(state.unlockedAchievements))
          state.unlockedAchievements = [];
        if (typeof state.isBossActive !== "boolean") state.isBossActive = false;
        if (typeof state.bossHp !== "number" || Number.isNaN(state.bossHp))
          state.bossHp = 0;
        if (
          typeof state.bossMaxHp !== "number" ||
          Number.isNaN(state.bossMaxHp)
        )
          state.bossMaxHp = 0;
        if (
          typeof state.bossTimeLeft !== "number" ||
          Number.isNaN(state.bossTimeLeft)
        )
          state.bossTimeLeft = 0;

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
