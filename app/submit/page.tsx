"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!files.length) {
      setError("Please upload at least one drawing.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          location,
        }),
      });

      const project = await response.json();

      if (!response.ok) {
        throw new Error(project.error || "Unable to create project.");
      }

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const drawingResponse = await fetch(
          `/api/projects/${project.id}/drawings`,
          {
            method: "POST",
            headers: {
              "x-submission-token": project.submissionToken,
            },
            body: formData,
          },
        );

        const drawing = await drawingResponse.json();

        if (!drawingResponse.ok) {
          throw new Error(
            drawing.error || `Unable to upload ${file.name}.`,
          );
        }
      }

      router.push(`/submit/payment?projectId=${project.id}`);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting the project.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen blueprint-grid">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="engineering-mark small">CE</div>
            <span className="font-extrabold">Construction Estimator</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
            >
              Contact Us
            </Link>

            <span className="text-xs font-semibold text-slate-500">
              Project submission
            </span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-12 md:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-extrabold uppercase tracking-[.22em] text-blue-700">
            Step 1 · Project intake
          </p>

          <h1 className="page-title">Tell us about the project</h1>

          <p className="page-subtitle">
            Provide the basic project information and upload the building
            drawings available to you. The technical estimate is prepared in
            the engineering workspace after submission.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 space-y-6">
          <section className="engineering-card p-6 md:p-8">
            <div className="section-heading">
              <div>
                <h2>Project information</h2>
                <p>
                  Your account information is already associated with this
                  project.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                01
              </span>
            </div>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label>
                <span className="field-label">Project name</span>

                <input
                  className="field-input"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Residential building"
                  required
                />
              </label>

              <label>
                <span className="field-label">Project location</span>

                <input
                  className="field-input"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="City / project location"
                  required
                />
              </label>
            </div>
          </section>

          <section className="engineering-card p-6 md:p-8">
            <div className="section-heading">
              <div>
                <h2>Building drawings</h2>

                <p>
                  Upload architectural, structural or other relevant drawings
                  available for review.
                </p>
              </div>

              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                02
              </span>
            </div>

            <div className="mt-7 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-center">
              <input
                id="drawings"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={(event) =>
                  setFiles(Array.from(event.target.files ?? []))
                }
                className="mx-auto block max-w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-700 file:px-4 file:py-2.5 file:text-sm file:font-bold file:text-white"
              />

              <p className="mt-4 text-xs text-slate-500">
                PDF, JPG, JPEG or PNG · maximum 10 MB per file
              </p>

              {files.length > 0 && (
                <div className="mx-auto mt-5 max-w-xl space-y-2 text-left">
                  {files.map((file) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
                    >
                      <span className="truncate font-medium">
                        {file.name}
                      </span>

                      <span className="ml-4 shrink-0 text-slate-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {error && <div className="alert-error">{error}</div>}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-5 text-slate-500">
              <span className="font-semibold text-slate-700">Estimex Service Fee: ₹699.00</span>
              <p className="text-[11px] text-slate-400">
                Fixed estimation fee for complete BOQ &amp; civil calculations. By proceeding, you agree to our{" "}
                <Link href="/terms" target="_blank" className="underline hover:text-blue-700">Terms</Link> and{" "}
                <Link href="/refund-policy" target="_blank" className="underline hover:text-blue-700">Refund Policy</Link>.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="primary-button"
            >
              {submitting ? "Uploading drawings…" : "Proceed to Payment (₹699) →"}
            </button>
          </div>
        </form>
      </div>

      {/* Public Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 text-xs text-slate-500 sm:flex-row md:px-8">
          <span>Estimex Civil Estimation</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Link href="/terms" target="_blank" className="hover:text-blue-700 transition">
              Terms &amp; Conditions
            </Link>
            <span>·</span>
            <Link href="/privacy" target="_blank" className="hover:text-blue-700 transition">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link href="/refund-policy" target="_blank" className="hover:text-blue-700 transition">
              Refund Policy
            </Link>
            <span>·</span>
            <Link href="/contact" target="_blank" className="hover:text-blue-700 transition">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}