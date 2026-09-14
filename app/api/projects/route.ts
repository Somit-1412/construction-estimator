import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return Response.json(projects);
}

export async function POST(request: Request) {
  const body = await request.json();

  const { projectName, clientName, clientEmail, location } = body;

  if (!projectName || !clientName || !clientEmail || !location) {
    return Response.json(
      { error: "All project fields are required." },
      { status: 400 }
    );
  }

  const project = await prisma.project.create({
    data: {
      projectName,
      clientName,
      clientEmail,
      location,
    },
  });

  return Response.json(project, { status: 201 });
}