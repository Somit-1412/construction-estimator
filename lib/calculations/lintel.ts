export type LintelGroup = {
  type: string;
  number: number;
  length: number;
  width: number;
  depth: number;
};

function validateLintelGroup(group: LintelGroup): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.width < 0 ||
    group.depth < 0
  ) {
    throw new Error(
      "Lintel dimensions cannot be negative."
    );
  }
}

export function calculateLintelConcreteVolume(
  group: LintelGroup
): number {
  validateLintelGroup(group);

  return (
    group.number *
    group.length *
    group.width *
    group.depth
  );
}