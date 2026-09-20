"use client";

import { useEffect, useState } from "react";

type Material = {
  id: string;
  name: string;
  category: string;
  unit: string;
  rates: {
    id: string;
    rate: string;
    effectiveFrom: string;
  }[];
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/materials")
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load materials.",
          );
        }

        if (!cancelled) {
          setMaterials(data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load materials.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function formatUnit(unit: string) {
    switch (unit) {
      case "BAG":
        return "Bag";

      case "CUBIC_METER":
        return "m³";

      case "NUMBER":
        return "Nos.";

      case "KILOGRAM":
        return "kg";

      case "SQUARE_METER":
        return "m²";

      case "LITRE":
        return "Litre";

      default:
        return unit;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Estimation Configuration
        </p>

        <h1 className="mt-2 text-2xl font-semibold text-white">
          Materials & Rates
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Manage construction materials and their current rates.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="font-medium text-white">
            Material Master
          </h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-zinc-500">
            Loading materials...
          </div>
        ) : materials.length === 0 ? (
          <div className="px-6 py-8 text-sm text-zinc-500">
            No materials found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950">
                <tr>
                  <th className="px-6 py-4 font-medium text-zinc-400">
                    Material
                  </th>

                  <th className="px-6 py-4 font-medium text-zinc-400">
                    Category
                  </th>

                  <th className="px-6 py-4 font-medium text-zinc-400">
                    Unit
                  </th>

                  <th className="px-6 py-4 font-medium text-zinc-400">
                    Current Rate
                  </th>
                </tr>
              </thead>

              <tbody>
                {materials.map((material) => {
                  const currentRate = material.rates[0];

                  return (
                    <tr
                      key={material.id}
                      className="border-b border-zinc-800 last:border-0"
                    >
                      <td className="px-6 py-4 font-medium text-white">
                        {material.name}
                      </td>

                      <td className="px-6 py-4 text-zinc-400">
                        {material.category}
                      </td>

                      <td className="px-6 py-4 text-zinc-400">
                        {formatUnit(material.unit)}
                      </td>

                      <td className="px-6 py-4 text-zinc-400">
                        {currentRate
                          ? `₹${currentRate.rate} / ${formatUnit(material.unit)}`
                          : "Not set"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}