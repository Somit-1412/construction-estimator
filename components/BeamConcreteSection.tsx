"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateBeamConcreteQuantity,
  calculateBeamShutteringArea,
  type BeamGroup,
} from "@/lib/calculations/beams";
import {
  calculateBeamReinforcementWeight,
  type BeamReinforcementBar,
} from "@/lib/calculations/beamReinforcement";

type BeamData = BeamGroup & {
  reinforcementBars: BeamReinforcementBar[];
};

export default function BeamConcreteSection() {
  const [beamGroups, setBeamGroups] = useState<BeamData[]>("beamGroups", [
    {
      type: "B1",
      width: 0.23,
      depth: 0.45,
      length: 4,
      number: 4,
      reinforcementBars: [
        {
          barMark: "B1-01",
          barType: "Bottom",
          diameter: 16,
          number: 2,
          length: 4.5,
        },
        {
          barMark: "B1-02",
          barType: "Top",
          diameter: 12,
          number: 2,
          length: 4.5,
        },
        {
          barMark: "B1-03",
          barType: "Stirrups",
          diameter: 8,
          number: 28,
          length: 1.3,
        },
      ],
    },
    {
      type: "B2",
      width: 0.23,
      depth: 0.45,
      length: 5,
      number: 3,
      reinforcementBars: [
        {
          barMark: "B2-01",
          barType: "Bottom",
          diameter: 16,
          number: 2,
          length: 5.5,
        },
        {
          barMark: "B2-02",
          barType: "Top",
          diameter: 12,
          number: 2,
          length: 5.5,
        },
      ],
    },
    {
      type: "B3",
      width: 0.23,
      depth: 0.3,
      length: 3,
      number: 2,
      reinforcementBars: [
        {
          barMark: "B3-01",
          barType: "Bottom",
          diameter: 12,
          number: 2,
          length: 3.5,
        },
        {
          barMark: "B3-02",
          barType: "Stirrups",
          diameter: 8,
          number: 20,
          length: 1.0,
        },
      ],
    },
  ]);

  const updateGroup = (
    index: number,
    updatedGroup: BeamData
  ) => {
    setBeamGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) =>
        groupIndex === index ? updatedGroup : group
      )
    );
  };

  const addBeamGroup = () => {
    setBeamGroups((currentGroups) => [
      ...currentGroups,
      {
        type: "B",
        width: 0,
        depth: 0,
        length: 0,
        number: 0,
        reinforcementBars: [],
      },
    ]);
  };

  const removeBeamGroup = (index: number) => {
    setBeamGroups((currentGroups) =>
      currentGroups.filter((_, groupIndex) => groupIndex !== index)
    );
  };

  const addReinforcementBar = (beamIndex: number) => {
    setBeamGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) => {
        if (groupIndex !== beamIndex) {
          return group;
        }

        return {
          ...group,
          reinforcementBars: [
            ...group.reinforcementBars,
            {
              barMark: `${group.type}-${group.reinforcementBars.length + 1}`,
              barType: "Bottom",
              diameter: 0,
              number: 0,
              length: 0,
            },
          ],
        };
      })
    );
  };

  const updateReinforcementBar = (
    beamIndex: number,
    barIndex: number,
    updatedBar: BeamReinforcementBar
  ) => {
    setBeamGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) => {
        if (groupIndex !== beamIndex) {
          return group;
        }

        return {
          ...group,
          reinforcementBars: group.reinforcementBars.map(
            (bar, currentBarIndex) =>
              currentBarIndex === barIndex
                ? updatedBar
                : bar
          ),
        };
      })
    );
  };

  const removeReinforcementBar = (
    beamIndex: number,
    barIndex: number
  ) => {
    setBeamGroups((currentGroups) =>
      currentGroups.map((group, groupIndex) => {
        if (groupIndex !== beamIndex) {
          return group;
        }

        return {
          ...group,
          reinforcementBars: group.reinforcementBars.filter(
            (_, currentBarIndex) =>
              currentBarIndex !== barIndex
          ),
        };
      })
    );
  };

  const totalConcrete = beamGroups.reduce((total, group) => {
    try {
      return total + calculateBeamConcreteQuantity(group);
    } catch {
      return total;
    }
  }, 0);

  const totalShuttering = beamGroups.reduce((total, group) => {
    try {
      return total + calculateBeamShutteringArea(group);
    } catch {
      return total;
    }
  }, 0);

  const totalReinforcement = beamGroups.reduce((total, group) => {
    const groupWeight = group.reinforcementBars.reduce(
      (groupTotal, bar) => {
        try {
          return (
            groupTotal +
            calculateBeamReinforcementWeight(bar)
          );
        } catch {
          return groupTotal;
        }
      },
      0
    );

    return total + groupWeight;
  }, 0);

  return (
    <section className="mx-auto max-w-5xl p-8">
      <h2 className="mb-8 text-2xl font-semibold">
        Beam Concrete, Shuttering & Reinforcement
      </h2>

      {beamGroups.map((group, index) => {
        let concreteQuantity: number | null = null;
        let shutteringArea: number | null = null;

        try {
          concreteQuantity =
            calculateBeamConcreteQuantity(group);

          shutteringArea =
            calculateBeamShutteringArea(group);
        } catch {
          concreteQuantity = null;
          shutteringArea = null;
        }

        const groupReinforcement = group.reinforcementBars.reduce(
          (total, bar) => {
            try {
              return (
                total +
                calculateBeamReinforcementWeight(bar)
              );
            } catch {
              return total;
            }
          },
          0
        );

        return (
          <div
            key={index}
            className="mb-8 rounded-lg border p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-medium">
                Beam Group {index + 1}
              </h3>

              <button
                type="button"
                onClick={() => removeBeamGroup(index)}
                className="rounded border px-3 py-1 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
              <label className="flex min-w-0 flex-col gap-1">
                <span className="h-10 text-sm">
                  Beam Type
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
                  Overall Depth (m)
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
                  Number of Beams
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
            </div>

            <div className="mt-8">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium">
                  Reinforcement / BBS
                </h4>

                <button
                  type="button"
                  onClick={() =>
                    addReinforcementBar(index)
                  }
                  className="rounded border px-3 py-1 text-sm"
                >
                  + Add bar
                </button>
              </div>

              {group.reinforcementBars.length === 0 ? (
                <p className="text-sm">
                  No reinforcement bars added.
                </p>
              ) : (
                <div className="space-y-4">
                  {group.reinforcementBars.map(
                    (bar, barIndex) => {
                      let weight: number | null = null;

                      try {
                        weight =
                          calculateBeamReinforcementWeight(
                            bar
                          );
                      } catch {
                        weight = null;
                      }

                      return (
                        <div
                          key={barIndex}
                          className="rounded border p-4"
                        >
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Bar Mark
                              </span>

                              <input
                                type="text"
                                value={bar.barMark}
                                onChange={(e) =>
                                  updateReinforcementBar(
                                    index,
                                    barIndex,
                                    {
                                      ...bar,
                                      barMark:
                                        e.target.value,
                                    }
                                  )
                                }
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>

                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Bar Type
                              </span>

                              <input
                                type="text"
                                value={bar.barType}
                                onChange={(e) =>
                                  updateReinforcementBar(
                                    index,
                                    barIndex,
                                    {
                                      ...bar,
                                      barType:
                                        e.target.value,
                                    }
                                  )
                                }
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>

                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Diameter (mm)
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={bar.diameter}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateReinforcementBar(
                                    index,
                                    barIndex,
                                    {
                                      ...bar,
                                      diameter: value,
                                    }
                                  );
                                }}
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>

                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Number of Bars
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={bar.number}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateReinforcementBar(
                                    index,
                                    barIndex,
                                    {
                                      ...bar,
                                      number: value,
                                    }
                                  );
                                }}
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>

                            <label className="flex min-w-0 flex-col gap-1">
                              <span className="h-10 text-sm">
                                Length / Bar (m)
                              </span>

                              <input
                                type="number"
                                min="0"
                                value={bar.length}
                                onChange={(e) => {
                                  const value =
                                    Number(
                                      e.target.value
                                    );

                                  if (value < 0) {
                                    return;
                                  }

                                  updateReinforcementBar(
                                    index,
                                    barIndex,
                                    {
                                      ...bar,
                                      length: value,
                                    }
                                  );
                                }}
                                className="w-full rounded border px-3 py-2"
                              />
                            </label>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <p className="font-medium">
                              Weight:{" "}
                              {weight === null
                                ? "Invalid"
                                : `${weight.toFixed(
                                    2
                                  )} kg`}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeReinforcementBar(
                                  index,
                                  barIndex
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

              <p className="mt-4 font-medium">
                Beam Reinforcement Total:{" "}
                {groupReinforcement.toFixed(2)} kg
              </p>
            </div>

            {concreteQuantity === null ||
            shutteringArea === null ? (
              <p className="mt-5 text-sm">
                Error: invalid beam dimensions.
              </p>
            ) : (
              <div className="mt-6 space-y-2">
                <p className="font-medium">
                  Concrete Quantity:{" "}
                  {concreteQuantity.toFixed(3)} m³
                </p>

                <p className="font-medium">
                  Shuttering Area:{" "}
                  {shutteringArea.toFixed(3)} m²
                </p>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addBeamGroup}
        className="mb-8 rounded border px-4 py-2"
      >
        + Add beam group
      </button>

      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-medium">
          Total Beam Quantities
        </h3>

        <div className="mt-3 space-y-2">
          <p className="text-2xl font-semibold">
            {totalConcrete.toFixed(3)} m³
          </p>

          <p className="text-2xl font-semibold">
            {totalShuttering.toFixed(3)} m²
          </p>

          <p className="text-2xl font-semibold">
            {totalReinforcement.toFixed(2)} kg
          </p>
        </div>
      </div>
    </section>
  );
}