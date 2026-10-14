import { destroyEngineerSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await destroyEngineerSession();
  return NextResponse.redirect(new URL("/engineer/login", request.url));
}
