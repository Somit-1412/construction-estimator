export type FootingGroup = {
  type: string;
  number: number;
  length: number;
  breadth: number;
  thickness: number;
};

function validateFootingGroup(
  group: FootingGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.breadth < 0 ||
    group.thickness < 0
  ) {
    throw new Error(
      "Footing dimensions cannot be negative."
    );
  }
}

export function calculateFootingConcreteQuantity(
  group: FootingGroup
): number {
  validateFootingGroup(group);

  return (
    group.number *
    group.length *
    group.breadth *
    group.thickness
  );
}