import { prisma } from "@/lib/prisma";

export async function GET() {
  const materials = await prisma.material.findMany({
    orderBy: {
      name: "asc",
    },
    include: {
      rates: {
        orderBy: {
          effectiveFrom: "desc",
        },
      },
    },
  });

  return Response.json(materials);
}
