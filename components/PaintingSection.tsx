"use client";

import { useCalculationState as useState } from "@/components/CalculationPersistence";
import {
  calculateInternalPaintingArea,
  calculateExternalPaintingArea,
} from "@/lib/calculations/painting";

export default function PaintingSection() {
  const [internalPlasterNetArea, setInternalPlasterNetArea] =
    useState("internalPlasterNetArea", 130.825);
  const [externalPlasterNetArea, setExternalPlasterNetArea] =
    useState("externalPlasterNetArea", 0);

  const internalPaintingArea = calculateInternalPaintingArea(
    internalPlasterNetArea
  );
  const externalPaintingArea = calculateExternalPaintingArea(
    externalPlasterNetArea
  );
  const totalPaintingArea = internalPaintingArea + externalPaintingArea;

  return (
    <section className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">
          Painting Areas
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Painting areas are based on net internal and external plaster areas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <label className="block text-sm text-zinc-400">
            Net Internal Plaster Area (m²)
          </label>

          <input
            type="number"
            min="0"
            step="0.001"
            value={internalPlasterNetArea}
            onChange={(e) =>
              setInternalPlasterNetArea(Number(e.target.value))
            }
            className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />

          <p className="mt-3 text-xs text-zinc-500">
            Internal walls and ceilings.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
          <label className="block text-sm text-zinc-400">
            Net External Plaster Area (m²)
          </label>

          <input
            type="number"
            min="0"
            step="0.001"
            value={externalPlasterNetArea}
            onChange={(e) =>
              setExternalPlasterNetArea(Number(e.target.value))
            }
            className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-500"
          />

          <p className="mt-3 text-xs text-zinc-500">
            External facades and weather-exposed surfaces.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-5">
          <div className="text-sm text-zinc-400">
            Internal Painting
          </div>

          <div className="mt-1 text-xl font-semibold text-white">
            {internalPaintingArea.toFixed(3)} m²
          </div>
        </div>

        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-5">
          <div className="text-sm text-zinc-400">
            External Painting
          </div>

          <div className="mt-1 text-xl font-semibold text-white">
            {externalPaintingArea.toFixed(3)} m²
          </div>
        </div>

        <div className="rounded-lg border border-blue-800/60 bg-blue-950/20 p-5">
          <div className="text-sm text-blue-300">
            Total Painting Area
          </div>

          <div className="mt-1 text-xl font-semibold text-white">
            {totalPaintingArea.toFixed(3)} m²
          </div>
        </div>
      </div>
    </section>
  );
}