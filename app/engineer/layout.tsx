import Link from "next/link";

export default function EngineerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-zinc-800 bg-zinc-900 md:block">
          <div className="border-b border-zinc-800 px-6 py-5">
            <h1 className="text-lg font-semibold">
              Construction Estimator
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Engineer Portal
            </p>
          </div>

          <nav className="p-4">
            <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Workspace
            </div>

            <div className="space-y-1">
              <Link
                href="/engineer"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Dashboard
              </Link>

              <Link
                href="/engineer/projects"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Projects
              </Link>

              <Link
                href="/engineer/calculations"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Calculations
              </Link>

              <Link
                href="/engineer/materials"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Materials
              </Link>

              <Link
                href="/engineer/costing"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Costing
              </Link>

              <Link
                href="/engineer/reports"
                className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Reports
              </Link>
            </div>
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
            <div>
              <h2 className="font-medium">Engineer Workspace</h2>
            </div>

            <div className="text-sm text-zinc-400">
              Engineer
            </div>
          </header>

          <main className="min-w-0 flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}