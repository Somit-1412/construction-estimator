"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/customer-auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create account.");
      }

      router.push("/customer");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating your account.",
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
              className="text-sm font-semibold text-slate-600 hover:text-blue-700 transition"
            >
              Contact Us
            </Link>

            <Link
              href="/login"
              className="text-sm font-semibold text-blue-700 hover:text-blue-800"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-5 py-12">
        <section className="engineering-card w-full p-6 md:p-8">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.22em] text-blue-700">
              Customer account
            </p>

            <h1 className="page-title mt-2">Create your account</h1>

            <p className="page-subtitle mt-3">
              Create an account to submit projects, track estimates, and access
              your completed estimates.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label>
              <span className="field-label">Full name</span>
              <input
                className="field-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your full name"
                required
              />
            </label>

            <label>
              <span className="field-label">Email address</span>
              <input
                className="field-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
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
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>

            <label>
              <span className="field-label">Confirm password</span>
              <input
                className="field-input"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Enter your password again"
                minLength={8}
                required
              />
            </label>

            {error && <div className="alert-error">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="primary-button w-full"
            >
              {submitting ? "Creating account…" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}