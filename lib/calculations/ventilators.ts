export type VentilatorGroup = {
  mark: string;
  number: number;
  width: number;
  height: number;
};

function validateVentilatorGroup(group: VentilatorGroup): void {
  if (
    group.number < 0 ||
    group.width < 0 ||
    group.height < 0
  ) {
    throw new Error("Ventilator dimensions cannot be negative.");
  }
}

export function calculateVentilatorOpeningArea(
  group: VentilatorGroup
): number {
  validateVentilatorGroup(group);

  return group.number * group.width * group.height;
}