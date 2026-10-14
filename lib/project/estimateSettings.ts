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
    mortarRatio: {
      cement: number;
      sand: number;
    };
  };

  plaster: {
    internal: {
      thicknessMm: number;
      dryVolumeFactor: number;
      ratio: {
        cement: number;
        sand: number;
      };
    };

    external: {
      thicknessMm: number;
      dryVolumeFactor: number;
      ratio: {
        cement: number;
        sand: number;
      };
    };
  };

  painting: {
    internalCoverageM2PerLitre: number;
    externalCoverageM2PerLitre: number;
    coats: number;
  };

  labour: Array<{
    key: string;
    label: string;
    unit: string;
    rate: number;
  }>;
};

type UnknownRecord = Record<string, unknown>;

export const emptyEstimateSettings: EstimateSettings = {
  concrete: {
    pcc: {
      cement: 0,
      sand: 0,
      aggregate: 0,
    },

    rcc: {
      cement: 0,
      sand: 0,
      aggregate: 0,
    },

    dryVolumeFactor: 0,
    cementBagVolume: 0.0347,
  },

  masonry: {
    bricksPerM3: 0,
    mortarWetVolumePerM3: 0,
    mortarDryVolumeFactor: 0,

    mortarRatio: {
      cement: 0,
      sand: 0,
    },
  },

  plaster: {
    internal: {
      thicknessMm: 0,
      dryVolumeFactor: 0,

      ratio: {
        cement: 0,
        sand: 0,
      },
    },

    external: {
      thicknessMm: 0,
      dryVolumeFactor: 0,

      ratio: {
        cement: 0,
        sand: 0,
      },
    },
  },

  painting: {
    internalCoverageM2PerLitre: 0,
    externalCoverageM2PerLitre: 0,
    coats: 0,
  },

  labour: [
    {
      key: "excavation",
      label: "Excavation",
      unit: "m³",
      rate: 0,
    },

    {
      key: "pcc",
      label: "PCC",
      unit: "m³",
      rate: 0,
    },

    {
      key: "concrete",
      label: "RCC / Concrete",
      unit: "m³",
      rate: 0,
    },

    {
      key: "brickwork",
      label: "Brickwork",
      unit: "m³",
      rate: 0,
    },

    {
      key: "plaster",
      label: "Plaster",
      unit: "m²",
      rate: 0,
    },

    {
      key: "flooring",
      label: "Flooring",
      unit: "m²",
      rate: 0,
    },

    {
      key: "painting",
      label: "Painting",
      unit: "m²",
      rate: 0,
    },

    {
      key: "filling",
      label: "Filling",
      unit: "m³",
      rate: 0,
    },
  ],
};

function positive(value: unknown): number {
  const n = Number(value);

  return Number.isFinite(n) && n > 0 ? n : 0;
}

function asRecord(value: unknown): UnknownRecord {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as UnknownRecord;
  }

  return {};
}

export function normalizeEstimateSettings(
  value: unknown
): EstimateSettings {
  const source = asRecord(value);

  const concrete = asRecord(
    source.concrete
  );

  const masonry = asRecord(
    source.masonry
  );

  const plaster = asRecord(
    source.plaster
  );

  const painting = asRecord(
    source.painting
  );

  const labourSource = Array.isArray(
    source.labour
  )
    ? source.labour
    : [];

  const pcc = asRecord(
    concrete.pcc
  );

  const rcc = asRecord(
    concrete.rcc
  );

  const mortarRatio = asRecord(
    masonry.mortarRatio
  );

  const internal = asRecord(
    plaster.internal
  );

  const external = asRecord(
    plaster.external
  );

  const internalRatio = asRecord(
    internal.ratio
  );

  const externalRatio = asRecord(
    external.ratio
  );

  return {
    concrete: {
      pcc: {
        cement: positive(
          pcc.cement
        ),

        sand: positive(
          pcc.sand
        ),

        aggregate: positive(
          pcc.aggregate
        ),
      },

      rcc: {
        cement: positive(
          rcc.cement
        ),

        sand: positive(
          rcc.sand
        ),

        aggregate: positive(
          rcc.aggregate
        ),
      },

      dryVolumeFactor: positive(
        concrete.dryVolumeFactor
      ),

      cementBagVolume:
        positive(
          concrete.cementBagVolume
        ) || 0.0347,
    },

    masonry: {
      bricksPerM3: positive(
        masonry.bricksPerM3
      ),

      mortarWetVolumePerM3:
        positive(
          masonry.mortarWetVolumePerM3
        ),

      mortarDryVolumeFactor:
        positive(
          masonry.mortarDryVolumeFactor
        ),

      mortarRatio: {
        cement: positive(
          mortarRatio.cement
        ),

        sand: positive(
          mortarRatio.sand
        ),
      },
    },

    plaster: {
      internal: {
        thicknessMm: positive(
          internal.thicknessMm
        ),

        dryVolumeFactor: positive(
          internal.dryVolumeFactor
        ),

        ratio: {
          cement: positive(
            internalRatio.cement
          ),

          sand: positive(
            internalRatio.sand
          ),
        },
      },

      external: {
        thicknessMm: positive(
          external.thicknessMm
        ),

        dryVolumeFactor: positive(
          external.dryVolumeFactor
        ),

        ratio: {
          cement: positive(
            externalRatio.cement
          ),

          sand: positive(
            externalRatio.sand
          ),
        },
      },
    },

    painting: {
      internalCoverageM2PerLitre:
        positive(
          painting.internalCoverageM2PerLitre
        ),

      externalCoverageM2PerLitre:
        positive(
          painting.externalCoverageM2PerLitre
        ),

      coats: positive(
        painting.coats
      ),
    },

    labour:
      emptyEstimateSettings.labour.map(
        (item) => {
          const found = labourSource.find(
            (entry) => {
              const record =
                asRecord(entry);

              return (
                record.key ===
                item.key
              );
            }
          );

          const foundRecord =
            asRecord(found);

          return {
            ...item,
            rate: positive(
              foundRecord.rate
            ),
          };
        }
      ),
  };
}

export function ratioTotal(
  ratio:
    | RatioSettings
    | {
        cement: number;
        sand: number;
      }
): number {
  return (
    positive(ratio.cement) +
    positive(ratio.sand) +
    positive(
      "aggregate" in ratio
        ? ratio.aggregate
        : 0
    )
  );
}

export function convertConcrete(
  volume: number,
  ratio: RatioSettings,
  settings: EstimateSettings
) {
  const total =
    ratioTotal(ratio);

  const dryVolume =
    volume *
    settings.concrete
      .dryVolumeFactor;

  if (
    !volume ||
    !total ||
    !settings.concrete
      .dryVolumeFactor ||
    !settings.concrete
      .cementBagVolume
  ) {
    return null;
  }

  return {
    cementBags:
      (dryVolume *
        ratio.cement) /
      total /
      settings.concrete
        .cementBagVolume,

    sandVolume:
      (dryVolume *
        ratio.sand) /
      total,

    aggregateVolume:
      (dryVolume *
        Number(
          ratio.aggregate ?? 0
        )) /
      total,
  };
}

export function convertMasonry(
  volume: number,
  settings: EstimateSettings
) {
  const { masonry } =
    settings;

  const total =
    masonry.mortarRatio
      .cement +
    masonry.mortarRatio
      .sand;

  if (
    !volume ||
    !masonry.bricksPerM3 ||
    !masonry
      .mortarWetVolumePerM3 ||
    !masonry
      .mortarDryVolumeFactor ||
    total <= 0 ||
    !settings.concrete
      .cementBagVolume
  ) {
    return null;
  }

  const dryMortar =
    volume *
    masonry
      .mortarWetVolumePerM3 *
    masonry
      .mortarDryVolumeFactor;

  return {
    bricks:
      volume *
      masonry.bricksPerM3,

    cementBags:
      (dryMortar *
        masonry
          .mortarRatio
          .cement) /
      total /
      settings.concrete
        .cementBagVolume,

    sandVolume:
      (dryMortar *
        masonry
          .mortarRatio
          .sand) /
      total,
  };
}

export function convertPlaster(
  area: number,
  specification:
    EstimateSettings["plaster"]["internal"],
  cementBagVolume: number
) {
  const total =
    specification.ratio
      .cement +
    specification.ratio
      .sand;

  if (
    !area ||
    !specification
      .thicknessMm ||
    !specification
      .dryVolumeFactor ||
    total <= 0 ||
    !cementBagVolume
  ) {
    return null;
  }

  const wetVolume =
    (area *
      specification
        .thicknessMm) /
    1000;

  const dryVolume =
    wetVolume *
    specification
      .dryVolumeFactor;

  return {
    cementBags:
      (dryVolume *
        specification
          .ratio.cement) /
      total /
      cementBagVolume,

    sandVolume:
      (dryVolume *
        specification
          .ratio.sand) /
      total,
  };
}