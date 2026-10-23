"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import QRCode from "qrcode";

type OrderDetails = {
  orderId: string;
  amountInr: number;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  provider: string;
  isConfigured: boolean;
  isTestMode: boolean;
  projectName: string;
  clientName: string;
  clientEmail: string;
  upiVpa: string;
  upiDeepLink: string;
};

type ProjectSummary = {
  id: string;
  projectName: string;
  location: string;
  status: string;
  drawings: Array<{ id: string; originalName: string; sizeBytes: number }>;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function PaymentCheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");

  const [project, setProject] = useState<ProjectSummary | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");

  // Fetch project details and initialize payment order
  useEffect(() => {
    if (!projectId) return;

    let ignore = false;

    async function load() {
      try {
        // 1. Fetch project info
        const projRes = await fetch(`/api/projects/${projectId}`);
        if (!projRes.ok) {
          const err = await projRes.json().catch(() => ({}));
          throw new Error(err.error || "Unable to load project details.");
        }
        const projData: ProjectSummary = await projRes.json();
        if (ignore) return;
        setProject(projData);

        // If already paid, redirect to success immediately
        if (
          projData.status === "PAYMENT_RECEIVED" ||
          projData.status === "IN_PROGRESS" ||
          projData.status === "COMPLETED"
        ) {
          router.push(`/submit/success?projectId=${projectId}`);
          return;
        }

        // 2. Create or retrieve pending payment order
        const orderRes = await fetch("/api/payments/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        });

        if (!orderRes.ok) {
          const err = await orderRes.json().catch(() => ({}));
          throw new Error(err.error || "Failed to initiate payment order.");
        }

        const orderData: OrderDetails = await orderRes.json();
        if (ignore) return;
        setOrder(orderData);

        // Generate dynamic UPI QR Code
        if (orderData.upiDeepLink) {
          try {
            const url = await QRCode.toDataURL(orderData.upiDeepLink, {
              width: 260,
              margin: 2,
              color: {
                dark: "#0f172a",
                light: "#ffffff",
              },
            });
            if (!ignore) {
              setQrDataUrl(url);
            }
          } catch (qrErr) {
            console.error("Failed to generate QR code:", qrErr);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to prepare checkout.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      ignore = true;
    };
  }, [projectId, router]);

  // Real-time status polling: checks every 3.5s if payment was completed via UPI app / webhook
  useEffect(() => {
    if (!projectId || !order || processing) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" });
        if (res.ok) {
          const updated: ProjectSummary = await res.json();
          if (
            updated.status === "PAYMENT_RECEIVED" ||
            updated.status === "IN_PROGRESS" ||
            updated.status === "COMPLETED"
          ) {
            clearInterval(interval);
            router.push(`/submit/success?projectId=${projectId}`);
          }
        }
      } catch {
        // Silent poll error
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [projectId, order, processing, router]);

  // Complete verification call
  const verifyPayment = async (verificationPayload: {
    orderId: string;
    paymentId: string;
    signature: string;
    projectId: string;
  }) => {
    setProcessing(true);
    setError("");

    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verificationPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Payment verification failed.");
      }

      router.push(`/submit/success?projectId=${projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment verification failed.");
      setProcessing(false);
    }
  };

  // Launch Razorpay standard checkout modal
  const handleRazorpayCheckout = async () => {
    if (!order || !project) return;
    setProcessing(true);
    setError("");

    // Dynamically load Razorpay SDK if not present
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Razorpay SDK."));
        document.body.appendChild(script);
      }).catch((e) => {
        setError(e.message);
        setProcessing(false);
        return;
      });
    }

    if (!window.Razorpay) {
      setError("Razorpay SDK is not available.");
      setProcessing(false);
      return;
    }

    const options = {
      key: order.keyId,
      amount: order.amountPaise,
      currency: order.currency,
      name: "Estimex",
      description: `Estimation Service Fee - ${order.projectName}`,
      order_id: order.orderId,
      prefill: {
        name: order.clientName,
        email: order.clientEmail,
      },
      theme: {
        color: "#2563eb",
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        await verifyPayment({
          orderId: response.razorpay_order_id || order.orderId,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
          projectId: project.id,
        });
      },
      modal: {
        ondismiss: function () {
          setProcessing(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open Razorpay checkout.");
      setProcessing(false);
    }
  };

  // Test mode simulation handler
  const handleSimulatedPayment = async () => {
    if (!order || !project) return;
    await verifyPayment({
      orderId: order.orderId,
      paymentId: `sim_pay_${Date.now()}`,
      signature: "test_signature",
      projectId: project.id,
    });
  };

  if (!projectId) {
    return (
      <main className="min-h-screen blueprint-grid flex items-center justify-center p-6">
        <div className="engineering-card p-8 text-center max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold">
            !
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No Project Specified</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please choose a project from your customer dashboard to complete payment.
          </p>
          <Link href="/customer" className="primary-button mt-6 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen blueprint-grid flex items-center justify-center p-6">
        <div className="engineering-card p-8 text-center max-w-md w-full">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Preparing checkout & order details…
          </p>
        </div>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="min-h-screen blueprint-grid flex items-center justify-center p-6">
        <div className="engineering-card p-8 text-center max-w-md w-full">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold">
            !
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Checkout Error</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <Link href="/customer" className="primary-button mt-6 inline-block">
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen blueprint-grid">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="engineering-mark small">CE</div>
            <span className="font-extrabold">Construction Estimator</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
            >
              Contact Us
            </Link>

            <span className="text-xs font-semibold text-slate-500">
              Step 2 of 2 · Service Fee Checkout
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-blue-700">
            Upfront Service Fee
          </p>
          <h1 className="page-title mt-2">Complete Estimation Payment</h1>
          <p className="page-subtitle mt-2">
            Review your project details and complete the ₹699 estimation fee to submit for engineering review.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-5">
          {/* Left Column: Project and Fee Summary (2 Cols) */}
          <div className="space-y-6 lg:col-span-2">
            <section className="engineering-card p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Project Summary
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs text-slate-400 block">Project Name</span>
                  <span className="font-bold text-slate-900">{project?.projectName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Location</span>
                  <span className="font-medium text-slate-700">{project?.location}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Uploaded Drawings</span>
                  <span className="font-medium text-slate-700">
                    {project?.drawings.length || 0} drawing file(s) saved
                  </span>
                </div>
              </div>
            </section>

            <section className="engineering-card p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                Fee Breakdown
              </h2>
              <div className="mt-4 divide-y divide-slate-100 text-sm">
                <div className="flex justify-between py-2 text-slate-600">
                  <span>Estimation Service Fee</span>
                  <span className="font-semibold text-slate-900">₹{order?.amountInr ?? 699}.00</span>
                </div>
                <div className="flex justify-between py-2 text-slate-600">
                  <span>Applicable GST (Taxes)</span>
                  <span className="font-semibold text-slate-900">Included</span>
                </div>
                <div className="flex justify-between pt-3 text-base font-extrabold text-blue-900">
                  <span>Total Payable</span>
                  <span>₹{order?.amountInr ?? 699}.00</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs leading-relaxed text-blue-800">
                <strong>Important Notice:</strong> This ₹699 fee covers Estimex professional engineering
                calculations, itemized BOQ, material schedules, and multi-storey breakdown. It is independent of
                your eventual construction costs.
              </div>
            </section>

            {/* Interrupted checkout safety notice */}
            <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-xs text-slate-500">
              <p className="font-medium text-slate-700">Draft Protected</p>
              <p className="mt-1">
                Your uploaded drawings and project details are safely stored. You can return anytime from your{" "}
                <Link href="/customer" className="text-blue-600 underline">
                  Customer Dashboard
                </Link>{" "}
                to complete payment without re-uploading files.
              </p>
            </div>
          </div>

          {/* Right Column: Payment Methods (3 Cols) */}
          <div className="space-y-6 lg:col-span-3">
            <section className="engineering-card p-6 md:p-8">
              <div className="flex border-b border-slate-200 pb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`flex-1 pb-2 text-sm font-bold text-center border-b-2 transition ${
                    paymentMethod === "upi"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  UPI & Dynamic QR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 pb-2 text-sm font-bold text-center border-b-2 transition ${
                    paymentMethod === "card"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Cards & Netbanking
                </button>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
                  {error}
                </div>
              )}

              {/* UPI Tab */}
              {paymentMethod === "upi" && (
                <div className="mt-6 flex flex-col items-center text-center">
                  <p className="text-xs text-slate-500">
                    Scan with any UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED)
                  </p>

                  <div className="mt-4 rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm">
                    {qrDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qrDataUrl}
                        alt="UPI Payment QR Code"
                        className="h-56 w-56 rounded-lg"
                      />
                    ) : (
                      <div className="flex h-56 w-56 items-center justify-center text-xs text-slate-400">
                        Generating QR…
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <span>UPI ID:</span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-blue-700">
                      {order?.upiVpa}
                    </span>
                  </div>

                  <div className="mt-2 text-sm font-bold text-slate-900">
                    Amount: ₹{order?.amountInr ?? 699}.00
                  </div>

                  {order?.upiDeepLink && (
                    <a
                      href={order.upiDeepLink}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:hidden"
                    >
                      <span>⚡ Open UPI App Directly</span>
                    </a>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Listening for real-time payment confirmation…</span>
                  </div>
                </div>
              )}

              {/* Cards / Netbanking Tab */}
              {paymentMethod === "card" && (
                <div className="mt-6 space-y-4">
                  <p className="text-xs text-slate-600">
                    Pay securely using Visa, Mastercard, RuPay, Netbanking, or digital wallets via Razorpay.
                  </p>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 space-y-2">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-semibold text-slate-800">Estimex Estimation</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-bold text-slate-900">₹{order?.amountInr ?? 699}.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Order ID:</span>
                      <span className="font-mono text-slate-600">{order?.orderId}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleRazorpayCheckout}
                    className="primary-button w-full justify-center !py-3 text-sm font-bold"
                  >
                    {processing ? "Processing…" : `Pay ₹${order?.amountInr ?? 699}.00 via Razorpay`}
                  </button>
                </div>
              )}

              {/* Test Mode Simulation Box */}
              {order?.isTestMode && (
                <div className="mt-8 rounded-xl border border-amber-300 bg-amber-50/80 p-5 text-left">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                      Sandbox / Dev Mode
                    </span>
                    <span className="text-xs font-semibold text-amber-900">
                      Live Razorpay keys not yet configured
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-amber-800 leading-relaxed">
                    You can test the complete end-to-end payment workflow, database state transition,
                    and engineer intake right now using the sandbox simulator below.
                  </p>

                  <button
                    type="button"
                    disabled={processing}
                    onClick={handleSimulatedPayment}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg bg-amber-700 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-800 disabled:opacity-60"
                  >
                    {processing ? "Confirming..." : "Simulate Successful Payment (₹699)"}
                  </button>
                </div>
              )}
              {/* Policy Acceptance Notice for Razorpay compliance */}
              <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
                <p>
                  By completing payment of ₹{order?.amountInr ?? 699}.00, you acknowledge and agree to Estimex&apos;s{" "}
                  <Link href="/terms" target="_blank" className="font-semibold text-blue-700 underline hover:text-blue-900">
                    Terms &amp; Conditions
                  </Link>
                  {", "}
                  <Link href="/privacy" target="_blank" className="font-semibold text-blue-700 underline hover:text-blue-900">
                    Privacy Policy
                  </Link>
                  {", and "}
                  <Link href="/refund-policy" target="_blank" className="font-semibold text-blue-700 underline hover:text-blue-900">
                    Refund Policy
                  </Link>
                  .
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Public Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-500 sm:flex-row md:px-8">
          <span>Estimex Civil Estimation</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/terms" target="_blank" className="hover:text-blue-700 transition">
              Terms &amp; Conditions
            </Link>
            <span>·</span>
            <Link href="/privacy" target="_blank" className="hover:text-blue-700 transition">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/refund-policy" target="_blank" className="hover:text-blue-700 transition">
              Refund Policy
            </Link>
            <span>·</span>
            <Link href="/contact" target="_blank" className="hover:text-blue-700 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function PaymentCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen blueprint-grid flex items-center justify-center p-6">
          <div className="engineering-card p-8 text-center max-w-md w-full">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="mt-4 text-sm font-semibold text-slate-700">Loading checkout…</p>
          </div>
        </div>
      }
    >
      <PaymentCheckoutContent />
    </Suspense>
  );
}
