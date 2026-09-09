export type FlooringGroup = {
  type: string;
  number: number;
  length: number;
  width: number;
};

function validateFlooringGroup(
  group: FlooringGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.width < 0
  ) {
    throw new Error(
      "Flooring dimensions cannot be negative."
    );
  }
}

export function calculateFlooringArea(
  group: FlooringGroup
): number {
  validateFlooringGroup(group);

  return (
    group.number *
    group.length *
    group.width
  );
}