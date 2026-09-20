"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateFootingShutteringArea,
  FootingShutteringGroup,
} from "@/lib/calculations/footingShuttering";

const initialGroups: FootingShutteringGroup[] = [
  {
    type: "F1",
    number: 3,
    length: 1.8,
    breadth: 1.8,
    thickness: 0.45,
  },
  {
    type: "F2",
    number: 3,
    length: 1.5,
    breadth: 1.5,
    thickness: 0.4,
  },
  {
    type: "F3",
    number: 2,
    length: 1.2,
    breadth: 1.2,
    thickness: 0.35,
  },
];

export default function FootingShutteringSection() {
  const [groups, setGroups] =
    useState<FootingShutteringGroup[]>("footingShutteringGroups", initialGroups);

  function updateGroup(
    index: number,
    field: keyof FootingShutteringGroup,
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
        type: `F${currentGroups.length + 1}`,
        number: 1,
        length: 1,
        breadth: 1,
        thickness: 0.3,
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
      total + calculateFootingShutteringArea(group),
    0
  );

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Footing Shuttering
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const shutteringArea =
            calculateFootingShutteringArea(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Footing {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="rounded border px-3 py-1"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
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
                  <span>Number</span>
                  <input
                    type="number"
                    min="0"
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
                  <span>Breadth (m)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.breadth}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "breadth",
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
              </div>

              <p className="mt-4">
                Shuttering Area:{" "}
                {shutteringArea.toFixed(3)} m²
              </p>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="mt-6 rounded border px-4 py-2"
      >
        Add Footing
      </button>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">
          Total Footing Shuttering
        </h3>

        <p className="mt-2">
          {totalShutteringArea.toFixed(3)} m²
        </p>
      </div>
    </section>
  );
}