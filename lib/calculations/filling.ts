export type FillingGroup = {
  type: string;
  number: number;
  length: number;
  width: number;
  depth: number;
};

function validateFillingGroup(
  group: FillingGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.width < 0 ||
    group.depth < 0
  ) {
    throw new Error(
      "Filling dimensions cannot be negative."
    );
  }
}

export function calculateFillingVolume(
  group: FillingGroup
): number {
  validateFillingGroup(group);

  return (
    group.number *
    group.length *
    group.width *
    group.depth
  );
}