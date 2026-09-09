export type LintelReinforcementGroup = {
  type: string;

  number: number;

  mainBarDiameterMm: number;
  mainBarCount: number;
  mainBarLength: number;

  stirrupDiameterMm: number;
  stirrupCount: number;
  stirrupLength: number;
};

export type LintelReinforcementResult = {
  mainSteelWeight: number;
  stirrupSteelWeight: number;
  totalSteelWeight: number;
};

const STEEL_DENSITY = 7850;

function validateLintelReinforcementGroup(
  group: LintelReinforcementGroup
): void {
  if (
    group.number < 0 ||
    group.mainBarDiameterMm < 0 ||
    group.mainBarCount < 0 ||
    group.mainBarLength < 0 ||
    group.stirrupDiameterMm < 0 ||
    group.stirrupCount < 0 ||
    group.stirrupLength < 0
  ) {
    throw new Error(
      "Lintel reinforcement values cannot be negative."
    );
  }
}

function calculateSteelWeight(
  diameterMm: number,
  totalBarLength: number
): number {
  const diameterM = diameterMm / 1000;

  return (
    (Math.PI / 4) *
    diameterM ** 2 *
    totalBarLength *
    STEEL_DENSITY
  );
}

export function calculateLintelReinforcement(
  group: LintelReinforcementGroup
): LintelReinforcementResult {
  validateLintelReinforcementGroup(group);

  const totalMainBarLength =
    group.number *
    group.mainBarCount *
    group.mainBarLength;

  const mainSteelWeight = calculateSteelWeight(
    group.mainBarDiameterMm,
    totalMainBarLength
  );

  const totalStirrupLength =
    group.number *
    group.stirrupCount *
    group.stirrupLength;

  const stirrupSteelWeight = calculateSteelWeight(
    group.stirrupDiameterMm,
    totalStirrupLength
  );

  return {
    mainSteelWeight,
    stirrupSteelWeight,
    totalSteelWeight:
      mainSteelWeight + stirrupSteelWeight,
  };
}