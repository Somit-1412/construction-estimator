import Image from "next/image";
import Link from "next/link";

const features = [
  [
    "01",
    "Drawing-led estimation",
    "Your building drawings are reviewed before quantities are prepared.",
  ],
  [
    "02",
    "Engineering calculations",
    "Excavation, concrete, reinforcement, masonry, plaster, flooring and finishing quantities are structured by work item.",
  ],
  [
    "03",
    "Material & labour costing",
    "Project-specific specifications, current rates and labour inputs are brought together into one estimate.",
  ],
  [
    "04",
    "Issued estimate",
    "A finalized revision records the values used for the estimate so later rate changes do not silently rewrite it.",
  ],
];

export default function Home() {
  return (
    <main className="min-h-screen blueprint-grid text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 md:px-8">
          <Link
            href="/"
            className="flex items-center"
          >
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

      <section className="overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.24em] text-blue-700">
              Professional construction estimation
            </p>

            <h1 className="mt-5 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-[-.05em] text-slate-950 sm:text-6xl">
              From building drawing to a structured construction estimate.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600">
              Submit your project information and drawings. An engineer reviews
              the work, prepares project-specific quantities, applies material
              and labour rates, and issues a detailed estimate.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/submit"
                className="primary-button text-center"
              >
                Submit your project
              </Link>

              <a
                href="#process"
                className="secondary-button text-center"
              >
                See the process
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                Drawing review
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                Quantity calculation
              </span>

              <span className="rounded-full border border-slate-200 bg-white px-3 py-2">
                Cost report
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="engineering-card relative overflow-hidden p-6 md:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 border-b border-l border-blue-100 bg-blue-50/60" />

              <div className="relative">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
                      Estimate workflow
                    </p>

                    <p className="mt-1 font-bold">
                      Residential project
                    </p>
                  </div>

                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-bold text-amber-700">
                    ENGINEERED
                  </span>
                </div>

                <div className="mt-7 space-y-5">
                  {[
                    "Building drawing",
                    "Quantity schedule",
                    "Material specification",
                    "Cost estimate",
                  ].map((item, i) => (
                    <div
                      key={item}
                      className="flex items-center gap-4"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-xs font-extrabold text-blue-700">
                        0{i + 1}
                      </div>

                      <div className="h-px flex-1 bg-slate-200" />

                      <span className="w-40 text-right text-sm font-semibold text-slate-700">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Issued estimate
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        Revision controlled
                      </p>
                    </div>

                    <span className="text-2xl font-black text-blue-800">
                      ₹ —
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    The final value is built from the project&apos;s saved
                    calculations, specifications, rates and labour schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="process"
        className="border-y border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-700">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
              A technical workflow, presented simply.
            </h2>

            <p className="mt-4 text-slate-600">
              The customer provides the project inputs. The engineering
              workspace handles the technical estimation process.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(([n, t, d]) => (
              <article
                key={n}
                className="engineering-card p-6"
              >
                <span className="text-xs font-black text-orange-600">
                  {n}
                </span>

                <h3 className="mt-6 font-bold text-slate-900">
                  {t}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {d}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8">
          <div className="engineering-card overflow-hidden">
            <div className="grid lg:grid-cols-[1fr_.7fr]">
              <div className="p-8 md:p-12">
                <p className="text-xs font-extrabold uppercase tracking-[.2em] text-blue-700">
                  Ready when you are
                </p>

                <h2 className="mt-3 text-3xl font-extrabold tracking-tight">
                  Start with the building information you already have.
                </h2>

                <p className="mt-4 max-w-xl text-slate-600">
                  Upload the available drawings and provide the basic project
                  details. The engineering review happens after submission.
                </p>

                <Link
                  href="/submit"
                  className="primary-button mt-7 inline-block"
                >
                  Begin project submission
                </Link>
              </div>

              <div className="min-h-56 blueprint-grid border-t border-slate-200 lg:border-l lg:border-t-0">
                <div className="h-full p-8">
                  <div className="h-full rounded-xl border border-blue-100 bg-white/70 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Drawing reference
                    </p>

                    <div className="mt-4 grid grid-cols-6 gap-2 opacity-60">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-5 border border-blue-100"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 md:flex-row md:items-center md:justify-between md:px-8">
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

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <Link
              href="/contact"
              className="font-medium text-slate-600 hover:text-blue-700 transition"
            >
              Contact Us
            </Link>
            <span className="hidden sm:inline">·</span>
            <span>Engineering-led quantity and cost estimation.</span>
          </div>
        </div>
      </footer>
    </main>
  );
}