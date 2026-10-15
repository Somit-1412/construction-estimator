import { getCurrentEngineer, unauthorizedResponse } from "@/lib/auth";

export async function GET() {
  const engineer = await getCurrentEngineer();
  if (!engineer) {
    return unauthorizedResponse();
  }

  return Response.json(
    {
      authenticated: true,
      engineer: {
        id: engineer.id,
        name: engineer.name,
        email: engineer.email,
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
