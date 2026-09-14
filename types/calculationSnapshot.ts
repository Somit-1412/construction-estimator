import {
  emptyProjectQuantities,
  type ProjectQuantities,
} from "./projectQuantities";

export type CalculationSnapshot = {
  quantities: ProjectQuantities;
  calculatedAt: string;
};

export function createEmptyCalculationSnapshot(): CalculationSnapshot {
  return {
    quantities: { ...emptyProjectQuantities },
    calculatedAt: new Date().toISOString(),
  };
}