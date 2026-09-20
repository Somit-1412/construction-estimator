import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildProjectEstimate } from "@/lib/project/quantityEngine";

export default async function ProjectMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, projectName: true, estimateSettings: true, calculations: { select: { type: true, inputs: true, results: true } } },
  });
  if (!project) notFound();

  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    include: { rates: { where: { effectiveTo: null }, orderBy: { effectiveFrom: "desc" }, take: 1 } },
  });
  const estimate = buildProjectEstimate(project.calculations, materials.map((m) => ({ materialName: m.name, unit: m.unit, rate: m.rates[0] ? Number(m.rates[0].rate) : null })), project.estimateSettings);

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/engineer/projects/${id}`} className="text-sm text-zinc-400 hover:text-white">← Back to Project</Link>
        <p className="mt-5 text-sm text-zinc-500">{project.projectName}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Project Materials</h1>
        <p className="mt-2 text-sm text-zinc-400">Quantities derived from the saved engineering calculations.</p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Construction Quantities</h2>
        <p className="mt-1 text-sm text-zinc-500">Work quantities are shown separately from material conversion assumptions.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-3 py-3">Work Item</th><th className="px-3 py-3">Quantity</th><th className="px-3 py-3">Unit</th></tr></thead>
            <tbody>{estimate.workQuantities.map((item) => <tr key={item.key} className="border-b border-zinc-800/70"><td className="px-3 py-3 text-zinc-200">{item.label}</td><td className="px-3 py-3 text-zinc-300">{item.quantity.toFixed(3)}</td><td className="px-3 py-3 text-zinc-500">{item.unit}</td></tr>)}</tbody>
          </table>
          {estimate.workQuantities.length === 0 && <p className="py-6 text-sm text-zinc-500">No saved calculation quantities are available yet.</p>}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Directly Derived Materials</h2>
        <p className="mt-1 text-sm text-zinc-500">Only material quantities that are explicitly supported by the current calculation inputs are shown here. Material conversion uses the project specifications when they have been configured.</p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500"><tr><th className="px-3 py-3">Material</th><th className="px-3 py-3">Quantity</th><th className="px-3 py-3">Unit</th><th className="px-3 py-3">Current Rate</th><th className="px-3 py-3">Cost</th></tr></thead>
            <tbody>{estimate.materials.map((item) => <tr key={item.materialName} className="border-b border-zinc-800/70"><td className="px-3 py-3 text-zinc-200">{item.materialName}</td><td className="px-3 py-3 text-zinc-300">{item.quantity.toFixed(3)}</td><td className="px-3 py-3 text-zinc-500">{item.unit}</td><td className="px-3 py-3 text-zinc-300">{item.rate === null ? "Not set" : `₹${item.rate.toFixed(2)}`}</td><td className="px-3 py-3 text-zinc-200">{item.cost === null ? "Rate required" : `₹${item.cost.toFixed(2)}`}</td></tr>)}</tbody>
          </table>
          {estimate.materials.length === 0 && <p className="py-6 text-sm text-zinc-500">No directly derived material quantities are available yet.</p>}
        </div>
      </section>
    </div>
  );
}
