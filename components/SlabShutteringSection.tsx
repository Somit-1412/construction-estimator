"use client";

import { useState } from "react";
import {
  calculateSlabShutteringArea,
  SlabShutteringGroup,
} from "@/lib/calculations/slabShuttering";

const initialGroups: SlabShutteringGroup[] = [
  {
    type: "S1",
    length: 4,
    width: 5,
  },
];

export default function SlabShutteringSection() {
  const [groups, setGroups] =
    useState<SlabShutteringGroup[]>(initialGroups);

  function updateGroup(
    index: number,
    field: keyof SlabShutteringGroup,
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

  const totalShutteringArea = groups.reduce(
    (total, group) =>
      total + calculateSlabShutteringArea(group),
    0
  );

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Slab Shuttering
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const shutteringArea =
            calculateSlabShutteringArea(group);

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
              </div>

              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-semibold">
                  Shuttering Area
                </h4>

                <p className="mt-2">
                  {shutteringArea.toFixed(3)} m²
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
          Total Slab Shuttering
        </h3>

        <p className="mt-2">
          {totalShutteringArea.toFixed(3)} m²
        </p>
      </div>
    </section>
  );
}