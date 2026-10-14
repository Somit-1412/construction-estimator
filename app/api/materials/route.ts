import { prisma } from "@/lib/prisma";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
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
