"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateFoundationBrickworkVolume,
  FoundationBrickworkGroup,
} from "@/lib/calculations/foundationBrickwork";

const initialGroups: FoundationBrickworkGroup[] = [
  {
    type: "F1",
    wallType: "long",
    number: 3,
    length: 5.46,
    thickness: 0.2,
    height: 0.8,
  },
];

export default function FoundationBrickworkSection() {
  const [groups, setGroups] =
    useState<FoundationBrickworkGroup[]>("groups", initialGroups);

  function updateGroup(
    index: number,
    field: keyof FoundationBrickworkGroup,
    value: string
  ) {
    setGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index
          ? {
              ...group,
              [field]:
                field === "type" || field === "wallType"
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
        type: `F${currentGroups.length + 1}`,
        wallType: "long",
        number: 1,
        length: 1,
        thickness: 0.2,
        height: 0.2,
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

  const totalVolume = groups.reduce(
    (total, group) =>
      total + calculateFoundationBrickworkVolume(group),
    0
  );

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Foundation & Plinth Brickwork
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const volume =
            calculateFoundationBrickworkVolume(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Group {index + 1}
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
                  <span>Wall Type</span>
                  <select
                    value={group.wallType}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "wallType",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  >
                    <option value="long">Long Wall</option>
                    <option value="short">Short Wall</option>
                  </select>
                </label>

                <label className="flex min-w-0 flex-col gap-1">
                  <span>Number of Walls</span>
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
                  <span>Thickness (m)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.thickness}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "thickness",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>

                <label className="flex min-w-0 flex-col gap-1">
                  <span>Height (m)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.height}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "height",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-semibold">
                  Brickwork Quantity
                </h4>
                <p className="mt-2">
                  {volume.toFixed(3)} m³
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
          Total Foundation & Plinth Brickwork
        </h3>
        <p className="mt-2">
          {totalVolume.toFixed(3)} m³
        </p>
      </div>
    </section>
  );
}