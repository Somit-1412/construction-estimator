import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const access = await prisma.clientAccess.findUnique({ where: { tokenHash: createHash("sha256").update(token).digest("hex") }, include: { project: { include: { estimate: true } } } });
  if (!access || access.revokedAt || (access.expiresAt && access.expiresAt <= new Date()) || !access.project.estimate?.finalizedAt) return Response.json({ error: "Estimate access is invalid or expired." }, { status: 404 });
  return Response.json({ project: access.project, estimate: access.project.estimate.snapshot, revision: access.project.estimate.revision, finalizedAt: access.project.estimate.finalizedAt });
}
