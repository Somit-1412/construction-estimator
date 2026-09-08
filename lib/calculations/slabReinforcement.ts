export type SlabReinforcementGroup = {
  type: string;

  length: number;
  width: number;
  cover: number;

  mainBarDiameterMm: number;
  mainBarSpacing: number;

  distributionBarDiameterMm: number;
  distributionBarSpacing: number;
};

export type SlabReinforcementResult = {
  mainBarCount: number;
  mainBarLength: number;
  mainSteelWeight: number;

  distributionBarCount: number;
  distributionBarLength: number;
  distributionSteelWeight: number;

  totalSteelWeight: number;
};

const STEEL_DENSITY = 7850;

function validateSlabReinforcementGroup(
  group: SlabReinforcementGroup
): void {
  if (
    group.length < 0 ||
    group.width < 0 ||
    group.cover < 0 ||
    group.mainBarDiameterMm < 0 ||
    group.mainBarSpacing <= 0 ||
    group.distributionBarDiameterMm < 0 ||
    group.distributionBarSpacing <= 0
  ) {
    throw new Error(
      "Slab reinforcement dimensions cannot be negative and bar spacing must be greater than zero."
    );
  }

  if (group.length < 2 * group.cover) {
    throw new Error(
      "Slab length must be greater than or equal to twice the cover."
    );
  }

  if (group.width < 2 * group.cover) {
    throw new Error(
      "Slab width must be greater than or equal to twice the cover."
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

export function calculateSlabReinforcement(
  group: SlabReinforcementGroup
): SlabReinforcementResult {
  validateSlabReinforcementGroup(group);

  const clearLength = group.length - 2 * group.cover;
  const clearWidth = group.width - 2 * group.cover;

  const mainBarCount =
    Math.ceil(clearWidth / group.mainBarSpacing) + 1;

  const mainBarLength = clearLength;

  const totalMainBarLength =
    mainBarCount * mainBarLength;

  const mainSteelWeight = calculateSteelWeight(
    group.mainBarDiameterMm,
    totalMainBarLength
  );

  const distributionBarCount =
    Math.ceil(
        clearLength / group.distributionBarSpacing
    ) + 1;

  const distributionBarLength = clearWidth;

  const totalDistributionBarLength =
    distributionBarCount * distributionBarLength;

  const distributionSteelWeight = calculateSteelWeight(
    group.distributionBarDiameterMm,
    totalDistributionBarLength
  );

  const totalSteelWeight =
    mainSteelWeight + distributionSteelWeight;

  return {
    mainBarCount,
    mainBarLength,
    mainSteelWeight,

    distributionBarCount,
    distributionBarLength,
    distributionSteelWeight,

    totalSteelWeight,
  };
}