export type BrickworkDeduction = {
  type: string;
  length: number;
  breadth: number;
  height: number;
  number: number;
};

export type BrickworkGroup = {
  type: string;
  number: number;
  length: number;
  breadth: number;
  height: number;
  deductions: BrickworkDeduction[];
};

function validateDeduction(
  deduction: BrickworkDeduction
): void {
  if (
    deduction.length < 0 ||
    deduction.breadth < 0 ||
    deduction.height < 0 ||
    deduction.number < 0
  ) {
    throw new Error(
      "Brickwork deduction dimensions cannot be negative."
    );
  }
}

function validateBrickworkGroup(
  group: BrickworkGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.breadth < 0 ||
    group.height < 0
  ) {
    throw new Error(
      "Brickwork dimensions cannot be negative."
    );
  }

  group.deductions.forEach(validateDeduction);
}

export function calculateBrickworkGrossQuantity(
  group: BrickworkGroup
): number {
  validateBrickworkGroup(group);

  return (
    group.number *
    group.length *
    group.breadth *
    group.height
  );
}

export function calculateBrickworkDeductionQuantity(
  deduction: BrickworkDeduction
): number {
  validateDeduction(deduction);

  return (
    deduction.number *
    deduction.length *
    deduction.breadth *
    deduction.height
  );
}

export function calculateBrickworkNetQuantity(
  group: BrickworkGroup
): number {
  validateBrickworkGroup(group);

  const grossQuantity =
    calculateBrickworkGrossQuantity(group);

  const totalDeductions = group.deductions.reduce(
    (total, deduction) =>
      total +
      calculateBrickworkDeductionQuantity(deduction),
    0
  );

  const netQuantity =
    grossQuantity - totalDeductions;

  if (netQuantity < 0) {
    throw new Error(
      "Brickwork deductions cannot exceed gross brickwork quantity."
    );
  }

  return netQuantity;
}