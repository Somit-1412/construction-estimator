"use client";

import { useState } from "react";
import { calculateInternalPaintingArea } from "@/lib/calculations/painting";

export default function PaintingSection() {
  const [internalPlasterNetArea, setInternalPlasterNetArea] =
    useState(130.825);

  const paintingArea = calculateInternalPaintingArea(
    internalPlasterNetArea
  );

  return (
    <section className="space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">
          Internal Painting
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Painting area is based on the net internal plaster area.
        </p>
      </div>

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
          This value will eventually come directly from the internal
          plaster calculation.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-5">
        <div className="text-sm text-zinc-400">
          Total Internal Painting Area
        </div>

        <div className="mt-1 text-2xl font-semibold text-white">
          {paintingArea.toFixed(3)} m²
        </div>
      </div>
    </section>
  );
}