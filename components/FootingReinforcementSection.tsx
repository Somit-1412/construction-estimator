"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateFootingReinforcementTotalLength,
  calculateFootingReinforcementWeight,
  FootingReinforcementGroup,
} from "@/lib/calculations/footingReinforcement";

const initialGroups: FootingReinforcementGroup[] = [
  {
    type: "F1",
    barType: "Bottom X",
    diameter: 12,
    numberOfBars: 10,
    lengthPerBar: 1.8,
  },
  {
    type: "F1",
    barType: "Bottom Y",
    diameter: 12,
    numberOfBars: 10,
    lengthPerBar: 1.8,
  },
  {
    type: "F2",
    barType: "Bottom X",
    diameter: 10,
    numberOfBars: 10,
    lengthPerBar: 1.5,
  },
  {
    type: "F2",
    barType: "Bottom Y",
    diameter: 10,
    numberOfBars: 10,
    lengthPerBar: 1.5,
  },
];

export default function FootingReinforcementSection() {
  const [groups, setGroups] =
    useState<FootingReinforcementGroup[]>("footingReinforcementGroups", 
      initialGroups
    );

  function updateGroup(
    index: number,
    field: keyof FootingReinforcementGroup,
    value: string | number
  ) {
    setGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index
          ? {
              ...group,
              [field]:
                field === "type" ||
                field === "barType"
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
        type: "F1",
        barType: "Bottom X",
        diameter: 0,
        numberOfBars: 0,
        lengthPerBar: 0,
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

  const totalLength = groups.reduce(
    (total, group) =>
      total +
      calculateFootingReinforcementTotalLength(group),
    0
  );

  const totalWeight = groups.reduce(
    (total, group) =>
      total +
      calculateFootingReinforcementWeight(group),
    0
  );

  return (
    <section className="border-b p-6">
      <h2 className="mb-6 text-2xl font-bold">
        Footing Reinforcement
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const length =
            calculateFootingReinforcementTotalLength(
              group
            );

          const weight =
            calculateFootingReinforcementWeight(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  Reinforcement Group {index + 1}
                </h3>

                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGroup(index)}
                    className="rounded border px-3 py-1 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Footing Type
                  </span>
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

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Bar Type
                  </span>
                  <input
                    type="text"
                    value={group.barType}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "barType",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Diameter (mm)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={group.diameter}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "diameter",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Number of Bars
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={group.numberOfBars}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "numberOfBars",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Length / Bar (m)
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.lengthPerBar}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "lengthPerBar",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600">
                    Total Bar Length
                  </p>
                  <p className="text-lg font-semibold">
                    {length.toFixed(3)} m
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    Steel Weight
                  </p>
                  <p className="text-lg font-semibold">
                    {weight.toFixed(3)} kg
                  </p>
                </div>
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
        Add Reinforcement Group
      </button>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">
            Total Reinforcement Length
          </p>
          <p className="text-2xl font-bold">
            {totalLength.toFixed(3)} m
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <p className="text-sm text-gray-600">
            Total Reinforcement Steel
          </p>
          <p className="text-2xl font-bold">
            {totalWeight.toFixed(3)} kg
          </p>
        </div>
      </div>
    </section>
  );
}   