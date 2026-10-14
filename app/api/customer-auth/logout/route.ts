import { destroyCustomerSession } from "@/lib/customer-auth";
import { redirect } from "next/navigation";

export async function POST() {
  await destroyCustomerSession();
  redirect("/login");
}