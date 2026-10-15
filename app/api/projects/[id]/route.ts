import { ProjectStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";
import { getCurrentCustomer, customerUnauthorizedResponse } from "@/lib/customer-auth";

const engineerAllowedStatuses = new Set<ProjectStatus>([
  "SUBMITTED",
  "PAYMENT_RECEIVED",
  "IN_PROGRESS",
  "COMPLETED",
]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Check customer access first: authenticated customer who owns this project can always view it (including PAYMENT_PENDING)
  const customer = await getCurrentCustomer();
  if (customer) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        drawings: {
          select: { id: true, originalName: true, sizeBytes: true, uploadedAt: true },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (project && project.customerId === customer.id) {
      return Response.json(project);
    }
  }

  // 2. Check engineer access: engineers can only view projects once payment has been verified
  const engineer = await getCurrentEngineer();
  if (engineer) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        drawings: {
          select: { id: true, originalName: true, sizeBytes: true, uploadedAt: true },
        },
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!project || project.status === "PAYMENT_PENDING") {
      return Response.json({ error: "Project not found or unpaid." }, { status: 404 });
    }

    return Response.json(project);
  }

  // 3. Unauthorized access
  if (!customer) {
    return customerUnauthorizedResponse();
  }

  return Response.json(
    { error: "Project not found or unauthorized." },
    { status: 404 }
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status as ProjectStatus | undefined;

  if (!status || !engineerAllowedStatuses.has(status)) {
    return Response.json({ error: "Invalid project status." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, status: true },
  });

  if (!project || project.status === "PAYMENT_PENDING") {
    return Response.json({ error: "Project not found or unpaid." }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { status },
  });

  return Response.json(updated);
}
