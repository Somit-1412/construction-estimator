"use client";

import { useState } from "react";
import {
  calculateDPCQuantity,
  type DPCGroup,
} from "@/lib/calculations/dpc";

export default function DPCSection() {
  const [dpcGroups, setDPCGroups] = useState<DPCGroup[]>([
    {
      type: "Long Wall",
      number: 3,
      length: 4.89,
      breadth: 0.23,
    },
    {
      type: "Short Wall",
      number: 3,
      length: 3.23,
      breadth: 0.23,
    },
    {
      type: "Short Wall 2",
      number: 2,
      length: 4,
      breadth: 0.23,
    },
  ]);

  const updateGroup = (
    index: number,
    updatedGroup: DPCGroup
  ) => {
    setDPCGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index
          ? updatedGroup
          : group
      )
    );
  };

  const addDPCGroup = () => {
    setDPCGroups((currentGroups) => [
      ...currentGroups,
      {
        type: "Wall",
        number: 1,
        length: 0,
        breadth: 0,
      },
    ]);
  };

  const removeDPCGroup = (index: number) => {
    setDPCGroups((currentGroups) =>
      currentGroups.filter(
        (_, groupIndex) => groupIndex !== index
      )
    );
  };

  const totalDPC = dpcGroups.reduce(
    (total, group) => {
      try {
        return total + calculateDPCQuantity(group);
      } catch {
        return total;
      }
    },
    0
  );

  return (
    <section className="mx-auto max-w-5xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        Damp Proof Course (DPC)
      </h2>

      {dpcGroups.map((group, index) => {
        let quantity: number | null = null;

        try {
          quantity = calculateDPCQuantity(group);
        } catch {
          quantity = null;
        }

        return (
          <div
            key={index}
            className="mb-8 rounded-lg border p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                DPC Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeDPCGroup(index)
                }
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Wall Type
                </span>

                <input
                  type="text"
                  value={group.type}
                  onChange={(e) =>
                    updateGroup(index, {
                      ...group,
                      type: e.target.value,
                    })
                  }
                  className="w-full rounded border px-3 py-2"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Number of Walls
                </span>

                <input
                  type="number"
                  min="0"
                  value={group.number}
                  onChange={(e) => {
                    const value = Number(
                      e.target.value
                    );

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      number: value,
                    });
                  }}
                  className="w-full rounded border px-3 py-2"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Length (m)
                </span>

                <input
                  type="number"
                  min="0"
                  value={group.length}
                  onChange={(e) => {
                    const value = Number(
                      e.target.value
                    );

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      length: value,
                    });
                  }}
                  className="w-full rounded border px-3 py-2"
                />
              </label>

              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Breadth (m)
                </span>

                <input
                  type="number"
                  min="0"
                  value={group.breadth}
                  onChange={(e) => {
                    const value = Number(
                      e.target.value
                    );

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      breadth: value,
                    });
                  }}
                  className="w-full rounded border px-3 py-2"
                />
              </label>
            </div>

            <p className="mt-6 font-medium">
              DPC Quantity:{" "}
              {quantity === null
                ? "Invalid"
                : `${quantity.toFixed(3)} m²`}
            </p>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addDPCGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add DPC group
      </button>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total DPC Quantity
        </h3>

        <p className="mt-3 text-2xl font-semibold">
          {totalDPC.toFixed(3)} m²
        </p>
      </div>
    </section>
  );
}