"use client";

import { useState } from "react";
import {
  calculateLintelConcreteVolume,
  LintelGroup,
} from "@/lib/calculations/lintel";

const initialGroups: LintelGroup[] = [
  {
    type: "L1",
    number: 3,
    length: 1.66,
    width: 0.23,
    depth: 0.15,
  },
];

export default function LintelConcreteSection() {
  const [groups, setGroups] =
    useState<LintelGroup[]>(initialGroups);

  function updateGroup(
    index: number,
    field: keyof LintelGroup,
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
        length: 1,
        width: 0.23,
        depth: 0.15,
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
      total + calculateLintelConcreteVolume(group),
    0
  );

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Lintel Concrete
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const volume =
            calculateLintelConcreteVolume(group);

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
                  <span>Depth (m)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.depth}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "depth",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-semibold">
                  Concrete Quantity
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
          Total Lintel Concrete
        </h3>
        <p className="mt-2">
          {totalVolume.toFixed(3)} m³
        </p>
      </div>
    </section>
  );
}