"use client";

import { useState, useEffect } from "react";
import { Button, Input, Card, Badge } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  premium: "Premium",
};

export default function SettingsPage() {
  useEffect(() => {
    document.title = "Settings | YT Scripts";
  }, []);
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const setUser = useAuthStore((state) => state.setUser);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  // Email verification
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerifyError, setEmailVerifyError] = useState("");

  // Subscriptions
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.phone) setPhone(user.phone);
  }, [user?.name, user?.phone]);

  useEffect(() => {
    apiClient("/payments/subscriptions")
      .then((data) => {
        setSubscriptions(data || []);
        setSubsLoading(false);
      })
      .catch(() => setSubsLoading(false));
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const updated = await apiClient("/users/profile", {
        method: "PUT",
        body: { name, phone },
      });
      setUser(updated);
      setMessageType("success");
      setMessage("Profile updated successfully");
    } catch (err: any) {
      setMessageType("error");
      setMessage(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmailOtp = async () => {
    setEmailVerifying(true);
    setEmailVerifyError("");
    try {
      const result = await apiClient("/otp/send", {
        method: "POST",
        body: { target: user?.email, type: "email" },
      });
      setEmailOtpSent(true);
      alert(`OTP sent to your email. For development: ${result.otp}`);
    } catch (err: any) {
      setEmailVerifyError(err.message || "Failed to send OTP");
    } finally {
      setEmailVerifying(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      setEmailVerifyError("Please enter the 6-digit OTP");
      return;
    }
    setEmailVerifying(true);
    setEmailVerifyError("");
    try {
      await apiClient("/otp/verify", {
        method: "POST",
        body: { target: user?.email, type: "email", otp: emailOtp },
      });
      await fetchProfile();
      setEmailOtpSent(false);
      setEmailOtp("");
      alert("Email verified successfully!");
    } catch (err: any) {
      setEmailVerifyError(err.message || "Invalid OTP");
    } finally {
      setEmailVerifying(false);
    }
  };

  // Determine the plan name for account type
  const activeSubscription = subscriptions.find((s) => s.status === "active");
  const accountType = user?.role === "admin"
    ? "Admin"
    : activeSubscription
      ? PLAN_NAMES[activeSubscription.plan] || activeSubscription.plan
      : "Free";

  if (!isInitialized || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings</p>
      </div>

      {/* Profile Section */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-200">
            {(name || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">Update your personal information</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          {message && (
            <div className={`p-4 text-sm rounded-xl border flex items-center gap-2 ${
              messageType === "success"
                ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                : "text-red-700 bg-red-50 border-red-200"
            }`}>
              {messageType === "success" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          )}

          <Input
            label="Display Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
          />

          {/* Email with Verify button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 pl-10 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-500"
                />
              </div>
              {user?.emailVerified ? (
                <Badge variant="success" className="flex items-center px-3 py-1 h-[42px]">Verified</Badge>
              ) : emailOtpSent ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter OTP"
                    maxLength={6}
                    className="w-28 px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button variant="primary" size="sm" onClick={handleVerifyEmail} loading={emailVerifying}>
                    Verify
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={handleSendEmailOtp} loading={emailVerifying}>
                  Verify
                </Button>
              )}
            </div>
            {emailVerifyError && <p className="text-sm text-red-500 mt-1">{emailVerifyError}</p>}
          </div>

          {/* Phone Number */}
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={saving} variant="primary">
              <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </Button>
            {!saving && messageType === "success" && message && (
              <span className="text-sm text-emerald-600 font-medium">✓ Saved</span>
            )}
          </div>
        </form>
      </Card>

      {/* Account Info */}
      <Card variant="default" padding="lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Account Type</span>
            <span className="text-sm font-medium text-gray-900">
              {accountType}
            </span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Credits</span>
            <span className="text-sm font-medium text-gray-900">{user?.creditBalance ?? 0}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Auth Method</span>
            <span className="text-sm font-medium text-gray-900">Email & Password</span>
          </div>
          {!subsLoading && subscriptions.length > 0 && subscriptions.map((sub: any) => {
            const planName = PLAN_NAMES[sub.plan] || sub.plan;
            return (
              <div key={sub.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <span className="text-sm text-gray-500">{planName} — Auto-renewal</span>
                <span className="text-sm font-medium text-gray-900">
                  {sub.status === "active" ? "ON" : "OFF"}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}