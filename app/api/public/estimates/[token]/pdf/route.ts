import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { generateEstimatePdf } from "@/lib/reports/estimatePdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const access = await prisma.clientAccess.findUnique({
    where: {
      tokenHash: createHash("sha256").update(token).digest("hex"),
    },
    include: {
      project: {
        include: {
          estimate: true,
          payments: {
            where: { status: "COMPLETED" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });

  if (
    !access ||
    access.revokedAt ||
    (access.expiresAt && access.expiresAt <= new Date()) ||
    !access.project.estimate?.finalizedAt
  ) {
    return Response.json(
      { error: "Estimate access token is invalid or expired." },
      { status: 404 }
    );
  }

  const project = access.project;
  const estimate = project.estimate!;

  try {
    const pdfBuffer = await generateEstimatePdf({
      project: {
        id: project.id,
        projectName: project.projectName,
        clientName: project.clientName,
        clientEmail: project.clientEmail,
        location: project.location,
        createdAt: project.createdAt,
      },
      estimate: {
        revision: estimate.revision,
        finalizedAt: estimate.finalizedAt,
        totalCost: Number(estimate.totalCost),
        snapshot: estimate.snapshot as Parameters<typeof generateEstimatePdf>[0]["estimate"]["snapshot"],
      },
      payment: project.payments[0]
        ? {
            amount: Number(project.payments[0].amount),
            currency: project.payments[0].currency,
            status: project.payments[0].status,
            orderId: project.payments[0].orderId,
            transactionId: project.payments[0].transactionId,
            createdAt: project.payments[0].createdAt,
          }
        : null,
    });

    const cleanName = project.projectName.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `Estimex_Estimate_${cleanName}_R${estimate.revision}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    console.error("Failed to generate public PDF:", err);
    return Response.json(
      { error: "Failed to generate estimate PDF." },
      { status: 500 }
    );
  }
}
