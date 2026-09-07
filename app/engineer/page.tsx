export default function EngineerDashboard() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Dashboard
        </h1>

        <p className="mt-2 text-zinc-400">
          Manage estimation projects and review calculation progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Active Projects
          </p>

          <p className="mt-2 text-3xl font-semibold">
            0
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Pending Review
          </p>

          <p className="mt-2 text-3xl font-semibold">
            0
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            In Progress
          </p>

          <p className="mt-2 text-3xl font-semibold">
            0
          </p>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-sm text-zinc-400">
            Completed
          </p>

          <p className="mt-2 text-3xl font-semibold">
            0
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold">
          Recent Projects
        </h2>

        <p className="mt-2 text-sm text-zinc-400">
          Projects will appear here once the project workflow is connected.
        </p>
      </div>
    </div>
  );
}