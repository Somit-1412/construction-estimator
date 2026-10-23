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
      estimate: {
        select: {
          id: true,
          revision: true,
          totalCost: true,
          finalizedAt: true,
        },
      },
      payments: {
        where: { status: "COMPLETED" },
        take: 1,
        select: {
          id: true,
          amount: true,
          transactionId: true,
          orderId: true,
          createdAt: true,
        },
      },
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
            <Link
              href="/contact"
              className="text-sm font-semibold text-slate-600 hover:text-blue-700 transition"
            >
              Contact Us
            </Link>

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
              Submit new projects, complete estimation fee checkout, and download finalized estimates.
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
            {projects.map((project) => {
              const isFinalized = Boolean(project.estimate?.finalizedAt);
              const completedPayment = project.payments[0];

              return (
                <section
                  key={project.id}
                  className="engineering-card p-6"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-900">
                          {project.projectName}
                        </h2>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {project.location}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Submitted{" "}
                        {project.createdAt.toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>

                      {/* Payment metadata */}
                      {completedPayment && (
                        <p className="mt-2 text-xs font-semibold text-emerald-700">
                          Estimation Fee: ₹{Number(completedPayment.amount).toFixed(2)} (Paid · Ref:{" "}
                          {completedPayment.transactionId || completedPayment.orderId})
                        </p>
                      )}

                      <p className="mt-3 text-xs font-medium text-slate-600">
                        {project.status === "PAYMENT_PENDING" &&
                          "Drawings and project details are saved. Complete the ₹699 service fee to begin engineering calculations."}
                        {project.status === "SUBMITTED" &&
                          "Project details and drawings received. Engineering intake in queue."}
                        {project.status === "PAYMENT_RECEIVED" &&
                          "Payment confirmed. Lead engineer assigned to prepare complete estimate and BOQ."}
                        {project.status === "IN_PROGRESS" &&
                          "Technical estimation in progress. Calculations, material requirements, and labour schedules are being prepared."}
                        {project.status === "COMPLETED" && isFinalized &&
                          "Estimate has been finalized by the engineering team and is ready for your review."}
                        {project.status === "COMPLETED" && !isFinalized &&
                          "Project completed. Final report is being compiled."}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <div className="flex items-center gap-2">
                        {project.status === "COMPLETED" ? (
                          <span className="w-fit rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                            Completed {project.estimate ? `· R${project.estimate.revision}` : ""}
                          </span>
                        ) : project.status === "PAYMENT_RECEIVED" ? (
                          <span className="w-fit rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-teal-800">
                            Payment Received · ₹699
                          </span>
                        ) : project.status === "IN_PROGRESS" ? (
                          <span className="w-fit rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                            In Progress
                          </span>
                        ) : project.status === "PAYMENT_PENDING" ? (
                          <span className="w-fit rounded-full bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-800">
                            Payment Pending · ₹699
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                            Submitted
                          </span>
                        )}
                      </div>

                      {/* Action buttons based on status */}
                      {project.status === "PAYMENT_PENDING" && (
                        <div className="mt-2">
                          <Link
                            href={`/submit/payment?projectId=${project.id}`}
                            className="primary-button !px-4 !py-2 !text-xs font-bold"
                          >
                            Complete Payment (₹699) →
                          </Link>
                        </div>
                      )}

                      {isFinalized && project.estimate && (
                        <div className="flex flex-col items-start gap-2 sm:items-end">
                          <p className="text-sm font-bold text-slate-900">
                            ₹{Number(project.estimate.totalCost).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </p>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/customer/projects/${project.id}/estimate`}
                              className="primary-button !px-4 !py-2 !text-xs font-semibold"
                            >
                              View Final Estimate →
                            </Link>
                            <a
                              href={`/customer/projects/${project.id}/estimate/pdf`}
                              target="_blank"
                              rel="noreferrer"
                              className="secondary-button !px-4 !py-2 !text-xs font-semibold"
                            >
                              Download PDF
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-500 sm:flex-row md:px-8">
          <span>Estimex Civil Estimation</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
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
            <Link href="/contact" className="hover:text-blue-700 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}