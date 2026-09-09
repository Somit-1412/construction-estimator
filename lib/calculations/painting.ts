export type PaintingResult = {
  internalPaintingArea: number;
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