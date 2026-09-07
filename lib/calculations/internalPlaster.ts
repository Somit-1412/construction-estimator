export type InternalPlasterSurfaceType =
  | "wall"
  | "ceiling";

export type InternalPlasterGroup = {
  type: string;
  surfaceType: InternalPlasterSurfaceType;
  number: number;
  length: number;
  secondDimension: number;
};

export type InternalPlasterDeduction = {
  type: string;
  number: number;
  length: number;
  height: number;
};

function validateSurface(
  surface: InternalPlasterGroup
): void {
  if (
    surface.number < 0 ||
    surface.length < 0 ||
    surface.secondDimension < 0
  ) {
    throw new Error(
      "Internal plaster dimensions cannot be negative."
    );
  }
}

function validateDeduction(
  deduction: InternalPlasterDeduction
): void {
  if (
    deduction.number < 0 ||
    deduction.length < 0 ||
    deduction.height < 0
  ) {
    throw new Error(
      "Internal plaster deduction dimensions cannot be negative."
    );
  }
}

export function calculateInternalPlasterSurfaceArea(
  surface: InternalPlasterGroup
): number {
  validateSurface(surface);

  return (
    surface.number *
    surface.length *
    surface.secondDimension
  );
}

export function calculateInternalPlasterDeductionArea(
  deduction: InternalPlasterDeduction
): number {
  validateDeduction(deduction);

  return (
    deduction.number *
    deduction.length *
    deduction.height
  );
}