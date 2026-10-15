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

/** Absolute session lifetime: 7 days from login. Configurable via env. */
const rawSessionDays = process.env.CUSTOMER_SESSION_DAYS;
const parsedSessionDays = Number(rawSessionDays);
const SESSION_DAYS =
  rawSessionDays && !isNaN(parsedSessionDays) && parsedSessionDays > 0
    ? parsedSessionDays
    : 7;

/**
 * Inactivity timeout in minutes. After this period without a meaningful
 * user action the session is invalidated server-side and the cookie cleared.
 * Configurable via env. Default: 30 minutes.
 */
const rawInactivity = process.env.CUSTOMER_INACTIVITY_TIMEOUT_MINUTES;
const parsedInactivity = Number(rawInactivity);
const INACTIVITY_MINUTES =
  rawInactivity && !isNaN(parsedInactivity) && parsedInactivity > 0
    ? parsedInactivity
    : 30;

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
      lastActiveAt: new Date(),
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
  try {
    const store = await cookies();
    const token = store.get(CUSTOMER_SESSION_COOKIE)?.value;

    if (token) {
      await prisma.customerSession.deleteMany({
        where: {
          tokenHash: hashToken(token),
        },
      });
    }

    try {
      store.delete({ name: CUSTOMER_SESSION_COOKIE, path: "/" });
      store.set(CUSTOMER_SESSION_COOKIE, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    } catch {
      // In case cookie cannot be modified in the current context
    }
  } catch {
    // Ignore error
  }
}

/**
 * Record a meaningful user action against the current session, resetting the
 * inactivity clock. Only call this from explicit user-initiated write endpoints
 * (project submission, payment verification, etc.) — NOT on passive page loads or background requests.
 *
 * An optional token may be passed directly if already retrieved in the request flow.
 */
export async function touchCustomerSession(token?: string): Promise<void> {
  let sessionToken = token;
  if (!sessionToken) {
    try {
      const store = await cookies();
      sessionToken = store.get(CUSTOMER_SESSION_COOKIE)?.value;
    } catch {
      return;
    }
  }

  if (!sessionToken) return;

  try {
    await prisma.customerSession.updateMany({
      where: { tokenHash: hashToken(sessionToken) },
      data: { lastActiveAt: new Date() },
    });
  } catch {
    // Best-effort session touch
  }
}

export async function getCurrentCustomer() {
  let token: string | undefined;
  let store: Awaited<ReturnType<typeof cookies>> | undefined;

  try {
    store = await cookies();
    token = store.get(CUSTOMER_SESSION_COOKIE)?.value;
  } catch {
    return null;
  }

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

  const now = new Date();
  const inactivityDeadline = new Date(
    now.getTime() - INACTIVITY_MINUTES * 60 * 1000,
  );

  // Expire if: session not found, absolute lifetime exceeded, customer
  // deactivated, or inactivity timeout exceeded.
  if (
    !session ||
    session.expiresAt <= now ||
    !session.customer.active ||
    session.lastActiveAt <= inactivityDeadline
  ) {
    if (token) {
      try {
        await prisma.customerSession.deleteMany({
          where: {
            tokenHash: hashToken(token),
          },
        });
      } catch {
        // Ignore DB deletion errors during expired session cleanup
      }
    }

    if (store) {
      try {
        store.delete(CUSTOMER_SESSION_COOKIE);
      } catch {
        // In Server Components, response cookies cannot be modified during render.
        // The session is already invalidated in the database above.
      }
    }

    return null;
  }

  return session.customer;
}

export function customerUnauthorizedResponse() {
  return Response.json(
    { error: "Customer authentication is required." },
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

export { CUSTOMER_SESSION_COOKIE, INACTIVITY_MINUTES, SESSION_DAYS };