"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Ratio = { cement: number; sand: number; aggregate?: number };
type Settings = {
  concrete: { pcc: Ratio; rcc: Ratio; dryVolumeFactor: number; cementBagVolume: number };
  masonry: { bricksPerM3: number; mortarWetVolumePerM3: number; mortarDryVolumeFactor: number; mortarRatio: { cement: number; sand: number } };
  plaster: { internal: { thicknessMm: number; dryVolumeFactor: number; ratio: Ratio }; external: { thicknessMm: number; dryVolumeFactor: number; ratio: Ratio } };
  painting: { internalLitresPerM2: number; externalLitresPerM2: number };
};

const initial: Settings = {
  concrete: { pcc: { cement: 0, sand: 0, aggregate: 0 }, rcc: { cement: 0, sand: 0, aggregate: 0 }, dryVolumeFactor: 0, cementBagVolume: 0.0347 },
  masonry: { bricksPerM3: 0, mortarWetVolumePerM3: 0, mortarDryVolumeFactor: 0, mortarRatio: { cement: 0, sand: 0 } },
  plaster: { internal: { thicknessMm: 0, dryVolumeFactor: 0, ratio: { cement: 0, sand: 0 } }, external: { thicknessMm: 0, dryVolumeFactor: 0, ratio: { cement: 0, sand: 0 } } },
  painting: { internalLitresPerM2: 0, externalLitresPerM2: 0 },
};

function Field({ label, value, onChange, step = "0.01" }: { label: string; value: number; onChange: (value: number) => void; step?: string }) {
  return <label className="block"><span className="mb-1 block text-xs text-zinc-500">{label}</span><input type="number" min="0" step={step} value={value || ""} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-zinc-500" /></label>;
}

export default function SpecificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState("");
  const [settings, setSettings] = useState<Settings>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { void params.then(({ id: value }) => setId(value)); }, [params]);
  useEffect(() => { if (!id) return; fetch(`/api/projects/${id}/settings`).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setSettings(d); }).catch(e => setError(e.message)); }, [id]);

  const update = (path: string[], value: number) => {
    setSettings(current => {
      const next = structuredClone(current) as any;
      let target = next;
      for (let i = 0; i < path.length - 1; i++) target = target[path[i]];
      target[path[path.length - 1]] = value;
      return next;
    });
  };

  async function save() {
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch(`/api/projects/${id}/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to save specifications.");
      setSettings(data); setMessage("Specifications saved. Costing will use these values.");
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save specifications."); }
    finally { setSaving(false); }
  }

  return <div className="space-y-8">
    <div><Link href={`/engineer/projects/${id}`} className="text-sm text-zinc-400 hover:text-white">← Back to Project</Link><p className="mt-5 text-sm text-zinc-500">Project estimation configuration</p><h1 className="mt-1 text-2xl font-semibold text-white">Material Specifications</h1><p className="mt-2 max-w-3xl text-sm text-zinc-400">Enter the project-specific material conversion assumptions used to turn engineering quantities into material quantities. Nothing is assumed automatically.</p></div>
    {error && <div className="rounded-lg border border-red-900 bg-red-950/30 p-4 text-sm text-red-300">{error}</div>}
    {message && <div className="rounded-lg border border-emerald-900 bg-emerald-950/20 p-4 text-sm text-emerald-300">{message}</div>}
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-lg font-semibold text-white">Concrete</h2><p className="mt-1 text-sm text-zinc-500">Set the mix proportions and dry-volume factor used for this project.</p><div className="mt-5 grid gap-5 md:grid-cols-2"><div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-medium text-white">PCC Mix</h3><div className="mt-4 grid grid-cols-3 gap-3"><Field label="Cement" value={settings.concrete.pcc.cement} onChange={v => update(["concrete","pcc","cement"],v)} /><Field label="Sand" value={settings.concrete.pcc.sand} onChange={v => update(["concrete","pcc","sand"],v)} /><Field label="Aggregate" value={settings.concrete.pcc.aggregate || 0} onChange={v => update(["concrete","pcc","aggregate"],v)} /></div></div><div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-medium text-white">RCC Mix</h3><div className="mt-4 grid grid-cols-3 gap-3"><Field label="Cement" value={settings.concrete.rcc.cement} onChange={v => update(["concrete","rcc","cement"],v)} /><Field label="Sand" value={settings.concrete.rcc.sand} onChange={v => update(["concrete","rcc","sand"],v)} /><Field label="Aggregate" value={settings.concrete.rcc.aggregate || 0} onChange={v => update(["concrete","rcc","aggregate"],v)} /></div></div></div><div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Dry volume factor" value={settings.concrete.dryVolumeFactor} onChange={v => update(["concrete","dryVolumeFactor"],v)} /><Field label="Cement bag volume (m³/bag)" value={settings.concrete.cementBagVolume} onChange={v => update(["concrete","cementBagVolume"],v)} /></div></section>
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-lg font-semibold text-white">Masonry</h2><div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-4"><Field label="Bricks per m³" value={settings.masonry.bricksPerM3} onChange={v => update(["masonry","bricksPerM3"],v)} step="1" /><Field label="Wet mortar m³ per m³ brickwork" value={settings.masonry.mortarWetVolumePerM3} onChange={v => update(["masonry","mortarWetVolumePerM3"],v)} /><Field label="Dry mortar factor" value={settings.masonry.mortarDryVolumeFactor} onChange={v => update(["masonry","mortarDryVolumeFactor"],v)} /><div className="grid grid-cols-2 gap-3"><Field label="Cement ratio" value={settings.masonry.mortarRatio.cement} onChange={v => update(["masonry","mortarRatio","cement"],v)} /><Field label="Sand ratio" value={settings.masonry.mortarRatio.sand} onChange={v => update(["masonry","mortarRatio","sand"],v)} /></div></div></section>
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-lg font-semibold text-white">Plaster</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-medium text-white">Internal</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Thickness (mm)" value={settings.plaster.internal.thicknessMm} onChange={v => update(["plaster","internal","thicknessMm"],v)} /><Field label="Dry volume factor" value={settings.plaster.internal.dryVolumeFactor} onChange={v => update(["plaster","internal","dryVolumeFactor"],v)} /><Field label="Cement ratio" value={settings.plaster.internal.ratio.cement} onChange={v => update(["plaster","internal","ratio","cement"],v)} /><Field label="Sand ratio" value={settings.plaster.internal.ratio.sand} onChange={v => update(["plaster","internal","ratio","sand"],v)} /></div></div><div className="rounded-lg border border-zinc-800 bg-zinc-950 p-5"><h3 className="font-medium text-white">External</h3><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Thickness (mm)" value={settings.plaster.external.thicknessMm} onChange={v => update(["plaster","external","thicknessMm"],v)} /><Field label="Dry volume factor" value={settings.plaster.external.dryVolumeFactor} onChange={v => update(["plaster","external","dryVolumeFactor"],v)} /><Field label="Cement ratio" value={settings.plaster.external.ratio.cement} onChange={v => update(["plaster","external","ratio","cement"],v)} /><Field label="Sand ratio" value={settings.plaster.external.ratio.sand} onChange={v => update(["plaster","external","ratio","sand"],v)} /></div></div></div></section>
    <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6"><h2 className="text-lg font-semibold text-white">Painting</h2><div className="mt-5 grid gap-5 md:grid-cols-2"><Field label="Internal paint litres per m²" value={settings.painting.internalLitresPerM2} onChange={v => update(["painting","internalLitresPerM2"],v)} /><Field label="External paint litres per m²" value={settings.painting.externalLitresPerM2} onChange={v => update(["painting","externalLitresPerM2"],v)} /></div></section>
    <div className="flex items-center justify-end gap-3"><Link href={`/engineer/projects/${id}`} className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800">Cancel</Link><button onClick={() => void save()} disabled={saving} className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 hover:bg-zinc-200 disabled:opacity-50">{saving ? "Saving..." : "Save Specifications"}</button></div>
  </div>;
}
