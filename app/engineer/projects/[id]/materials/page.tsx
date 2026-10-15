import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildProjectEstimate } from "@/lib/project/quantityEngine";

type SnapshotItem = {
  materialName: string;
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
};

type EstimateSnapshot = {
  totalMaterialCost: number;
  totalLabourCost: number;
  totalCost: number;
  materials?: SnapshotItem[];
};

export default async function ProjectMaterialsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      projectName: true,
      estimateSettings: true,
      estimate: { select: { snapshot: true, finalizedAt: true } },
      calculations: { select: { type: true, inputs: true, results: true } },
    },
  });
  if (!project) notFound();

  if (project.estimate?.finalizedAt) {
    const snapshot = project.estimate.snapshot as unknown as EstimateSnapshot;
    return (
      <div className="space-y-7">
        <div>
          <Link href={`/engineer/projects/${id}`} className="back-link">
            ← Back to Project
          </Link>
          <div className="page-kicker">Issued revision</div>
          <h1 className="page-title">Project Materials</h1>
          <p className="page-subtitle">
            Materials captured in the finalized estimate. These values are frozen to the issued revision.
          </p>
        </div>
        <section className="engineering-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="section-title">Finalized material quantities</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              Issued
            </span>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantity</th>
                  <th>Rate</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {(snapshot.materials ?? []).map((item: SnapshotItem) => (
                  <tr key={item.materialName}>
                    <td>{item.materialName}</td>
                    <td>
                      {Number(item.quantity).toFixed(3)} {item.unit}
                    </td>
                    <td>₹{Number(item.rate).toFixed(2)}</td>
                    <td>₹{Number(item.cost).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    include: {
      rates: {
        where: { effectiveTo: null },
        orderBy: { effectiveFrom: "desc" },
        take: 1,
      },
    },
  });
  const estimate = buildProjectEstimate(
    project.calculations,
    materials.map((m) => ({
      materialName: m.name,
      unit: m.unit,
      rate: m.rates[0] ? Number(m.rates[0].rate) : null,
    })),
    project.estimateSettings,
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href={`/engineer/projects/${id}`} className="text-sm text-zinc-400 hover:text-white">
          ← Back to Project
        </Link>
        <p className="mt-5 text-sm text-zinc-500">{project.projectName}</p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Project Materials</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Quantities derived from the saved engineering calculations.
        </p>
      </div>

      {estimate.floorBreakdown && estimate.floorBreakdown.length > 0 && (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Storey Breakdown</h2>
            <Link
              href={`/engineer/projects/${id}/floors`}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              Manage floors →
            </Link>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            Work quantities calculated independently for each storey before project aggregation.
          </p>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {estimate.floorBreakdown.map((floor) => (
              <div
                key={floor.floorLevel}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-4"
              >
                <h3 className="font-medium text-white">
                  {floor.floorName} (Level {floor.floorLevel})
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-zinc-800 text-zinc-500">
                      <tr>
                        <th className="py-2">Item</th>
                        <th className="py-2 text-right">Quantity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/50">
                      {floor.workQuantities.map((work) => (
                        <tr key={work.key}>
                          <td className="py-2 text-zinc-300">{work.label}</td>
                          <td className="py-2 text-right font-mono text-zinc-200">
                            {work.quantity.toFixed(3)} {work.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Construction Quantities</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Aggregated project-wide quantities derived from all storeys without double counting.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-3">Work Item</th>
                <th className="px-3 py-3">Quantity</th>
                <th className="px-3 py-3">Unit</th>
              </tr>
            </thead>
            <tbody>
              {estimate.workQuantities.map((item) => (
                <tr key={item.key} className="border-b border-zinc-800/70">
                  <td className="px-3 py-3 text-zinc-200">{item.label}</td>
                  <td className="px-3 py-3 text-zinc-300">{item.quantity.toFixed(3)}</td>
                  <td className="px-3 py-3 text-zinc-500">{item.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {estimate.workQuantities.length === 0 && (
            <p className="py-6 text-sm text-zinc-500">
              No saved calculation quantities are available yet.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">Directly Derived Materials</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Only material quantities that are explicitly supported by the current calculation inputs are shown here. Material conversion uses the project specifications when they have been configured.
        </p>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-3 py-3">Material</th>
                <th className="px-3 py-3">Quantity</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-3 py-3">Current Rate</th>
                <th className="px-3 py-3">Cost</th>
              </tr>
            </thead>
            <tbody>
              {estimate.materials.map((item) => (
                <tr key={item.materialName} className="border-b border-zinc-800/70">
                  <td className="px-3 py-3 text-zinc-200">{item.materialName}</td>
                  <td className="px-3 py-3 text-zinc-300">{item.quantity.toFixed(3)}</td>
                  <td className="px-3 py-3 text-zinc-500">{item.unit}</td>
                  <td className="px-3 py-3 text-zinc-300">
                    {item.rate === null ? "Not set" : `₹${item.rate.toFixed(2)}`}
                  </td>
                  <td className="px-3 py-3 text-zinc-200">
                    {item.cost === null ? "Rate required" : `₹${item.cost.toFixed(2)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {estimate.materials.length === 0 && (
            <p className="py-6 text-sm text-zinc-500">
              No directly derived material quantities are available yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
