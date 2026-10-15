import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function SubmitSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<{ projectId?: string }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const projectId = resolvedParams.projectId;

  let paymentInfo: { amount: string; ref: string } | null = null;

  if (projectId) {
    const payment = await prisma.payment.findFirst({
      where: {
        projectId,
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
    });

    if (payment) {
      paymentInfo = {
        amount: Number(payment.amount).toFixed(2),
        ref: payment.transactionId || payment.orderId || "Verified",
      };
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xl font-bold">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Project Submitted
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-zinc-400">
            Your project details, drawings, and upfront estimation service fee have been
            received successfully. Our lead engineer has been assigned to prepare the estimate.
          </p>

          {paymentInfo && (
            <div className="mt-6 inline-flex items-center gap-3 rounded-xl border border-emerald-800/60 bg-emerald-950/40 px-4 py-2 text-xs text-emerald-300">
              <span className="font-semibold">Estimation Fee Paid: ₹{paymentInfo.amount}</span>
              <span className="text-emerald-500">·</span>
              <span className="font-mono text-[11px] text-zinc-400">Ref: {paymentInfo.ref}</span>
            </div>
          )}

          <div className="mt-8 rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-left">
            <p className="text-sm font-medium text-zinc-200">
              What happens next?
            </p>

            <ol className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>
                <span className="text-zinc-200">1.</span>{" "}
                Your project is reviewed.
              </li>

              <li>
                <span className="text-zinc-200">2.</span>{" "}
                Required engineering quantities are calculated.
              </li>

              <li>
                <span className="text-zinc-200">3.</span>{" "}
                Materials and construction costs are prepared.
              </li>

              <li>
                <span className="text-zinc-200">4.</span>{" "}
                Your final estimate is generated.
              </li>
            </ol>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/customer"
              className="inline-block rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              View My Projects
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}