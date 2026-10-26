import { getCurrentCustomer } from "@/lib/customer-auth";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { SessionGuard } from "@/components/SessionGuard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubmitLayout({
  children,
}: {
  children: ReactNode;
}) {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login?callbackUrl=/submit");
  }

  return (
    <>
      <SessionGuard type="customer" />
      {children}
    </>
  );
}