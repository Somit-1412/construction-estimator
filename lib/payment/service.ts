import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Payment, Project } from "@/lib/generated/prisma/client";
import { getPaymentConfig, getPaymentWebhookSecret } from "./config";

export class PaymentError extends Error {
  constructor(message: string, public status: number = 400) {
    super(message);
    this.name = "PaymentError";
  }
}

/**
 * Creates a server-side payment order for the fixed estimation service fee (₹699).
 * Strictly verifies project ownership, prevents duplicate charging, and generates
 * both Razorpay and dynamic UPI payment details.
 */
export async function createPaymentOrder(projectId: string, customerId: string) {
  const config = getPaymentConfig();

  if (process.env.NODE_ENV === "production" && !config.isConfigured) {
    throw new PaymentError("Payment gateway is not configured on this server.", 503);
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      customerId: true,
      status: true,
      projectName: true,
      clientName: true,
      clientEmail: true,
    },
  });

  if (!project || project.customerId !== customerId) {
    throw new PaymentError("Project not found or unauthorized.", 404);
  }

  // Prevent double charging if payment is already recorded
  if (
    project.status === "PAYMENT_RECEIVED" ||
    project.status === "IN_PROGRESS" ||
    project.status === "COMPLETED"
  ) {
    throw new PaymentError(
      `Payment has already been received for project '${project.projectName}'.`,
      400
    );
  }

  // Only allow payment for projects awaiting payment (PAYMENT_PENDING or legacy SUBMITTED)
  if (project.status !== "PAYMENT_PENDING" && project.status !== "SUBMITTED") {
    throw new PaymentError(
      `Project is in '${project.status}' status and cannot accept payment.`,
      400
    );
  }

  // Check idempotency: check if an active pending payment order already exists within last 30 minutes
  const existingPending = await prisma.payment.findFirst({
    where: {
      projectId,
      status: "PENDING",
      createdAt: {
        gt: new Date(Date.now() - 30 * 60 * 1000),
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existingPending && existingPending.orderId) {
    const upiDeepLink = `upi://pay?pa=${encodeURIComponent(config.upiVpa)}&pn=${encodeURIComponent(
      "Estimex"
    )}&am=${Number(existingPending.amount).toFixed(2)}&cu=INR&tr=${encodeURIComponent(
      existingPending.orderId
    )}&tn=${encodeURIComponent(`Estimex Estimate - ${project.projectName}`)}`;

    return {
      orderId: existingPending.orderId,
      amountInr: Number(existingPending.amount),
      amountPaise: Math.round(Number(existingPending.amount) * 100),
      currency: existingPending.currency,
      keyId: config.keyId,
      provider: config.provider,
      isConfigured: config.isConfigured,
      isTestMode: config.isTestMode,
      projectName: project.projectName,
      clientName: project.clientName,
      clientEmail: project.clientEmail,
      upiVpa: config.upiVpa,
      upiDeepLink,
    };
  }

  let orderId = `order_${randomBytes(16).toString("hex")}`;
  const secret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (config.keyId && secret && !config.keyId.includes("simulated")) {
    try {
      const basicAuth = Buffer.from(`${config.keyId}:${secret}`).toString("base64");
      const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(config.feeInr * 100),
          currency: config.currency,
          receipt: `rcpt_${projectId.slice(-10)}_${Date.now().toString().slice(-6)}`,
          notes: {
            projectId: project.id,
            projectName: project.projectName,
            customerEmail: project.clientEmail,
          },
        }),
      });

      if (rzpRes.ok) {
        const rzpData = (await rzpRes.json()) as { id?: string };
        if (rzpData?.id) {
          orderId = rzpData.id;
        }
      }
    } catch {
      // Best-effort external order creation; fallback to generated order ID
    }
  }

  const idempotencyKey = `idem_${projectId}_${Date.now()}`;

  const payment = await prisma.payment.create({
    data: {
      projectId: project.id,
      amount: config.feeInr,
      currency: config.currency,
      status: "PENDING",
      provider: config.provider || "razorpay",
      orderId,
      idempotencyKey,
      metadata: {
        service: "Estimation Service Fee",
        projectName: project.projectName,
        clientEmail: project.clientEmail,
        isTestMode: config.isTestMode,
      },
    },
  });

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(config.upiVpa)}&pn=${encodeURIComponent(
    "Estimex"
  )}&am=${Number(payment.amount).toFixed(2)}&cu=INR&tr=${encodeURIComponent(
    orderId
  )}&tn=${encodeURIComponent(`Estimex Estimate - ${project.projectName}`)}`;

  return {
    orderId: payment.orderId || orderId,
    amountInr: Number(payment.amount),
    amountPaise: Math.round(Number(payment.amount) * 100),
    currency: payment.currency,
    keyId: config.keyId,
    provider: config.provider,
    isConfigured: config.isConfigured,
    isTestMode: config.isTestMode,
    projectName: project.projectName,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    upiVpa: config.upiVpa,
    upiDeepLink,
  };
}

function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a.trim(), "utf8");
  const bufB = Buffer.from(b.trim(), "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Optionally retrieves live payment details directly from Razorpay's server-side API
 * to provide authoritative confirmation of order linkage, status, amount, and currency.
 */
export async function fetchRazorpayPaymentDetails(paymentId: string): Promise<{
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: string;
  method?: string;
  email?: string;
} | null> {
  const config = getPaymentConfig();
  const rawSecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const secret = rawSecret ? rawSecret.trim().replace(/^["'\\]+|["'\\]+$/g, "").trim() : "";

  if (!config.keyId || !secret || config.keyId.includes("simulated") || config.isTestMode) {
    return null;
  }

  try {
    const basicAuth = Buffer.from(`${config.keyId}:${secret}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new PaymentError("Payment record not found on Razorpay gateway.", 404);
      }
      return null;
    }

    const data = (await res.json()) as Record<string, unknown>;
    return {
      id: String(data.id || ""),
      order_id: data.order_id ? String(data.order_id) : null,
      amount: Number(data.amount),
      currency: String(data.currency || "INR").toUpperCase(),
      status: String(data.status || ""),
      method: typeof data.method === "string" ? data.method : undefined,
      email: typeof data.email === "string" ? data.email : undefined,
    };
  } catch (err) {
    if (err instanceof PaymentError) throw err;
    return null;
  }
}

/**
 * Verifies payment signatures and authoritatively transitions project status to PAYMENT_RECEIVED.
 * Never trusts client redirect alone; requires server-side HMAC validation with timing-safe comparison,
 * customer ownership confirmation, and idempotent state transitions.
 */
export async function verifyAndRecordPayment({
  orderId,
  paymentId,
  signature,
  projectId,
  customerId,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  projectId: string;
  customerId?: string;
}) {
  const config = getPaymentConfig();
  const rawSecret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const secret = rawSecret ? rawSecret.trim().replace(/^["'\\]+|["'\\]+$/g, "").trim() : "";

  if (config.isConfigured && secret) {
    // Authoritative signature verification: HMAC-SHA256(orderId + "|" + paymentId, secret)
    const expectedSignature = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isHmacValid = timingSafeCompare(signature, expectedSignature);

    const isTestValid =
      process.env.NODE_ENV !== "production" &&
      config.isTestMode &&
      (signature === "test_signature" ||
        signature === "simulated_success" ||
        signature.startsWith("test_"));

    if (!isHmacValid && !isTestValid) {
      throw new PaymentError("Invalid payment signature. Verification failed.", 400);
    }

    // If live credentials are configured and not in test/simulated mode, verify against Razorpay API
    if (!isTestValid && !config.isTestMode && !config.keyId?.includes("simulated")) {
      try {
        const rzpPayment = await fetchRazorpayPaymentDetails(paymentId);
        if (rzpPayment) {
          if (rzpPayment.order_id && rzpPayment.order_id !== orderId) {
            throw new PaymentError("Payment does not belong to this order on Razorpay.", 400);
          }
          if (rzpPayment.status !== "captured" && rzpPayment.status !== "authorized") {
            throw new PaymentError(
              `Payment status on gateway is '${rzpPayment.status}', expected 'captured' or 'authorized'.`,
              400
            );
          }
          const expectedPaise = Math.round(config.feeInr * 100);
          if (rzpPayment.amount !== expectedPaise && rzpPayment.amount !== config.feeInr) {
            throw new PaymentError(
              `Payment amount (₹${rzpPayment.amount / 100}) does not match the ₹${config.feeInr} estimation fee.`,
              400
            );
          }
          if (rzpPayment.currency !== config.currency.toUpperCase()) {
            throw new PaymentError("Payment currency does not match INR.", 400);
          }
        }
      } catch (err) {
        if (err instanceof PaymentError) throw err;
        // Network timeouts fall back to cryptographically verified HMAC signature
      }
    }
  } else {
    // Reject any test signature in production
    if (process.env.NODE_ENV === "production") {
      throw new PaymentError(
        "Live payment credentials are not configured on this server. Simulated test payments are disabled in production.",
        500
      );
    }

    // In development / test mode, allow test signatures or HMAC with default development key
    const testSecret = secret || "estimex_test_secret";
    const expectedSignature = createHmac("sha256", testSecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isHmacValid = timingSafeCompare(signature, expectedSignature);
    const isTestValid =
      isHmacValid ||
      signature === "test_signature" ||
      signature === "simulated_success" ||
      signature.startsWith("test_");

    if (!isTestValid) {
      throw new PaymentError("Invalid test payment signature.", 400);
    }
  }

  // Transactionally update Payment to COMPLETED and Project to PAYMENT_RECEIVED
  const result = await prisma.$transaction(
    async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { orderId },
        include: { project: true },
      });

      if (!payment) {
        throw new PaymentError("Payment record not found for this order.", 404);
      }

      if (payment.projectId !== projectId) {
        throw new PaymentError("Order does not belong to this project.", 400);
      }

      // Verify project ownership if customerId provided
      if (customerId && payment.project.customerId && payment.project.customerId !== customerId) {
        throw new PaymentError("Project does not belong to the authenticated customer.", 403);
      }

      if (payment.status === "REFUNDED") {
        throw new PaymentError("Payment record is marked as refunded.", 400);
      }

      if (payment.status === "COMPLETED") {
        // Idempotent: already marked completed
        return {
          success: true,
          payment,
          project: payment.project,
          alreadyProcessed: true,
        };
      }

      // Confirm expected amount and currency
      if (Number(payment.amount) !== config.feeInr || payment.currency.toUpperCase() !== config.currency.toUpperCase()) {
        throw new PaymentError("Payment record amount or currency mismatch.", 400);
      }

      const existingMetadata =
        payment.metadata && typeof payment.metadata === "object"
          ? (payment.metadata as Record<string, unknown>)
          : {};

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          transactionId: paymentId,
          metadata: {
            ...existingMetadata,
            checkoutVerifiedAt: new Date().toISOString(),
          },
        },
      });

      // Preserve advanced project status if engineer has already started or completed
      const shouldUpdateProject =
        payment.project.status === "PAYMENT_PENDING" ||
        payment.project.status === "SUBMITTED";

      const updatedProject = shouldUpdateProject
        ? await tx.project.update({
            where: { id: projectId },
            data: {
              status: "PAYMENT_RECEIVED",
            },
          })
        : payment.project;

      return {
        success: true,
        payment: updatedPayment,
        project: updatedProject,
        alreadyProcessed: false,
      };
    },
    { maxWait: 10000, timeout: 20000 }
  );

  return result;
}

/**
 * Validates Razorpay's webhook signature against the unaltered raw request body.
 * Uses timing-safe constant-time comparison to prevent timing attacks.
 * In production, strictly requires PAYMENT_WEBHOOK_SECRET.
 */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  if (!rawBody || typeof rawBody !== "string" || !signature || typeof signature !== "string") {
    return false;
  }

  const secret = getPaymentWebhookSecret();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    // In non-production test mode without webhook secret, accept designated test signature
    return signature === "test_webhook_signature";
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeCompare(signature, expected);
}

/**
 * Idempotently records a verified webhook payment for an order.
 * Validates amount, currency, order linkage, and preserves existing project progression.
 */
export async function recordWebhookPayment({
  orderId,
  paymentId,
  amount,
  currency,
  method,
  email,
  event,
}: {
  orderId: string;
  paymentId: string;
  amount?: number;
  currency?: string;
  method?: string;
  email?: string;
  event?: string;
}): Promise<{
  success: boolean;
  payment: Payment;
  project: Project;
  alreadyProcessed?: boolean;
}> {
  const config = getPaymentConfig();
  const expectedInr = config.feeInr;
  const expectedPaise = Math.round(expectedInr * 100);

  // Validate amount if supplied from webhook payload
  if (amount !== undefined && amount !== null) {
    const num = Number(amount);
    if (num !== expectedPaise && num !== expectedInr) {
      throw new PaymentError(
        `Webhook payment amount (${num}) does not match expected estimation fee (₹${expectedInr} / ${expectedPaise} paise).`,
        400
      );
    }
  }

  // Validate currency if supplied from webhook payload
  if (currency && typeof currency === "string") {
    if (currency.toUpperCase() !== config.currency.toUpperCase()) {
      throw new PaymentError(
        `Webhook payment currency (${currency}) does not match expected (${config.currency}).`,
        400
      );
    }
  }

  return prisma.$transaction(
    async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { orderId },
        include: { project: true },
      });

      if (!payment) {
        throw new PaymentError("Payment record not found for webhook order.", 404);
      }

      if (payment.status === "REFUNDED") {
        throw new PaymentError("Payment order is already refunded.", 400);
      }

      // Idempotency: if already completed, do not re-process or overwrite
      if (payment.status === "COMPLETED") {
        return {
          success: true,
          payment,
          project: payment.project,
          alreadyProcessed: true,
        };
      }

      // Confirm expected amount and currency in the payment record
      if (Number(payment.amount) !== expectedInr || payment.currency.toUpperCase() !== config.currency.toUpperCase()) {
        throw new PaymentError("Payment record amount or currency mismatch.", 400);
      }

      const existingMetadata =
        payment.metadata && typeof payment.metadata === "object"
          ? (payment.metadata as Record<string, unknown>)
          : {};

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "COMPLETED",
          transactionId: paymentId,
          metadata: {
            ...existingMetadata,
            webhookEvent: event || "payment.captured",
            webhookProcessedAt: new Date().toISOString(),
            ...(method ? { paymentMethod: method } : {}),
            ...(email ? { paymentEmail: email } : {}),
          },
        },
      });

      // Preserve advanced project status if engineer has already started or completed
      const shouldUpdateProject =
        payment.project.status === "PAYMENT_PENDING" ||
        payment.project.status === "SUBMITTED";

      const updatedProject = shouldUpdateProject
        ? await tx.project.update({
            where: { id: payment.projectId },
            data: {
              status: "PAYMENT_RECEIVED",
            },
          })
        : payment.project;

      return {
        success: true,
        payment: updatedPayment,
        project: updatedProject,
        alreadyProcessed: false,
      };
    },
    { maxWait: 10000, timeout: 20000 }
  );
}

/**
 * Records failure details from a payment.failed webhook event in metadata
 * without marking the payment as completed or transitioning the project.
 */
export async function recordFailedPaymentWebhook({
  orderId,
  paymentId,
  errorCode,
  errorDescription,
}: {
  orderId: string;
  paymentId?: string;
  errorCode?: string;
  errorDescription?: string;
}) {
  return prisma.$transaction(
    async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { orderId },
        include: { project: true },
      });

      if (!payment) return null;

      // Do not overwrite an already completed or refunded payment
      if (payment.status === "COMPLETED" || payment.status === "REFUNDED") {
        return payment;
      }

      const existingMetadata =
        payment.metadata && typeof payment.metadata === "object"
          ? (payment.metadata as Record<string, unknown>)
          : {};

      const updatedPayment = await tx.payment.update({
        where: { id: payment.id },
        data: {
          metadata: {
            ...existingMetadata,
            lastFailedPaymentId: paymentId,
            lastErrorCode: errorCode,
            lastErrorDescription: errorDescription,
            lastFailedAt: new Date().toISOString(),
          },
        },
      });

      return updatedPayment;
    },
    { maxWait: 10000, timeout: 20000 }
  );
}
