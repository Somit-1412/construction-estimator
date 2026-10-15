import { randomBytes, createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import {
  getCurrentCustomer,
  customerUnauthorizedResponse,
  touchCustomerSession,
} from "@/lib/customer-auth";
import {
  getCurrentEngineer,
  unauthorizedResponse,
} from "@/lib/auth";

export async function GET() {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();

  // Engineers only see actionable projects where payment has been received
  const projects = await prisma.project.findMany({
    where: {
      status: {
        not: "PAYMENT_PENDING",
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();

  if (!customer) return customerUnauthorizedResponse();

  const body = await request.json().catch(() => null);

  const projectName =
    typeof body?.projectName === "string"
      ? body.projectName.trim()
      : "";

  const location =
    typeof body?.location === "string"
      ? body.location.trim()
      : "";

  if (!projectName || !location) {
    return Response.json(
      { error: "Project name and location are required." },
      { status: 400 },
    );
  }

  const submissionToken = randomBytes(24).toString("base64url");

  // Project is created with PAYMENT_PENDING. Payment must precede engineer intake.
  const project = await prisma.project.create({
    data: {
      projectName,
      clientName: customer.name,
      clientEmail: customer.email,
      location,
      customerId: customer.id,
      status: "PAYMENT_PENDING",
      submissionTokenHash: createHash("sha256")
        .update(submissionToken)
        .digest("hex"),
    },
  });

  // Record this explicit user action to reset the inactivity clock.
  await touchCustomerSession();

  return Response.json(
    {
      ...project,
      submissionToken,
    },
    { status: 201 },
  );
}