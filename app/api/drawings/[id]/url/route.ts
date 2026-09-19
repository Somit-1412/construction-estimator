import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { prisma } from "@/lib/prisma";
import { S3_BUCKET, s3 } from "@/lib/s3";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const drawing = await prisma.drawing.findUnique({
    where: { id },
  });

  if (!drawing) {
    return Response.json(
      { error: "Drawing not found." },
      { status: 404 },
    );
  }

  const command = new GetObjectCommand({
    Bucket: S3_BUCKET,
    Key: drawing.storageKey,
  });

  const url = await getSignedUrl(s3, command, {
    expiresIn: 60 * 10,
  });

  return Response.json({ url });
}