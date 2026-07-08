"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { apiClient } from "@/lib/api";

export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [script, setScript] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"script" | "seo" | "thumbnail">(
    "script",
  );

  useEffect(() => {
    const fetchScript = async () => {
      try {
        const data = await apiClient(`/scripts/${params.id}`);
        setScript(data);
      } catch (err) {
        router.push("/dashboard/scripts");
      } finally {
        setLoading(false);
      }
    };
    fetchScript();
  }, [params.id, router]);

  const handleRegenerate = async () => {
    try {
      await apiClient(`/scripts/${params.id}/regenerate`, { method: "PUT" });
      setScript((prev: any) => ({ ...prev, status: "generating" }));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this script?")) return;
    try {
      await apiClient(`/scripts/${params.id}`, { method: "DELETE" });
      router.push("/dashboard/scripts");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopy = () => {
    if (script?.content) {
      navigator.clipboard.writeText(script.content);
      alert("Script copied to clipboard!");
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (!script) {
    return (
      <Card variant="default" padding="lg" className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Script not found
        </h3>
        <Button
          onClick={() => router.push("/dashboard/scripts")}
          variant="primary"
          className="mt-4"
        >
          Back to Scripts
        </Button>
      </Card>
    );
  }

  const tabs = [
    { id: "script" as const, label: "Script", icon: "📝" },
    { id: "seo" as const, label: "SEO Suggestions", icon: "🔍" },
    { id: "thumbnail" as const, label: "Thumbnail Ideas", icon: "🎨" },
  ];

  const statusVariant =
    script.status === "completed"
      ? "success"
      : script.status === "generating"
        ? "warning"
        : script.status === "failed"
          ? "danger"
          : "default";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {script.title || script.topic}
            </h1>
            <Badge variant={statusVariant}>{script.status}</Badge>
          </div>
          <p className="text-sm text-gray-500">
            {script.videoType?.replace(/_/g, " ")} · {script.wordCount || 0}{" "}
            words · {new Date(script.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={!script.content}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRegenerate}
            disabled={script.status === "generating"}
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Regenerate
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </Button>
        </div>
      </div>

      {/* Status alerts */}
      {script.status === "generating" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-amber-700">
            Script is being generated. This may take a moment...
          </p>
        </div>
      )}

      {script.status === "failed" && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <svg
            className="w-5 h-5 text-red-500 flex-shrink-0"
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
          <p className="text-sm text-red-700">
            Script generation failed. Your credit has been refunded. Try again.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
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

      {/* Script Tab */}
      {activeTab === "script" && (
        <Card variant="default" padding="lg">
          {script.content ? (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-700">
                {script.content}
              </pre>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-3">⏳</div>
              <p>Script content not available yet.</p>
            </div>
          )}
        </Card>
      )}

      {/* SEO Tab */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          {script.seoSuggestions ? (
            <>
              <Card variant="default" padding="lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                  </svg>
                  Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {script.seoSuggestions.keywords?.map(
                    (kw: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                      >
                        {kw}
                      </span>
                    ),
                  )}
                </div>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Hashtags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {script.seoSuggestions.hashtags?.map(
                    (ht: string, i: number) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                      >
                        {ht}
                      </span>
                    ),
                  )}
                </div>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-indigo-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  Title Suggestions
                </h3>
                <ul className="space-y-2">
                  {script.seoSuggestions.titleSuggestions?.map(
                    (t: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-700"
                      >
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {t}
                      </li>
                    ),
                  )}
                </ul>
              </Card>
            </>
          ) : (
            <Card variant="default" padding="lg" className="text-center py-8">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-500">
                SEO suggestions will appear here after generation.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Thumbnail Tab */}
      {activeTab === "thumbnail" && (
        <div className="space-y-4">
          {script.thumbnailConcepts?.length > 0 ? (
            script.thumbnailConcepts.map((concept: any, i: number) => (
              <Card key={i} variant="default" padding="lg">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                    🖼️
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Concept {i + 1}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {concept.conceptDescription}
                    </p>
                    {concept.textOverlaySuggestion && (
                      <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-sm">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                        {concept.textOverlaySuggestion}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card variant="default" padding="lg" className="text-center py-8">
              <div className="text-4xl mb-3">🎨</div>
              <p className="text-gray-500">
                Thumbnail concepts will appear here after generation.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
