import { createHash, randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect("/login");
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      estimate: {
        select: {
          id: true,
          finalizedAt: true,
        },
      },
    },
  });

  if (!project || project.customerId !== customer.id) {
    return Response.json(
      { error: "Project not found or you do not have permission to access it." },
      { status: 404 }
    );
  }

  if (!project.estimate?.finalizedAt) {
    return Response.json(
      { error: "The estimate for this project has not been finalized yet." },
      { status: 400 }
    );
  }

  // Issue a fresh, secure client access token for the authenticated customer session
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7-day valid token

  await prisma.clientAccess.create({
    data: {
      projectId: project.id,
      tokenHash,
      expiresAt,
    },
  });

  redirect(`/estimate/${token}`);
}
