export type ExcavationWallType = "long" | "short";

export type ExcavationGroup = {
  type: ExcavationWallType;
  number: number;
  internalLength: number;
  wallThickness: number;
  breadth: number;
  depth: number;
};

export type ExcavationDetails = {
  centreToCentreLength: number;
  excavationLength: number;
  quantity: number;
};

function validateExcavationGroup(group: ExcavationGroup): void {
  if (
    group.number < 0 ||
    group.internalLength < 0 ||
    group.wallThickness < 0 ||
    group.breadth < 0 ||
    group.depth < 0
  ) {
    throw new Error("Excavation dimensions cannot be negative.");
  }
}

export function calculateCentreToCentreLength(
  internalLength: number,
  wallThickness: number
): number {
  return internalLength + wallThickness;
}

export function calculateExcavationLength(
  type: ExcavationWallType,
  centreToCentreLength: number,
  breadth: number
): number {
  if (type === "long") {
    return centreToCentreLength + breadth;
  }

  return centreToCentreLength - breadth;
}

export function calculateExcavationQuantity(
  group: ExcavationGroup
): number {
  validateExcavationGroup(group);

  const centreToCentreLength = calculateCentreToCentreLength(
    group.internalLength,
    group.wallThickness
  );

  const excavationLength = calculateExcavationLength(
    group.type,
    centreToCentreLength,
    group.breadth
  );

  if (excavationLength < 0) {
    throw new Error("Calculated excavation length cannot be negative.");
  }

  return (
    group.number *
    excavationLength *
    group.breadth *
    group.depth
  );
}

export function calculateExcavationDetails(
  group: ExcavationGroup
): ExcavationDetails {
  validateExcavationGroup(group);

  const centreToCentreLength = calculateCentreToCentreLength(
    group.internalLength,
    group.wallThickness
  );

  const excavationLength = calculateExcavationLength(
    group.type,
    centreToCentreLength,
    group.breadth
  );

  if (excavationLength < 0) {
    throw new Error("Calculated excavation length cannot be negative.");
  }

  const quantity =
    group.number *
    excavationLength *
    group.breadth *
    group.depth;

  return {
    centreToCentreLength,
    excavationLength,
    quantity,
  };
}