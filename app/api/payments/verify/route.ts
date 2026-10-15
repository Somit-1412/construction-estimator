import { NextResponse } from "next/server";
import { getCurrentCustomer, customerUnauthorizedResponse, touchCustomerSession } from "@/lib/customer-auth";
import { verifyAndRecordPayment, PaymentError } from "@/lib/payment/service";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return customerUnauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const { projectId, orderId, paymentId, signature } = body || {};

  if (!projectId || !orderId || !paymentId || !signature) {
    return NextResponse.json(
      { error: "Missing required verification fields (projectId, orderId, paymentId, signature)." },
      { status: 400 }
    );
  }

  try {
    const result = await verifyAndRecordPayment({
      orderId,
      paymentId,
      signature,
      projectId,
    });
    await touchCustomerSession();
    return NextResponse.json({
      success: true,
      status: result.project.status,
      paymentId: result.payment.id,
      transactionId: result.payment.transactionId,
    });
  } catch (err) {
    if (err instanceof PaymentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Payment verification failed." }, { status: 500 });
  }
}
