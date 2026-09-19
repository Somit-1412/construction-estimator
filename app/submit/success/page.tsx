import Link from "next/link";

export default function SubmitSuccessPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-6">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 text-lg">
            ✓
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-tight">
            Project Submitted
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-zinc-400">
            Your project details and drawings have been submitted
            successfully. Our engineer will review the submitted
            information before preparing the estimate.
          </p>

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

          <Link
            href="/"
            className="mt-8 inline-block rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}