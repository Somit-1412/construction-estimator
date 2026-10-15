import { NextResponse } from "next/server";
import { getCurrentCustomer, customerUnauthorizedResponse, touchCustomerSession } from "@/lib/customer-auth";
import { createPaymentOrder, PaymentError } from "@/lib/payment/service";

export async function POST(request: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return customerUnauthorizedResponse();
  }

  const body = await request.json().catch(() => null);
  const projectId = body?.projectId;

  if (!projectId || typeof projectId !== "string") {
    return NextResponse.json({ error: "Missing or invalid projectId." }, { status: 400 });
  }

  try {
    const order = await createPaymentOrder(projectId, customer.id);
    await touchCustomerSession();
    return NextResponse.json(order);
  } catch (err) {
    if (err instanceof PaymentError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to create payment order." }, { status: 500 });
  }
}
