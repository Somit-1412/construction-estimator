"use client";

import { useState } from "react";
import {
  calculateInternalPlasterDeductionArea,
  calculateInternalPlasterSurfaceArea,
  type InternalPlasterDeduction,
  type InternalPlasterGroup,
} from "@/lib/calculations/internalPlaster";

export default function InternalPlasterSection() {
  const [plasterGroups, setPlasterGroups] =
    useState<InternalPlasterGroup[]>([
      {
        type: "Living Room - Long Wall",
        surfaceType: "wall",
        number: 2,
        length: 4.45,
        secondDimension: 3,
      },
      {
        type: "Living Room - Short Wall",
        surfaceType: "wall",
        number: 2,
        length: 4,
        secondDimension: 3,
      },
      {
        type: "Living Room - Ceiling",
        surfaceType: "ceiling",
        number: 1,
        length: 4.45,
        secondDimension: 4,
      },
      {
        type: "Kitchen - Long Wall",
        surfaceType: "wall",
        number: 2,
        length: 2.7,
        secondDimension: 3,
      },
      {
        type: "Kitchen - Short Wall",
        surfaceType: "wall",
        number: 2,
        length: 3,
        secondDimension: 3,
      },
      {
        type: "Kitchen - Ceiling",
        surfaceType: "ceiling",
        number: 1,
        length: 2.7,
        secondDimension: 3,
      },
      {
        type: "Toilet - Long Wall",
        surfaceType: "wall",
        number: 2,
        length: 1.5,
        secondDimension: 3,
      },
      {
        type: "Toilet - Short Wall",
        surfaceType: "wall",
        number: 2,
        length: 3,
        secondDimension: 3,
      },
      {
        type: "Toilet - Ceiling",
        surfaceType: "ceiling",
        number: 1,
        length: 1.5,
        secondDimension: 3,
      },
    ]);

  const [deductions, setDeductions] =
    useState<InternalPlasterDeduction[]>([
      {
        type: "Door",
        number: 1,
        length: 1.2,
        height: 2.1,
      },
      {
        type: "Door",
        number: 2,
        length: 0.9,
        height: 2.1,
      },
      {
        type: "Window",
        number: 3,
        length: 1,
        height: 1.5,
      },
      {
        type: "Ventilator",
        number: 1,
        length: 0.75,
        height: 0.9,
      },
    ]);

  const updateGroup = (
    index: number,
    updatedGroup: InternalPlasterGroup
  ) => {
    setPlasterGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index
          ? updatedGroup
          : group
      )
    );
  };

  const addPlasterGroup = () => {
    setPlasterGroups((currentGroups) => [
      ...currentGroups,
      {
        type: "Plaster Surface",
        surfaceType: "wall",
        number: 1,
        length: 0,
        secondDimension: 0,
      },
    ]);
  };

  const removePlasterGroup = (index: number) => {
    setPlasterGroups((currentGroups) =>
      currentGroups.filter(
        (_, groupIndex) => groupIndex !== index
      )
    );
  };

  const updateDeduction = (
    index: number,
    updatedDeduction: InternalPlasterDeduction
  ) => {
    setDeductions((currentDeductions) =>
      currentDeductions.map(
        (deduction, deductionIndex) =>
          deductionIndex === index
            ? updatedDeduction
            : deduction
      )
    );
  };

  const addDeduction = () => {
    setDeductions((currentDeductions) => [
      ...currentDeductions,
      {
        type: "Opening",
        number: 1,
        length: 0,
        height: 0,
      },
    ]);
  };

  const removeDeduction = (index: number) => {
    setDeductions((currentDeductions) =>
      currentDeductions.filter(
        (_, deductionIndex) =>
          deductionIndex !== index
      )
    );
  };

  const totalGross = plasterGroups.reduce(
    (total, group) => {
      try {
        return (
          total +
          calculateInternalPlasterSurfaceArea(group)
        );
      } catch {
        return total;
      }
    },
    0
  );

  const totalDeductions = deductions.reduce(
    (total, deduction) => {
      try {
        return (
          total +
          calculateInternalPlasterDeductionArea(
            deduction
          )
        );
      } catch {
        return total;
      }
    },
    0
  );

  const totalNet = totalGross - totalDeductions;

  return (
    <section className="mx-auto max-w-5xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        12 mm Internal Plaster
      </h2>

      {plasterGroups.map((group, index) => {
        let quantity: number | null = null;

        try {
          quantity =
            calculateInternalPlasterSurfaceArea(group);
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
                Plaster Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() =>
                  removePlasterGroup(index)
                }
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Description
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
                  Surface Type
                </span>

                <select
                  value={group.surfaceType}
                  onChange={(e) =>
                    updateGroup(index, {
                      ...group,
                      surfaceType:
                        e.target.value as
                          | "wall"
                          | "ceiling",
                    })
                  }
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="wall">
                    Wall
                  </option>
                  <option value="ceiling">
                    Ceiling
                  </option>
                </select>
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
                  {group.surfaceType === "wall"
                    ? "Height (m)"
                    : "Breadth (m)"}
                </span>

                <input
                  type="number"
                  min="0"
                  value={group.secondDimension}
                  onChange={(e) => {
                    const value = Number(
                      e.target.value
                    );

                    if (value < 0) {
                      return;
                    }

                    updateGroup(index, {
                      ...group,
                      secondDimension: value,
                    });
                  }}
                  className="w-full rounded border px-3 py-2"
                />
              </label>
            </div>

            <p className="mt-6 font-medium">
              Plaster Area:{" "}
              {quantity === null
                ? "Invalid"
                : `${quantity.toFixed(3)} m²`}
            </p>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addPlasterGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add plaster group
      </button>

      <div className="mb-8 rounded-lg border p-6">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Deductions
          </h3>

          <button
            type="button"
            onClick={addDeduction}
            className="rounded border px-3 py-1 text-sm"
          >
            + Add deduction
          </button>
        </div>

        {deductions.length === 0 ? (
          <p className="text-sm">
            No deductions added.
          </p>
        ) : (
          <div className="space-y-4">
            {deductions.map(
              (deduction, index) => {
                let quantity: number | null = null;

                try {
                  quantity =
                    calculateInternalPlasterDeductionArea(
                      deduction
                    );
                } catch {
                  quantity = null;
                }

                return (
                  <div
                    key={index}
                    className="rounded border p-4"
                  >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <label className="flex min-w-0 flex-col gap-1">
                        <span className="h-10 text-sm">
                          Type
                        </span>

                        <input
                          type="text"
                          value={deduction.type}
                          onChange={(e) =>
                            updateDeduction(
                              index,
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
                        Deduction Area:{" "}
                        {quantity === null
                          ? "Invalid"
                          : `${quantity.toFixed(
                              3
                            )} m²`}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeDeduction(index)
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

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total Internal Plaster
        </h3>

        <div className="mt-3 space-y-2">
          <p className="text-2xl font-semibold">
            Gross: {totalGross.toFixed(3)} m²
          </p>

          <p className="text-2xl font-semibold">
            Deductions:{" "}
            {totalDeductions.toFixed(3)} m²
          </p>

          <p className="text-2xl font-semibold">
            Net: {Math.max(0, totalNet).toFixed(3)} m²
          </p>
        </div>
      </div>
    </section>
  );
}