import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ReportsIndexPage() {
  const projects = await prisma.project.findMany({ orderBy: { updatedAt: "desc" }, select: { id: true, projectName: true, clientName: true, status: true, updatedAt: true } });
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-semibold text-white">Reports</h1><p className="mt-1 text-sm text-zinc-400">Review project estimates and print the current report.</p></div>
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
        {projects.length === 0 ? <p className="px-6 py-10 text-sm text-zinc-500">No projects yet.</p> : projects.map((project) => <Link key={project.id} href={`/engineer/projects/${project.id}/report`} className="flex items-center justify-between gap-4 px-6 py-5 hover:bg-zinc-800/50"><div><p className="font-medium text-white">{project.projectName}</p><p className="mt-1 text-sm text-zinc-500">{project.clientName}</p></div><span className="text-sm text-zinc-400">Open →</span></Link>)}
      </section>
    </div>
  );
}
