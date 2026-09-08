export type FoundationBrickworkGroup = {
  type: string;
  wallType: "long" | "short";
  number: number;
  length: number;
  thickness: number;
  height: number;
};

function validateFoundationBrickworkGroup(
  group: FoundationBrickworkGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.thickness < 0 ||
    group.height < 0
  ) {
    throw new Error(
      "Foundation brickwork dimensions cannot be negative."
    );
  }
}

export function calculateFoundationBrickworkVolume(
  group: FoundationBrickworkGroup
): number {
  validateFoundationBrickworkGroup(group);

  return (
    group.number *
    group.length *
    group.thickness *
    group.height
  );
}