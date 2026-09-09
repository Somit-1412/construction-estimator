"use client";

import { useState } from "react";
import {
  calculateFlooringArea,
  FlooringGroup,
} from "@/lib/calculations/flooring";
import {
  calculateFlooringMaterials,
  calculateFlooringTileQuantity,
  FlooringMaterialInput,
  FlooringTileInput,
} from "@/lib/calculations/flooringMaterials";

const initialGroups: FlooringGroup[] = [
  {
    type: "F1",
    number: 2,
    length: 5,
    width: 4,
  },
];

const initialTileInput: FlooringTileInput = {
  floorArea: 40,
  tileLength: 0.6,
  tileWidth: 0.6,
  skirtingPercentage: 20,
};

const initialMaterialInput: FlooringMaterialInput = {
  floorArea: 40,
  beddingThickness: 0.02,
  wetMortarAllowancePercentage: 15,
  cementRatio: 1,
  sandRatio: 6,
  dryMortarFactor: 4 / 3,
  cementBagVolume: 0.0347,
};

export default function FlooringSection() {
  const [groups, setGroups] =
    useState<FlooringGroup[]>(initialGroups);

  const [tileInput, setTileInput] =
    useState<FlooringTileInput>(initialTileInput);

  const [materialInput, setMaterialInput] =
    useState<FlooringMaterialInput>(initialMaterialInput);

  function updateGroup(
    index: number,
    field: keyof FlooringGroup,
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
        width: 1,
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

  function updateTileInput(
    field: keyof FlooringTileInput,
    value: string
  ) {
    setTileInput((currentInput) => ({
      ...currentInput,
      [field]: Number(value),
    }));
  }

  function updateMaterialInput(
    field: keyof FlooringMaterialInput,
    value: string
  ) {
    setMaterialInput((currentInput) => ({
      ...currentInput,
      [field]: Number(value),
    }));
  }

  const totalArea = groups.reduce(
    (total, group) =>
      total + calculateFlooringArea(group),
    0
  );

  const tileResult =
    calculateFlooringTileQuantity({
      ...tileInput,
      floorArea: totalArea,
    });

  const materialResult =
    calculateFlooringMaterials({
      ...materialInput,
      floorArea: totalArea,
    });

  return (
    <section className="p-6">
      <h2 className="mb-4 text-2xl font-bold">
        Flooring
      </h2>

      <div className="space-y-6">
        {groups.map((group, index) => {
          const area = calculateFlooringArea(group);

          return (
            <div
              key={index}
              className="rounded-lg border p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Flooring Group {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeGroup(index)}
                  className="rounded border px-3 py-1"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  <span>Number of Areas</span>

                  <input
                    type="number"
                    min="0"
                    step="1"
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
                  <span>Width (m)</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={group.width}
                    onChange={(event) =>
                      updateGroup(
                        index,
                        "width",
                        event.target.value
                      )
                    }
                    className="w-full min-w-0 rounded border px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 rounded-lg border p-4">
                <h4 className="font-semibold">
                  Flooring Area
                </h4>

                <p className="mt-2">
                  {area.toFixed(3)} m²
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
        Add Group
      </button>

      <div className="mt-6 rounded-lg border p-4">
        <h3 className="text-lg font-semibold">
          Total Flooring Area
        </h3>

        <p className="mt-2">
          {totalArea.toFixed(3)} m²
        </p>
      </div>

      <div className="mt-8 rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">
          Flooring Tile Quantity
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1">
            <span>Tile Length (m)</span>

            <input
              type="number"
              min="0.001"
              step="0.01"
              value={tileInput.tileLength}
              onChange={(event) =>
                updateTileInput(
                  "tileLength",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Tile Width (m)</span>

            <input
              type="number"
              min="0.001"
              step="0.01"
              value={tileInput.tileWidth}
              onChange={(event) =>
                updateTileInput(
                  "tileWidth",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Skirting Percentage (%)</span>

            <input
              type="number"
              min="0"
              step="1"
              value={tileInput.skirtingPercentage}
              onChange={(event) =>
                updateTileInput(
                  "skirtingPercentage",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Tile Area
            </h4>

            <p className="mt-2">
              {tileResult.tileArea.toFixed(3)} m²
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Floor Tiles
            </h4>

            <p className="mt-2">
              {tileResult.floorTiles} Nos.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Skirting Tiles
            </h4>

            <p className="mt-2">
              {tileResult.skirtingTiles} Nos.
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Total Tiles
            </h4>

            <p className="mt-2">
              {tileResult.totalTiles} Nos.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-semibold">
          Flooring Material Quantity
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <label className="flex min-w-0 flex-col gap-1">
            <span>Bedding Thickness (m)</span>

            <input
              type="number"
              min="0"
              step="0.001"
              value={materialInput.beddingThickness}
              onChange={(event) =>
                updateMaterialInput(
                  "beddingThickness",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Wet Mortar Allowance (%)</span>

            <input
              type="number"
              min="0"
              step="1"
              value={
                materialInput.wetMortarAllowancePercentage
              }
              onChange={(event) =>
                updateMaterialInput(
                  "wetMortarAllowancePercentage",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Cement Ratio</span>

            <input
              type="number"
              min="0.001"
              step="0.1"
              value={materialInput.cementRatio}
              onChange={(event) =>
                updateMaterialInput(
                  "cementRatio",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Sand Ratio</span>

            <input
              type="number"
              min="0"
              step="0.1"
              value={materialInput.sandRatio}
              onChange={(event) =>
                updateMaterialInput(
                  "sandRatio",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Dry Mortar Factor</span>

            <input
              type="number"
              min="0.001"
              step="0.01"
              value={materialInput.dryMortarFactor}
              onChange={(event) =>
                updateMaterialInput(
                  "dryMortarFactor",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>

          <label className="flex min-w-0 flex-col gap-1">
            <span>Cement Bag Volume (m³)</span>

            <input
              type="number"
              min="0.001"
              step="0.0001"
              value={materialInput.cementBagVolume}
              onChange={(event) =>
                updateMaterialInput(
                  "cementBagVolume",
                  event.target.value
                )
              }
              className="w-full min-w-0 rounded border px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Base Mortar
            </h4>

            <p className="mt-2">
              {materialResult.baseMortarVolume.toFixed(3)} m³
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Wet Mortar
            </h4>

            <p className="mt-2">
              {materialResult.wetMortarVolume.toFixed(3)} m³
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Dry Mortar
            </h4>

            <p className="mt-2">
              {materialResult.dryMortarVolume.toFixed(3)} m³
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Cement
            </h4>

            <p className="mt-2">
              {materialResult.cementVolume.toFixed(3)} m³
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Cement Bags
            </h4>

            <p className="mt-2">
              {materialResult.cementBags.toFixed(2)} bags
            </p>
          </div>

          <div className="rounded-lg border p-4">
            <h4 className="font-semibold">
              Sand
            </h4>

            <p className="mt-2">
              {materialResult.sandVolume.toFixed(3)} m³
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}