"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [location, setLocation] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleFilesChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    setError("");

    const selectedFiles = Array.from(
      event.target.files ?? [],
    );

    setFiles(selectedFiles);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (files.length === 0) {
      setError("Please upload at least one drawing.");
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Create project
      const projectResponse = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName,
          clientName,
          clientEmail,
          location,
        }),
      });

      const projectData = await projectResponse.json();

      if (!projectResponse.ok) {
        throw new Error(
          projectData.error || "Unable to create project.",
        );
      }

      // Step 2: Upload drawings
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const drawingResponse = await fetch(
          `/api/projects/${projectData.id}/drawings`,
          {
            method: "POST",
            body: formData,
          },
        );

        const drawingData = await drawingResponse.json();

        if (!drawingResponse.ok) {
          throw new Error(
            drawingData.error ||
              `Unable to upload ${file.name}.`,
          );
        }
      }

      // Payment will be added here later.

      router.push("/submit/success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while submitting the project.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800">
        <div className="mx-auto flex max-w-4xl items-center px-6 py-5">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight"
          >
            Construction Estimator
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-12">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
            Project Submission
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Submit your construction project
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Enter your project details and upload the building
            drawings required for estimation.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-8"
        >
          {/* Project details */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold">
              Project Details
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="projectName"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Project Name
                </label>

                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(event.target.value)
                  }
                  placeholder="e.g. Residential Building"
                  required
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor="clientName"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Your Name
                </label>

                <input
                  id="clientName"
                  type="text"
                  value={clientName}
                  onChange={(event) =>
                    setClientName(event.target.value)
                  }
                  placeholder="Full name"
                  required
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor="clientEmail"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Email Address
                </label>

                <input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(event) =>
                    setClientEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  required
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-zinc-300"
                >
                  Project Location
                </label>

                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="City / project location"
                  required
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
                />
              </div>
            </div>
          </section>

          {/* Drawings */}
          <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-lg font-semibold">
              Building Drawings
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Upload the architectural or structural drawings
              for your project.
            </p>

            <div className="mt-6 rounded-lg border border-dashed border-zinc-700 bg-zinc-950 p-5">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFilesChange}
                className="block w-full text-sm text-zinc-300
                  file:mr-4 file:rounded-md file:border-0
                  file:bg-zinc-700 file:px-4 file:py-2
                  file:text-sm file:font-medium file:text-white
                  hover:file:bg-zinc-600"
              />

              <p className="mt-3 text-xs text-zinc-500">
                PDF, JPG, JPEG or PNG · Maximum 10 MB per file
              </p>

              {files.length > 0 && (
                <div className="mt-5 space-y-2">
                  {files.map((file) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-900 px-4 py-3"
                    >
                      <p className="truncate text-sm text-zinc-200">
                        {file.name}
                      </p>

                      <p className="shrink-0 text-xs text-zinc-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {error && (
            <div className="rounded-md border border-red-900/50 bg-red-950/20 px-4 py-3">
              <p className="text-sm text-red-400">
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-white px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "Submitting Project..."
              : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}