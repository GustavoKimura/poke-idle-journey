import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState } from "../types/game";

const initialUpgrades = [
  {
    id: "1",
    name: "Extra Pokeball",
    baseCost: 10,
    costMultiplier: 1.15,
    count: 0,
    type: "active" as const,
    effect: 1,
  },
  {
    id: "2",
    name: "Youngster Trainer",
    baseCost: 50,
    costMultiplier: 1.15,
    count: 0,
    type: "passive" as const,
    effect: 2,
  },
  {
    id: "3",
    name: "Local Gym",
    baseCost: 500,
    costMultiplier: 1.15,
    count: 0,
    type: "passive" as const,
    effect: 25,
  },
  {
    id: "4",
    name: "Pokemon Daycare",
    baseCost: 5000,
    costMultiplier: 1.15,
    count: 0,
    type: "passive" as const,
    effect: 150,
  },
  {
    id: "5",
    name: "Silph Co. Scope",
    baseCost: 50000,
    costMultiplier: 1.18,
    count: 0,
    type: "active" as const,
    effect: 500,
  },
  {
    id: "6",
    name: "Master Ball Factory",
    baseCost: 1000000,
    costMultiplier: 1.2,
    count: 0,
    type: "passive" as const,
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
    }),
    {
      name: "poke-idle-storage",
    },
  ),
);
