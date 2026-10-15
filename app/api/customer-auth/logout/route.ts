import { destroyCustomerSession } from "@/lib/customer-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  await destroyCustomerSession();
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Clear-Site-Data", '"cache"');
  return response;
}

export async function GET(request: Request) {
  await destroyCustomerSession();
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Clear-Site-Data", '"cache"');
  return response;
}