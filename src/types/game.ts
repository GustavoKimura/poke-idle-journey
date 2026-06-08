export interface Upgrade {
  id: string;
  name: string;
  baseCost: number;
  costMultiplier: number;
  count: number;
  type: "active" | "passive";
  effect: number;
}

export interface GameState {
  score: number;
  clickPower: number;
  passiveIncome: number;
  multiplier: number;
  upgrades: Upgrade[];
  click: () => void;
  buyUpgrade: (id: string) => void;
}
