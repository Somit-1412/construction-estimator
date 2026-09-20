"use client";

import { useState } from "react";

type Status = "SUBMITTED" | "PAYMENT_RECEIVED" | "IN_PROGRESS" | "COMPLETED";

export default function StatusControls({ projectId, initialStatus }: { projectId: string; initialStatus: Status }) {
  const [status, setStatus] = useState(initialStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function update(nextStatus: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED") {
    setSaving(true); setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update project status.");
      setStatus(data.status);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to update project status."); }
    finally { setSaving(false); }
  }

  return <div className="flex flex-col items-end gap-2"><div className="flex items-center gap-2"><span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">{status.replaceAll("_", " ")}</span>{status === "SUBMITTED" && <button disabled={saving} onClick={() => void update("IN_PROGRESS")} className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800 disabled:opacity-50">Start Work</button>}{status === "IN_PROGRESS" && <button disabled={saving} onClick={() => void update("COMPLETED")} className="rounded-md border border-emerald-900 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-950/30 disabled:opacity-50">Mark Completed</button>}</div>{error && <p className="text-xs text-red-400">{error}</p>}</div>;
}
