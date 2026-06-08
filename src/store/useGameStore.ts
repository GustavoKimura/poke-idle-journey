import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState, Upgrade } from "../types/game";

const initialUpgrades: Upgrade[] = [
  {
    id: "1",
    name: "Extra Pokeball",
    baseCost: 10,
    costMultiplier: 1.15,
    count: 0,
    type: "active",
    effect: 1,
  },
  {
    id: "2",
    name: "Youngster Trainer",
    baseCost: 50,
    costMultiplier: 1.15,
    count: 0,
    type: "passive",
    effect: 2,
  },
  {
    id: "3",
    name: "Local Gym",
    baseCost: 500,
    costMultiplier: 1.15,
    count: 0,
    type: "passive",
    effect: 25,
  },
  {
    id: "4",
    name: "Pokemon Daycare",
    baseCost: 5000,
    costMultiplier: 1.15,
    count: 0,
    type: "passive",
    effect: 150,
  },
  {
    id: "5",
    name: "Silph Co. Scope",
    baseCost: 50000,
    costMultiplier: 1.18,
    count: 0,
    type: "active",
    effect: 500,
  },
  {
    id: "6",
    name: "Master Ball Factory",
    baseCost: 1000000,
    costMultiplier: 1.2,
    count: 0,
    type: "passive",
    effect: 10000,
  },
];

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      score: 0,
      clickPower: 1,
      passiveIncome: 0,
      multiplier: 1,
      rareCandies: 0,
      upgrades: initialUpgrades,
      unlockedPokemonIds: [1],
      currentPokemonId: 1,
      isPokedexOpen: false,
      togglePokedex: () =>
        set((state) => ({ isPokedexOpen: !state.isPokedexOpen })),
      click: (critMultiplier = 1) =>
        set((state) => ({
          score:
            state.score +
            state.clickPower *
              state.multiplier *
              (1 + state.rareCandies) *
              critMultiplier,
        })),
      buyUpgrade: (id) =>
        set((state) => {
          const upgradeIndex = state.upgrades.findIndex((u) => u.id === id);
          if (upgradeIndex === -1) return state;

          const upgrade = state.upgrades[upgradeIndex];
          const currentCost = Math.floor(
            upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.count),
          );

          if (state.score < currentCost) return state;

          const newUpgrades = [...state.upgrades];
          newUpgrades[upgradeIndex] = { ...upgrade, count: upgrade.count + 1 };

          let newClickPower = state.clickPower;
          let newPassiveIncome = state.passiveIncome;

          if (upgrade.type === "active") {
            newClickPower += upgrade.effect;
          } else {
            newPassiveIncome += upgrade.effect;
          }

          return {
            score: state.score - currentCost,
            upgrades: newUpgrades,
            clickPower: newClickPower,
            passiveIncome: newPassiveIncome,
          };
        }),
      addPassiveIncome: (amount) =>
        set((state) => ({
          score: state.score + amount,
        })),
      unlockNextPokemon: () =>
        set((state) => {
          const nextId = state.currentPokemonId + 1;
          if (state.currentPokemonId >= 151) return state;

          const cost = Math.floor(
            1000 * Math.pow(1.25, state.currentPokemonId - 1),
          );

          return {
            score: state.score - cost,
            currentPokemonId: nextId,
            unlockedPokemonIds: [...state.unlockedPokemonIds, nextId],
            multiplier: state.multiplier + 0.1 * state.currentPokemonId,
          };
        }),
      prestige: () =>
        set((state) => {
          if (state.currentPokemonId < 151) return state;

          return {
            score: 0,
            clickPower: 1,
            passiveIncome: 0,
            multiplier: 1,
            rareCandies: state.rareCandies + 1,
            upgrades: initialUpgrades,
            unlockedPokemonIds: [1],
            currentPokemonId: 1,
          };
        }),
      hardReset: () => {
        localStorage.removeItem("poke-idle-storage");
        window.location.reload();
      },
    }),
    {
      name: "poke-idle-storage",
      version: 2,
      migrate: (persistedState: unknown) => {
        const state = {
          ...(persistedState as Record<string, unknown>),
        } as Partial<GameState>;

        if (typeof state.score !== "number" || Number.isNaN(state.score))
          state.score = 0;
        if (
          typeof state.clickPower !== "number" ||
          Number.isNaN(state.clickPower)
        )
          state.clickPower = 1;
        if (
          typeof state.passiveIncome !== "number" ||
          Number.isNaN(state.passiveIncome)
        )
          state.passiveIncome = 0;
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

        if (Array.isArray(state.upgrades)) {
          state.upgrades = state.upgrades.map((u: Partial<Upgrade>) => {
            const initialMatch = initialUpgrades.find(
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

          initialUpgrades.forEach((init) => {
            if (!state.upgrades!.find((u: Upgrade) => u.id === init.id)) {
              state.upgrades!.push(init);
            }
          });
        } else {
          state.upgrades = initialUpgrades;
        }

        state.isPokedexOpen = false;

        return state as GameState;
      },
    },
  ),
);
