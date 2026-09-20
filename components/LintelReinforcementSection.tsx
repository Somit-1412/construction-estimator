"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateLintelReinforcement,
  LintelReinforcementGroup,
} from "@/lib/calculations/lintelReinforcement";

const initialGroups: LintelReinforcementGroup[] = [
  {
    type: "L1",
    number: 3,

    mainBarDiameterMm: 12,
    mainBarCount: 4,
    mainBarLength: 1.66,

    stirrupDiameterMm: 6,
    stirrupCount: 8,
    stirrupLength: 0.9,
  },
];

export default function LintelReinforcementSection() {
  const [groups, setGroups] =
    useState<LintelReinforcementGroup[]>("lintelReinforcementGroups", initialGroups);

  function updateGroup(
    index: number,
    field: keyof LintelReinforcementGroup,
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
        type: `L${currentGroups.length + 1}`,
        number: 1,

        mainBarDiameterMm: 8,
        mainBarCount: 2,
        mainBarLength: 1,

        stirrupDiameterMm: 6,
        stirrupCount: 5,
        stirrupLength: 0.5,
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
      calculateLintelReinforcement(group).totalSteelWeight,
    0
  );

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Lintel Reinforcement
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const result =
            calculateLintelReinforcement(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Lintel Group {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="rounded border px-3 py-1"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <span>Number of Lintels</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={group.number}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "number",
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

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    <span>Number of Bars</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={group.mainBarCount}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "mainBarCount",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Bar Length (m)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={group.mainBarLength}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "mainBarLength",
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
                  Stirrups
                </h4>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Bar Diameter (mm)</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={group.stirrupDiameterMm}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "stirrupDiameterMm",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Number of Stirrups</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={group.stirrupCount}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "stirrupCount",
                          event.target.value
                        )
                      }
                      className="w-full min-w-0 rounded border px-3 py-2"
                    />
                  </label>

                  <label className="flex min-w-0 flex-col gap-1">
                    <span>Stirrup Length (m)</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={group.stirrupLength}
                      onChange={(event) =>
                        updateGroup(
                          index,
                          "stirrupLength",
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
                    Steel:{" "}
                    {result.mainSteelWeight.toFixed(3)} kg
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-semibold">
                    Stirrup Reinforcement
                  </h4>

                  <p className="mt-2 text-sm">
                    Steel:{" "}
                    {result.stirrupSteelWeight.toFixed(3)} kg
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-semibold">
                  Lintel Reinforcement Total
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
        Add Group
      </button>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">
          Total Lintel Reinforcement
        </h3>

        <p className="mt-2">
          {totalSteelWeight.toFixed(3)} kg
        </p>
      </div>
    </section>
  );
}