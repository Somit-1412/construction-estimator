"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Estimate = {
  project: { id: string; projectName: string; clientName: string; clientEmail: string; location: string; status: string };
  workQuantities: { key: string; label: string; quantity: number; unit: string }[];
  materials: { materialName: string; quantity: number; unit: string; source: string; rate: number | null; cost: number | null }[];
  totalMaterialCost: number;
};

export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState("");

  useEffect(() => { void params.then(({ id: value }) => setId(value)); }, [params]);
  useEffect(() => { if (!id) return; fetch(`/api/projects/${id}/estimate`, { cache: "no-store" }).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to load report."); setEstimate(data); }).catch((err) => setError(err instanceof Error ? err.message : "Unable to load report.")); }, [id]);

  if (error) return <div className="rounded-xl border border-red-900 bg-red-950/20 p-6 text-sm text-red-300">{error}</div>;
  if (!estimate) return <div className="text-sm text-zinc-500">Loading report...</div>;

  return (
    <div className="space-y-8 print:bg-white print:text-black">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between print:hidden"><div><Link href={`/engineer/projects/${estimate.project.id}`} className="text-sm text-zinc-400 hover:text-white">← Back to Project</Link><h1 className="mt-5 text-2xl font-semibold text-white">Estimate Report</h1><p className="mt-2 text-sm text-zinc-400">Review the current project estimate before finalization.</p></div><button type="button" onClick={() => window.print()} className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200">Print / Save PDF</button></div>
      <main className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 print:border-0 print:bg-white print:p-0">
        <header className="border-b border-zinc-800 pb-6 print:border-black"><p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500 print:text-black">Construction Estimate</p><h2 className="mt-2 text-3xl font-semibold text-white print:text-black">{estimate.project.projectName}</h2><div className="mt-5 grid gap-3 text-sm md:grid-cols-2"><p><span className="text-zinc-500 print:text-zinc-700">Client:</span> <span className="text-zinc-200 print:text-black">{estimate.project.clientName}</span></p><p><span className="text-zinc-500 print:text-zinc-700">Location:</span> <span className="text-zinc-200 print:text-black">{estimate.project.location}</span></p><p><span className="text-zinc-500 print:text-zinc-700">Email:</span> <span className="text-zinc-200 print:text-black">{estimate.project.clientEmail}</span></p><p><span className="text-zinc-500 print:text-zinc-700">Status:</span> <span className="text-zinc-200 print:text-black">{estimate.project.status.replaceAll("_", " ")}</span></p></div></header>
        <section className="mt-8"><h3 className="text-lg font-semibold text-white print:text-black">Construction Quantities</h3><table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b border-zinc-800 print:border-black"><th className="py-3 text-zinc-500 print:text-black">Item</th><th className="py-3 text-zinc-500 print:text-black">Quantity</th><th className="py-3 text-zinc-500 print:text-black">Unit</th></tr></thead><tbody>{estimate.workQuantities.map((item) => <tr key={item.key} className="border-b border-zinc-800/70 print:border-zinc-300"><td className="py-3 text-zinc-200 print:text-black">{item.label}</td><td className="py-3 text-zinc-300 print:text-black">{item.quantity.toFixed(3)}</td><td className="py-3 text-zinc-500 print:text-black">{item.unit}</td></tr>)}</tbody></table></section>
        <section className="mt-8"><h3 className="text-lg font-semibold text-white print:text-black">Direct Material Cost</h3><table className="mt-4 w-full text-left text-sm"><thead><tr className="border-b border-zinc-800 print:border-black"><th className="py-3 text-zinc-500 print:text-black">Material</th><th className="py-3 text-zinc-500 print:text-black">Quantity</th><th className="py-3 text-zinc-500 print:text-black">Rate</th><th className="py-3 text-zinc-500 print:text-black">Cost</th></tr></thead><tbody>{estimate.materials.map((item) => <tr key={item.materialName} className="border-b border-zinc-800/70 print:border-zinc-300"><td className="py-3 text-zinc-200 print:text-black">{item.materialName}</td><td className="py-3 text-zinc-300 print:text-black">{item.quantity.toFixed(3)} {item.unit}</td><td className="py-3 text-zinc-300 print:text-black">{item.rate === null ? "Not set" : `₹${item.rate.toFixed(2)}`}</td><td className="py-3 text-zinc-200 print:text-black">{item.cost === null ? "—" : `₹${item.cost.toFixed(2)}`}</td></tr>)}</tbody></table><div className="mt-5 flex justify-end border-t border-zinc-800 pt-5 print:border-black"><p className="text-lg font-semibold text-white print:text-black">Direct Material Total: ₹{estimate.totalMaterialCost.toFixed(2)}</p></div></section>
        <p className="mt-8 text-xs leading-5 text-zinc-500 print:text-zinc-700">This report reflects the calculations and material rates currently saved in the engineer workspace. Concrete, masonry and finishing material conversion is only included where the project data explicitly supports it.</p>
      </main>
    </div>
  );
}
