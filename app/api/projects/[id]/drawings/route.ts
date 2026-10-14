import { createHash } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { prisma } from "@/lib/prisma";
import { getCurrentEngineer } from "@/lib/auth";
import { S3_BUCKET, s3 } from "@/lib/s3";

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, submissionTokenHash: true },
  });

  const submissionToken = request.headers.get("x-submission-token");
  const engineer = await getCurrentEngineer();
  const tokenHash = submissionToken ? createHash("sha256").update(submissionToken).digest("hex") : null;
  if (!project) {
    return Response.json(
      { error: "Project not found." },
      { status: 404 },
    );
  }

  if (!engineer && (!tokenHash || tokenHash !== project.submissionTokenHash)) return Response.json({ error: "Valid submission access is required." }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json(
      { error: "A drawing file is required." },
      { status: 400 },
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json(
      { error: "Only PDF, JPG, JPEG, and PNG files are allowed." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { error: "File size must not exceed 10 MB." },
      { status: 400 },
    );
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
  const storageKey = `projects/${project.id}/drawings/${crypto.randomUUID()}.${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: file.type,
    }),
  );

  const drawing = await prisma.drawing.create({
    data: {
      projectId: project.id,
      originalName: file.name,
      storageKey,
      mimeType: file.type,
      sizeBytes: file.size,
    },
  });

  return Response.json(drawing, { status: 201 });
}