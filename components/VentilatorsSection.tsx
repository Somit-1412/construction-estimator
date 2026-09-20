"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateVentilatorOpeningArea,
  type VentilatorGroup,
} from "@/lib/calculations/ventilators";

export default function VentilatorsSection() {
  const [groups, setGroups] = useState<VentilatorGroup[]>("groups", [
    {
      mark: "V1",
      number: 1,
      width: 0.75,
      height: 0.9,
    },
  ]);

  const updateGroup = (
    index: number,
    field: keyof VentilatorGroup,
    value: string | number
  ) => {
    setGroups((current) =>
      current.map((group, i) =>
        i === index ? { ...group, [field]: value } : group
      )
    );
  };

  const addGroup = () => {
    setGroups((current) => [
      ...current,
      {
        mark: `V${current.length + 1}`,
        number: 1,
        width: 0.75,
        height: 0.9,
      },
    ]);
  };

  const removeGroup = (index: number) => {
    setGroups((current) => current.filter((_, i) => i !== index));
  };

  const totalArea = groups.reduce(
    (total, group) =>
      total + calculateVentilatorOpeningArea(group),
    0
  );

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-4">
        {groups.map((group, index) => {
          const area = calculateVentilatorOpeningArea(group);

          return (
            <div
              key={index}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-medium text-zinc-100">
                  Ventilator {index + 1}
                </h3>

                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGroup(index)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Ventilator Mark
                  </label>
                  <input
                    type="text"
                    value={group.mark}
                    onChange={(e) =>
                      updateGroup(index, "mark", e.target.value)
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Number
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={group.number}
                    onChange={(e) =>
                      updateGroup(
                        index,
                        "number",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Width (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.width}
                    onChange={(e) =>
                      updateGroup(
                        index,
                        "width",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-zinc-400">
                    Height (m)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.height}
                    onChange={(e) =>
                      updateGroup(
                        index,
                        "height",
                        Number(e.target.value)
                      )
                    }
                    className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-md bg-zinc-900 p-4">
                <div className="text-sm text-zinc-400">
                  Opening Area
                </div>

                <div className="mt-1 text-xl font-semibold text-zinc-100">
                  {area.toFixed(3)} m²
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addGroup}
        className="rounded-md border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800"
      >
        Add Ventilator Mark
      </button>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-5">
        <div className="text-sm text-zinc-400">
          Total Ventilator Opening Area
        </div>

        <div className="mt-1 text-2xl font-semibold text-white">
          {totalArea.toFixed(3)} m²
        </div>
      </div>
    </div>
  );
}