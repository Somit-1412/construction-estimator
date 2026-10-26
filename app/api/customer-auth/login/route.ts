import { NextResponse } from "next/server";
import {
  authenticateCustomer,
  createCustomerSession,
} from "@/lib/customer-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }

  const customer = await authenticateCustomer(email, password);

  if (!customer) {
    return NextResponse.json(
      { error: "Invalid customer credentials." },
      { status: 401 },
    );
  }

  await createCustomerSession(customer.id);

  return NextResponse.json({
    customer: {
      id: customer.id,
      name: customer.name,
      email: customer.email,
    },
  });
}