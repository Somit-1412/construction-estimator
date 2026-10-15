import { NextResponse } from "next/server";
import { getCurrentCustomer, customerUnauthorizedResponse } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";
import { generateEstimatePdf } from "@/lib/reports/estimatePdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return customerUnauthorizedResponse();
  }

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      estimate: true,
      payments: {
        where: { status: "COMPLETED" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!project || project.customerId !== customer.id) {
    return NextResponse.json(
      { error: "Project not found or unauthorized." },
      { status: 404 }
    );
  }

  if (!project.estimate || !project.estimate.finalizedAt) {
    return NextResponse.json(
      { error: "The estimate for this project has not been finalized yet." },
      { status: 400 }
    );
  }

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
        revision: project.estimate.revision,
        finalizedAt: project.estimate.finalizedAt,
        totalCost: Number(project.estimate.totalCost),
        snapshot: project.estimate.snapshot as Parameters<typeof generateEstimatePdf>[0]["estimate"]["snapshot"],
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
    const filename = `Estimex_Estimate_${cleanName}_R${project.estimate.revision}.pdf`;

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-cache, no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Failed to generate PDF:", err);
    return NextResponse.json(
      { error: "Failed to generate estimate PDF." },
      { status: 500 }
    );
  }
}
