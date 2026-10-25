"use client";

import { useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button, Input, Card } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      await apiClient("/auth/forgot-password", {
        method: "POST",
        body: { email },
      });

      setMessage(
        "If an account exists for this email, password reset instructions will be sent shortly.",
      );
    } catch {
      setError("We could not process your request. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white">
              YS
            </span>
            <span className="font-semibold text-gray-900">
              YT<span className="text-indigo-600">Scripts</span>
            </span>
          </Link>
        </div>
      </header>

      <section className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="bordered" padding="lg">
            <div className="mb-7 text-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Forgot your password?
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Enter the email address associated with your account. If an
                account exists, we will send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                  {message}
                </div>
              )}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                Send reset instructions
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Back to Sign In
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
