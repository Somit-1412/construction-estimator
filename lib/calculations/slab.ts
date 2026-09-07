export type SlabGroup = {
  type: string;
  number: number;
  length: number;
  breadth: number;
  thickness: number;
};

function validateSlabGroup(
  group: SlabGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.breadth < 0 ||
    group.thickness < 0
  ) {
    throw new Error(
      "Slab dimensions cannot be negative."
    );
  }
}

export function calculateSlabConcreteQuantity(
  group: SlabGroup
): number {
  validateSlabGroup(group);

  return (
    group.number *
    group.length *
    group.breadth *
    group.thickness
  );
}