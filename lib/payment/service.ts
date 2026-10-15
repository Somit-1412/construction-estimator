import "server-only";
import { createHmac, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
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

/**
 * Verifies payment signatures and authoritatively transitions project status to PAYMENT_RECEIVED.
 * Never trusts client redirect alone; requires server-side HMAC validation or validated test-signature.
 */
export async function verifyAndRecordPayment({
  orderId,
  paymentId,
  signature,
  projectId,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
  projectId: string;
}) {
  const config = getPaymentConfig();
  const secret = process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

  if (config.isConfigured && secret) {
    // Authoritative signature verification: HMAC-SHA256(orderId + "|" + paymentId, secret)
    const expectedSignature = createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isTestValid =
      process.env.NODE_ENV !== "production" &&
      config.isTestMode &&
      (signature === "test_signature" ||
        signature === "simulated_success" ||
        signature.startsWith("test_"));

    if (signature !== expectedSignature && !isTestValid) {
      throw new PaymentError("Invalid payment signature. Verification failed.", 400);
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

    const isTestValid =
      signature === expectedSignature ||
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

    if (payment.status === "COMPLETED") {
      // Idempotent: already marked completed
      return { success: true, payment, project: payment.project };
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        transactionId: paymentId,
      },
    });

    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: {
        status: "PAYMENT_RECEIVED",
      },
    });

    return { success: true, payment: updatedPayment, project: updatedProject };
    },
    { maxWait: 10000, timeout: 20000 }
  );

  return result;
}

export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = getPaymentWebhookSecret();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      return false;
    }
    // In test mode without webhook secret, accept test header
    return signature === "test_webhook_signature";
  }
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

export async function recordWebhookPayment({
  orderId,
  paymentId,
}: {
  orderId: string;
  paymentId: string;
}) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { orderId },
      include: { project: true },
    });

    if (!payment) {
      throw new PaymentError("Payment record not found for webhook order.", 404);
    }

    if (payment.status === "COMPLETED") {
      return { success: true, payment, project: payment.project };
    }

    const updatedPayment = await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        transactionId: paymentId,
      },
    });

    const updatedProject = await tx.project.update({
      where: { id: payment.projectId },
      data: {
        status: "PAYMENT_RECEIVED",
      },
    });

    return { success: true, payment: updatedPayment, project: updatedProject };
  }, { maxWait: 10000, timeout: 20000 });
}
