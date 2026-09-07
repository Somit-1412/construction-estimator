export type BeamReinforcementBar = {
  barMark: string;
  barType: string;
  diameter: number;
  number: number;
  length: number;
};

function validateBeamReinforcementBar(
  bar: BeamReinforcementBar
): void {
  if (
    bar.diameter < 0 ||
    bar.number < 0 ||
    bar.length < 0
  ) {
    throw new Error(
      "Beam reinforcement values cannot be negative."
    );
  }
}

export function calculateBeamReinforcementWeight(
  bar: BeamReinforcementBar
): number {
  validateBeamReinforcementBar(bar);

  const unitWeight =
    (bar.diameter * bar.diameter) / 162;

  return unitWeight * bar.number * bar.length;
}