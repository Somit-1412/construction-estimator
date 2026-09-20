import { prisma } from "@/lib/prisma";

const RATE_PATTERN = /^\d+(?:\.\d{1,2})?$/;

type RouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  const { id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!material) {
    return Response.json({ error: "Material not found." }, { status: 404 });
  }

  const rates = await prisma.materialRate.findMany({
    where: { materialId: id },
    orderBy: { effectiveFrom: "desc" },
  });

  return Response.json(rates);
}

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;

  const material = await prisma.material.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!material) {
    return Response.json({ error: "Material not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const rateValue = typeof body?.rate === "string" ? body.rate.trim() : body?.rate;

  if (
    (typeof rateValue !== "string" && typeof rateValue !== "number") ||
    !RATE_PATTERN.test(String(rateValue)) ||
    Number(rateValue) <= 0
  ) {
    return Response.json(
      { error: "Rate must be a positive number with up to two decimal places." },
      { status: 400 },
    );
  }

  const rate = Number(rateValue);

  const createdRate = await prisma.$transaction(async (tx) => {
    const now = new Date();

    await tx.materialRate.updateMany({
      where: {
        materialId: id,
        effectiveTo: null,
      },
      data: {
        effectiveTo: now,
      },
    });

    return tx.materialRate.create({
      data: {
        materialId: id,
        rate,
        effectiveFrom: now,
      },
    });
  });

  return Response.json(createdRate, { status: 201 });
}
