"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculatePCCQuantity,
  type PCCGroup,
} from "@/lib/calculations/pcc";

export default function PCCSection() {
  const [pccGroups, setPCCGroups] = useState<PCCGroup[]>("pccGroups", [
    {
      number: 3,
      length: 5.46,
      breadth: 1.1,
      depth: 0.15,
    },
    {
      number: 3,
      length: 3.23,
      breadth: 1.1,
      depth: 0.15,
    },
    {
      number: 2,
      length: 6.83,
      breadth: 1.1,
      depth: 0.15,
    },
  ]);

  const updateGroup = (
    index: number,
    updatedGroup: PCCGroup
  ) => {
    setPCCGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index ? updatedGroup : group
      )
    );
  };

  const addPCCGroup = () => {
    setPCCGroups((currentGroups) => [
      ...currentGroups,
      {
        number: 1,
        length: 0,
        breadth: 0,
        depth: 0,
      },
    ]);
  };

  const removePCCGroup = (index: number) => {
    setPCCGroups((currentGroups) =>
      currentGroups.filter((_, groupIndex) => groupIndex !== index)
    );
  };

  const totalQuantity = pccGroups.reduce((total, group) => {
    try {
      return total + calculatePCCQuantity(group);
    } catch {
      return total;
    }
  }, 0);

  return (
    <section className="mx-auto max-w-4xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        PCC in Foundation
      </h2>

      {pccGroups.map((group, index) => {
        let quantity: number | null = null;

        try {
          quantity = calculatePCCQuantity(group);
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
                PCC Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removePCCGroup(index)}
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Number
                </span>

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
                    const value = Number(e.target.value);

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
                    const value = Number(e.target.value);

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

              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Depth (m)
                </span>

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
                  className="w-full rounded border px-3 py-2"
                />
              </label>
            </div>

            {quantity === null ? (
              <p className="mt-5 text-sm">
                Error: invalid PCC dimensions.
              </p>
            ) : (
              <p className="mt-5 font-medium">
                Quantity: {quantity.toFixed(3)} m³
              </p>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addPCCGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add PCC group
      </button>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total PCC
        </h3>

        <p className="mt-2 text-2xl font-semibold">
          {totalQuantity.toFixed(3)} m³
        </p>
      </div>
    </section>
  );
}