export type ColumnGroup = {
  type: string;
  width: number;
  depth: number;
  number: number;
  height: number;
};

function validateColumnGroup(group: ColumnGroup): void {
  if (
    group.width < 0 ||
    group.depth < 0 ||
    group.number < 0 ||
    group.height < 0
  ) {
    throw new Error("Column dimensions cannot be negative.");
  }
}

export function calculateColumnConcreteQuantity(
  group: ColumnGroup
): number {
  validateColumnGroup(group);

  return (
    group.width *
    group.depth *
    group.height *
    group.number
  );
}

export function calculateColumnShutteringArea(
  group: ColumnGroup
): number {
  validateColumnGroup(group);

  return (
    2 *
    (group.width + group.depth) *
    group.height *
    group.number
  );
}