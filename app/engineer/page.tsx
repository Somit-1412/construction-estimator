import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function EngineerDashboard() {
  const [projects, active, pending, inProgress, completed] = await Promise.all([
    prisma.project.findMany({
      where: { status: { not: "PAYMENT_PENDING" } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        projectName: true,
        clientName: true,
        status: true,
        updatedAt: true,
      },
    }),
    prisma.project.count({
      where: {
        status: { in: ["PAYMENT_RECEIVED", "IN_PROGRESS", "SUBMITTED"] },
      },
    }),
    prisma.project.count({
      where: {
        status: { in: ["PAYMENT_RECEIVED", "SUBMITTED"] },
      },
    }),
    prisma.project.count({
      where: { status: "IN_PROGRESS" },
    }),
    prisma.project.count({
      where: { status: "COMPLETED" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-zinc-400">Project workflow overview.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Active Projects", active],
          ["Pending Review", pending],
          ["In Progress", inProgress],
          ["Completed", completed],
        ].map(([label, count]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-white">{count}</p>
          </div>
        ))}
      </div>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div>
            <h2 className="font-semibold text-white">Recent Projects</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Open a project to work through calculations, materials, costing and
              reporting.
            </p>
          </div>
          <Link
            href="/engineer/projects"
            className="text-sm text-zinc-300 hover:text-white"
          >
            All Projects →
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="px-6 py-10 text-sm text-zinc-500">No projects yet.</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/engineer/projects/${project.id}`}
                className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-zinc-800/50"
              >
                <div>
                  <p className="font-medium text-white">{project.projectName}</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    {project.clientName}
                  </p>
                </div>
                <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {project.status.replaceAll("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
