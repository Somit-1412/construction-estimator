export type DPCGroup = {
  type: string;
  number: number;
  length: number;
  breadth: number;
};

function validateDPCGroup(group: DPCGroup): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.breadth < 0
  ) {
    throw new Error("DPC dimensions cannot be negative.");
  }
}

export function calculateDPCQuantity(
  group: DPCGroup
): number {
  validateDPCGroup(group);

  return (
    group.number *
    group.length *
    group.breadth
  );
}