export type ExternalPlasterGroup = {
  type: string;
  number: number;
  length: number;
  height: number;
};

export type ExternalPlasterDeduction = {
  type: string;
  number: number;
  length: number;
  height: number;
};

function validateGroup(
  group: ExternalPlasterGroup
): void {
  if (
    group.number < 0 ||
    group.length < 0 ||
    group.height < 0
  ) {
    throw new Error(
      "External plaster dimensions cannot be negative."
    );
  }
}

function validateDeduction(
  deduction: ExternalPlasterDeduction
): void {
  if (
    deduction.number < 0 ||
    deduction.length < 0 ||
    deduction.height < 0
  ) {
    throw new Error(
      "External plaster deduction dimensions cannot be negative."
    );
  }
}

export function calculateExternalPlasterArea(
  group: ExternalPlasterGroup
): number {
  validateGroup(group);

  return (
    group.number *
    group.length *
    group.height
  );
}

export function calculateExternalPlasterDeductionArea(
  deduction: ExternalPlasterDeduction
): number {
  validateDeduction(deduction);

  return (
    deduction.number *
    deduction.length *
    deduction.height
  );
}