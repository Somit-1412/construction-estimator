import "server-only";
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const CUSTOMER_SESSION_COOKIE = "ce_customer_session";
const SESSION_DAYS = 7;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, expectedHex] = stored.split("$");

  if (scheme !== "scrypt" || !salt || !expectedHex) {
    return false;
  }

  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");

  return (
    actual.length === expected.length &&
    timingSafeEqual(actual, expected)
  );
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createCustomer(
  name: string,
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return null;
  }

  return prisma.customer.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: hashPassword(password),
    },
  });
}

export async function authenticateCustomer(
  email: string,
  password: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const customer = await prisma.customer.findUnique({
    where: { email: normalizedEmail },
  });

  if (
    !customer ||
    !customer.active ||
    !verifyPassword(password, customer.passwordHash)
  ) {
    return null;
  }

  return customer;
}

export async function createCustomerSession(customerId: string) {
  const token = randomBytes(32).toString("base64url");

  const expiresAt = new Date(
    Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.customerSession.create({
    data: {
      customerId,
      tokenHash: hashToken(token),
      expiresAt,
    },
  });

  const store = await cookies();

  store.set(CUSTOMER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCustomerSession() {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.customerSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });
  }

  store.delete(CUSTOMER_SESSION_COOKIE);
}

export async function getCurrentCustomer() {
  const store = await cookies();
  const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.customerSession.findUnique({
    where: {
      tokenHash: hashToken(token),
    },
    include: {
      customer: true,
    },
  });

  if (
    !session ||
    session.expiresAt <= new Date() ||
    !session.customer.active
  ) {
    await prisma.customerSession.deleteMany({
      where: {
        tokenHash: hashToken(token),
      },
    });

    store.delete(CUSTOMER_SESSION_COOKIE);

    return null;
  }

  return session.customer;
}

export function customerUnauthorizedResponse() {
  return Response.json(
    { error: "Customer authentication is required." },
    { status: 401 },
  );
}

export { CUSTOMER_SESSION_COOKIE };