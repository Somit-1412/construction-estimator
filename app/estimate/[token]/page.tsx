"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type ProjectData = {
  projectName: string;
  clientName: string;
  location: string;
  clientEmail: string;
};

type WorkQuantity = {
  key: string;
  label: string;
  quantity: number;
  unit: string;
};

type MaterialItem = {
  materialName: string;
  quantity: number;
  unit: string;
  rate: number | null;
  cost: number | null;
  source?: string;
};

type LabourItem = {
  key: string;
  label: string;
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
};

type EstimateData = {
  workQuantities: WorkQuantity[];
  materials: MaterialItem[];
  labour: LabourItem[];
  totalMaterialCost: number;
  totalLabourCost: number;
  totalCost: number;
};

type Data = {
  project: ProjectData;
  estimate: EstimateData;
  revision: number;
  finalizedAt: string;
};

export default function ClientEstimatePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void params
      .then(({ token }) =>
        fetch(`/api/public/estimates/${token}`, {
          cache: "no-store",
        })
      )
      .then(async (response) => {
        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load estimate."
          );
        }

        setData(result);
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load estimate."
        );
      });
  }, [params]);

  if (error) {
    return (
      <main className="blueprint-grid flex min-h-screen items-center justify-center p-6">
        <div className="engineering-card max-w-md p-8">
          <div className="mb-6">
            <Image
              src="/Estimex_logo.jpeg"
              alt="Estimex"
              width={192}
              height={192}
              className="h-auto w-48"
            />
          </div>

          <h1 className="text-xl font-bold">
            Estimate unavailable
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="blueprint-grid flex min-h-screen items-center justify-center p-6 text-sm text-slate-500">
        Loading estimate…
      </main>
    );
  }

  const { project, estimate } = data;

  return (
    <main className="blueprint-grid min-h-screen px-5 py-8 md:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Customer Header */}
        <header className="engineering-card p-7 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <Image
                src="/Estimex_logo.jpeg"
                alt="Estimex — Civil Estimation Made Simple"
                width={224}
                height={224}
                className="h-auto w-56"
                priority
              />

              <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
                Final construction estimate
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {project.projectName}
              </h1>

              <p className="mt-2 text-slate-600">
                Prepared for {project.clientName} ·{" "}
                {project.location}
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="secondary-button print:hidden"
            >
              Print / Save PDF
            </button>
          </div>

          <div className="mt-8 grid gap-4 border-t border-slate-200 pt-6 text-sm md:grid-cols-3">
            <div>
              <span className="muted-label">
                Revision
              </span>

              <p className="font-semibold">
                R{data.revision}
              </p>
            </div>

            <div>
              <span className="muted-label">
                Finalized
              </span>

              <p className="font-semibold">
                {new Date(
                  data.finalizedAt
                ).toLocaleDateString()}
              </p>
            </div>

            <div>
              <span className="muted-label">
                Client email
              </span>

              <p className="font-semibold">
                {project.clientEmail}
              </p>
            </div>
          </div>
        </header>

        {/* Cost Summary */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">
          <div className="metric-card">
            <span>Material cost</span>

            <strong>
              ₹
              {estimate.totalMaterialCost.toFixed(2)}
            </strong>
          </div>

          <div className="metric-card">
            <span>Labour cost</span>

            <strong>
              ₹
              {estimate.totalLabourCost.toFixed(2)}
            </strong>
          </div>

          <div className="metric-card accent">
            <span>Total estimate</span>

            <strong>
              ₹
              {estimate.totalCost.toFixed(2)}
            </strong>
          </div>
        </section>

        {/* Materials */}
        <section className="engineering-card mt-6 p-7">
          <h2 className="section-title">
            Material summary
          </h2>

          <table className="data-table mt-4">
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
                  <td>{item.materialName}</td>

                  <td>
                    {item.quantity.toFixed(3)}{" "}
                    {item.unit}
                  </td>

                  <td>
                    ₹
                    {Number(
                      item.rate ?? 0
                    ).toFixed(2)}
                  </td>

                  <td>
                    ₹
                    {Number(
                      item.cost ?? 0
                    ).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Labour */}
        <section className="engineering-card mt-6 p-7">
          <h2 className="section-title">
            Labour summary
          </h2>

          <table className="data-table mt-4">
            <thead>
              <tr>
                <th>Work</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Cost</th>
              </tr>
            </thead>

            <tbody>
              {estimate.labour
                .filter((item) => item.rate > 0)
                .map((item) => (
                  <tr key={item.key}>
                    <td>{item.label}</td>

                    <td>
                      {item.quantity.toFixed(3)}{" "}
                      {item.unit}
                    </td>

                    <td>
                      ₹
                      {Number(
                        item.rate
                      ).toFixed(2)}
                    </td>

                    <td>
                      ₹
                      {Number(
                        item.cost
                      ).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Footer */}
        <footer className="mx-auto mt-8 max-w-3xl text-center">
          <Image
            src="/Estimex_logo.jpeg"
            alt="Estimex"
            width={128}
            height={128}
            className="mx-auto mb-4 h-auto w-32"
          />

          <p className="text-xs leading-5 text-slate-500">
            This client view reflects the estimate
            finalized by the engineering workspace.
            Changes to current master material rates
            do not alter this issued revision.
          </p>
        </footer>
      </div>
    </main>
  );
}