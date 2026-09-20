import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildProjectEstimate } from "@/lib/project/quantityEngine";

export default async function ProjectCostingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, projectName: true, estimateSettings: true, calculations: { select: { type: true, inputs: true, results: true } } },
  });
  if (!project) notFound();
  const materials = await prisma.material.findMany({ include: { rates: { where: { effectiveTo: null }, orderBy: { effectiveFrom: "desc" }, take: 1 } }, orderBy: { name: "asc" } });
  const estimate = buildProjectEstimate(project.calculations, materials.map((m) => ({ materialName: m.name, unit: m.unit, rate: m.rates[0] ? Number(m.rates[0].rate) : null })), project.estimateSettings);
  const missingRates = estimate.materials.filter((item) => item.rate === null);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/engineer/projects/${id}`} className="text-sm text-zinc-400 hover:text-white">← Back to Project</Link>
        <p className="mt-5 text-sm text-zinc-500">{project.projectName}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Costing</h1>
        <p className="mt-2 text-sm text-zinc-400">Material costing from the project's saved quantities and current material rates.</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"><p className="text-xs uppercase tracking-wide text-zinc-500">Material Cost</p><p className="mt-2 text-2xl font-semibold text-white">₹{estimate.totalMaterialCost.toFixed(2)}</p></div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"><p className="text-xs uppercase tracking-wide text-zinc-500">Priced Materials</p><p className="mt-2 text-2xl font-semibold text-white">{estimate.materials.filter((item) => item.rate !== null).length}</p></div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"><p className="text-xs uppercase tracking-wide text-zinc-500">Rates Missing</p><p className="mt-2 text-2xl font-semibold text-white">{missingRates.length}</p></div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-lg font-semibold text-white">Material Cost Breakdown</h2><p className="mt-1 text-sm text-zinc-500">Configured project specifications are applied to supported concrete, masonry, plaster and finishing quantities.</p></div><div className="flex gap-4"><Link href={`/engineer/projects/${id}/specifications`} className="text-sm text-zinc-300 hover:text-white">Specifications →</Link><Link href="/engineer/materials" className="text-sm text-zinc-300 hover:text-white">Manage rates →</Link></div></div>
        <div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-3 py-3">Material</th><th className="px-3 py-3">Quantity</th><th className="px-3 py-3">Rate</th><th className="px-3 py-3">Cost</th></tr></thead><tbody>{estimate.materials.map((item) => <tr key={item.materialName} className="border-b border-zinc-800/70"><td className="px-3 py-3 text-zinc-200">{item.materialName}</td><td className="px-3 py-3 text-zinc-300">{item.quantity.toFixed(3)} {item.unit}</td><td className="px-3 py-3 text-zinc-300">{item.rate === null ? "Not set" : `₹${item.rate.toFixed(2)}`}</td><td className="px-3 py-3 text-zinc-200">{item.cost === null ? "—" : `₹${item.cost.toFixed(2)}`}</td></tr>)}</tbody></table></div>
      </section>

      <section className="rounded-xl border border-amber-900/40 bg-amber-950/10 p-5"><p className="text-sm text-amber-300">Concrete, brickwork and plaster material conversion is not priced here because the current project data does not contain a material-mix specification for those work items. No arbitrary mix ratio is being introduced into the estimate.</p></section>
    </div>
  );
}
