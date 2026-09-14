import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

type ProjectPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectPage({
  params,
}: ProjectPageProps) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/engineer/projects"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          ← Back to Projects
        </Link>

        <div className="mt-5">
          <h1 className="text-2xl font-semibold text-white">
            {project.projectName}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Project workspace
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Project Details
            </h2>

            <div className="mt-5 space-y-3 text-sm">
              <div>
                <span className="text-zinc-500">Client</span>
                <p className="mt-1 text-zinc-200">
                  {project.clientName}
                </p>
              </div>

              <div>
                <span className="text-zinc-500">Email</span>
                <p className="mt-1 text-zinc-200">
                  {project.clientEmail}
                </p>
              </div>

              <div>
                <span className="text-zinc-500">Location</span>
                <p className="mt-1 text-zinc-200">
                  {project.location}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
            {project.status.replaceAll("_", " ")}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-white">
          Estimation Workspace
        </h2>

        <p className="mt-1 text-sm text-zinc-400">
          Calculation, drawings, materials, costing and reporting for this
          project will be managed here.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-medium text-white">Drawings</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Project drawings will be stored and reviewed here.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-medium text-white">Calculations</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Engineering quantities will be calculated here.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-medium text-white">Materials</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Material quantities will be derived from the calculations.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-medium text-white">Costing</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Rates and total construction cost will be calculated here.
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <h3 className="font-medium text-white">Report</h3>
            <p className="mt-1 text-sm text-zinc-500">
              The finalized estimate will be generated here.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}