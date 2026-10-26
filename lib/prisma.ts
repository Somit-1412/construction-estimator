import dns from "node:dns";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function normalizeConnectionString(raw: string): string {
  const trimmed = raw.trim().replace(/^["'\\]+|["'\\]+$/g, "").trim();
  if (!trimmed) return trimmed;

  try {
    const url = new URL(trimmed);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode === "require" || sslmode === "prefer" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
    return trimmed;
  } catch {
    return trimmed.replace(/([?&]sslmode=)(require|prefer|verify-ca)(?=&|$)/g, "$1verify-full");
  }
}

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const rawUrl = process.env.DATABASE_URL || "";
  const connectionString = normalizeConnectionString(rawUrl);

  const adapter = new PrismaPg({ connectionString });
  const client = new PrismaClient({ adapter });

  globalForPrisma.prisma = client;
  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = Reflect.get(client, prop);
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});