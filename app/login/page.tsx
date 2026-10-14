"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/customer-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      router.push("/customer");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while signing in.",
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

          <Link
            href="/register"
            className="text-sm font-semibold text-blue-700 hover:text-blue-800"
          >
            Create account
          </Link>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-5 py-12">
        <section className="engineering-card w-full p-6 md:p-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-blue-700">
              Customer account
            </p>

            <h1 className="page-title mt-2">Sign in</h1>

            <p className="page-subtitle mt-3">
              Sign in to submit projects and access your estimates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label>
              <span className="field-label">Email address</span>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label>
              <span className="field-label">Password</span>
              <input
                className="field-input"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                autoComplete="current-password"
                required
              />
            </label>

            {error && <div className="alert-error">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="primary-button w-full"
            >
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Create one
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}