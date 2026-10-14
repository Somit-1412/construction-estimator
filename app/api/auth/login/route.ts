import { authenticateEngineer, createEngineerSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) return Response.json({ error: "Email and password are required." }, { status: 400 });
  const engineer = await authenticateEngineer(email, password);
  if (!engineer) return Response.json({ error: "Invalid engineer credentials." }, { status: 401 });
  await createEngineerSession(engineer.id);
  return Response.json({ engineer: { id: engineer.id, name: engineer.name, email: engineer.email } });
}
