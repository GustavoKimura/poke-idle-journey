import type { StateCreator } from "zustand";
import type { GameState, PlayerSlice } from "../../types/game";
import {
  GAME_CONFIG,
  INITIAL_UPGRADES,
  ACHIEVEMENTS,
  ASCENSION_UPGRADES,
  calculateMultipleUpgradeCost,
  calculateNextPokemonCost,
  calculatePrestigeReward,
  calculatePartyUpgradeCost,
  calculateAscensionCost,
} from "../../config/gameConfig";
import {
  playCatchSound,
  playUpgradeSound,
  playClickSound,
} from "../../utils/audio";
import {
  recalculateTotals,
  calculatePartyMultiplier,
  calculateTypeSynergyMultiplier,
} from "../../utils/calculations";
import { ParticleManager } from "../../utils/ParticleManager";
import { triggerHitStop } from "../../utils/hitStop";

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
  shinyPokemonIds: [],
  isCurrentPokemonShiny: false,
  currentPokemonId: 1,
  party: [],
  partyCooldowns: {},
  pokemonLevels: {},
  totalClicks: 0,
  unlockedAchievements: [],
  ascensionUpgrades: {},

  togglePartyMember: (id) =>
    set((state) => {
      if (state.party.includes(id)) {
        return { party: state.party.filter((pId) => pId !== id) };
      }
      const maxPartySize =
        GAME_CONFIG.MAX_PARTY_SIZE + (state.ascensionUpgrades.party_size || 0);
      if (state.party.length >= maxPartySize) return state;
      return { party: [...state.party, id] };
    }),

  upgradePokemon: (id) =>
    set((state) => {
      const currentLevel = state.pokemonLevels[id] || 1;
      const cost = calculatePartyUpgradeCost(currentLevel);
      if (state.score < cost) return state;
      playUpgradeSound();
      return {
        score: state.score - cost,
        pokemonLevels: { ...state.pokemonLevels, [id]: currentLevel + 1 },
      };
    }),

  triggerPartyAbility: (id) =>
    set((state) => {
      if (!state.party.includes(id)) return state;
      const now = Date.now();
      if (state.partyCooldowns[id] && now < state.partyCooldowns[id])
        return state;

      const partyMult = calculatePartyMultiplier(
        state.party,
        state.pokemonLevels,
        state.shinyPokemonIds,
      );
      const synergyMult = calculateTypeSynergyMultiplier(state.party);
      const ascensionMult =
        1 +
        state.rareCandies * 0.1 +
        (state.ascensionUpgrades.click_power || 0) * 1.0;

      const dps =
        state.passiveIncome *
        state.multiplier *
        partyMult *
        synergyMult *
        ascensionMult;
      const baseClick =
        state.clickPower *
        state.multiplier *
        partyMult *
        synergyMult *
        ascensionMult *
        50;
      const totalDamage = Math.max(dps * 30, baseClick);

      const newState: Partial<GameState> = {
        partyCooldowns: { ...state.partyCooldowns, [id]: now + 30000 },
        score: state.score + totalDamage,
      };

      if (state.isBossActive) {
        const newHp = state.bossHp - totalDamage;
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
          const nextShiny = Math.random() < GAME_CONFIG.SHINY_CHANCE;

          newState.isBossActive = false;
          newState.currentPokemonId = nextId;
          newState.unlockedPokemonIds = newUnlocked;
          newState.historicalUnlockedPokemonIds = newHistorical;
          newState.shinyPokemonIds = newShinies;
          newState.isCurrentPokemonShiny = nextShiny;
          newState.multiplier =
            state.multiplier +
            GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId;
          newState.score = newState.score! + state.bossMaxHp * 2;
          newState.bossHp = 0;
          newState.clickPower = clickPower;
          newState.passiveIncome = passiveIncome;
          newState.isVictoryModalOpen = isVictory
            ? true
            : state.isVictoryModalOpen;
        } else {
          newState.bossHp = newHp;
        }
      }

      if (state.isVfxEnabled) {
        triggerHitStop(150);
        setTimeout(() => {
          ParticleManager.spawn(
            window.innerWidth / 2 + (Math.random() * 100 - 50),
            window.innerHeight / 2 + (Math.random() * 100 - 50),
            totalDamage,
            true,
            state.isBossActive,
          );
        }, 0);
      }

      playClickSound(true, 5);

      return newState;
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

  buyAscensionUpgrade: (id) =>
    set((state) => {
      const upgrade = ASCENSION_UPGRADES.find((u) => u.id === id);
      if (!upgrade) return state;

      const currentLevel = state.ascensionUpgrades[id] || 0;
      if (currentLevel >= upgrade.maxLevel) return state;

      const cost = calculateAscensionCost(
        upgrade.baseCost,
        upgrade.costMultiplier,
        currentLevel,
      );
      if (state.rareCandies < cost) return state;

      return {
        rareCandies: state.rareCandies - cost,
        ascensionUpgrades: {
          ...state.ascensionUpgrades,
          [id]: currentLevel + 1,
        },
      };
    }),

  click: (critMultiplier = 1, comboMultiplier = 1, typeMultiplier = 1) =>
    set((state) => {
      const partyMult = calculatePartyMultiplier(
        state.party,
        state.pokemonLevels,
        state.shinyPokemonIds,
      );
      const synergyMult = calculateTypeSynergyMultiplier(state.party);
      const ascensionMult =
        1 +
        state.rareCandies * 0.1 +
        (state.ascensionUpgrades.click_power || 0) * 1.0;

      const amount =
        state.clickPower *
        state.multiplier *
        partyMult *
        synergyMult *
        ascensionMult *
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
          const nextShiny = Math.random() < GAME_CONFIG.SHINY_CHANCE;

          newState.isBossActive = false;
          newState.currentPokemonId = nextId;
          newState.unlockedPokemonIds = newUnlocked;
          newState.historicalUnlockedPokemonIds = newHistorical;
          newState.shinyPokemonIds = newShinies;
          newState.isCurrentPokemonShiny = nextShiny;
          newState.multiplier =
            state.multiplier +
            GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId;
          newState.score = newState.score! + state.bossMaxHp * 2;
          newState.bossHp = 0;
          newState.clickPower = clickPower;
          newState.passiveIncome = passiveIncome;
          newState.isVictoryModalOpen = isVictory
            ? true
            : state.isVictoryModalOpen;
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

      const isVictory = nextId === GAME_CONFIG.MAX_POKEMON_ID;
      const cost = calculateNextPokemonCost(state.currentPokemonId);
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
      const nextShiny = Math.random() < GAME_CONFIG.SHINY_CHANCE;

      return {
        score: state.score - cost,
        currentPokemonId: nextId,
        unlockedPokemonIds: newUnlocked,
        historicalUnlockedPokemonIds: newHistorical,
        shinyPokemonIds: newShinies,
        isCurrentPokemonShiny: nextShiny,
        multiplier:
          state.multiplier +
          GAME_CONFIG.POKEMON_MULTIPLIER_REWARD * state.currentPokemonId,
        clickPower,
        passiveIncome,
        isVictoryModalOpen: isVictory ? true : state.isVictoryModalOpen,
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

      return {
        score: 0,
        clickPower,
        passiveIncome,
        multiplier: 1,
        rareCandies: state.rareCandies + reward,
        upgrades: newUpgrades,
        unlockedPokemonIds: [1],
        isCurrentPokemonShiny: Math.random() < GAME_CONFIG.SHINY_CHANCE,
        currentPokemonId: 1,
        party: [],
        partyCooldowns: {},
        pokemonLevels: {},
        offlineEarnings: 0,
        offlineSeconds: 0,
        isBossActive: false,
        bossHp: 0,
        bossMaxHp: 0,
        bossTimeLeft: 0,
        totalClicks: 0,
        isPrestigeModalOpen: false,
        isVictoryModalOpen: false,
        lastSaveTime: Date.now(),
      };
    }),

  hardReset: () =>
    set((state) => ({
      ...state,
      score: 0,
      clickPower: 1,
      passiveIncome: 0,
      multiplier: 1,
      rareCandies: 0,
      upgrades: INITIAL_UPGRADES.map((u) => ({ ...u })),
      unlockedPokemonIds: [1],
      historicalUnlockedPokemonIds: [1],
      shinyPokemonIds: [],
      isCurrentPokemonShiny: false,
      currentPokemonId: 1,
      party: [],
      partyCooldowns: {},
      pokemonLevels: {},
      totalClicks: 0,
      unlockedAchievements: [],
      ascensionUpgrades: {},
      isBossActive: false,
      bossHp: 0,
      bossMaxHp: 0,
      bossTimeLeft: 0,
      isPokedexOpen: false,
      isPrestigeModalOpen: false,
      isAscensionModalOpen: false,
      isVictoryModalOpen: false,
      offlineEarnings: 0,
      offlineSeconds: 0,
      lastSaveTime: Date.now(),
      isAchievementsOpen: false,
      isHowToPlayOpen: false,
    })),
});
