export type RatioSettings = {
  cement: number;
  sand: number;
  aggregate?: number;
};

export type EstimateSettings = {
  concrete: {
    pcc: RatioSettings;
    rcc: RatioSettings;
    dryVolumeFactor: number;
    cementBagVolume: number;
  };
  masonry: {
    bricksPerM3: number;
    mortarWetVolumePerM3: number;
    mortarDryVolumeFactor: number;
    mortarRatio: { cement: number; sand: number };
  };
  plaster: {
    internal: { thicknessMm: number; dryVolumeFactor: number; ratio: { cement: number; sand: number } };
    external: { thicknessMm: number; dryVolumeFactor: number; ratio: { cement: number; sand: number } };
  };
  painting: {
    internalLitresPerM2: number;
    externalLitresPerM2: number;
  };
};

export const emptyEstimateSettings: EstimateSettings = {
  concrete: {
    pcc: { cement: 0, sand: 0, aggregate: 0 },
    rcc: { cement: 0, sand: 0, aggregate: 0 },
    dryVolumeFactor: 0,
    cementBagVolume: 0.0347,
  },
  masonry: {
    bricksPerM3: 0,
    mortarWetVolumePerM3: 0,
    mortarDryVolumeFactor: 0,
    mortarRatio: { cement: 0, sand: 0 },
  },
  plaster: {
    internal: { thicknessMm: 0, dryVolumeFactor: 0, ratio: { cement: 0, sand: 0 } },
    external: { thicknessMm: 0, dryVolumeFactor: 0, ratio: { cement: 0, sand: 0 } },
  },
  painting: { internalLitresPerM2: 0, externalLitresPerM2: 0 },
};

function positive(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function normalizeEstimateSettings(value: unknown): EstimateSettings {
  const source = value && typeof value === "object" ? value as Record<string, any> : {};
  const concrete = source.concrete ?? {};
  const masonry = source.masonry ?? {};
  const plaster = source.plaster ?? {};
  const painting = source.painting ?? {};
  const pcc = concrete.pcc ?? {};
  const rcc = concrete.rcc ?? {};
  const mortarRatio = masonry.mortarRatio ?? {};
  const internal = plaster.internal ?? {};
  const external = plaster.external ?? {};

  return {
    concrete: {
      pcc: { cement: positive(pcc.cement), sand: positive(pcc.sand), aggregate: positive(pcc.aggregate) },
      rcc: { cement: positive(rcc.cement), sand: positive(rcc.sand), aggregate: positive(rcc.aggregate) },
      dryVolumeFactor: positive(concrete.dryVolumeFactor),
      cementBagVolume: positive(concrete.cementBagVolume) || 0.0347,
    },
    masonry: {
      bricksPerM3: positive(masonry.bricksPerM3),
      mortarWetVolumePerM3: positive(masonry.mortarWetVolumePerM3),
      mortarDryVolumeFactor: positive(masonry.mortarDryVolumeFactor),
      mortarRatio: { cement: positive(mortarRatio.cement), sand: positive(mortarRatio.sand) },
    },
    plaster: {
      internal: {
        thicknessMm: positive(internal.thicknessMm),
        dryVolumeFactor: positive(internal.dryVolumeFactor),
        ratio: { cement: positive(internal.ratio?.cement), sand: positive(internal.ratio?.sand) },
      },
      external: {
        thicknessMm: positive(external.thicknessMm),
        dryVolumeFactor: positive(external.dryVolumeFactor),
        ratio: { cement: positive(external.ratio?.cement), sand: positive(external.ratio?.sand) },
      },
    },
    painting: {
      internalLitresPerM2: positive(painting.internalLitresPerM2),
      externalLitresPerM2: positive(painting.externalLitresPerM2),
    },
  };
}

export function ratioTotal(ratio: RatioSettings | { cement: number; sand: number }): number {
  return positive(ratio.cement) + positive(ratio.sand) + positive("aggregate" in ratio ? ratio.aggregate : 0);
}

export function convertConcrete(volume: number, ratio: RatioSettings, settings: EstimateSettings) {
  const total = ratioTotal(ratio);
  const dryVolume = volume * settings.concrete.dryVolumeFactor;
  if (!volume || !total || !settings.concrete.dryVolumeFactor || !settings.concrete.cementBagVolume) return null;
  return {
    cementBags: dryVolume * ratio.cement / total / settings.concrete.cementBagVolume,
    sandVolume: dryVolume * ratio.sand / total,
    aggregateVolume: dryVolume * Number(ratio.aggregate ?? 0) / total,
  };
}

export function convertMasonry(volume: number, settings: EstimateSettings) {
  const { masonry } = settings;
  const total = masonry.mortarRatio.cement + masonry.mortarRatio.sand;
  if (!volume || !masonry.bricksPerM3 || !masonry.mortarWetVolumePerM3 || !masonry.mortarDryVolumeFactor || total <= 0 || !settings.concrete.cementBagVolume) return null;
  const dryMortar = volume * masonry.mortarWetVolumePerM3 * masonry.mortarDryVolumeFactor;
  return {
    bricks: volume * masonry.bricksPerM3,
    cementBags: dryMortar * masonry.mortarRatio.cement / total / settings.concrete.cementBagVolume,
    sandVolume: dryMortar * masonry.mortarRatio.sand / total,
  };
}

export function convertPlaster(area: number, specification: EstimateSettings["plaster"]["internal"], cementBagVolume: number) {
  const total = specification.ratio.cement + specification.ratio.sand;
  if (!area || !specification.thicknessMm || !specification.dryVolumeFactor || total <= 0 || !cementBagVolume) return null;
  const wetVolume = area * specification.thicknessMm / 1000;
  const dryVolume = wetVolume * specification.dryVolumeFactor;
  return {
    cementBags: dryVolume * specification.ratio.cement / total / cementBagVolume,
    sandVolume: dryVolume * specification.ratio.sand / total,
  };
}
