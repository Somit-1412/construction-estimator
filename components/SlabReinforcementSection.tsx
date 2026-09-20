"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateSlabReinforcement,
  SlabReinforcementGroup,
} from "@/lib/calculations/slabReinforcement";

const initialGroups: SlabReinforcementGroup[] = [
  {
    type: "S1",
    length: 3,
    width: 3.33,
    cover: 0.025,

    mainBarDiameterMm: 12,
    mainBarSpacing: 0.15,

    distributionBarDiameterMm: 6,
    distributionBarSpacing: 0.2,
  },
];

export default function SlabReinforcementSection() {
  const [groups, setGroups] =
    useState<SlabReinforcementGroup[]>("groups", initialGroups);

  function updateGroup(
    index: number,
    field: keyof SlabReinforcementGroup,
    value: string
  ) {
    setGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index
          ? {
              ...group,
              [field]:
                field === "type"
                  ? value
                  : Number(value),
            }
          : group
      )
    );
  }

  function addGroup() {
    setGroups((currentGroups) => [
      ...currentGroups,
      {
        type: `S${currentGroups.length + 1}`,
        length: 1,
        width: 1,
        cover: 0.025,

        mainBarDiameterMm: 8,
        mainBarSpacing: 0.15,

        distributionBarDiameterMm: 8,
        distributionBarSpacing: 0.15,
      },
    ]);
  }

  function removeGroup(index: number) {
    setGroups((currentGroups) =>
      currentGroups.filter(
        (_, groupIndex) => groupIndex !== index
      )
    );
  }

  const totalSteelWeight = groups.reduce(
    (total, group) =>
      total +
      calculateSlabReinforcement(group).totalSteelWeight,
    0
  );

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Slab Reinforcement
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const result =
            calculateSlabReinforcement(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Slab {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="rounded border px-3 py-1"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <label className="flex min-w-0 flex-col gap-1">
                  <span>Type</span>

                  <input
                    type="text"
                    value={group.type}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "type",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-1">
                  <span>Length (m)</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.length}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "length",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-1">
                  <span>Width (m)</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.width}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "width",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-1">
                  <span>Cover (m)</span>

                  <input
                    type="number"
                    min="0"
                    step="0.001"
                    value={group.cover}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "cover",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 font-semibold">
                  Main Reinforcement
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Bar Diameter (mm)</span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={group.mainBarDiameterMm}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "mainBarDiameterMm",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Spacing (m)</span>

                    <input
                      type="number"
                      min="0.001"
                      step="0.01"
                      value={group.mainBarSpacing}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "mainBarSpacing",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="mb-3 font-semibold">
                  Distribution Reinforcement
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Bar Diameter (mm)</span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        group.distributionBarDiameterMm
                      }
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "distributionBarDiameterMm",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Spacing (m)</span>

                    <input
                      type="number"
                      min="0.001"
                      step="0.01"
                      value={
                        group.distributionBarSpacing
                      }
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "distributionBarSpacing",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">
                    Main Reinforcement
                  </h4>

                  <p className="mt-2 text-sm">
                    Bars: {result.mainBarCount}
                  </p>

                  <p className="text-sm">
                    Length each:{" "}
                    {result.mainBarLength.toFixed(3)} m
                  </p>

                  <p className="text-sm">
                    Steel:{" "}
                    {result.mainSteelWeight.toFixed(3)} kg
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">
                    Distribution Reinforcement
                  </h4>

                  <p className="mt-2 text-sm">
                    Bars:{" "}
                    {result.distributionBarCount}
                  </p>

                  <p className="text-sm">
                    Length each:{" "}
                    {result.distributionBarLength.toFixed(3)} m
                  </p>

                  <p className="text-sm">
                    Steel:{" "}
                    {result.distributionSteelWeight.toFixed(3)} kg
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-semibold">
                  Slab Reinforcement Total
                </h4>

                <p className="mt-2">
                  {result.totalSteelWeight.toFixed(3)} kg
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="mt-6 rounded border px-4 py-2"
      >
        Add Slab
      </button>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">
          Total Slab Reinforcement
        </h3>

        <p className="mt-2">
          {totalSteelWeight.toFixed(3)} kg
        </p>
      </div>
    </section>
  );
}