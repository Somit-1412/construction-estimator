import { ProjectStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";

const allowed = new Set<ProjectStatus>(["SUBMITTED", "IN_PROGRESS", "COMPLETED"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as ProjectStatus | undefined;
  if (!status || !allowed.has(status)) {
    return Response.json({ error: "Invalid project status." }, { status: 400 });
  }
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
  const updated = await prisma.project.update({ where: { id }, data: { status } });
  return Response.json(updated);
}
