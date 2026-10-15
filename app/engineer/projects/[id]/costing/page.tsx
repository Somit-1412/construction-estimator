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

export default async function ProjectCostingPage({
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
          <h1 className="page-title">Costing</h1>
          <p className="page-subtitle">
            This project has been finalized. The costs below are frozen to the issued estimate revision.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="metric-card">
            <span>Material cost</span>
            <strong>₹{Number(snapshot.totalMaterialCost || 0).toFixed(2)}</strong>
          </div>
          <div className="metric-card">
            <span>Labour cost</span>
            <strong>₹{Number(snapshot.totalLabourCost || 0).toFixed(2)}</strong>
          </div>
          <div className="metric-card accent">
            <span>Issued total</span>
            <strong>₹{Number(snapshot.totalCost || 0).toFixed(2)}</strong>
          </div>
        </div>

        <section className="engineering-card p-6">
          <h2 className="section-title">Issued material cost</h2>
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
    include: {
      rates: {
        where: { effectiveTo: null },
        orderBy: { effectiveFrom: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
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

  const missingRates = estimate.materials.filter((item) => item.rate === null);

  return (
    <div className="space-y-7">
      <div>
        <Link href={`/engineer/projects/${id}`} className="back-link">
          ← Back to Project
        </Link>
        <div className="page-kicker">Project economics</div>
        <h1 className="page-title">Costing</h1>
        <p className="page-subtitle">
          A consolidated view of material and labour costs generated from this project&apos;s saved calculations and specifications.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="metric-card">
          <span>Material cost</span>
          <strong>₹{estimate.totalMaterialCost.toFixed(2)}</strong>
        </div>
        <div className="metric-card">
          <span>Labour cost</span>
          <strong>₹{estimate.totalLabourCost.toFixed(2)}</strong>
        </div>
        <div className="metric-card accent">
          <span>Current estimate</span>
          <strong>
            ₹{(estimate.totalMaterialCost + estimate.totalLabourCost).toFixed(2)}
          </strong>
        </div>
      </div>

      {missingRates.length > 0 && (
        <div className="alert-error">
          Missing material rates: {missingRates.map((item) => item.materialName).join(", ")}. Add them in Material Rates before finalization.
        </div>
      )}

      {estimate.floorBreakdown && estimate.floorBreakdown.length > 0 && (
        <section className="engineering-card p-6">
          <div className="section-heading">
            <div>
              <h2 className="section-title">Storey Breakdown</h2>
              <p className="text-sm text-slate-500">
                Work quantities broken down across building levels before project-wide aggregation.
              </p>
            </div>
            <Link href={`/engineer/projects/${id}/floors`} className="back-link text-sm">
              Manage floors →
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {estimate.floorBreakdown.map((floor) => (
              <div key={floor.floorLevel} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-900">
                  {floor.floorName} (Level {floor.floorLevel})
                </h3>
                <div className="mt-3 overflow-x-auto">
                  <table className="data-table bg-white">
                    <thead>
                      <tr>
                        <th>Work Item</th>
                        <th>Floor Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {floor.workQuantities.map((work) => (
                        <tr key={work.key}>
                          <td className="font-medium text-slate-800">{work.label}</td>
                          <td>
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

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2>Material cost breakdown</h2>
            <p>Current active master rates are used until the estimate is finalized.</p>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href={`/engineer/projects/${id}/specifications`} className="back-link">
              Specifications →
            </Link>
            <Link href="/engineer/materials" className="back-link">
              Manage rates →
            </Link>
          </div>
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
              {estimate.materials.map((item) => (
                <tr key={item.materialName}>
                  <td className="font-semibold">{item.materialName}</td>
                  <td>
                    {item.quantity.toFixed(3)} {item.unit}
                  </td>
                  <td>{item.rate === null ? "Not set" : `₹${item.rate.toFixed(2)}`}</td>
                  <td>{item.cost === null ? "—" : `₹${item.cost.toFixed(2)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="engineering-card p-6">
        <div className="section-heading">
          <div>
            <h2>Labour schedule</h2>
            <p>Project-specific labour rates from Specifications.</p>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Work</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Cost</th>
              </tr>
            </thead>
            <tbody>
              {estimate.labour.map((item) => (
                <tr key={item.key}>
                  <td className="font-semibold">{item.label}</td>
                  <td>
                    {item.quantity.toFixed(3)} {item.unit}
                  </td>
                  <td>{item.rate > 0 ? `₹${item.rate.toFixed(2)}` : "Not set"}</td>
                  <td>{item.rate > 0 ? `₹${item.cost.toFixed(2)}` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
