"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Project = {
  id: string;
  projectName: string;
  clientName: string;
  clientEmail: string;
  location: string;
  status: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    fetch("/api/projects")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load projects.");
        }

        return response.json();
      })
      .then((data: Project[]) => {
        if (!cancelled) {
          setProjects(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load projects.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/projects", {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create project.");
      }

      setProjects((currentProjects) => [data, ...currentProjects]);

      setProjectName("");
      setClientName("");
      setClientEmail("");
      setLocation("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Projects</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Create and manage construction estimation projects.
        </p>
      </div>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">
            Create Project
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Enter the basic project and client information.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Project Name
            </label>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Residential Building"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Client Name
            </label>
            <input
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Client name"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Client Email
            </label>
            <input
              type="email"
              value={clientEmail}
              onChange={(event) => setClientEmail(event.target.value)}
              placeholder="client@example.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Location
            </label>
            <input
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Nagpur"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-zinc-500"
              required
            />
          </div>

          {error && (
            <div className="md:col-span-2 rounded-lg border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900">
        <div className="border-b border-zinc-800 px-6 py-4">
          <h2 className="font-semibold text-white">Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-zinc-500">
            No projects yet.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/engineer/projects/${project.id}`}
                className="flex flex-col gap-3 px-6 py-5 transition hover:bg-zinc-800/50 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-medium text-white">
                    {project.projectName}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {project.clientName} · {project.location}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {project.clientEmail}
                  </p>
                </div>

                <div className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {project.status.replaceAll("_", " ")}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}