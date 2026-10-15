import { NextResponse } from "next/server";
import { verifyWebhookSignature, recordWebhookPayment } from "@/lib/payment/service";

type WebhookEntity = {
  id?: string;
  order_id?: string;
};

type WebhookPayload = {
  event?: string;
  orderId?: string;
  paymentId?: string;
  payload?: {
    payment?: {
      entity?: WebhookEntity;
    };
    order?: {
      entity?: WebhookEntity;
    };
  };
};

export async function POST(request: Request) {
  const signature =
    request.headers.get("x-razorpay-signature") ||
    request.headers.get("x-payment-signature");

  const rawBody = await request.text();

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let eventData: WebhookPayload;
  try {
    eventData = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const orderId =
      eventData.payload?.payment?.entity?.order_id ||
      eventData.payload?.order?.entity?.id ||
      eventData.orderId;
    const paymentId =
      eventData.payload?.payment?.entity?.id ||
      eventData.paymentId ||
      `tx_${Date.now()}`;

    if (orderId) {
      await recordWebhookPayment({ orderId, paymentId });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return NextResponse.json({ error: "Webhook processing error." }, { status: 500 });
  }
}
