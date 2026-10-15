import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, { params }: RouteProps) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const floors = await prisma.floor.findMany({
    where: { projectId: id },
    orderBy: { level: "asc" },
  });

  return NextResponse.json(
    floors.map((f) => ({
      ...f,
      heightMeters: Number(f.heightMeters),
    }))
  );
}

export async function POST(request: Request, { params }: RouteProps) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const name = body?.name?.trim();
  const heightMeters = Number(body?.heightMeters) || 3.0;

  if (!name) {
    return NextResponse.json({ error: "Floor name is required." }, { status: 400 });
  }

  // Determine level if not explicitly provided
  let level = typeof body?.level === "number" ? body.level : null;
  if (level === null) {
    const highest = await prisma.floor.findFirst({
      where: { projectId: id },
      orderBy: { level: "desc" },
      select: { level: true },
    });
    level = highest ? highest.level + 1 : 0;
  }

  // Check unique level
  const existing = await prisma.floor.findUnique({
    where: {
      projectId_level: {
        projectId: id,
        level,
      },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: `A floor with level ${level} already exists in this project.` },
      { status: 400 }
    );
  }

  const floor = await prisma.floor.create({
    data: {
      projectId: id,
      name,
      level,
      heightMeters,
    },
  });

  return NextResponse.json(
    {
      ...floor,
      heightMeters: Number(floor.heightMeters),
    },
    { status: 201 }
  );
}
