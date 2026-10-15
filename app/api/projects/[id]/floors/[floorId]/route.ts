import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
    floorId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteProps) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id, floorId } = await params;

  const floor = await prisma.floor.findUnique({
    where: { id: floorId },
  });

  if (!floor || floor.projectId !== id) {
    return NextResponse.json({ error: "Floor not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const data: { name?: string; heightMeters?: number; level?: number } = {};

  if (body?.name && typeof body.name === "string") {
    data.name = body.name.trim();
  }

  if (body?.heightMeters !== undefined && !Number.isNaN(Number(body.heightMeters))) {
    data.heightMeters = Number(body.heightMeters);
  }

  if (typeof body?.level === "number" && body.level !== floor.level) {
    const existing = await prisma.floor.findUnique({
      where: {
        projectId_level: {
          projectId: id,
          level: body.level,
        },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Level ${body.level} is already taken by another floor.` },
        { status: 400 }
      );
    }
    data.level = body.level;
  }

  const updated = await prisma.floor.update({
    where: { id: floorId },
    data,
  });

  return NextResponse.json({
    ...updated,
    heightMeters: Number(updated.heightMeters),
  });
}

export async function DELETE(_request: Request, { params }: RouteProps) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id, floorId } = await params;

  const floor = await prisma.floor.findUnique({
    where: { id: floorId },
  });

  if (!floor || floor.projectId !== id) {
    return NextResponse.json({ error: "Floor not found." }, { status: 404 });
  }

  await prisma.floor.delete({
    where: { id: floorId },
  });

  return NextResponse.json({ success: true, deletedId: floorId });
}
