import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            Construction Estimator
          </Link>

          <Link
            href="/submit"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
          >
            Get Estimate
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Professional Construction Estimation
            </p>

            <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Get a detailed construction estimate based on your building plan.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
              Submit your project details and building drawings. Our engineer
              reviews the drawings, performs the required quantity
              calculations, and prepares a detailed material and cost estimate.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/submit"
                className="rounded-md bg-white px-6 py-3 text-center text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
              >
                Start Your Estimate
              </Link>

              <a
                href="#process"
                className="rounded-md border border-zinc-700 px-6 py-3 text-center text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-900"
              >
                How It Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* What you receive */}
      <section className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              What you receive
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              A structured construction estimate
            </h2>

            <p className="mt-4 text-zinc-400">
              The estimate is prepared from the project information and
              drawings submitted for review.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              title="Quantity Estimation"
              description="Quantities for excavation, concrete, brickwork, plaster, flooring, reinforcement and other construction items."
            />

            <FeatureCard
              title="Material Breakdown"
              description="Estimated quantities of major construction materials required for the project."
            />

            <FeatureCard
              title="Cost Estimation"
              description="Material and applicable construction costs calculated using the project's estimation data."
            />

            <FeatureCard
              title="Engineer Review"
              description="Submitted drawings are reviewed by an engineer before the final estimate is prepared."
            />

            <FeatureCard
              title="Detailed Report"
              description="A structured report containing the calculated quantities, materials and estimated costs."
            />

            <FeatureCard
              title="Project-Based Estimate"
              description="The estimate is prepared specifically for the dimensions and construction information provided for your project."
            />
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
              Process
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              From drawing to estimate
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <ProcessStep
              number="01"
              title="Submit"
              description="Enter your project details and upload your building drawings."
            />

            <ProcessStep
              number="02"
              title="Review"
              description="An engineer reviews the submitted drawings and project information."
            />

            <ProcessStep
              number="03"
              title="Calculate"
              description="Required quantities, materials and construction costs are calculated."
            />

            <ProcessStep
              number="04"
              title="Receive"
              description="The completed estimate and report are made available to you."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-12 text-center sm:px-12">
            <h2 className="text-3xl font-semibold tracking-tight">
              Ready to estimate your project?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Submit your project information and building drawings to begin
              the estimation process.
            </p>

            <Link
              href="/submit"
              className="mt-8 inline-block rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200"
            >
              Start Your Estimate
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Construction Estimator</p>
          <p>Professional construction quantity and cost estimation.</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
      <h3 className="text-base font-medium text-white">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-zinc-600">
        {number}
      </p>

      <h3 className="mt-3 text-lg font-medium text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </div>
  );
}