"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const [activeTab, setActiveTab] = useState<"users" | "stats">("users");
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [showCreditModal, setShowCreditModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    if (!isInitialized) {
      fetchProfile();
    }
  }, [router, isInitialized, fetchProfile]);

  useEffect(() => {
    if (isInitialized && !isLoading && user) {
      if (user.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      // Fetch admin data
      Promise.all([apiClient("/admin/users"), apiClient("/admin/stats")])
        .then(([usersData, statsData]) => {
          setUsers(usersData.users || []);
          setStats(statsData);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isInitialized && !isLoading && !user) {
      router.push("/login");
    }
  }, [isInitialized, isLoading, user, router]);

  const handleAdjustCredits = async () => {
    if (!selectedUser || !creditAmount) return;
    try {
      await apiClient(`/admin/users/${selectedUser.id}/credits`, {
        method: "PATCH",
        body: { amount: parseInt(creditAmount), reason: creditReason },
      });
      setShowCreditModal(false);
      setCreditAmount("");
      setCreditReason("");
      const usersData = await apiClient("/admin/users");
      setUsers(usersData.users || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (isLoading || !isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const tabs = [
    { id: "users" as const, label: "Users", icon: "👥" },
    { id: "stats" as const, label: "Stats", icon: "📊" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation bar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="w-px h-6 bg-gray-200" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">YS</span>
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-gray-900">Admin Panel</h1>
                  <p className="text-xs text-gray-500">Platform management</p>
                </div>
              </div>
            </div>
            <Badge variant="info">Admin</Badge>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <Card variant="default" padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-6 py-3 font-medium text-gray-500">Email</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Credits</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Scripts</th>
                    <th className="text-center px-6 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-right px-6 py-3 font-medium text-gray-500">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((u: any) => (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUser?.id === u.id ? "bg-indigo-50" : ""
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {(u.name || u.email || "?").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.name || "Unnamed"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{u.email}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-gray-900">{u.creditBalance}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">
                        {u._count?.scripts || 0}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant={u.role === "admin" ? "info" : "default"}>
                          {u.role || "user"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Expanded user details */}
            {selectedUser && (
              <div className="p-6 bg-indigo-50/50 border-t border-indigo-100 animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {selectedUser.name || selectedUser.email} — Details
                  </h3>
                  <Button variant="primary" size="sm" onClick={() => setShowCreditModal(true)}>
                    Adjust Credits
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 bg-white rounded-xl border border-indigo-100">
                    <p className="text-gray-500">Total Scripts</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUser._count?.scripts}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100">
                    <p className="text-gray-500">Transactions</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUser._count?.creditTransactions}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100">
                    <p className="text-gray-500">Payments</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUser._count?.payments}</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-indigo-100">
                    <p className="text-gray-500">Credit Balance</p>
                    <p className="text-xl font-bold text-gray-900">{selectedUser.creditBalance}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Users", value: stats?.totalUsers || 0, icon: "👥", color: "from-blue-500 to-blue-600" },
              { label: "Total Scripts", value: stats?.totalScripts || 0, icon: "📝", color: "from-indigo-500 to-purple-500" },
              { label: "Revenue (₹)", value: stats?.totalRevenue || 0, icon: "💰", color: "from-emerald-500 to-green-600" },
              { label: "Scripts Today", value: stats?.scriptsToday || 0, icon: "⚡", color: "from-amber-500 to-orange-600" },
              { label: "Active Subs", value: stats?.activeSubscriptions || 0, icon: "🔄", color: "from-cyan-500 to-blue-600" },
            ].map((stat) => (
              <Card key={stat.label} variant="default" padding="lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-xl shadow-sm`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === "number" ? stat.value.toLocaleString() : stat.value}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Credit Adjustment Modal */}
        {showCreditModal && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Adjust Credits — {selectedUser?.name || selectedUser?.email}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    placeholder="e.g., 10 or -5"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">Positive to add, negative to remove</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <input
                    type="text"
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    placeholder="e.g., Bonus, refund, penalty"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="primary" onClick={handleAdjustCredits} disabled={!creditAmount}>
                    Apply
                  </Button>
                  <Button variant="ghost" onClick={() => setShowCreditModal(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}