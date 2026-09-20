import Link from "next/link";
import { notFound } from "next/navigation";
import DrawingsSection from "./DrawingsSection";
import StatusControls from "./StatusControls";

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
    where: { id },
    include: {
      drawings: {
        orderBy: {
          uploadedAt: "desc",
        },
      },
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

          <StatusControls projectId={project.id} initialStatus={project.status} />
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
          <DrawingsSection
            projectId={project.id}
            initialDrawings={project.drawings}
          />

          <Link
            href={`/engineer/projects/${project.id}/calculations`}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            <h3 className="font-medium text-white">
              Calculations
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              Open and manage engineering calculations for this project.
            </p>
          </Link>

          <Link
            href={`/engineer/projects/${project.id}/specifications`}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            <h3 className="font-medium text-white">Specifications</h3>
            <p className="mt-1 text-sm text-zinc-500">Configure project-specific material conversion assumptions.</p>
          </Link>

          <Link
            href={`/engineer/projects/${project.id}/materials`}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            <h3 className="font-medium text-white">Materials</h3>
            <p className="mt-1 text-sm text-zinc-500">Review quantities derived from calculations.</p>
          </Link>

          <Link
            href={`/engineer/projects/${project.id}/costing`}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            <h3 className="font-medium text-white">Costing</h3>
            <p className="mt-1 text-sm text-zinc-500">Review material costs and estimate totals.</p>
          </Link>

          <Link
            href={`/engineer/projects/${project.id}/report`}
            className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 transition hover:border-zinc-600 hover:bg-zinc-900"
          >
            <h3 className="font-medium text-white">Report</h3>
            <p className="mt-1 text-sm text-zinc-500">Review and print the project estimate.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}