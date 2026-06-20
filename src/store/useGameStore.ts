import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import type { GameState, Upgrade } from "../types/game";
import { INITIAL_UPGRADES } from "../config/gameConfig";
import { recalculateTotals } from "../utils/calculations";

import { createPlayerSlice } from "./slices/createPlayerSlice";
import { createBossSlice } from "./slices/createBossSlice";
import { createSystemSlice } from "./slices/createSystemSlice";

const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const idbValue = await get(name);
    if (idbValue !== undefined) return idbValue;

    const localValue = localStorage.getItem(name);
    if (localValue !== null) {
      await set(name, localValue);
      localStorage.removeItem(name);
      return localValue;
    }

    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

export const useGameStore = create<GameState>()(
  persist(
    (set, getFn, api) => ({
      ...createPlayerSlice(set, getFn, api),
      ...createBossSlice(set, getFn, api),
      ...createSystemSlice(set, getFn, api),
    }),
    {
      name: "poke-idle-storage",
      storage: createJSONStorage(() => idbStorage),
      version: 26,
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
        if (!Array.isArray(state.historicalUnlockedPokemonIds))
          state.historicalUnlockedPokemonIds = [...state.unlockedPokemonIds];

        if (!Array.isArray(state.shinyPokemonIds)) state.shinyPokemonIds = [];
        if (typeof state.isCurrentPokemonShiny !== "boolean")
          state.isCurrentPokemonShiny = false;

        if (!state.pokemonLevels || typeof state.pokemonLevels !== "object") {
          state.pokemonLevels = {};
        }
        if (!state.partyCooldowns || typeof state.partyCooldowns !== "object") {
          state.partyCooldowns = {};
        }
        if (
          !state.ascensionUpgrades ||
          typeof state.ascensionUpgrades !== "object"
        ) {
          state.ascensionUpgrades = {};
        }

        if (!Array.isArray(state.party)) {
          state.party = [];
        } else if (
          state.party.length > 0 &&
          typeof state.party[0] === "object"
        ) {
          const oldParty = state.party as unknown as {
            id: number;
            level: number;
          }[];
          state.party = oldParty.map((p) => p.id);
          oldParty.forEach((p) => {
            if (
              !state.pokemonLevels![p.id] ||
              state.pokemonLevels![p.id] < p.level
            ) {
              state.pokemonLevels![p.id] = p.level;
            }
          });
        }

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
        if (typeof state.isHowToPlayOpen !== "boolean")
          state.isHowToPlayOpen = false;
        if (typeof state.isAscensionModalOpen !== "boolean")
          state.isAscensionModalOpen = false;
        if (typeof state.isStatsOpen !== "boolean") state.isStatsOpen = false;
        if (typeof state.isVictoryModalOpen !== "boolean")
          state.isVictoryModalOpen = false;

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

        const totals = recalculateTotals(
          state.upgrades!,
          state.unlockedPokemonIds!.length,
        );
        state.clickPower = totals.clickPower;
        state.passiveIncome = totals.passiveIncome;
        state.isPokedexOpen = false;
        state.isPrestigeModalOpen = false;
        state.isAchievementsOpen = false;

        return state as GameState;
      },
    },
  ),
);
