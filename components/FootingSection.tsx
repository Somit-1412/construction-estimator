"use client";

import { useState } from "react";
import {
  calculateFootingConcreteQuantity,
  FootingGroup,
} from "@/lib/calculations/footing";

const initialGroups: FootingGroup[] = [
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

export default function FootingSection() {
  const [groups, setGroups] =
    useState<FootingGroup[]>(initialGroups);

  function updateGroup(
    index: number,
    field: keyof FootingGroup,
    value: string | number
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
        length: 0,
        breadth: 0,
        thickness: 0,
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

  const totalConcrete = groups.reduce(
    (total, group) =>
      total + calculateFootingConcreteQuantity(group),
    0
  );

  return (
    <section className="border-b p-6">
      <h2 className="mb-6 text-2xl font-bold">
        RCC Footing
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const quantity =
            calculateFootingConcreteQuantity(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold">
                  Footing Group {index + 1}
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
                    Type
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
                    Number
                  </span>
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

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Length (m)
                  </span>
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

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Breadth (m)
                  </span>
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

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">
                    Thickness (m)
                  </span>
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

              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Concrete Quantity
                </p>
                <p className="text-lg font-semibold">
                  {quantity.toFixed(3)} m³
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
        Add Footing Group
      </button>

      <div className="mt-6 rounded-lg border p-4">
        <p className="text-sm text-gray-600">
          Total Footing Concrete
        </p>
        <p className="text-2xl font-bold">
          {totalConcrete.toFixed(3)} m³
        </p>
      </div>
    </section>
  );
}