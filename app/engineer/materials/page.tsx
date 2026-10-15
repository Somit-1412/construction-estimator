"use client";

import { useEffect, useMemo, useState } from "react";

type Rate = {
  id: string;
  rate: string;
  effectiveFrom: string;
  effectiveTo: string | null;
};

type Material = {
  id: string;
  name: string;
  category: string;
  unit: string;
  rates: Rate[];
};

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingMaterialId, setSavingMaterialId] = useState<string | null>(null);
  const [rateInputs, setRateInputs] = useState<Record<string, string>>({});
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);

  async function loadMaterials() {
    setError("");

    try {
      const response = await fetch("/api/materials", { cache: "no-store" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load materials.");
      }

      setMaterials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load materials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignore = false;
    async function fetchMaterials() {
      try {
        const response = await fetch("/api/materials", { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load materials.");
        }
        if (!ignore) {
          setMaterials(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Unable to load materials.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void fetchMaterials();
    return () => {
      ignore = true;
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

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  async function handleAddRate(materialId: string) {
    const rate = rateInputs[materialId]?.trim() ?? "";

    if (!rate || Number(rate) <= 0) {
      setError("Enter a valid positive rate before saving.");
      return;
    }

    setSavingMaterialId(materialId);
    setError("");

    try {
      const response = await fetch(`/api/materials/${materialId}/rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save material rate.");
      }

      setRateInputs((current) => ({ ...current, [materialId]: "" }));
      await loadMaterials();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save material rate.");
    } finally {
      setSavingMaterialId(null);
    }
  }

  const materialCountLabel = useMemo(
    () => `${materials.length} material${materials.length === 1 ? "" : "s"}`,
    [materials.length],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
          Estimation Configuration
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Materials & Rates</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage construction materials and maintain their rate history.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-900/50 bg-red-950/20 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="font-medium text-white">Material Master</h2>
            <p className="mt-1 text-xs text-zinc-500">{materialCountLabel}</p>
          </div>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-zinc-500">Loading materials...</div>
        ) : materials.length === 0 ? (
          <div className="px-6 py-8 text-sm text-zinc-500">No materials found.</div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {materials.map((material) => {
              const currentRate = material.rates.find((rate) => rate.effectiveTo === null);
              const historyOpen = openHistoryId === material.id;
              const saving = savingMaterialId === material.id;

              return (
                <div key={material.id} className="p-6">
                  <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr_0.7fr_1.2fr] lg:items-start">
                    <div>
                      <p className="font-medium text-white">{material.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{material.category}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-600">Unit</p>
                      <p className="mt-1 text-sm text-zinc-300">{formatUnit(material.unit)}</p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-600">Current Rate</p>
                      <p className="mt-1 text-sm font-medium text-white">
                        {currentRate
                          ? `₹${currentRate.rate} / ${formatUnit(material.unit)}`
                          : "Not set"}
                      </p>
                      {currentRate && (
                        <p className="mt-1 text-xs text-zinc-500">
                          Since {formatDate(currentRate.effectiveFrom)}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-600">Add New Rate</p>
                      <div className="mt-2 flex gap-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={rateInputs[material.id] ?? ""}
                          onChange={(event) =>
                            setRateInputs((current) => ({
                              ...current,
                              [material.id]: event.target.value,
                            }))
                          }
                          placeholder="Rate"
                          className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                        />
                        <button
                          type="button"
                          onClick={() => void handleAddRate(material.id)}
                          disabled={saving}
                          className="rounded-md border border-zinc-700 px-3 py-2 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setOpenHistoryId(historyOpen ? null : material.id)}
                      className="text-xs font-medium text-zinc-400 transition hover:text-white"
                    >
                      {historyOpen ? "Hide rate history" : `View rate history (${material.rates.length})`}
                    </button>
                  </div>

                  {historyOpen && (
                    <div className="mt-4 overflow-hidden rounded-md border border-zinc-800">
                      {material.rates.length === 0 ? (
                        <p className="px-4 py-4 text-sm text-zinc-500">No rate history.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-500">
                              <tr>
                                <th className="px-4 py-3 font-medium">Rate</th>
                                <th className="px-4 py-3 font-medium">Effective From</th>
                                <th className="px-4 py-3 font-medium">Effective To</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {material.rates.map((rate) => (
                                <tr key={rate.id} className="border-t border-zinc-800">
                                  <td className="px-4 py-3 text-zinc-200">
                                    ₹{rate.rate} / {formatUnit(material.unit)}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-400">
                                    {formatDate(rate.effectiveFrom)}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-400">
                                    {rate.effectiveTo ? formatDate(rate.effectiveTo) : "—"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className={
                                        rate.effectiveTo === null
                                          ? "text-emerald-400"
                                          : "text-zinc-500"
                                      }
                                    >
                                      {rate.effectiveTo === null ? "Current" : "Historical"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
