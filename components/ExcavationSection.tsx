"use client";

import { useState } from "react";
import {
  calculateExcavationDetails,
  type ExcavationGroup,
} from "@/lib/calculations/excavation";

export default function ExcavationSection() {
  const [excavationGroups, setExcavationGroups] = useState<
    ExcavationGroup[]
  >([
    {
      type: "long",
      number: 2,
      internalLength: 5,
      wallThickness: 0.3,
      breadth: 0.9,
      depth: 0.9,
    },
    {
      type: "short",
      number: 2,
      internalLength: 4,
      wallThickness: 0.3,
      breadth: 0.9,
      depth: 0.9,
    },
  ]);

  const updateGroup = (
    index: number,
    updatedGroup: ExcavationGroup
  ) => {
    setExcavationGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index ? updatedGroup : group
      )
    );
  };

  const addExcavationGroup = () => {
    setExcavationGroups((currentGroups) => [
      ...currentGroups,
      {
        type: "long",
        number: 1,
        internalLength: 0,
        wallThickness: 0,
        breadth: 0,
        depth: 0,
      },
    ]);
  };

  const removeExcavationGroup = (index: number) => {
    setExcavationGroups((currentGroups) =>
      currentGroups.filter((_, groupIndex) => groupIndex !== index)
    );
  };

  const totalQuantity = excavationGroups.reduce((total, group) => {
    try {
      const details = calculateExcavationDetails(group);

      return total + details.quantity;
    } catch {
      return total;
    }
  }, 0);

  return (
    <section className="mx-auto max-w-4xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        Earthwork in Excavation
      </h2>

      {excavationGroups.map((group, index) => {
        let details;

        try {
          details = calculateExcavationDetails(group);
        } catch {
          details = null;
        }

        return (
          <div
            key={index}
            className="mb-8 rounded-lg border p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Excavation Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeExcavationGroup(index)}
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="mb-6">
              <label className="flex flex-col gap-1">
                <span className="text-sm">Wall type</span>

                <select
                  value={group.type}
                  onChange={(e) =>
                    updateGroup(index, {
                      ...group,
                      type: e.target.value as "long" | "short",
                    })
                  }
                  className="rounded border px-3 py-2"
                >
                  <option value="long">Long wall</option>
                  <option value="short">Short wall</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <label className="flex flex-col gap-1">
                <span className="text-sm">Number of walls</span>

                <input
                  type="number"
                  min="0"
                  value={group.number}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      number: value,
                    });
                  }}
                  className="rounded border px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Internal Length (m)</span>

                <input
                  type="number"
                  min="0"
                  value={group.internalLength}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      internalLength: value,
                    });
                  }}
                  className="rounded border px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Wall Thickness (m)</span>

                <input
                  type="number"
                  min="0"
                  value={group.wallThickness}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      wallThickness: value,
                    });
                  }}
                  className="rounded border px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Breadth (m)</span>

                <input
                  type="number"
                  min="0"
                  value={group.breadth}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      breadth: value,
                    });
                  }}
                  className="rounded border px-3 py-2"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-sm">Depth (m)</span>

                <input
                  type="number"
                  min="0"
                  value={group.depth}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      depth: value,
                    });
                  }}
                  className="rounded border px-3 py-2"
                />
              </label>
            </div>

            {details === null ? (
              <p className="mt-5 text-sm">
                Error: invalid excavation dimensions.
              </p>
            ) : (
              <>
                <p className="mt-5 text-sm">
                  Calculated C/C length:{" "}
                  {details.centreToCentreLength.toFixed(3)} m
                </p>

                <p className="mt-2 text-sm">
                  Calculated excavation length:{" "}
                  {details.excavationLength.toFixed(3)} m
                </p>

                <p className="mt-2 font-medium">
                  Quantity: {details.quantity.toFixed(3)} m³
                </p>
              </>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addExcavationGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add excavation group
      </button>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total Excavation
        </h3>

        <p className="mt-2 text-2xl font-semibold">
          {totalQuantity.toFixed(3)} m³
        </p>
      </div>
    </section>
  );
}