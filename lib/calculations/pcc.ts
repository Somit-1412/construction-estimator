export type PCCGroup = {
  number: number;
  length: number;
  breadth: number;
  depth: number;
};

function validatePCCGroup(group: PCCGroup): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.breadth < 0 ||
    group.depth < 0
  ) {
    throw new Error("PCC dimensions cannot be negative.");
  }
}

export function calculatePCCQuantity(
  group: PCCGroup
): number {
  validatePCCGroup(group);

  return (
    group.number *
    group.length *
    group.breadth *
    group.depth
  );
}