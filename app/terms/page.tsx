import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms and Conditions — Estimex",
  description:
    "Terms and Conditions governing Estimex's civil construction estimation services, the ₹699 estimation fee, customer responsibilities, and service disclaimers.",
};

const OFFICIAL_CONTACT_EMAIL = "anushrisatpute03@gmail.com";

export default function TermsPage() {
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
            Legal &amp; Policy
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Terms and Conditions
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
            Please read these Terms and Conditions carefully before submitting your project
            details or paying for estimation services on Estimex. By submitting a project,
            creating an account, or completing payment, you agree to be bound by these terms.
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Last Updated: October 2026
          </p>
        </div>

        {/* Essential Notice: ₹699 Service Fee vs Construction Costs */}
        <div className="mt-8 rounded-2xl border-2 border-blue-200 bg-blue-50/70 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg">
              ₹
            </div>
            <div>
              <h2 className="text-base font-bold text-blue-950 sm:text-lg">
                Important Distinction: Estimation Service Fee vs. Construction Costs
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-blue-900 sm:text-sm">
                The fee charged by Estimex is a fixed upfront service fee of <strong>₹699 per estimate</strong>.
                This fee compensates Estimex solely for technical architectural/structural drawing review,
                civil engineering quantity calculations, material schedules, and the preparation of a structured
                Bill of Quantities (BOQ) report.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-blue-900 sm:text-sm">
                <strong>The ₹699 fee is NOT a construction cost, deposit, contractor advance, or building procurement fund.</strong>{" "}
                All construction and material total figures presented in your final estimate report (e.g. ₹15,00,000 or ₹35,00,000)
                are indicative engineering calculations for your planning purposes. Estimex does not collect construction funds,
                does not bill for physical construction work, and is not a building contractor.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Terms Sections */}
        <div className="mt-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              1. Overview of Estimex Services
            </h2>
            <p className="mt-3">
              Estimex operates an online engineering-led platform that prepares civil construction quantity
              take-offs, material requirement estimates, and labor costing schedules based on customer-uploaded
              building plans and architectural drawings.
            </p>
            <p className="mt-2">
              Our estimation process covers foundational and structural stages including excavation, Plain Cement
              Concrete (PCC), Reinforced Cement Concrete (RCC) footings, columns, plinth and floor beams, slabs,
              brickwork, damp-proof courses (DPC), internal and external plastering, flooring, and painting specifications.
            </p>
          </section>

          {/* Section 2 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              2. Fixed Estimation Service Fee (₹699)
            </h2>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
              <li>
                Each project submission requires payment of a non-negotiable service fee of <strong>₹699</strong> (inclusive of applicable processing fees).
              </li>
              <li>
                This fee is strictly for our engineering analysis and digital estimate report generation service.
              </li>
              <li>
                The service fee is never calculated as a percentage of your total estimated building cost, nor is the building cost used as the transaction amount.
              </li>
              <li>
                Payments must be completed through our integrated payment provider (Razorpay via UPI, Credit/Debit Cards, or Netbanking) before an engineer begins processing the project.
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              3. Service Workflow &amp; Engineer Processing
            </h2>
            <p className="mt-3">
              To ensure orderly execution and quality control, our service operates strictly in the following sequential order:
            </p>
            <ol className="mt-3 space-y-2.5 list-decimal list-inside text-slate-600">
              <li>
                <strong>Account Registration &amp; Submission:</strong> The customer creates an authenticated account, submits project details (name, location, storey count), and uploads corresponding architectural or structural drawing files.
              </li>
              <li>
                <strong>Payment Initiation:</strong> The project is recorded in <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">PAYMENT_PENDING</code> status. An invoice/order for the ₹699 fee is created.
              </li>
              <li>
                <strong>Payment Confirmation:</strong> Upon successful transaction verification via Razorpay, the status authoritatively transitions to <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded font-mono">PAYMENT_RECEIVED</code>. Unpaid requests are not assigned to or processed by engineers.
              </li>
              <li>
                <strong>Engineer Review &amp; Calculation:</strong> A qualified civil engineer reviews the uploaded drawings, establishes structural dimensions and schedules, applies current regional or standard material and labor rates, and performs civil quantity calculations.
              </li>
              <li>
                <strong>Finalization &amp; Delivery:</strong> The completed estimate is finalized and issued as a locked revision. The customer can review the itemized breakdown and download the official estimate PDF directly from their authenticated dashboard.
              </li>
            </ol>
          </section>

          {/* Section 4 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              4. Customer Responsibilities
            </h2>
            <p className="mt-3">
              By using Estimex, you acknowledge and agree that:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
              <li>
                You are responsible for supplying clear, legible, and dimensionally accurate building drawings (floor plans, sections, elevations, or structural details).
              </li>
              <li>
                You will provide truthful project site locations and intended building specifications.
              </li>
              <li>
                If drawings are illegible, contradictory, or missing critical dimensional details, our engineering team may request clarifications or revised files by email. Delays in providing clarifications will affect delivery timelines.
              </li>
              <li>
                You will safeguard your account login credentials and notify us immediately of any unauthorized access to your account.
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              5. Limitations of Estimates &amp; Unit Rates
            </h2>
            <p className="mt-3">
              Estimex estimates are generated using standard civil engineering formulas, mathematical quantity take-offs, and prevailing benchmark rates for materials (cement, steel, aggregate, sand, bricks, finishes) and labor. You understand and acknowledge that:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
              <li>
                <strong>Market Volatility:</strong> Actual construction material rates and labor wages fluctuate continuously based on regional supply chains, vendor pricing, seasonal demand, transportation distances, and inflation.
              </li>
              <li>
                <strong>Advisory Scope:</strong> Our reports serve as a planning and budgeting benchmark. Estimex does not sell construction materials or supply labor, and cannot guarantee that local suppliers or contractors will match benchmark unit rates.
              </li>
              <li>
                <strong>Site Unforeseens:</strong> Subsurface soil conditions, local municipal building codes, foundation depth adjustments, and site-specific topography may alter actual quantities consumed during physical execution.
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              6. Disclaimers: No Construction or Outcome Guarantees
            </h2>
            <div className="space-y-3 text-slate-600">
              <p>
                <strong>No Contracting or Supervisory Role:</strong> Estimex is an independent estimation software and advisory service. Estimex is not a general contractor, building firm, architect of record, or on-site supervisor. Estimex assumes no responsibility for actual physical construction, structural stability, workmanship, or contractor compliance.
              </p>
              <p>
                <strong>No Guaranteed Savings or Infallibility:</strong> While calculations are prepared using established engineering methodology, Estimex does not warrant or guarantee that implementing the estimate will result in specific monetary savings, complete budget conformity, or error-free construction execution.
              </p>
              <p>
                <strong>Independent Professional Advice:</strong> You are strongly advised to have your site conditions, structural drawings, and soil tests evaluated by a licensed local structural engineer, architect, and chartered civil surveyor prior to commencing foundation or structural construction works.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              7. Intellectual Property &amp; Deliverables
            </h2>
            <p className="mt-3">
              Customers retain full ownership of all architectural and structural drawings uploaded to Estimex. By uploading drawings, you grant Estimex a limited, non-exclusive license to view, store, and process the files solely for the purpose of preparing your estimate.
            </p>
            <p className="mt-2">
              Estimex retains all proprietary rights in its estimation algorithms, report templates, formatting, software, and brand assets. Upon issuance, you are granted a perpetual, non-transferable license to use and share the generated estimate PDF for your personal or commercial project planning.
            </p>
          </section>

          {/* Section 8 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              8. Governing Law &amp; Dispute Resolution
            </h2>
            <p className="mt-3">
              These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any legal dispute, controversy, or claim arising out of or relating to these terms or our services shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          {/* Section 9 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              9. Contact &amp; Questions
            </h2>
            <p className="mt-3">
              If you have any questions or require clarification regarding these Terms and Conditions, please contact us by email:
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-semibold text-slate-900">Email:</span>
              <a
                href={`mailto:${OFFICIAL_CONTACT_EMAIL}`}
                className="font-bold text-blue-700 hover:text-blue-900 underline underline-offset-4"
              >
                {OFFICIAL_CONTACT_EMAIL}
              </a>
            </div>
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
            <span className="font-semibold text-slate-700">Terms &amp; Conditions</span>
            <span>·</span>
            <Link href="/privacy" className="hover:text-blue-700 transition">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/refund-policy" className="hover:text-blue-700 transition">
              Refund Policy
            </Link>
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
