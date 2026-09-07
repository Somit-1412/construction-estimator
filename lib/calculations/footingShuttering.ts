export type FootingShutteringGroup = {
  type: string;
  number: number;
  length: number;
  breadth: number;
  thickness: number;
};

function validateFootingShutteringGroup(
  group: FootingShutteringGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.breadth < 0 ||
    group.thickness < 0
  ) {
    throw new Error(
      "Footing shuttering dimensions cannot be negative."
    );
  }
}

export function calculateFootingShutteringArea(
  group: FootingShutteringGroup
): number {
  validateFootingShutteringGroup(group);

  return (
    2 *
    (group.length + group.breadth) *
    group.thickness *
    group.number
  );
}