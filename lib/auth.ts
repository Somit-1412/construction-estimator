import "server-only";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "ce_engineer_session";
const SESSION_DAYS = 7;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, expectedHex] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function ensureConfiguredEngineer(email: string, password: string) {
  const configuredEmail = process.env.ENGINEER_EMAIL?.trim().toLowerCase();
  const configuredPassword = process.env.ENGINEER_PASSWORD;
  if (!configuredEmail || !configuredPassword || email !== configuredEmail || password !== configuredPassword) return null;

  const existing = await prisma.engineer.findUnique({ where: { email: configuredEmail } });
  if (existing) return existing;

  return prisma.engineer.create({
    data: {
      email: configuredEmail,
      name: process.env.ENGINEER_NAME?.trim() || "Engineer",
      passwordHash: hashPassword(configuredPassword),
    },
  });
}

export async function authenticateEngineer(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const engineer = await prisma.engineer.findUnique({ where: { email: normalizedEmail } });
  const account = engineer ?? await ensureConfiguredEngineer(normalizedEmail, password);
  if (!account || !account.active || !verifyPassword(password, account.passwordHash)) return null;
  return account;
}

export async function createEngineerSession(engineerId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await prisma.engineerSession.create({ data: { engineerId, tokenHash: hashToken(token), expiresAt } });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyEngineerSession() {
  try {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (token) {
      await prisma.engineerSession.deleteMany({ where: { tokenHash: hashToken(token) } });
    }
    try {
      store.delete({ name: SESSION_COOKIE, path: "/" });
      store.set(SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    } catch {
      // In case cookies cannot be modified during render
    }
  } catch {
    // Ignore error
  }
}

export async function getCurrentEngineer() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.engineerSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { engineer: true },
  });
  if (!session || session.expiresAt <= new Date() || !session.engineer.active) {
    if (token) {
      try {
        await prisma.engineerSession.deleteMany({ where: { tokenHash: hashToken(token) } });
      } catch {
        // Ignore DB deletion errors
      }
    }
    try {
      store.delete({ name: SESSION_COOKIE, path: "/" });
    } catch {
      // In Server Components, response cookies cannot be modified during render
    }
    return null;
  }
  return session.engineer;
}

export function unauthorizedResponse() {
  return Response.json(
    { error: "Engineer authentication is required." },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}

export { SESSION_COOKIE };
