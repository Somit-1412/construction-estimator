export type BeamGroup = {
  type: string;
  width: number;
  depth: number;
  length: number;
  number: number;
};

function validateBeamGroup(group: BeamGroup): void {
  if (
    group.width < 0 ||
    group.depth < 0 ||
    group.length < 0 ||
    group.number < 0
  ) {
    throw new Error("Beam dimensions cannot be negative.");
  }
}

export function calculateBeamConcreteQuantity(
  group: BeamGroup
): number {
  validateBeamGroup(group);

  return (
    group.length *
    group.width *
    group.depth *
    group.number
  );
}

export function calculateBeamShutteringArea(
  group: BeamGroup
): number {
  validateBeamGroup(group);

  return (
    group.length *
    (2 * group.depth + group.width) *
    group.number
  );
}