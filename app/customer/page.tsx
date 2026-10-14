import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer-auth";
import { prisma } from "@/lib/prisma";

export default async function CustomerDashboard() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login");
  }

  const projects = await prisma.project.findMany({
    where: {
      customerId: customer.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      projectName: true,
      location: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <main className="min-h-screen blueprint-grid">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="engineering-mark small">CE</div>
            <span className="font-extrabold">Construction Estimator</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 sm:block">
              {customer.name}
            </span>

            <form action="/api/customer-auth/logout" method="POST">
              <button
                type="submit"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-blue-700">
              Customer dashboard
            </p>

            <h1 className="page-title mt-2">Your projects</h1>

            <p className="page-subtitle mt-3">
              Submit new projects and track the progress of your estimates.
            </p>
          </div>

          <Link href="/submit" className="primary-button inline-block">
            Start an estimate
          </Link>
        </div>

        {projects.length === 0 ? (
          <section className="engineering-card mt-8 p-8 text-center">
            <h2 className="text-lg font-bold text-slate-900">
              No projects yet
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Start your first estimate by submitting your project details and
              drawings.
            </p>

            <Link
              href="/submit"
              className="primary-button mt-6 inline-block"
            >
              Submit a project
            </Link>
          </section>
        ) : (
          <div className="mt-8 grid gap-5">
            {projects.map((project) => (
              <section
                key={project.id}
                className="engineering-card p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {project.projectName}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {project.location}
                    </p>

                    <p className="mt-2 text-xs text-slate-400">
                      Submitted{" "}
                      {project.createdAt.toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                    {project.status.replaceAll("_", " ")}
                  </span>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}