import "server-only";

export const DEFAULT_SERVICE_FEE_INR = 699;

export type PaymentConfig = {
  isConfigured: boolean;
  isTestMode: boolean;
  feeInr: number;
  provider: string;
  keyId: string | null;
  currency: string;
  reasonNotConfigured?: string;
  upiVpa: string;
};

/**
 * Reads estimation service fee and payment provider credentials from environment variables.
 *
 * Rules:
 * - The service fee is exactly ₹699 per estimate by default.
 * - This is a fee for Estimex's estimation service, never calculated as a percentage of construction cost.
 * - If ESTIMATION_SERVICE_FEE_INR is unset or invalid, default to ₹699. Do not silently disable the fee.
 * - If provider keys (PAYMENT_KEY_ID / PAYMENT_KEY_SECRET) are missing, live payments are disabled,
 *   and test simulation mode is enabled for development and sandbox validation.
 */
function cleanEnv(val: string | undefined | null): string {
  if (!val) return "";
  return val.trim().replace(/^["'\\]+|["'\\]+$/g, "").trim();
}

export function getPaymentConfig(): PaymentConfig {
  const rawFee = cleanEnv(process.env.ESTIMATION_SERVICE_FEE_INR);
  const parsedFee = rawFee ? Number(rawFee) : NaN;
  const feeInr =
    Number.isFinite(parsedFee) && parsedFee > 0
      ? parsedFee
      : DEFAULT_SERVICE_FEE_INR;

  const provider = (cleanEnv(process.env.PAYMENT_PROVIDER) || "razorpay").toLowerCase();
  const rawKeyId = cleanEnv(process.env.PAYMENT_KEY_ID || process.env.RAZORPAY_KEY_ID);
  const keyId = rawKeyId || null;
  const rawKeySecret = cleanEnv(process.env.PAYMENT_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET);
  const keySecret = rawKeySecret || null;
  const upiVpa = cleanEnv(process.env.PAYMENT_UPI_VPA) || "billing@estimex";

  const hasKeys = Boolean(keyId && keySecret);
  const isTestKey = Boolean(keyId && (keyId.startsWith("rzp_test_") || keyId === "rzp_test_simulated"));
  const isTestMode =
    process.env.NODE_ENV !== "production" &&
    (!hasKeys || cleanEnv(process.env.PAYMENT_TEST_MODE) === "true" || isTestKey);

  if (!hasKeys) {
    return {
      isConfigured: false,
      isTestMode: process.env.NODE_ENV !== "production",
      feeInr,
      provider,
      keyId: process.env.NODE_ENV === "production" ? null : "rzp_test_simulated",
      currency: "INR",
      reasonNotConfigured:
        "Payment provider credentials (PAYMENT_KEY_ID / PAYMENT_KEY_SECRET) are not configured.",
      upiVpa,
    };
  }

  // If in production, reject test payment credentials (rzp_test_*) unconditionally
  if (process.env.NODE_ENV === "production" && isTestKey) {
    return {
      isConfigured: false,
      isTestMode: false,
      feeInr,
      provider,
      keyId: null,
      currency: "INR",
      reasonNotConfigured:
        "Test payment credentials (rzp_test_*) cannot be used in production.",
      upiVpa,
    };
  }

  return {
    isConfigured: true,
    isTestMode,
    feeInr,
    provider,
    keyId,
    currency: "INR",
    upiVpa,
  };
}

export function isPaymentConfigured(): boolean {
  return getPaymentConfig().isConfigured;
}

export function getPaymentWebhookSecret(): string | null {
  const raw = process.env.PAYMENT_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET;
  return cleanEnv(raw) || null;
}
