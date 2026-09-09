export type DoorGroup = {
  type: string;
  number: number;
  width: number;
  height: number;
};

function validateDoorGroup(group: DoorGroup): void {
  if (
    group.number < 0 ||
    group.width < 0 ||
    group.height < 0
  ) {
    throw new Error("Door dimensions cannot be negative.");
  }
}

export function calculateDoorOpeningArea(group: DoorGroup): number {
  validateDoorGroup(group);

  return group.number * group.width * group.height;
}