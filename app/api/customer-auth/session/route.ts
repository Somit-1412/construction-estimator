import { getCurrentCustomer, customerUnauthorizedResponse } from "@/lib/customer-auth";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return customerUnauthorizedResponse();
  }

  return Response.json(
    {
      authenticated: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    },
  );
}
