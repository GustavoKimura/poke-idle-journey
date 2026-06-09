import type { StateCreator } from "zustand";
import type { GameState, PlayerSlice } from "../../types/game";
import {
  GAME_CONFIG,
  INITIAL_UPGRADES,
  ACHIEVEMENTS,
  calculateMultipleUpgradeCost,
  calculateNextPokemonCost,
  calculatePrestigeReward,
  calculatePartyUpgradeCost,
} from "../../config/gameConfig";
import {
  playCatchSound,
  playUpgradeSound,
  playPrestigeSound,
} from "../../utils/audio";
import { recalculateTotals } from "../../utils/calculations";

export const createPlayerSlice: StateCreator<GameState, [], [], PlayerSlice> = (
  set,
) => ({
  score: 0,
  clickPower: 1,
  passiveIncome: 0,
  multiplier: 1,
  rareCandies: 0,
  upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
  unlockedPokemonIds: [1],
  historicalUnlockedPokemonIds: [1],
  currentPokemonId: 1,
  party: [],
  totalClicks: 0,
  unlockedAchievements: [],

  togglePartyMember: (id) =>
    set((state) => {
      if (state.party.some((p) => p.id === id)) {
        return { party: state.party.filter((p) => p.id !== id) };
      }
      if (state.party.length >= GAME_CONFIG.MAX_PARTY_SIZE) return state;
      return { party: [...state.party, { id, level: 1 }] };
    }),

  upgradePartyMember: (id) =>
    set((state) => {
      const member = state.party.find((p) => p.id === id);
      if (!member) return state;
      const cost = calculatePartyUpgradeCost(member.level);
      if (state.score < cost) return state;
      playUpgradeSound();
      return {
        score: state.score - cost,
        party: state.party.map((p) =>
          p.id === id ? { ...p, level: p.level + 1 } : p,
        ),
      };
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
        state.historicalUnlockedPokemonIds.length >= achievement.target
      )
        isCompleted = true;

      if (!isCompleted) return state;

      return {
        unlockedAchievements: [...state.unlockedAchievements, id],
        rareCandies: state.rareCandies + achievement.reward,
      };
    }),

  click: (critMultiplier = 1, comboMultiplier = 1, typeMultiplier = 1) =>
    set((state) => {
      const partyMult =
        1 +
        state.party.reduce(
          (acc, p) => acc + GAME_CONFIG.PARTY_MEMBER_MULTIPLIER * p.level,
          0,
        );
      const amount =
        state.clickPower *
        state.multiplier *
        partyMult *
        (1 + state.rareCandies) *
        critMultiplier *
        comboMultiplier *
        typeMultiplier;

      const newState: Partial<GameState> = {
        score: state.score + amount,
        totalClicks: state.totalClicks + 1,
      };

      if (state.isBossActive) {
        const newHp = state.bossHp - amount;
        if (newHp <= 0) {
          playCatchSound();
          const newUnlocked = [
            ...state.unlockedPokemonIds,
            state.currentPokemonId + 1,
          ];
          const newHistorical = Array.from(
            new Set([
              ...state.historicalUnlockedPokemonIds,
              state.currentPokemonId + 1,
            ]),
          );
          const { clickPower, passiveIncome } = recalculateTotals(
            state.upgrades,
            newUnlocked.length,
          );

          newState.isBossActive = false;
          newState.currentPokemonId = state.currentPokemonId + 1;
          newState.unlockedPokemonIds = newUnlocked;
          newState.historicalUnlockedPokemonIds = newHistorical;
          newState.multiplier =
            state.multiplier +
            GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId;
          newState.score = newState.score! + state.bossMaxHp * 2;
          newState.bossHp = 0;
          newState.clickPower = clickPower;
          newState.passiveIncome = passiveIncome;
        } else {
          newState.bossHp = newHp;
        }
      }

      return newState;
    }),

  buyUpgrade: (id, amount = 1) =>
    set((state) => {
      const upgradeIndex = state.upgrades.findIndex((u) => u.id === id);
      if (upgradeIndex === -1 || amount <= 0) return state;

      const upgrade = state.upgrades[upgradeIndex];
      const totalCost = calculateMultipleUpgradeCost(
        upgrade.baseCost,
        upgrade.costMultiplier,
        upgrade.count,
        amount,
      );

      if (state.score < totalCost) return state;

      const newUpgrades = [...state.upgrades];
      newUpgrades[upgradeIndex] = {
        ...upgrade,
        count: upgrade.count + amount,
      };

      const { clickPower, passiveIncome } = recalculateTotals(
        newUpgrades,
        state.unlockedPokemonIds.length,
      );

      return {
        score: state.score - totalCost,
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
      if (state.currentPokemonId >= GAME_CONFIG.MAX_POKEMON_ID) return state;

      const cost = calculateNextPokemonCost(state.currentPokemonId);
      const newUnlocked = [...state.unlockedPokemonIds, nextId];
      const newHistorical = Array.from(
        new Set([...state.historicalUnlockedPokemonIds, nextId]),
      );
      const { clickPower, passiveIncome } = recalculateTotals(
        state.upgrades,
        newUnlocked.length,
      );

      return {
        score: state.score - cost,
        currentPokemonId: nextId,
        unlockedPokemonIds: newUnlocked,
        historicalUnlockedPokemonIds: newHistorical,
        multiplier:
          state.multiplier +
          GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId,
        clickPower,
        passiveIncome,
      };
    }),

  prestige: () =>
    set((state) => {
      if (state.currentPokemonId < GAME_CONFIG.PRESTIGE_MIN_ID) return state;

      const reward = calculatePrestigeReward(
        state.currentPokemonId,
        state.totalClicks,
      );
      const newUpgrades = INITIAL_UPGRADES.map((u) => ({ ...u }));
      const { clickPower, passiveIncome } = recalculateTotals(newUpgrades, 1);

      playPrestigeSound();

      return {
        score: 0,
        clickPower,
        passiveIncome,
        multiplier: 1,
        rareCandies: state.rareCandies + reward,
        upgrades: newUpgrades,
        unlockedPokemonIds: [1],
        currentPokemonId: 1,
        party: [],
        offlineEarnings: 0,
        offlineSeconds: 0,
        isBossActive: false,
        bossHp: 0,
        bossMaxHp: 0,
        bossTimeLeft: 0,
        totalClicks: 0,
        isPrestigeModalOpen: false,
        lastSaveTime: Date.now(),
      };
    }),

  hardReset: () =>
    set(() => ({
      score: 0,
      clickPower: 1,
      passiveIncome: 0,
      multiplier: 1,
      rareCandies: 0,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      unlockedPokemonIds: [1],
      historicalUnlockedPokemonIds: [1],
      currentPokemonId: 1,
      party: [],
      totalClicks: 0,
      unlockedAchievements: [],
      isBossActive: false,
      bossHp: 0,
      bossMaxHp: 0,
      bossTimeLeft: 0,
      isPokedexOpen: false,
      isPrestigeModalOpen: false,
      offlineEarnings: 0,
      offlineSeconds: 0,
      lastSaveTime: Date.now(),
      hasSeenHowToPlay: false,
      isAchievementsOpen: false,
    })),
});
