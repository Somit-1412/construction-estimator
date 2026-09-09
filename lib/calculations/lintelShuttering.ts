export type LintelShutteringGroup = {
  type: string;
  number: number;
  shutteringAreaPerLintel: number;
};

function validateLintelShutteringGroup(
  group: LintelShutteringGroup
): void {
  if (
    group.number < 0 ||
    group.shutteringAreaPerLintel < 0
  ) {
    throw new Error(
      "Lintel shuttering values cannot be negative."
    );
  }
}

export function calculateLintelShutteringArea(
  group: LintelShutteringGroup
): number {
  validateLintelShutteringGroup(group);

  return group.number * group.shutteringAreaPerLintel;
}