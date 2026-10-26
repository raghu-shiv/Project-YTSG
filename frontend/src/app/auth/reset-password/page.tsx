"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Button, Input, Card } from "@/components/ui";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("This reset link is invalid or expired. Request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setError("Use a password between 12 and 128 characters.");
      return;
    }

    setLoading(true);

    try {
      await apiClient("/auth/reset-password", {
        method: "POST",
        body: {
          token,
          newPassword: password,
        },
      });
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(
        "The reset link is invalid, expired, or already used. Request a new one.",
      );
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
                Reset your password
              </h1>
              <p className="mt-3 text-sm leading-6 text-gray-500">
                Choose a new password for your YT Scripts account.
              </p>
            </div>

            {success ? (
              <div className="space-y-5">
                <div
                  role="status"
                  className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
                >
                  Your password has been changed. Sign in with your new password
                  to continue.
                </div>
                <Link
                  href="/auth"
                  className="flex w-full justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  Back to sign in
                </Link>
              </div>
            ) : (
              <>
                {!token && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    This reset link is missing its token. Request a new link.
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                    >
                      {error}
                    </div>
                  )}

                  <Input
                    label="New password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 12 characters"
                    minLength={12}
                    maxLength={128}
                    required
                    autoComplete="new-password"
                  />

                  <Input
                    label="Confirm new password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Enter the password again"
                    minLength={12}
                    maxLength={128}
                    required
                    autoComplete="new-password"
                  />

                  <Button
                    type="submit"
                    loading={loading}
                    disabled={loading || !token}
                    className="w-full"
                    size="lg"
                  >
                    Reset password
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Request a new reset link
                  </Link>
                </div>
              </>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-500">Loading password reset…</p>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
