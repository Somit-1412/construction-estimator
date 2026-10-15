import { prisma } from "@/lib/prisma";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";
import { buildProjectEstimate } from "@/lib/project/quantityEngine";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id }, include: { calculations: true } });
  if (!project) return Response.json({ error: "Project not found." }, { status: 404 });
  if (project.calculations.length === 0) return Response.json({ error: "At least one calculation must be saved before finalization." }, { status: 400 });

  const materials = await prisma.material.findMany({ include: { rates: { where: { effectiveTo: null }, orderBy: { effectiveFrom: "desc" }, take: 1 } } });
  const estimate = buildProjectEstimate(project.calculations, materials.map(m => ({ materialName: m.name, unit: m.unit, rate: m.rates[0] ? Number(m.rates[0].rate) : null })), project.estimateSettings);
  const missingRates = estimate.materials.filter(item => item.rate === null);
  if (missingRates.length) return Response.json({ error: `Missing current rates for: ${missingRates.map(item => item.materialName).join(", ")}.` }, { status: 400 });
  if (estimate.totalLabourCost > 0 && estimate.labour.some(item => item.rate <= 0)) return Response.json({ error: "Complete all labour rates used by this estimate before finalization." }, { status: 400 });

  const totalCost = estimate.totalMaterialCost + estimate.totalLabourCost;
  const revision = (await prisma.estimate.findUnique({ where: { projectId: id }, select: { revision: true } }))?.revision ?? 0;
  const finalizedAt = new Date();
  const snapshot = { project: { id: project.id, projectName: project.projectName, clientName: project.clientName, clientEmail: project.clientEmail, location: project.location }, workQuantities: estimate.workQuantities, materials: estimate.materials, labour: estimate.labour, totalMaterialCost: estimate.totalMaterialCost, totalLabourCost: estimate.totalLabourCost, totalCost, specifications: project.estimateSettings, floorBreakdown: estimate.floorBreakdown };

  await prisma.$transaction(async tx => {
    await tx.estimate.upsert({ where: { projectId: id }, update: { revision: revision + 1, snapshot, materialCost: estimate.totalMaterialCost, labourCost: estimate.totalLabourCost, totalCost, finalizedAt }, create: { projectId: id, revision: 1, snapshot, materialCost: estimate.totalMaterialCost, labourCost: estimate.totalLabourCost, totalCost, finalizedAt } });
    await tx.clientAccess.updateMany({ where: { projectId: id, revokedAt: null }, data: { revokedAt: finalizedAt } });
    await tx.project.update({ where: { id }, data: { status: "COMPLETED" } });
  });

  return Response.json({ ok: true, revision: revision + 1, totalCost });
}
