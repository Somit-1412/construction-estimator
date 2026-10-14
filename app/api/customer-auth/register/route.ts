import { createCustomer, createCustomerSession } from "@/lib/customer-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return Response.json(
      { error: "Name, email, and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Password must be at least 8 characters long." },
      { status: 400 },
    );
  }

  const customer = await createCustomer(name, email, password);

  if (!customer) {
    return Response.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  await createCustomerSession(customer.id);

  return Response.json(
    {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    },
    { status: 201 },
  );
}