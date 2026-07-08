"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge } from "@/components/ui";
import { apiClient } from "@/lib/api";

const videoTypes = [
  {
    value: "educational",
    label: "Educational",
    icon: "🎓",
    desc: "Lessons, tutorials, how-to guides",
  },
  {
    value: "tech_review",
    label: "Tech Review",
    icon: "💻",
    desc: "Product reviews, comparisons, unboxings",
  },
  {
    value: "faceless",
    label: "Faceless Channel",
    icon: "🎬",
    desc: "Voiceover content, compilations, lists",
  },
  {
    value: "general",
    label: "General",
    icon: "📺",
    desc: "Vlogs, entertainment, storytelling",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [videoType, setVideoType] = useState("educational");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentScripts, setRecentScripts] = useState<any[]>([]);

  useEffect(() => {
    apiClient("/scripts?limit=5")
      .then((data) => setRecentScripts(data.scripts || []))
      .catch(() => {});
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiClient("/scripts", {
        method: "POST",
        body: { topic, videoType },
      });
      router.push(`/dashboard/scripts/${data.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "generating":
        return <Badge variant="warning">Generating</Badge>;
      case "failed":
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Generate YouTube Script
        </h1>
        <p className="text-gray-500 mt-1">
          Enter a topic and choose your video type to get started
        </p>
      </div>

      {/* Generator Form */}
      <Card variant="elevated" padding="lg">
        <form onSubmit={handleGenerate} className="space-y-6">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Video Topic
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., How to start a YouTube channel in 2026"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-400 transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Video Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {videoTypes.map((vt) => (
                <button
                  key={vt.value}
                  type="button"
                  onClick={() => setVideoType(vt.value)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                    videoType === vt.value
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-2xl">{vt.icon}</span>
                  <div>
                    <p
                      className={`text-sm font-semibold ${videoType === vt.value ? "text-indigo-700" : "text-gray-900"}`}
                    >
                      {vt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{vt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            disabled={!topic.trim()}
            size="lg"
            className="w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            {loading ? "Generating Script..." : "Generate Script"}
          </Button>
        </form>
      </Card>

      {/* Recent Scripts */}
      {recentScripts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Scripts
            </h2>
            <button
              onClick={() => router.push("/dashboard/scripts")}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="space-y-3">
            {recentScripts.map((script: any, index: number) => (
              <div
                key={script.id}
                onClick={() => router.push(`/dashboard/scripts/${script.id}`)}
                className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
                      📝
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {script.title || script.topic}
                      </h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {script.videoType?.replace(/_/g, " ")} ·{" "}
                        {script.wordCount || 0} words
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(script.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {recentScripts.length === 0 && (
        <Card variant="default" padding="lg" className="text-center py-12">
          <div className="text-5xl mb-4">🎬</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Ready to create your first script?
          </h3>
          <p className="text-sm text-gray-500">
            Enter a topic above and let AI do the magic.
          </p>
        </Card>
      )}
    </div>
  );
}
