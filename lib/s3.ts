import "dotenv/config";
import { S3Client } from "@aws-sdk/client-s3";

function cleanEnv(val: string | undefined): string | undefined {
  if (!val) return undefined;
  return val.trim().replace(/^["'\\]+|["'\\]+$/g, "").trim() || undefined;
}

const accessKeyId = cleanEnv(process.env.AWS_ACCESS_KEY_ID);
const secretAccessKey = cleanEnv(process.env.AWS_SECRET_ACCESS_KEY);

// In ECS production, AWS credentials are automatically provided via the ECS Task IAM Role
// (via the container credential URI). Explicit credentials from env vars are used as fallback
// for local development if provided.
const credentials =
  accessKeyId && secretAccessKey
    ? {
        accessKeyId,
        secretAccessKey,
      }
    : undefined;

export const s3 = new S3Client({
  region: cleanEnv(process.env.AWS_REGION) || "ap-south-1",
  ...(credentials ? { credentials } : {}),
});

export const S3_BUCKET = cleanEnv(process.env.AWS_S3_BUCKET) || "construction-estimator-drawings-1412";