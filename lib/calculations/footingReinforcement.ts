export type FootingReinforcementGroup = {
  type: string;
  barType: string;
  diameter: number;
  numberOfBars: number;
  lengthPerBar: number;
};

function validateFootingReinforcementGroup(
  group: FootingReinforcementGroup
): void {
  if (
    group.diameter < 0 ||
    group.numberOfBars < 0 ||
    group.lengthPerBar < 0
  ) {
    throw new Error(
      "Footing reinforcement dimensions cannot be negative."
    );
  }
}

export function calculateFootingReinforcementTotalLength(
  group: FootingReinforcementGroup
): number {
  validateFootingReinforcementGroup(group);

  return (
    group.numberOfBars *
    group.lengthPerBar
  );
}

export function calculateFootingReinforcementWeight(
  group: FootingReinforcementGroup
): number {
  validateFootingReinforcementGroup(group);

  const totalLength =
    calculateFootingReinforcementTotalLength(group);

  return (
    (group.diameter * group.diameter) /
    162 *
    totalLength
  );
}