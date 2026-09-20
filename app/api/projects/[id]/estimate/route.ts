import { prisma } from "@/lib/prisma";
import { buildProjectEstimate } from "@/lib/project/quantityEngine";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      projectName: true,
      clientName: true,
      clientEmail: true,
      location: true,
      status: true,
      estimateSettings: true,
      calculations: { select: { type: true, inputs: true, results: true, calculatedAt: true, updatedAt: true } },
    },
  });
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });

  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    include: { rates: { where: { effectiveTo: null }, orderBy: { effectiveFrom: "desc" }, take: 1 } },
  });

  const estimate = buildProjectEstimate(
    project.calculations,
    materials.map((material) => ({
      materialName: material.name,
      unit: material.unit,
      rate: material.rates[0] ? Number(material.rates[0].rate) : null,
    })),
    project.estimateSettings,
  );

  return Response.json({
    project: { id: project.id, projectName: project.projectName, clientName: project.clientName, clientEmail: project.clientEmail, location: project.location, status: project.status },
    calculations: project.calculations.map((calculation) => ({ type: calculation.type, calculatedAt: calculation.calculatedAt, updatedAt: calculation.updatedAt })),
    ...estimate,
    estimateSettings: project.estimateSettings,
  });
}
