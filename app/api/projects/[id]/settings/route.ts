import { prisma } from "@/lib/prisma";
import { normalizeEstimateSettings } from "@/lib/project/estimateSettings";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true, estimateSettings: true } });
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
  return Response.json(normalizeEstimateSettings(project.estimateSettings));
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
  const body = await request.json().catch(() => null);
  const settings = normalizeEstimateSettings(body);
  const updated = await prisma.project.update({ where: { id }, data: { estimateSettings: settings } });
  return Response.json(updated.estimateSettings);
}
