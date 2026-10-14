import {
  calculateExcavationQuantity,
  type ExcavationGroup,
} from "@/lib/calculations/excavation";

import {
  calculatePCCQuantity,
  type PCCGroup,
} from "@/lib/calculations/pcc";

import {
  calculateFootingConcreteQuantity,
  type FootingGroup,
} from "@/lib/calculations/footing";

import {
  calculateFootingReinforcementWeight,
  type FootingReinforcementGroup,
} from "@/lib/calculations/footingReinforcement";

import {
  calculateFootingShutteringArea,
  type FootingShutteringGroup,
} from "@/lib/calculations/footingShuttering";

import {
  calculateColumnConcreteQuantity,
  calculateColumnShutteringArea,
  type ColumnGroup,
} from "@/lib/calculations/columns";

import {
  calculateBeamConcreteQuantity,
  calculateBeamShutteringArea,
  type BeamGroup,
} from "@/lib/calculations/beams";

import {
  calculateBeamReinforcementWeight,
  type BeamReinforcementBar,
} from "@/lib/calculations/beamReinforcement";

import {
  calculateSlabConcreteQuantity,
  type SlabGroup,
} from "@/lib/calculations/slab";

import {
  calculateSlabReinforcement,
  type SlabReinforcementGroup,
} from "@/lib/calculations/slabReinforcement";

import {
  calculateSlabShutteringArea,
  type SlabShutteringGroup,
} from "@/lib/calculations/slabShuttering";

import {
  calculateFoundationBrickworkVolume,
  type FoundationBrickworkGroup,
} from "@/lib/calculations/foundationBrickwork";

import {
  calculateBrickworkNetQuantity,
  type BrickworkGroup,
} from "@/lib/calculations/brickwork";

import {
  calculateDPCQuantity,
  type DPCGroup,
} from "@/lib/calculations/dpc";

import {
  calculateLintelConcreteVolume,
  type LintelGroup,
} from "@/lib/calculations/lintel";

import {
  calculateLintelReinforcement,
  type LintelReinforcementGroup,
} from "@/lib/calculations/lintelReinforcement";

import {
  calculateLintelShutteringArea,
  type LintelShutteringGroup,
} from "@/lib/calculations/lintelShuttering";

import {
  calculateFillingVolume,
  type FillingGroup,
} from "@/lib/calculations/filling";

import {
  calculateInternalPlaster,
  type InternalPlasterDeduction,
  type InternalPlasterGroup,
} from "@/lib/calculations/internalPlaster";

import {
  calculateExternalPlasterArea,
  calculateExternalPlasterDeductionArea,
  type ExternalPlasterDeduction,
  type ExternalPlasterGroup,
} from "@/lib/calculations/externalPlaster";

import {
  calculateFlooringArea,
  type FlooringGroup,
} from "@/lib/calculations/flooring";

import {
  calculateFlooringMaterials,
  calculateFlooringTileQuantity,
  type FlooringMaterialInput,
  type FlooringTileInput,
} from "@/lib/calculations/flooringMaterials";

import {
  calculateDoorOpeningArea,
  type DoorGroup,
} from "@/lib/calculations/doors";

import {
  calculateWindowOpeningArea,
  type WindowGroup,
} from "@/lib/calculations/windows";

import {
  calculateVentilatorOpeningArea,
  type VentilatorGroup,
} from "@/lib/calculations/ventilators";

import {
  calculateInternalPaintingArea,
} from "@/lib/calculations/painting";

import type {
  CalculationType,
} from "@/lib/generated/prisma/client";

import {
  convertConcrete,
  convertMasonry,
  convertPlaster,
  normalizeEstimateSettings,
} from "@/lib/project/estimateSettings";

export type CalculationResult = Record<
  string,
  number | Record<string, number>
>;

const array = <T>(value: unknown): T[] =>
  Array.isArray(value)
    ? (value as T[])
    : [];

const input = (
  value: unknown
): Record<string, unknown> =>
  value &&
  typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};

export function calculateCalculationResult(
  type: CalculationType,
  rawInputs: unknown
): CalculationResult {
  const data = input(rawInputs);

  switch (type) {
    case "EXCAVATION": {
      const quantity = array<ExcavationGroup>(
        data.excavationGroups
      ).reduce(
        (sum, group) =>
          sum +
          safe(() =>
            calculateExcavationQuantity(group)
          ),
        0
      );

      return { quantity };
    }

    case "PCC": {
      const quantity = array<PCCGroup>(
        data.pccGroups
      ).reduce(
        (sum, group) =>
          sum +
          safe(() =>
            calculatePCCQuantity(group)
          ),
        0
      );

      return { quantity };
    }

    case "FOOTING": {
      const quantity = array<FootingGroup>(
        data.footingGroups
      ).reduce(
        (sum, group) =>
          sum +
          safe(() =>
            calculateFootingConcreteQuantity(group)
          ),
        0
      );

      return { quantity };
    }

    case "FOOTING_REINFORCEMENT": {
      const steelWeight =
        array<FootingReinforcementGroup>(
          data.footingReinforcementGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateFootingReinforcementWeight(
                group
              )
            ),
          0
        );

      return { steelWeight };
    }

    case "FOOTING_SHUTTERING": {
      const area =
        array<FootingShutteringGroup>(
          data.footingShutteringGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateFootingShutteringArea(
                group
              )
            ),
          0
        );

      return { area };
    }

    case "COLUMN_CONCRETE":
    case "COLUMN_SHUTTERING": {
      const groups = array<ColumnGroup>(
        data.columnGroups
      );

      const concreteVolume =
        groups.reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateColumnConcreteQuantity(
                group
              )
            ),
          0
        );

      const area =
        groups.reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateColumnShutteringArea(
                group
              )
            ),
          0
        );

      return {
        concreteVolume,
        shutteringArea: area,
      };
    }

    case "BEAM_CONCRETE":
    case "BEAM_REINFORCEMENT":
    case "BEAM_BBS":
    case "BEAM_SHUTTERING": {
      const groups =
        array<
          BeamGroup & {
            reinforcementBars?: BeamReinforcementBar[];
          }
        >(data.beamGroups);

      const concreteVolume =
        groups.reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateBeamConcreteQuantity(
                group
              )
            ),
          0
        );

      const shutteringArea =
        groups.reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateBeamShutteringArea(
                group
              )
            ),
          0
        );

      const steelWeight =
        groups.reduce(
          (sum, group) =>
            sum +
            array<BeamReinforcementBar>(
              group.reinforcementBars
            ).reduce(
              (barSum, bar) =>
                barSum +
                safe(() =>
                  calculateBeamReinforcementWeight(
                    bar
                  )
                ),
              0
            ),
          0
        );

      return {
        concreteVolume,
        steelWeight,
        shutteringArea,
      };
    }

    case "SLAB_CONCRETE": {
      const quantity =
        array<SlabGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateSlabConcreteQuantity(
                group
              )
            ),
          0
        );

      return { quantity };
    }

    case "SLAB_REINFORCEMENT": {
      const steelWeight =
        array<SlabReinforcementGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(
              () =>
                calculateSlabReinforcement(
                  group
                ).totalSteelWeight
            ),
          0
        );

      return { steelWeight };
    }

    case "SLAB_SHUTTERING": {
      const area =
        array<SlabShutteringGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateSlabShutteringArea(
                group
              )
            ),
          0
        );

      return { area };
    }

    case "FOUNDATION_PLINTH_BRICKWORK": {
      const quantity =
        array<FoundationBrickworkGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateFoundationBrickworkVolume(
                group
              )
            ),
          0
        );

      return { quantity };
    }

    case "BRICKWORK": {
      const quantity =
        array<BrickworkGroup>(
          data.brickworkGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateBrickworkNetQuantity(
                group
              )
            ),
          0
        );

      return { quantity };
    }

    case "DPC": {
      const quantity =
        array<DPCGroup>(
          data.dpcGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateDPCQuantity(group)
            ),
          0
        );

      return { quantity };
    }

    case "LINTEL":
    case "LINTEL_REINFORCEMENT":
    case "LINTEL_SHUTTERING": {
      const concreteVolume =
        array<LintelGroup>(
          data.lintelGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateLintelConcreteVolume(
                group
              )
            ),
          0
        );

      const steelWeight =
        array<LintelReinforcementGroup>(
          data.lintelReinforcementGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(
              () =>
                calculateLintelReinforcement(
                  group
                ).totalSteelWeight
            ),
          0
        );

      const shutteringArea =
        array<LintelShutteringGroup>(
          data.lintelShutteringGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateLintelShutteringArea(
                group
              )
            ),
          0
        );

      return {
        concreteVolume,
        steelWeight,
        shutteringArea,
      };
    }

    case "FILLING": {
      const quantity =
        array<FillingGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateFillingVolume(group)
            ),
          0
        );

      return { quantity };
    }

    case "INTERNAL_PLASTER": {
      const result =
        calculateInternalPlaster(
          array<InternalPlasterGroup>(
            data.plasterGroups
          ),
          array<InternalPlasterDeduction>(
            data.deductions
          )
        );

      return {
        grossArea: result.grossArea,
        deductionArea:
          result.deductionArea,
        netArea: result.netArea,
      };
    }

    case "EXTERNAL_PLASTER": {
      const grossArea =
        array<ExternalPlasterGroup>(
          data.plasterGroups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateExternalPlasterArea(
                group
              )
            ),
          0
        );

      const deductionArea =
        array<ExternalPlasterDeduction>(
          data.deductions
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateExternalPlasterDeductionArea(
                group
              )
            ),
          0
        );

      return {
        grossArea,
        deductionArea,
        netArea: Math.max(
          0,
          grossArea - deductionArea
        ),
      };
    }

    case "FLOORING":
    case "FLOORING_MATERIALS": {
      const groups =
        array<FlooringGroup>(
          data.groups
        );

      const floorArea =
        groups.reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateFlooringArea(group)
            ),
          0
        );

      const tileInput =
        input(
          data.tileInput
        ) as unknown as FlooringTileInput;

      const materialInput =
        input(
          data.materialInput
        ) as unknown as FlooringMaterialInput;

      let tileResult:
        ReturnType<
          typeof calculateFlooringTileQuantity
        >;

      try {
        tileResult =
          calculateFlooringTileQuantity({
            ...tileInput,
            floorArea,
          });
      } catch {
        tileResult = {
          tileArea: 0,
          floorTiles: 0,
          skirtingTiles: 0,
          totalTiles: 0,
        };
      }

      let materialResult:
        ReturnType<
          typeof calculateFlooringMaterials
        >;

      try {
        materialResult =
          calculateFlooringMaterials({
            ...materialInput,
            floorArea,
          });
      } catch {
        materialResult = {
          baseMortarVolume: 0,
          wetMortarVolume: 0,
          dryMortarVolume: 0,
          cementVolume: 0,
          cementBags: 0,
          sandVolume: 0,
        };
      }

      return {
        floorArea,
        tileQuantity:
          tileResult.totalTiles,

        tileArea:
          tileResult.totalTiles *
          (Number(
            tileInput.tileLength
          ) || 0) *
          (Number(
            tileInput.tileWidth
          ) || 0),

        cementBags:
          materialResult.cementBags,

        sandVolume:
          materialResult.sandVolume,
      };
    }

    case "DOORS": {
      const area =
        array<DoorGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateDoorOpeningArea(
                group
              )
            ),
          0
        );

      return { area };
    }

    case "WINDOWS": {
      const area =
        array<WindowGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateWindowOpeningArea(
                group
              )
            ),
          0
        );

      return { area };
    }

    case "VENTILATORS": {
      const area =
        array<VentilatorGroup>(
          data.groups
        ).reduce(
          (sum, group) =>
            sum +
            safe(() =>
              calculateVentilatorOpeningArea(
                group
              )
            ),
          0
        );

      return { area };
    }

    case "PAINTING": {
      const area =
        calculateInternalPaintingArea(
          Number(
            data.internalPlasterNetArea
          ) || 0
        );

      return { area };
    }
  }
}

function safe(
  fn: () => number
): number {
  try {
    const value = fn();

    return Number.isFinite(value)
      ? value
      : 0;
  } catch {
    return 0;
  }
}

export type ProjectEstimate = {
  workQuantities: Array<{
    key: string;
    label: string;
    quantity: number;
    unit: string;
  }>;

  labour: Array<{
    key: string;
    label: string;
    quantity: number;
    unit: string;
    rate: number;
    cost: number;
  }>;

  totalLabourCost: number;

  materials: Array<{
    materialName: string;
    quantity: number;
    unit: string;
    source: string;
    rate: number | null;
    cost: number | null;
  }>;

  totalMaterialCost: number;
};

export function buildProjectEstimate(
  calculations: Array<{
    type: CalculationType;
    inputs: unknown;
    results: unknown;
  }>,
  rates: Array<{
    materialName: string;
    unit: string;
    rate: number | null;
  }>,
  rawSettings?: unknown
): ProjectEstimate {
  const settings =
    normalizeEstimateSettings(
      rawSettings
    );

  const results =
    new Map<
      CalculationType,
      CalculationResult
    >();

  for (const calculation of calculations) {
    const stored =
      input(calculation.results);

    results.set(
      calculation.type,
      Object.keys(stored).length
        ? (stored as CalculationResult)
        : calculateCalculationResult(
            calculation.type,
            calculation.inputs
          )
    );
  }

  const sumResult = (
    types: CalculationType[],
    key: string
  ) =>
    types.reduce(
      (sum, type) =>
        sum +
        Number(
          results.get(type)?.[key] ?? 0
        ),
      0
    );

  const firstResult = (
    types: CalculationType[],
    key: string
  ) => {
    for (const type of types) {
      const value =
        results.get(type)?.[key];

      if (value !== undefined) {
        return Number(value);
      }
    }

    return 0;
  };

  const workQuantities = [
    {
      key: "excavation",
      label: "Excavation",
      quantity:
        sumResult(
          ["EXCAVATION"],
          "quantity"
        ),
      unit: "m³",
    },

    {
      key: "pcc",
      label: "PCC",
      quantity:
        sumResult(
          ["PCC"],
          "quantity"
        ),
      unit: "m³",
    },

    {
      key: "footingConcrete",
      label: "Footing Concrete",
      quantity:
        sumResult(
          ["FOOTING"],
          "quantity"
        ),
      unit: "m³",
    },

    {
      key: "columnConcrete",
      label: "Column Concrete",
      quantity:
        firstResult(
          [
            "COLUMN_CONCRETE",
            "COLUMN_SHUTTERING",
          ],
          "concreteVolume"
        ),
      unit: "m³",
    },

    {
      key: "beamConcrete",
      label: "Beam Concrete",
      quantity:
        firstResult(
          [
            "BEAM_CONCRETE",
            "BEAM_REINFORCEMENT",
            "BEAM_BBS",
            "BEAM_SHUTTERING",
          ],
          "concreteVolume"
        ),
      unit: "m³",
    },

    {
      key: "slabConcrete",
      label: "Slab Concrete",
      quantity:
        sumResult(
          ["SLAB_CONCRETE"],
          "quantity"
        ),
      unit: "m³",
    },

    {
      key: "lintelConcrete",
      label: "Lintel Concrete",
      quantity:
        firstResult(
          [
            "LINTEL",
            "LINTEL_REINFORCEMENT",
            "LINTEL_SHUTTERING",
          ],
          "concreteVolume"
        ),
      unit: "m³",
    },

    {
      key: "foundationBrickwork",
      label:
        "Foundation & Plinth Brickwork",
      quantity:
        sumResult(
          [
            "FOUNDATION_PLINTH_BRICKWORK",
          ],
          "quantity"
        ),
      unit: "m³",
    },

    {
      key: "brickwork",
      label:
        "Superstructure Brickwork",
      quantity:
        sumResult(
          ["BRICKWORK"],
          "quantity"
        ),
      unit: "m³",
    },

    {
      key: "dpc",
      label: "DPC",
      quantity:
        sumResult(
          ["DPC"],
          "quantity"
        ),
      unit: "m²",
    },

    {
      key: "internalPlaster",
      label: "Internal Plaster",
      quantity:
        sumResult(
          ["INTERNAL_PLASTER"],
          "netArea"
        ),
      unit: "m²",
    },

    {
      key: "externalPlaster",
      label: "External Plaster",
      quantity:
        sumResult(
          ["EXTERNAL_PLASTER"],
          "netArea"
        ),
      unit: "m²",
    },

    {
      key: "flooring",
      label: "Flooring",
      quantity:
        firstResult(
          [
            "FLOORING",
            "FLOORING_MATERIALS",
          ],
          "floorArea"
        ),
      unit: "m²",
    },

    {
      key: "doorOpenings",
      label: "Door Openings",
      quantity:
        sumResult(
          ["DOORS"],
          "area"
        ),
      unit: "m²",
    },

    {
      key: "windowOpenings",
      label: "Window Openings",
      quantity:
        sumResult(
          ["WINDOWS"],
          "area"
        ),
      unit: "m²",
    },

    {
      key: "ventilatorOpenings",
      label: "Ventilator Openings",
      quantity:
        sumResult(
          ["VENTILATORS"],
          "area"
        ),
      unit: "m²",
    },

    {
      key: "filling",
      label: "Filling",
      quantity:
        sumResult(
          ["FILLING"],
          "quantity"
        ),
      unit: "m³",
    },
  ].filter(
    (item) => item.quantity !== 0
  );

  const steelQuantity =
    sumResult(
      [
        "FOOTING_REINFORCEMENT",
        "SLAB_REINFORCEMENT",
      ],
      "steelWeight"
    ) +
    firstResult(
      [
        "BEAM_CONCRETE",
        "BEAM_REINFORCEMENT",
        "BEAM_BBS",
        "BEAM_SHUTTERING",
      ],
      "steelWeight"
    ) +
    firstResult(
      [
        "LINTEL",
        "LINTEL_REINFORCEMENT",
        "LINTEL_SHUTTERING",
      ],
      "steelWeight"
    );

  const flooringResult =
    results.get("FLOORING") ??
    results.get("FLOORING_MATERIALS");

  const floorTileArea =
    Number(
      flooringResult?.tileArea ?? 0
    );

  const flooringCementBags =
    Number(
      flooringResult?.cementBags ?? 0
    );

  const flooringSandVolume =
    Number(
      flooringResult?.sandVolume ?? 0
    );

  const materialMap =
    new Map<
      string,
      {
        materialName: string;
        quantity: number;
        unit: string;
        sources: string[];
      }
    >();

  const addMaterial = (
    materialName: string,
    quantity: number,
    unit: string,
    source: string
  ) => {
    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return;
    }

    const existing =
      materialMap.get(
        materialName
      );

    if (existing) {
      existing.quantity +=
        quantity;

      if (
        !existing.sources.includes(
          source
        )
      ) {
        existing.sources.push(
          source
        );
      }

      return;
    }

    materialMap.set(
      materialName,
      {
        materialName,
        quantity,
        unit,
        sources: [source],
      }
    );
  };

  addMaterial(
    "Reinforcement Steel",
    steelQuantity,
    "kg",
    "Footing, beam, slab and lintel reinforcement"
  );

  addMaterial(
    "Floor Tiles",
    floorTileArea,
    "m²",
    "Flooring tile calculation"
  );

  addMaterial(
    "Cement",
    flooringCementBags,
    "Bag",
    "Flooring mortar calculation"
  );

  addMaterial(
    "Sand",
    flooringSandVolume,
    "m³",
    "Flooring mortar calculation"
  );

  const concreteGroups = [
    {
      volume:
        sumResult(
          ["PCC"],
          "quantity"
        ),
      ratio:
        settings.concrete.pcc,
      source: "PCC",
    },

    {
      volume:
        sumResult(
          ["FOOTING"],
          "quantity"
        ),
      ratio:
        settings.concrete.rcc,
      source: "Footing concrete",
    },

    {
      volume:
        firstResult(
          [
            "COLUMN_CONCRETE",
            "COLUMN_SHUTTERING",
          ],
          "concreteVolume"
        ),
      ratio:
        settings.concrete.rcc,
      source: "Column concrete",
    },

    {
      volume:
        firstResult(
          [
            "BEAM_CONCRETE",
            "BEAM_REINFORCEMENT",
            "BEAM_BBS",
            "BEAM_SHUTTERING",
          ],
          "concreteVolume"
        ),
      ratio:
        settings.concrete.rcc,
      source: "Beam concrete",
    },

    {
      volume:
        sumResult(
          ["SLAB_CONCRETE"],
          "quantity"
        ),
      ratio:
        settings.concrete.rcc,
      source: "Slab concrete",
    },

    {
      volume:
        firstResult(
          [
            "LINTEL",
            "LINTEL_REINFORCEMENT",
            "LINTEL_SHUTTERING",
          ],
          "concreteVolume"
        ),
      ratio:
        settings.concrete.rcc,
      source: "Lintel concrete",
    },
  ];

  for (
    const item of concreteGroups
  ) {
    const converted =
      convertConcrete(
        item.volume,
        item.ratio,
        settings
      );

    if (!converted) {
      continue;
    }

    addMaterial(
      "Cement",
      converted.cementBags,
      "Bag",
      `${item.source} concrete mix`
    );

    addMaterial(
      "Sand",
      converted.sandVolume,
      "m³",
      `${item.source} concrete mix`
    );

    addMaterial(
      "Aggregate",
      converted.aggregateVolume,
      "m³",
      `${item.source} concrete mix`
    );
  }

  const masonryVolume =
    sumResult(
      [
        "FOUNDATION_PLINTH_BRICKWORK",
      ],
      "quantity"
    ) +
    sumResult(
      ["BRICKWORK"],
      "quantity"
    );

  const masonry =
    convertMasonry(
      masonryVolume,
      settings
    );

  if (masonry) {
    addMaterial(
      "Bricks",
      masonry.bricks,
      "Nos.",
      "Foundation/plinth and superstructure brickwork"
    );

    addMaterial(
      "Cement",
      masonry.cementBags,
      "Bag",
      "Brickwork mortar"
    );

    addMaterial(
      "Sand",
      masonry.sandVolume,
      "m³",
      "Brickwork mortar"
    );
  }

  const internalPlaster =
    convertPlaster(
      sumResult(
        ["INTERNAL_PLASTER"],
        "netArea"
      ),
      settings.plaster.internal,
      settings.concrete.cementBagVolume
    );

  if (internalPlaster) {
    addMaterial(
      "Cement",
      internalPlaster.cementBags,
      "Bag",
      "Internal plaster mortar"
    );

    addMaterial(
      "Sand",
      internalPlaster.sandVolume,
      "m³",
      "Internal plaster mortar"
    );
  }

  const externalPlaster =
    convertPlaster(
      sumResult(
        ["EXTERNAL_PLASTER"],
        "netArea"
      ),
      settings.plaster.external,
      settings.concrete.cementBagVolume
    );

  if (externalPlaster) {
    addMaterial(
      "Cement",
      externalPlaster.cementBags,
      "Bag",
      "External plaster mortar"
    );

    addMaterial(
      "Sand",
      externalPlaster.sandVolume,
      "m³",
      "External plaster mortar"
    );
  }

  /*
   * PAINTING
   *
   * Coverage is configured as m² per litre.
   *
   * Litres required =
   * (paint area × number of coats)
   * / coverage per litre
   */
  const internalPaintArea =
    sumResult(
      ["PAINTING"],
      "area"
    );

  const paintQuantity =
    settings.painting
      .internalCoverageM2PerLitre > 0
      ? (
          internalPaintArea *
          settings.painting.coats
        ) /
        settings.painting
          .internalCoverageM2PerLitre
      : 0;

  addMaterial(
    "Paint",
    paintQuantity,
    "Litre",
    "Painting coverage"
  );

  const labourRows =
    settings.labour
      .map((setting) => {
        let quantity = 0;

        if (
          setting.key ===
          "concrete"
        ) {
          quantity =
            sumResult(
              [
                "PCC",
                "FOOTING",
                "SLAB_CONCRETE",
              ],
              "quantity"
            ) +
            firstResult(
              ["COLUMN_CONCRETE"],
              "concreteVolume"
            ) +
            firstResult(
              [
                "BEAM_CONCRETE",
                "BEAM_REINFORCEMENT",
                "BEAM_BBS",
                "BEAM_SHUTTERING",
              ],
              "concreteVolume"
            ) +
            firstResult(
              [
                "LINTEL",
                "LINTEL_REINFORCEMENT",
                "LINTEL_SHUTTERING",
              ],
              "concreteVolume"
            );
        } else if (
          setting.key ===
          "brickwork"
        ) {
          quantity =
            masonryVolume;
        } else if (
          setting.key ===
          "plaster"
        ) {
          quantity =
            sumResult(
              [
                "INTERNAL_PLASTER",
                "EXTERNAL_PLASTER",
              ],
              "netArea"
            );
        } else if (
          setting.key ===
          "flooring"
        ) {
          quantity =
            Number(
              flooringResult?.floorArea ??
                0
            );
        } else if (
          setting.key ===
          "painting"
        ) {
          quantity =
            internalPaintArea;
        } else {
          quantity =
            workQuantities.find(
              (item) =>
                item.key ===
                setting.key
            )?.quantity ?? 0;
        }

        return {
          ...setting,
          quantity,
          cost:
            quantity *
            setting.rate,
        };
      })
      .filter(
        (item) =>
          item.quantity > 0
      );

  const totalLabourCost =
    labourRows.reduce(
      (sum, item) =>
        sum + item.cost,
      0
    );

  const rateMap =
    new Map(
      rates.map(
        (rate) => [
          rate.materialName,
          rate,
        ]
      )
    );

  const materials =
    [...materialMap.values()].map(
      (item) => {
        const rate =
          rateMap.get(
            item.materialName
          )?.rate ?? null;

        return {
          materialName:
            item.materialName,
          quantity:
            item.quantity,
          unit:
            item.unit,
          source:
            item.sources.join(
              "; "
            ),
          rate,
          cost:
            rate === null
              ? null
              : item.quantity *
                rate,
        };
      }
    );

  return {
    workQuantities,
    labour: labourRows,
    totalLabourCost,
    materials,
    totalMaterialCost:
      materials.reduce(
        (sum, item) =>
          sum +
          (item.cost ?? 0),
        0
      ),
  };
}