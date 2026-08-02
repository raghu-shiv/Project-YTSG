"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, LoadingSpinner } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api";

// Module-level flag — persists across component mounts/unmounts
let gsiInitialized = false;

export default function AuthPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const setUser = useAuthStore((state) => state.setUser);
  const setToken = useAuthStore((state) => state.setToken);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isInitialized && user) {
      router.push("/dashboard");
    }
  }, [isInitialized, user, router]);

  // Load Google Identity Services and render the sign-in button
  // Uses a module-level flag to ensure initialize() is only called once
  useEffect(() => {
    const renderGoogleButton = () => {
      if (!googleBtnRef.current) return;
      const accounts = (window as any).google?.accounts;
      if (!accounts) return;

      // Only call initialize() once — GSI logs warnings otherwise
      if (!gsiInitialized) {
        accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleGoogleCredential,
        });
        gsiInitialized = true;
      }

      // Clear container before rendering (in case of re-render)
      googleBtnRef.current.innerHTML = "";

      // GSI width must be a number (pixels), not a percentage string
      accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline",
        size: "large",
        width: 360,
        text: "signin_with",
      });
    };

    // If already loaded, render immediately
    if ((window as any).google?.accounts) {
      renderGoogleButton();
      return;
    }

    // Otherwise load the script once
    const scriptId = "google-gsi-script";
    if (document.getElementById(scriptId)) {
      // Script already loading, wait for it
      const check = setInterval(() => {
        if ((window as any).google?.accounts) {
          clearInterval(check);
          renderGoogleButton();
        }
      }, 100);
      return () => clearInterval(check);
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.body.appendChild(script);

    // Don't clean up on unmount — keep the script loaded so the button persists
  }, []);

  const handleGoogleCredential = async (response: any) => {
    try {
      setLoading(true);
      setError("");

      const payload = JSON.parse(atob(response.credential.split(".")[1]));

      const result = await apiClient("/auth/google", {
        method: "POST",
        body: {
          email: payload.email,
          name: payload.name,
          googleId: payload.sub,
          avatarUrl: payload.picture,
        },
      });

      if (result.token && result.user) {
        setToken(result.token);
        setUser(result.user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.message ||
          (mode === "login" ? "Login failed" : "Registration failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md shadow-indigo-200">
              <span className="text-white font-bold text-xs">YS</span>
            </div>
            <span className="font-semibold text-gray-900">
              YT<span className="text-indigo-600">Scripts</span>
            </span>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-gray-500 mt-2">
              {mode === "login"
                ? "Sign in to your account to continue"
                : "Get 5 free credits to start generating scripts"}
            </p>
          </div>

          <Card variant="bordered" padding="lg">
            {/* Mode Toggle */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === "login"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  mode === "register"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Google Sign-In Button */}
            <div className="mb-6">
              <div ref={googleBtnRef} className="flex justify-center"></div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  Or continue with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {mode === "register" && (
                <Input
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              )}

              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  mode === "register"
                    ? "Create a strong password"
                    : "Enter your password"
                }
                required
                minLength={mode === "register" ? 6 : undefined}
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                size="lg"
              >
                {mode === "login" ? "Sign In" : "Create Account"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
