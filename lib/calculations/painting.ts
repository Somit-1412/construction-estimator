export type PaintingResult = {
  internalPaintingArea: number;
  externalPaintingArea: number;
  totalPaintingArea: number;
};

export function calculateInternalPaintingArea(
  internalPlasterNetArea: number
): number {
  if (internalPlasterNetArea < 0) {
    throw new Error(
      "Internal plaster area cannot be negative."
    );
  }

  return internalPlasterNetArea;
}

export function calculateExternalPaintingArea(
  externalPlasterNetArea: number
): number {
  if (externalPlasterNetArea < 0) {
    throw new Error(
      "External plaster area cannot be negative."
    );
  }

  return externalPlasterNetArea;
}

export function totalPaintingArea(
  internalPaintingArea: number,
  externalPaintingArea: number
): number {
  return (
    calculateInternalPaintingArea(internalPaintingArea) +
    calculateExternalPaintingArea(externalPaintingArea)
  );
}