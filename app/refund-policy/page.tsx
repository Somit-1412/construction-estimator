import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy — Estimex",
  description:
    "Information regarding cancellation requests, refund eligibility stages, and technical dispute resolutions for Estimex's ₹699 civil estimation service fee.",
};

const OFFICIAL_CONTACT_EMAIL = "anushrisatpute03@gmail.com";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen blueprint-grid text-slate-900 flex flex-col justify-between">
      {/* Public Header */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 md:px-8">
          <Link href="/" className="flex items-center">
            <Image
              src="/Estimex_logo.jpeg"
              alt="Estimex — Civil Estimation Made Simple"
              width={420}
              height={420}
              className="h-24 w-24 object-contain"
              priority
            />
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-3">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 px-2 py-2 sm:px-3 sm:py-2.5 sm:text-sm transition"
            >
              Home
            </Link>

            <Link
              href="/contact"
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 px-2 py-2 sm:px-3 sm:py-2.5 sm:text-sm transition"
            >
              Contact Us
            </Link>

            <Link
              href="/login"
              className="secondary-button text-xs !px-2.5 !py-2 sm:!px-4 sm:!py-2.5 sm:text-sm"
            >
              Log In
            </Link>

            <Link
              href="/register"
              className="secondary-button text-xs !px-2.5 !py-2 font-bold text-blue-700 border-blue-200 hover:bg-blue-50 sm:!px-4 sm:!py-2.5 sm:text-sm"
            >
              Sign Up
            </Link>

            <Link
              href="/submit"
              className="primary-button text-xs !px-2.5 !py-2 sm:!px-4 sm:!py-2.5 sm:text-sm"
            >
              <span className="hidden sm:inline">Start an estimate</span>
              <span className="sm:hidden">Start</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mx-auto max-w-4xl px-5 py-12 md:py-16 md:px-8 w-full flex-1">
        <div className="max-w-3xl">
          <p className="text-xs font-extrabold uppercase tracking-[.24em] text-blue-700">
            Customer Assurance &amp; Billing
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Refund &amp; Cancellation Policy
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
            Estimex aims to maintain a transparent, fair, and straightforward relationship with our customers.
            This policy outlines how cancellations and refund requests are evaluated for our professional
            construction estimation services.
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Last Updated: October 2026
          </p>
        </div>

        {/* Clear Notice on ₹699 Service Fee vs Construction Costs */}
        <div className="mt-8 rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white font-bold text-lg">
              ℹ️
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950 sm:text-lg">
                Understanding the ₹699 Estimation Service Fee
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-amber-900 sm:text-sm">
                The ₹699 fee paid on Estimex covers the dedicated professional time, civil engineering calculation
                work, and computing resources required to analyze your architectural plans, take off quantities,
                and produce a detailed, itemized Bill of Quantities (BOQ).
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-900 sm:text-sm">
                <strong>This ₹699 fee is completely distinct from the physical construction and material costs</strong>{" "}
                detailed inside the estimate report. Estimex does not handle, collect, or manage construction funds.
                All refund considerations apply strictly to the ₹699 digital estimation service fee.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Sections */}
        <div className="mt-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1: Refund Eligibility by Service Stage */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              1. Cancellation &amp; Refund Eligibility by Workflow Stage
            </h2>
            <p className="mt-3 text-slate-600">
              Because our service involves direct civil engineering labor upon payment confirmation, refund eligibility
              is structured around the progression of your project in our engineering pipeline:
            </p>

            <div className="mt-6 space-y-5">
              {/* Stage A */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    Stage 1: Before Engineering Work Commences
                  </span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200">
                    Status: PAYMENT_RECEIVED (Queued)
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  If you have completed payment of the ₹699 service fee but decide to cancel your request{" "}
                  <strong>before an engineer has begun review or calculation work</strong>, you are eligible for
                  cancellation and a full refund of the ₹699 fee.
                </p>
              </div>

              {/* Stage B */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    Stage 2: While Engineering Work is In Progress
                  </span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200">
                    Status: IN_PROGRESS
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Once an engineer has actively begun analyzing your drawings, extracting dimensions, or inputting
                  structural calculations, significant professional time has already been committed. In such cases:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside text-xs text-slate-600">
                  <li>Full refunds are generally not feasible once professional work has been substantially performed.</li>
                  <li>Requests received during active progress will be reviewed on a case-by-case basis. Depending on the extent of work completed, Estimex may offer a partial refund or a service credit applicable toward a future project revision, subject to management approval.</li>
                </ul>
              </div>

              {/* Stage C */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    Stage 3: After Estimate Delivery
                  </span>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                    Status: COMPLETED (Estimate Finalized)
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Once the engineering estimate has been finalized, issued, and made available for review and PDF download
                  in your customer dashboard, the service has been fully rendered. Because the customized engineering
                  deliverable has been delivered, refunds are generally not available after this point.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2: Technical Errors & Special Circumstances */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              2. Technical Errors, Duplicate Charges &amp; Unserviceable Requests
            </h2>
            <div className="mt-4 space-y-4 text-slate-600">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">A. Duplicate Billing &amp; Payment Gateway Errors</h3>
                <p className="mt-1 text-xs leading-relaxed">
                  If an internet interruption or payment gateway glitch causes your account or card to be charged more than
                  once for the same project submission order, the duplicate charge will be refunded in full upon verification
                  of the Razorpay payment references.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">B. Inadequate or Unreadable Drawings</h3>
                <p className="mt-1 text-xs leading-relaxed">
                  If your uploaded drawings are corrupted, unreadable, or lack sufficient dimensional data to produce a civil
                  estimate, our team will contact you by email to request revised files. If you are unable to provide
                  usable drawings, Estimex will cancel the project and issue a refund of the ₹699 fee.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">C. Technical Service Failure</h3>
                <p className="mt-1 text-xs leading-relaxed">
                  In the unlikely event of an unforeseen technical failure on our platform that permanently prevents the
                  delivery of your finalized estimate report, you will receive a full refund.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: How to Request a Refund */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              3. How to Request a Cancellation or Refund
            </h2>
            <p className="mt-3 text-slate-600">
              To request a cancellation or refund, please send an email to our official contact address:
            </p>
            <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-700">Send your request to:</p>
              <a
                href={`mailto:${OFFICIAL_CONTACT_EMAIL}`}
                className="mt-1 block text-base font-bold text-blue-700 hover:text-blue-900 underline"
              >
                {OFFICIAL_CONTACT_EMAIL}
              </a>
              <p className="mt-3 text-xs text-slate-500">Please include the following details in your email:</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-600 list-disc list-inside">
                <li>Project Name and Site Location</li>
                <li>Your Registered Account Email Address</li>
                <li>Razorpay Payment ID (e.g. <code className="font-mono bg-white px-1 py-0.5 rounded border">pay_...</code>) or Order Reference</li>
                <li>Reason for your cancellation or refund request</li>
              </ul>
            </div>
          </section>

          {/* Section 4: Refund Timelines & Bank Processing */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              4. Processing Timelines &amp; Settlement
            </h2>
            <p className="mt-3 text-slate-600">
              Once a refund request is approved:
            </p>
            <ul className="mt-2 space-y-2 list-disc list-inside text-slate-600">
              <li>
                <strong>Refund Initiation:</strong> Approved refunds are initiated directly through Razorpay back to your original payment method (bank account, debit/credit card, or UPI VPA).
              </li>
              <li>
                <strong>Bank Settlement Time:</strong> In accordance with standard banking and payment gateway operational cycles, refunds typically reflect in your account within <strong>5 to 7 business days</strong> following initiation, depending on your issuing bank.
              </li>
              <li>
                <strong>Confirmation:</strong> You will receive an email confirmation containing the refund reference number once the refund is initiated.
              </li>
            </ul>
          </section>

          {/* Section 5: Owner Discretion & Custom Reviews */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              5. Discretionary Policy Notice
            </h2>
            <p className="mt-3 text-slate-600">
              Estimex evaluates all cancellation and refund inquiries in good faith. Any discretionary exceptions,
              partial refund amounts for in-progress projects, or dispute reconciliations remain subject to review
              and final approval by Estimex management.
            </p>
          </section>
        </div>
      </div>

      {/* Public Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/Estimex_logo.jpeg"
              alt="Estimex"
              width={160}
              height={160}
              className="h-12 w-auto object-contain"
            />
            <span className="text-xs text-slate-500">
              Civil Estimation Made Simple
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-700 transition">
              Home
            </Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-blue-700 transition">
              Terms &amp; Conditions
            </Link>
            <span>·</span>
            <Link href="/privacy" className="hover:text-blue-700 transition">
              Privacy Policy
            </Link>
            <span>·</span>
            <span className="font-semibold text-slate-700">Refund Policy</span>
            <span>·</span>
            <Link href="/contact" className="hover:text-blue-700 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
