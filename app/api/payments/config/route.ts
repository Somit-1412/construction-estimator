import { NextResponse } from "next/server";
import { getPaymentConfig } from "@/lib/payment/config";

export async function GET() {
  const config = getPaymentConfig();
  return NextResponse.json({
    isConfigured: config.isConfigured,
    isTestMode: config.isTestMode,
    feeInr: config.feeInr,
    provider: config.provider,
    currency: config.currency,
    reasonNotConfigured: config.reasonNotConfigured,
    upiVpa: config.upiVpa,
  });
}
