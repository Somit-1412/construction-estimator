import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — Estimex",
  description:
    "Learn how Estimex collects, uses, stores, and protects your project information, architectural drawings, and payment transaction references.",
};

const OFFICIAL_CONTACT_EMAIL = "anushrisatpute03@gmail.com";

export default function PrivacyPage() {
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
            Data Protection &amp; Confidentiality
          </p>

          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
            Estimex values your trust and is dedicated to protecting your personal information,
            project data, and architectural plans. This Privacy Policy outlines what information
            we collect, how it is processed and secured, and your rights concerning your data.
          </p>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            Last Updated: October 2026
          </p>
        </div>

        {/* Clear Notice on Payment Card Details */}
        <div className="mt-8 rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-lg">
              🛡️
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 sm:text-lg">
                Zero Cardholder &amp; Banking Data Storage
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900 sm:text-sm">
                <strong>Estimex never collects, views, processes, or stores your credit card numbers, debit card numbers, CVVs, expiration dates, netbanking passwords, or UPI PINs.</strong>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-emerald-900 sm:text-sm">
                All payment transactions are handled directly through our authorized payment processing partner,{" "}
                <strong>Razorpay</strong>, using their secure, PCI-DSS compliant checkout interface. Estimex receives
                only a transaction reference ID, order reference, payment status, and verification timestamp to confirm
                service fulfillment.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Privacy Sections */}
        <div className="mt-10 space-y-8 text-slate-700 text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              1. Information We Collect
            </h2>
            <p className="mt-3">
              To provide civil estimation and quantity calculations, Estimex collects the following categories of information:
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">A. Account &amp; Contact Information</h3>
                <p className="mt-1 text-slate-600">
                  When you register, we collect your full name and email address. We store a cryptographically salted password hash (using the scrypt algorithm); we never store plaintext passwords.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">B. Project Specifications</h3>
                <p className="mt-1 text-slate-600">
                  When you submit an estimate request, we collect project metadata including the project name, geographic location (city/state), building type, number of storeys, and floor dimensions.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">C. Building Drawings &amp; Plan Files</h3>
                <p className="mt-1 text-slate-600">
                  We collect the architectural blueprints, structural drawings, elevation drawings, floor layouts, or PDF documents you upload. These files are essential for our engineers to measure dimensions and compute structural quantities.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">D. Engineering Calculations &amp; Reports</h3>
                <p className="mt-1 text-slate-600">
                  We generate and store engineering calculations (such as concrete volumes, steel reinforcement weights, brick counts, plaster areas), project rate schedules, and finalized PDF estimate reports.
                </p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm">E. Payment Reference Data</h3>
                <p className="mt-1 text-slate-600">
                  Upon completion of checkout, we record transactional metadata provided by Razorpay: Razorpay Order ID, Razorpay Payment ID, payment timestamp, payment status (<code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">COMPLETED</code>), and the service fee amount (₹699).
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              2. How We Use Your Information
            </h2>
            <p className="mt-3">
              We use the collected information solely for genuine operational and engineering purposes:
            </p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
              <li>To authenticate your identity and maintain secure, role-based dashboard access.</li>
              <li>To assign project drawings to our qualified civil engineers for quantity calculation and costing.</li>
              <li>To compile, format, and deliver itemized Bill of Quantities (BOQ) reports and downloadable PDFs.</li>
              <li>To verify service fee payments, generate transaction receipts, and manage account billing status.</li>
              <li>To communicate with you via email regarding technical drawing clarifications, order status updates, or customer support inquiries.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              3. Data Storage &amp; Infrastructure
            </h2>
            <p className="mt-3">
              Estimex implements industry-standard infrastructure architecture to safeguard your technical and personal data:
            </p>
            <div className="mt-4 space-y-4 text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  PostgreSQL Relational Database
                </h3>
                <p className="mt-1 text-xs">
                  User accounts, project metadata, floor schedules, engineering calculations, and payment reference numbers are stored in a managed, access-controlled PostgreSQL database with encrypted connections.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Private Amazon AWS S3 Drawing Storage
                </h3>
                <p className="mt-1 text-xs">
                  All customer-uploaded drawing files are stored in a private Amazon Simple Storage Service (AWS S3) bucket in the AWS Asia Pacific (Mumbai) region (<code className="text-xs font-mono">ap-south-1</code>).
                  The bucket is strictly private with public access blocked; files can only be accessed by authenticated users and engineers via time-limited, cryptographically signed URLs.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Razorpay Payment Infrastructure
                </h3>
                <p className="mt-1 text-xs">
                  Online payments are processed securely through Razorpay. Server-to-server communications use cryptographic HMAC-SHA256 signature verification to ensure authentic transaction completion without exposing financial credentials.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              4. Data Sharing &amp; Non-Disclosure
            </h2>
            <p className="mt-3">
              <strong>We do not sell, rent, trade, or monetize your personal information or building drawings.</strong>
            </p>
            <p className="mt-2 text-slate-600">
              Your architectural drawings and project specifications are treated as confidential engineering documents. We share data only with:
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600">
              <li>Authorized Estimex civil engineers for the sole purpose of performing calculations and preparing your estimate.</li>
              <li>Essential infrastructure providers (AWS for private file storage, Razorpay for payment processing).</li>
              <li>Law enforcement or regulatory authorities only when strictly required by applicable Indian law or court order.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              5. Session Security &amp; Cookies
            </h2>
            <p className="mt-3 text-slate-600">
              Estimex uses first-party HTTP cookies exclusively for essential session authentication:
            </p>
            <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600">
              <li>
                <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">ce_customer_session</code>: A cryptographically random token stored with <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">HttpOnly</code>, <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">SameSite=Lax</code>, and <code className="text-xs bg-slate-100 px-1 py-0.5 rounded font-mono">Secure</code> flags.
              </li>
              <li>
                <strong>Inactivity Timeout:</strong> Sessions automatically expire after 30 minutes of inactivity to protect your account if left unattended on shared devices.
              </li>
              <li>
                <strong>Server-Side Invalidation:</strong> Logging out immediately purges the session record from the database and sends browser cache-clearing instructions (<code className="text-xs font-mono">Clear-Site-Data</code>) to prevent back-button unauthorized viewing.
              </li>
              <li>We do not use third-party advertising tracking cookies.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              6. Access, Retention &amp; Customer Rights
            </h2>
            <p className="mt-3 text-slate-600">
              You retain control over your data:
            </p>
            <ul className="mt-2 space-y-2 list-disc list-inside text-slate-600">
              <li>
                <strong>Access:</strong> You can view all your submitted projects, drawing attachments, and finalized estimate reports at any time by logging into your customer dashboard.
              </li>
              <li>
                <strong>Retention:</strong> We retain your project records and generated estimates for as long as your account remains active, ensuring continuous access to your historical estimates.
              </li>
              <li>
                <strong>Deletion Requests:</strong> If you wish to delete a specific project or your entire account and associated drawing files, you may send a written request to <a href={`mailto:${OFFICIAL_CONTACT_EMAIL}`} className="text-blue-700 underline font-semibold">{OFFICIAL_CONTACT_EMAIL}</a>. We will process your request promptly upon verifying account ownership.
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="engineering-card p-6 md:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              7. Contact Us Regarding Privacy
            </h2>
            <p className="mt-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or how your project data is handled, please reach out to:
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
            <Link href="/terms" className="hover:text-blue-700 transition">
              Terms &amp; Conditions
            </Link>
            <span>·</span>
            <span className="font-semibold text-slate-700">Privacy Policy</span>
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
