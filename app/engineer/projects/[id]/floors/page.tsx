"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type Floor = {
  id: string;
  name: string;
  level: number;
  heightMeters: number;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function FloorsPage({ params }: PageProps) {
  const { id } = use(params);

  const [floors, setFloors] = useState<Floor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newFloorName, setNewFloorName] = useState("");
  const [newFloorHeight, setNewFloorHeight] = useState("3.0");
  const [submitting, setSubmitting] = useState(false);

  const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editHeight, setEditHeight] = useState("");

  useEffect(() => {
    let ignore = false;
    async function fetchFloors() {
      try {
        const res = await fetch(`/api/projects/${id}/floors`, { cache: "no-store" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to load floors.");
        if (!ignore) {
          setFloors(data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Unable to load floors.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    void fetchFloors();
    return () => {
      ignore = true;
    };
  }, [id]);

  async function reloadFloors() {
    try {
      const res = await fetch(`/api/projects/${id}/floors`, { cache: "no-store" });
      const data = await res.json();
      if (res.ok) setFloors(data);
    } catch {
      // ignore
    }
  }

  async function handleAddFloor(nameToAdd?: string, heightToAdd?: number) {
    const finalName = (nameToAdd || newFloorName).trim();
    const finalHeight = heightToAdd ?? (Number(newFloorHeight) || 3.0);

    if (!finalName) {
      setError("Please specify a floor name.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/projects/${id}/floors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalName,
          heightMeters: finalHeight,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to add floor.");

      setSuccess(`Added floor "${finalName}".`);
      setNewFloorName("");
      setNewFloorHeight("3.0");
      await reloadFloors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add floor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickAdd(level: number, name: string) {
    await handleAddFloor(name, 3.0);
  }

  async function handleSaveEdit(floorId: string) {
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/projects/${id}/floors/${floorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          heightMeters: Number(editHeight) || 3.0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to update floor.");

      setSuccess("Floor updated successfully.");
      setEditingFloorId(null);
      await reloadFloors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update floor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteFloor(floorId: string, floorName: string) {
    if (!confirm(`Are you sure you want to delete ${floorName}?`)) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/projects/${id}/floors/${floorId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to delete floor.");

      setSuccess(`Deleted ${floorName}.`);
      await reloadFloors();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete floor.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEditing(floor: Floor) {
    setEditingFloorId(floor.id);
    setEditName(floor.name);
    setEditHeight(String(floor.heightMeters));
  }

  const highestLevel = floors.length > 0 ? Math.max(...floors.map((f) => f.level)) : -1;

  return (
    <div className="space-y-7">
      <div>
        <Link href={`/engineer/projects/${id}`} className="back-link">
          ← Back to Project
        </Link>
        <div className="page-kicker">Multi-Storey Configuration</div>
        <h1 className="page-title">Floors &amp; Storeys</h1>
        <p className="page-subtitle">
          Configure building storeys, levels, and heights. Superstructure calculations
          (columns, beams, slabs, brickwork, plaster, finishes) aggregate across all configured floors.
        </p>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {success && <div className="alert-success">{success}</div>}

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Configured Floors ({floors.length})</h2>
            <p className="text-sm text-slate-500">
              Each floor maintains independent dimension inputs, layout groups, and storey heights.
            </p>
          </div>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-slate-500">Loading building storeys…</p>
        ) : floors.length === 0 ? (
          <div className="mt-5 rounded-lg border border-dashed border-slate-300 p-6 text-center">
            <p className="text-sm font-semibold text-slate-700">No multi-storey floors configured yet.</p>
            <p className="mt-1 text-xs text-slate-500">
              By default, this project operates in standard single-storey mode. You can initialize the Ground Floor and add additional storeys below.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void handleAddFloor("Ground Floor", 3.0)}
                disabled={submitting}
                className="primary-button !px-4 !py-2 !text-xs"
              >
                + Initialize Ground Floor (Level 0)
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-20">Level</th>
                  <th>Floor Name</th>
                  <th className="w-36">Storey Height</th>
                  <th className="w-44 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {floors.map((floor) => {
                  const isEditing = editingFloorId === floor.id;

                  return (
                    <tr key={floor.id}>
                      <td className="font-mono font-bold text-slate-600">
                        L{floor.level}
                      </td>
                      <td>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="input-field max-w-xs !py-1 !text-xs"
                          />
                        ) : (
                          <div>
                            <span className="font-semibold text-slate-900">{floor.name}</span>
                            {floor.level === 0 && (
                              <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                Base
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.05"
                              value={editHeight}
                              onChange={(e) => setEditHeight(e.target.value)}
                              className="input-field w-20 !py-1 !text-xs"
                            />
                            <span className="text-xs text-slate-500">m</span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-700">
                            {floor.heightMeters.toFixed(2)} m
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(floor.id)}
                              disabled={submitting}
                              className="primary-button !px-2.5 !py-1 !text-xs"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingFloorId(null)}
                              className="secondary-button !px-2.5 !py-1 !text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(floor)}
                              className="secondary-button !px-2.5 !py-1 !text-xs"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteFloor(floor.id, floor.name)}
                              disabled={submitting}
                              className="secondary-button !px-2.5 !py-1 !text-xs !text-red-600 hover:!border-red-300 hover:!bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add New Floor Section */}
      <section className="engineering-card p-6">
        <h2 className="section-title">Add Storey</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create an additional floor level for this project.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleAddFloor();
          }}
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
          <div>
            <label className="input-label">Floor Name</label>
            <input
              type="text"
              required
              placeholder={
                highestLevel < 0
                  ? "Ground Floor"
                  : highestLevel === 0
                  ? "First Floor"
                  : highestLevel === 1
                  ? "Second Floor"
                  : `Floor ${highestLevel + 1}`
              }
              value={newFloorName}
              onChange={(e) => setNewFloorName(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="input-label">Storey Height (meters)</label>
            <input
              type="number"
              step="0.05"
              min="1.0"
              max="15.0"
              required
              value={newFloorHeight}
              onChange={(e) => setNewFloorHeight(e.target.value)}
              className="input-field mt-1"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="primary-button w-full sm:w-auto"
            >
              {submitting ? "Adding…" : "+ Add Floor"}
            </button>
          </div>
        </form>

        {/* Quick presets */}
        {floors.length > 0 && highestLevel >= 0 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Quick Add Presets:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {highestLevel === 0 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleQuickAdd(1, "First Floor")}
                  className="secondary-button !px-3 !py-1.5 !text-xs"
                >
                  + Add First Floor (G + 1)
                </button>
              )}
              {highestLevel === 1 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleQuickAdd(2, "Second Floor")}
                  className="secondary-button !px-3 !py-1.5 !text-xs"
                >
                  + Add Second Floor (G + 2)
                </button>
              )}
              {highestLevel === 2 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleQuickAdd(3, "Third Floor")}
                  className="secondary-button !px-3 !py-1.5 !text-xs"
                >
                  + Add Third Floor (G + 3)
                </button>
              )}
              {highestLevel >= 3 && (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() =>
                    void handleQuickAdd(highestLevel + 1, `Floor ${highestLevel + 1}`)
                  }
                  className="secondary-button !px-3 !py-1.5 !text-xs"
                >
                  + Add Floor {highestLevel + 1}
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
