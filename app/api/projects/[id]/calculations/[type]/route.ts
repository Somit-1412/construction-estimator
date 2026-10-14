import { CalculationType } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";
import { calculateCalculationResult } from "@/lib/project/quantityEngine";

type RouteProps = {
  params: Promise<{
    id: string;
    type: string;
  }>;
};

function isCalculationType(
  type: string,
): type is CalculationType {
  return Object.values(CalculationType).includes(
    type as CalculationType,
  );
}

export async function GET(
  _request: Request,
  { params }: RouteProps,
) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id, type } = await params;

  if (!isCalculationType(type)) {
    return Response.json(
      { error: "Invalid calculation type." },
      { status: 400 },
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return Response.json(
      { error: "Project not found." },
      { status: 404 },
    );
  }

  const calculation = await prisma.calculation.findUnique({
    where: {
      projectId_type: {
        projectId: id,
        type,
      },
    },
  });

  return Response.json(calculation);
}

export async function PUT(
  request: Request,
  { params }: RouteProps,
) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id, type } = await params;

  if (!isCalculationType(type)) {
    return Response.json(
      { error: "Invalid calculation type." },
      { status: 400 },
    );
  }

  const project = await prisma.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return Response.json(
      { error: "Project not found." },
      { status: 404 },
    );
  }

  const body = await request.json();

  if (body.inputs === undefined) {
    return Response.json(
      {
        error: "Calculation inputs are required.",
      },
      { status: 400 },
    );
  }

  const results = calculateCalculationResult(type, body.inputs);

  const calculation = await prisma.calculation.upsert({
    where: {
      projectId_type: {
        projectId: id,
        type,
      },
    },
    update: {
      inputs: body.inputs,
      results,
      calculatedAt: new Date(),
    },
    create: {
      projectId: id,
      type,
      inputs: body.inputs,
      results,
      calculatedAt: new Date(),
    },
  });

  return Response.json(calculation);
}