"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateColumnConcreteQuantity,
  calculateColumnShutteringArea,
  type ColumnGroup,
} from "@/lib/calculations/columns";

export default function ColumnConcreteSection() {
  const [columnGroups, setColumnGroups] = useState<ColumnGroup[]>("columnGroups", [
    {
      type: "C1",
      width: 0.45,
      depth: 0.45,
      number: 8,
      height: 3,
    },
    {
      type: "C2",
      width: 0.3,
      depth: 0.45,
      number: 8,
      height: 3,
    },
    {
      type: "C3",
      width: 0.3,
      depth: 0.3,
      number: 4,
      height: 3,
    },
  ]);

  const updateGroup = (
    index: number,
    updatedGroup: ColumnGroup
  ) => {
    setColumnGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index ? updatedGroup : group
      )
    );
  };

  const addColumnGroup = () => {
    setColumnGroups((currentGroups) => [
      ...currentGroups,
      {
        type: "C",
        width: 0,
        depth: 0,
        number: 0,
        height: 0,
      },
    ]);
  };

  const removeColumnGroup = (index: number) => {
    setColumnGroups((currentGroups) =>
      currentGroups.filter((_, groupIndex) => groupIndex !== index)
    );
  };

  const totalConcreteQuantity = columnGroups.reduce(
    (total, group) => {
      try {
        return total + calculateColumnConcreteQuantity(group);
      } catch {
        return total;
      }
    },
    0
  );

  const totalShutteringArea = columnGroups.reduce(
    (total, group) => {
      try {
        return total + calculateColumnShutteringArea(group);
      } catch {
        return total;
      }
    },
    0
  );

  return (
    <section className="mx-auto max-w-4xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        Column Concrete
      </h2>

      {columnGroups.map((group, index) => {
        let concreteQuantity: number | null = null;
        let shutteringArea: number | null = null;

        try {
          concreteQuantity =
            calculateColumnConcreteQuantity(group);

          shutteringArea =
            calculateColumnShutteringArea(group);
        } catch {
          concreteQuantity = null;
          shutteringArea = null;
        }

        return (
          <div
            key={index}
            className="mb-8 rounded-lg border p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Column Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeColumnGroup(index)}
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Column Type
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
                  Width (m)
                </span>

                <input
                  type="number"
                  min="0"
                  value={group.width}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      width: value,
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

              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Number of Columns
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
                  Floor-to-Floor Height (m)
                </span>

                <input
                  type="number"
                  min="0"
                  value={group.height}
                  onChange={(e) => {
                    const value = Number(e.target.value);

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      height: value,
                    });
                  }}
                  className="w-full rounded border px-3 py-2"
                />
              </label>
            </div>

            {concreteQuantity === null ||
            shutteringArea === null ? (
              <p className="mt-5 text-sm">
                Error: invalid column dimensions.
              </p>
            ) : (
              <>
                <p className="mt-5 font-medium">
                  Concrete Quantity:{" "}
                  {concreteQuantity.toFixed(3)} m³
                </p>

                <p className="mt-2 font-medium">
                  Shuttering Area:{" "}
                  {shutteringArea.toFixed(3)} m²
                </p>
              </>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addColumnGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add column group
      </button>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total Column Concrete
        </h3>

        <p className="mt-2 text-2xl font-semibold">
          {totalConcreteQuantity.toFixed(3)} m³
        </p>

        <h3 className="mt-6 text-lg font-medium">
          Total Column Shuttering
        </h3>

        <p className="mt-2 text-2xl font-semibold">
          {totalShutteringArea.toFixed(3)} m²
        </p>
      </div>
    </section>
  );
}