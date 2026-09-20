import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      rates: {
        where: {
          effectiveTo: null,
        },
        orderBy: {
          effectiveFrom: "desc",
        },
        take: 1,
      },
    },
  });

  return Response.json(materials);
}