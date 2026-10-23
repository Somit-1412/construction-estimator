import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contact Us — Estimex",
  description:
    "Have a question about an estimation, your project, or our services? Contact Estimex by email.",
};

const OFFICIAL_CONTACT_EMAIL = "anushrisatpute03@gmail.com";

export default function ContactPage() {
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
      <div className="mx-auto max-w-4xl px-5 py-16 md:py-24 md:px-8 w-full flex-1">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.24em] text-blue-700">
            Get in touch
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
            Contact Estimex
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
            Have a question about an estimation, your project, or our services?
            Contact us by email and include any relevant project details so we
            can assist you.
          </p>
        </div>

        {/* Contact Card */}
        <div className="mt-10 engineering-card p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-200 pb-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Email
                </p>
                <a
                  href={`mailto:${OFFICIAL_CONTACT_EMAIL}`}
                  className="mt-1 block text-lg font-bold text-blue-700 hover:text-blue-900 transition underline underline-offset-4 break-all sm:text-xl"
                >
                  {OFFICIAL_CONTACT_EMAIL}
                </a>
              </div>
            </div>

            <a
              href={`mailto:${OFFICIAL_CONTACT_EMAIL}`}
              className="primary-button text-center !py-3 !px-6 text-sm font-bold inline-flex items-center justify-center gap-2 shrink-0"
            >
              <span>Compose Email</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <div className="mt-8 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              When contacting us regarding an estimate:
            </h2>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Please mention your project name and location if already submitted.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Attach or describe the building drawings (architectural or structural plans) you have questions about.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>
                  Include any specific requirements regarding specifications, number of storeys, or material preferences.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Quick Help Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white/70 p-5">
            <h3 className="font-bold text-sm text-slate-900">Existing Customer?</h3>
            <p className="mt-1 text-xs text-slate-600">
              Log in to view project statuses, download finalized estimate PDFs, or review your submitted drawings.
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block text-xs font-bold text-blue-700 hover:underline"
            >
              Go to Customer Login →
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white/70 p-5">
            <h3 className="font-bold text-sm text-slate-900">Ready to Estimate?</h3>
            <p className="mt-1 text-xs text-slate-600">
              Submit your drawings online. Our engineering team prepares complete civil itemized BOQs and schedules.
            </p>
            <Link
              href="/submit"
              className="mt-3 inline-block text-xs font-bold text-blue-700 hover:underline"
            >
              Start an Estimate →
            </Link>
          </div>
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
            <Link href="/refund-policy" className="hover:text-blue-700 transition">
              Refund Policy
            </Link>
            <span>·</span>
            <span className="font-semibold text-slate-700">Contact Us</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
