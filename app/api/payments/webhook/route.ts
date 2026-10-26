import { NextResponse } from "next/server";
import {
  verifyWebhookSignature,
  recordWebhookPayment,
  recordFailedPaymentWebhook,
  PaymentError,
} from "@/lib/payment/service";

type RazorpayWebhookEntity = {
  id?: string;
  order_id?: string | null;
  amount?: number;
  currency?: string;
  status?: string;
  method?: string;
  email?: string;
  contact?: string;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
  [key: string]: unknown;
};

type RazorpayWebhookPayload = {
  entity?: string;
  account_id?: string;
  event?: string;
  contains?: string[];
  payload?: {
    payment?: {
      entity?: RazorpayWebhookEntity;
    };
    order?: {
      entity?: RazorpayWebhookEntity;
    };
  };
  // Fallbacks for direct/mock test payloads
  orderId?: string;
  paymentId?: string;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
};

export async function POST(request: Request) {
  const signature =
    request.headers.get("x-razorpay-signature") ||
    request.headers.get("x-payment-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing webhook signature header." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  if (!rawBody || !rawBody.trim()) {
    return NextResponse.json(
      { error: "Empty request body." },
      { status: 400 }
    );
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 400 }
    );
  }

  let eventData: RazorpayWebhookPayload;
  try {
    eventData = JSON.parse(rawBody) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Malformed JSON payload." },
      { status: 400 }
    );
  }

  const event = eventData.event;
  if (!event || typeof event !== "string") {
    return NextResponse.json(
      { error: "Missing event type in webhook payload." },
      { status: 400 }
    );
  }

  try {
    // 1. Handle payment.failed event:
    // Record failure metadata without marking payment completed or project received
    if (event === "payment.failed") {
      const paymentEntity = eventData.payload?.payment?.entity;
      const orderId =
        paymentEntity?.order_id ||
        eventData.payload?.order?.entity?.id ||
        eventData.orderId;
      const paymentId = paymentEntity?.id || eventData.paymentId;

      if (orderId) {
        await recordFailedPaymentWebhook({
          orderId: String(orderId),
          paymentId: paymentId ? String(paymentId) : undefined,
          errorCode: paymentEntity?.error_code,
          errorDescription: paymentEntity?.error_description,
        });
      }

      return NextResponse.json(
        {
          received: true,
          event: "payment.failed",
          status: "recorded_failure",
        },
        { status: 200 }
      );
    }

    // 2. Filter for explicit successful payment events only:
    // Only payment.captured and order.paid indicate successful customer payment
    if (event !== "payment.captured" && event !== "order.paid") {
      return NextResponse.json(
        {
          received: true,
          event,
          status: "ignored",
          message: `Webhook event '${event}' is not a payment success event; ignored.`,
        },
        { status: 200 }
      );
    }

    // 3. Extract orderId and paymentId - never invent transaction IDs
    const paymentEntity = eventData.payload?.payment?.entity;
    const orderEntity = eventData.payload?.order?.entity;

    const rawOrderId =
      paymentEntity?.order_id ||
      orderEntity?.id ||
      eventData.orderId;

    const rawPaymentId =
      paymentEntity?.id ||
      eventData.paymentId;

    if (!rawOrderId || !rawPaymentId) {
      return NextResponse.json(
        {
          error: "Missing required payment ID or order ID in webhook payload.",
        },
        { status: 400 }
      );
    }

    const orderId = String(rawOrderId).trim();
    const paymentId = String(rawPaymentId).trim();

    // 4. Verify payment status in payment entity if provided
    if (
      paymentEntity?.status &&
      paymentEntity.status !== "captured" &&
      paymentEntity.status !== "authorized"
    ) {
      return NextResponse.json(
        {
          error: `Invalid payment status '${paymentEntity.status}' in webhook payload. Expected 'captured'.`,
        },
        { status: 400 }
      );
    }

    // 5. Extract amount and currency from entities
    const rawAmount =
      paymentEntity?.amount !== undefined
        ? paymentEntity.amount
        : orderEntity?.amount !== undefined
        ? orderEntity.amount
        : eventData.amount;

    const rawCurrency =
      paymentEntity?.currency ||
      orderEntity?.currency ||
      eventData.currency;

    const amount =
      rawAmount !== undefined && rawAmount !== null ? Number(rawAmount) : undefined;
    const currency = typeof rawCurrency === "string" ? rawCurrency : undefined;

    // 6. Record verified webhook payment
    const result = await recordWebhookPayment({
      orderId,
      paymentId,
      amount,
      currency,
      method: paymentEntity?.method,
      email: paymentEntity?.email,
      event,
    });

    return NextResponse.json(
      {
        received: true,
        status: result.alreadyProcessed ? "already_processed" : "completed",
        orderId,
        paymentId,
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof PaymentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("Webhook processing database error:", err);
    return NextResponse.json(
      { error: "Database error during webhook processing. Will retry." },
      { status: 500 }
    );
  }
}
