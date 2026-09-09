export type WindowGroup = {
  mark: string;
  number: number;
  width: number;
  height: number;
};

function validateWindowGroup(group: WindowGroup): void {
  if (
    group.number < 0 ||
    group.width < 0 ||
    group.height < 0
  ) {
    throw new Error("Window dimensions cannot be negative.");
  }
}

export function calculateWindowOpeningArea(group: WindowGroup): number {
  validateWindowGroup(group);

  return group.number * group.width * group.height;
}