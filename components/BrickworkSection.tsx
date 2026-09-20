"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateBrickworkDeductionQuantity,
  calculateBrickworkGrossQuantity,
  calculateBrickworkNetQuantity,
  type BrickworkDeduction,
  type BrickworkGroup,
} from "@/lib/calculations/brickwork";

export default function BrickworkSection() {
  const [brickworkGroups, setBrickworkGroups] =
    useState<BrickworkGroup[]>("brickworkGroups", [
      {
        type: "External Wall",
        number: 1,
        length: 10,
        breadth: 0.23,
        height: 3,
        deductions: [],
      },
      {
        type: "Internal Wall",
        number: 1,
        length: 8,
        breadth: 0.23,
        height: 3,
        deductions: [],
      },
    ]);

  const updateGroup = (
    index: number,
    updatedGroup: BrickworkGroup
  ) => {
    setBrickworkGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index ? updatedGroup : group
      )
    );
  };

  const addBrickworkGroup = () => {
    setBrickworkGroups((currentGroups) => [
      ...currentGroups,
      {
        type: "Wall",
        number: 1,
        length: 0,
        breadth: 0.23,
        height: 0,
        deductions: [],
      },
    ]);
  };

  const removeBrickworkGroup = (index: number) => {
    setBrickworkGroups((currentGroups) =>
      currentGroups.filter(
        (_, groupIndex) => groupIndex !== index
      )
    );
  };

  const addDeduction = (groupIndex: number) => {
    setBrickworkGroups((currentGroups) =>
      currentGroups.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        const deductionNumber =
          group.deductions.length + 1;

        const newDeduction: BrickworkDeduction = {
          type: `Opening ${deductionNumber}`,
          length: 0,
          breadth: group.breadth,
          height: 0,
          number: 1,
        };

        return {
          ...group,
          deductions: [
            ...group.deductions,
            newDeduction,
          ],
        };
      })
    );
  };

  const updateDeduction = (
    groupIndex: number,
    deductionIndex: number,
    updatedDeduction: BrickworkDeduction
  ) => {
    setBrickworkGroups((currentGroups) =>
      currentGroups.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        return {
          ...group,
          deductions: group.deductions.map(
            (deduction, currentDeductionIndex) =>
              currentDeductionIndex === deductionIndex
                ? updatedDeduction
                : deduction
          ),
        };
      })
    );
  };

  const removeDeduction = (
    groupIndex: number,
    deductionIndex: number
  ) => {
    setBrickworkGroups((currentGroups) =>
      currentGroups.map((group, index) => {
        if (index !== groupIndex) {
          return group;
        }

        return {
          ...group,
          deductions: group.deductions.filter(
            (_, currentDeductionIndex) =>
              currentDeductionIndex !== deductionIndex
          ),
        };
      })
    );
  };

  const totalGross = brickworkGroups.reduce(
    (total, group) => {
      try {
        return (
          total +
          calculateBrickworkGrossQuantity(group)
        );
      } catch {
        return total;
      }
    },
    0
  );

  const totalDeductions = brickworkGroups.reduce(
    (total, group) => {
      return (
        total +
        group.deductions.reduce(
          (groupTotal, deduction) => {
            try {
              return (
                groupTotal +
                calculateBrickworkDeductionQuantity(
                  deduction
                )
              );
            } catch {
              return groupTotal;
            }
          },
          0
        )
      );
    },
    0
  );

  const totalNet = brickworkGroups.reduce(
    (total, group) => {
      try {
        return (
          total +
          calculateBrickworkNetQuantity(group)
        );
      } catch {
        return total;
      }
    },
    0
  );

  return (
    <section className="mx-auto max-w-5xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        Brickwork
      </h2>

      {brickworkGroups.map((group, index) => {
        let grossQuantity: number | null = null;
        let netQuantity: number | null = null;

        try {
          grossQuantity =
            calculateBrickworkGrossQuantity(group);

          netQuantity =
            calculateBrickworkNetQuantity(group);
        } catch {
          grossQuantity = null;
          netQuantity = null;
        }

        return (
          <div
            key={index}
            className="mb-8 rounded-lg border p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Brickwork Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removeBrickworkGroup(index)
                }
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
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
                  Wall Thickness (m)
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
                  Height (m)
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

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">
                  Deductions
                </h4>

                <button
                  type="button"
                  onClick={() => addDeduction(index)}
                  className="rounded border px-3 py-1 text-sm"
                >
                  + Add deduction
                </button>
              </div>

              {group.deductions.length === 0 ? (
                <p className="text-sm">
                  No deductions added.
                </p>
              ) : (
                <div className="space-y-4">
                  {group.deductions.map(
                    (deduction, deductionIndex) => {
                      let quantity: number | null = null;

                      try {
                        quantity =
                          calculateBrickworkDeductionQuantity(
                            deduction
                          );
                      } catch {
                        quantity = null;
                      }

                      return (
                        <div
                          key={deductionIndex}
                          className="rounded border p-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Deduction Type
                              </span>

                              <input
                                type="text"
                                value={deduction.type}
                                onChange={(e) =>
                                  updateDeduction(
                                    index,
                                    deductionIndex,
                                    {
                                      ...deduction,
                                      type: e.target.value,
                                    }
                                  )
                                }
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>

                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Number
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={deduction.number}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateDeduction(
                                    index,
                                    deductionIndex,
                                    {
                                      ...deduction,
                                      number: value,
                                    }
                                  );
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
                                value={deduction.length}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateDeduction(
                                    index,
                                    deductionIndex,
                                    {
                                      ...deduction,
                                      length: value,
                                    }
                                  );
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
                                value={deduction.breadth}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateDeduction(
                                    index,
                                    deductionIndex,
                                    {
                                      ...deduction,
                                      breadth: value,
                                    }
                                  );
                                }}
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>

                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Height (m)
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={deduction.height}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateDeduction(
                                    index,
                                    deductionIndex,
                                    {
                                      ...deduction,
                                      height: value,
                                    }
                                  );
                                }}
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <p className="font-medium">
                              Deduction Quantity:{" "}
                              {quantity === null
                                ? "Invalid"
                                : `${quantity.toFixed(
                                    3
                                  )} m³`}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeDeduction(
                                  index,
                                  deductionIndex
                                )
                              }
                              className="rounded border px-3 py-1 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2">
              <p className="font-medium">
                Gross Brickwork:{" "}
                {grossQuantity === null
                  ? "Invalid"
                  : `${grossQuantity.toFixed(3)} m³`}
              </p>

              <p className="font-medium">
                Net Brickwork:{" "}
                {netQuantity === null
                  ? "Invalid"
                  : `${netQuantity.toFixed(3)} m³`}
              </p>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addBrickworkGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add brickwork group
      </button>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total Brickwork Quantities
        </h3>

        <div className="mt-3 space-y-2">
          <p className="text-2xl font-semibold">
            Gross: {totalGross.toFixed(3)} m³
          </p>

          <p className="text-2xl font-semibold">
            Deductions: {totalDeductions.toFixed(3)} m³
          </p>

          <p className="text-2xl font-semibold">
            Net: {totalNet.toFixed(3)} m³
          </p>
        </div>
      </div>
    </section>
  );
}