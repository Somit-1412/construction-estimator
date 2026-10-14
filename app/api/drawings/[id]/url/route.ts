import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { S3_BUCKET, s3 } from "@/lib/s3";
import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getCurrentEngineer())) return unauthorizedResponse();
  const { id } = await params;
  const drawing = await prisma.drawing.findUnique({ where: { id } });
  if (!drawing) return Response.json({ error: "Drawing not found." }, { status: 404 });
  const url = await getSignedUrl(s3, new GetObjectCommand({ Bucket: S3_BUCKET, Key: drawing.storageKey }), { expiresIn: 600 });
  return Response.json({ url });
}
