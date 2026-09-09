export type FlooringTileInput = {
  floorArea: number;

  tileLength: number;
  tileWidth: number;

  skirtingPercentage: number;
};

export type FlooringTileResult = {
  tileArea: number;
  floorTiles: number;
  skirtingTiles: number;
  totalTiles: number;
};

export type FlooringMaterialInput = {
  floorArea: number;

  beddingThickness: number;

  wetMortarAllowancePercentage: number;

  cementRatio: number;
  sandRatio: number;

  dryMortarFactor: number;

  cementBagVolume: number;
};

export type FlooringMaterialResult = {
  baseMortarVolume: number;
  wetMortarVolume: number;
  dryMortarVolume: number;

  cementVolume: number;
  cementBags: number;

  sandVolume: number;
};

function validateFlooringTileInput(
  input: FlooringTileInput
): void {
  if (
    input.floorArea < 0 ||
    input.tileLength <= 0 ||
    input.tileWidth <= 0 ||
    input.skirtingPercentage < 0
  ) {
    throw new Error(
      "Flooring tile values are invalid."
    );
  }
}

export function calculateFlooringTileQuantity(
  input: FlooringTileInput
): FlooringTileResult {
  validateFlooringTileInput(input);

  const tileArea =
    input.tileLength * input.tileWidth;

  const floorTiles = Math.ceil(
    input.floorArea / tileArea
  );

  const skirtingTiles = Math.ceil(
    (floorTiles * input.skirtingPercentage) / 100
  );

  return {
    tileArea,
    floorTiles,
    skirtingTiles,
    totalTiles: floorTiles + skirtingTiles,
  };
}

function validateFlooringMaterialInput(
  input: FlooringMaterialInput
): void {
  if (
    input.floorArea < 0 ||
    input.beddingThickness < 0 ||
    input.wetMortarAllowancePercentage < 0 ||
    input.cementRatio <= 0 ||
    input.sandRatio < 0 ||
    input.dryMortarFactor <= 0 ||
    input.cementBagVolume <= 0
  ) {
    throw new Error(
      "Flooring material values are invalid."
    );
  }

  if (
    input.cementRatio + input.sandRatio <= 0
  ) {
    throw new Error(
      "Cement and sand ratio must have a positive total."
    );
  }
}

export function calculateFlooringMaterials(
  input: FlooringMaterialInput
): FlooringMaterialResult {
  validateFlooringMaterialInput(input);

  const baseMortarVolume =
    input.floorArea *
    input.beddingThickness;

  const wetMortarVolume =
    baseMortarVolume *
    (1 + input.wetMortarAllowancePercentage / 100);

  const dryMortarVolume =
    wetMortarVolume *
    input.dryMortarFactor;

  const totalRatio =
    input.cementRatio +
    input.sandRatio;

  const cementVolume =
    dryMortarVolume *
    (input.cementRatio / totalRatio);

  const cementBags =
    cementVolume / input.cementBagVolume;

  const sandVolume =
    dryMortarVolume *
    (input.sandRatio / totalRatio);

  return {
    baseMortarVolume,
    wetMortarVolume,
    dryMortarVolume,
    cementVolume,
    cementBags,
    sandVolume,
  };
}