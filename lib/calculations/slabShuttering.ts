export type SlabShutteringGroup = {
  type: string;
  length: number;
  width: number;
};

function validateSlabShutteringGroup(
  group: SlabShutteringGroup
): void {
  if (group.length < 0 || group.width < 0) {
    throw new Error(
      "Slab shuttering dimensions cannot be negative."
    );
  }
}

export function calculateSlabShutteringArea(
  group: SlabShutteringGroup
): number {
  validateSlabShutteringGroup(group);

  return group.length * group.width;
}