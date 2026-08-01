"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { useScriptsStore } from "@/stores";
import { useAuthStore } from "@/stores/auth-store";
import { apiClient } from "@/lib/api";

export default function ScriptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"script" | "thumbnail">(
    "script",
  );

  const currentScript = useScriptsStore((state) => state.currentScript);
  const isLoading = useScriptsStore((state) => state.isLoading);
  const error = useScriptsStore((state) => state.error);
  const fetchScript = useScriptsStore((state) => state.fetchScript);
  const deleteScript = useScriptsStore((state) => state.deleteScript);
  const setCurrentScript = useScriptsStore((state) => state.setCurrentScript);
  const clearError = useScriptsStore((state) => state.clearError);

  // Auth store for credit display
  const user = useAuthStore((state) => state.user);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);

  // Thumbnail generation state
  const [generatingThumbnails, setGeneratingThumbnails] = useState(false);
  const [thumbnailError, setThumbnailError] = useState("");

  // Use a ref to prevent polling from being affected by effect re-runs
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    clearError();
    const scriptId = params.id as string;

    // Initial fetch
    fetchScript(scriptId);

    // Poll every 3s while script is generating (or until we have a status)
    pollRef.current = setInterval(() => {
      const state = useScriptsStore.getState();
      const status = state.currentScript?.status;
      if (!status || status === "generating") {
        state.fetchScript(scriptId);
      }
    }, 3000);

    // Auto-stop polling after 5 minutes
    const timeout = setTimeout(() => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }, 300000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearTimeout(timeout);
      setCurrentScript(null);
    };
  }, [params.id]);

  const handleRegenerate = async () => {
    try {
      const result = await apiClient(`/scripts/${params.id}/regenerate`, {
        method: "PUT",
      });
      setCurrentScript({ ...currentScript, ...result, status: "generating" });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this script?")) return;
    try {
      await deleteScript(params.id as string);
      router.push("/dashboard/scripts");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGenerateThumbnails = async () => {
    setGeneratingThumbnails(true);
    setThumbnailError("");
    try {
      const result = await apiClient(`/scripts/${params.id}/generate-thumbnails`, {
        method: "POST",
      });
      // Re-fetch the script to get updated thumbnail data
      await fetchScript(params.id as string);
      // Refresh credit balance from auth store
      await fetchProfile();
    } catch (err: any) {
      setThumbnailError(err.message || "Failed to generate thumbnails");
    } finally {
      setGeneratingThumbnails(false);
    }
  };

  const scriptCredits = user?.scriptCredits ?? 0;
  const thumbnailCredits = user?.thumbnailCredits ?? 0;

  // Loading state
  if (isLoading && !currentScript) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading script...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !currentScript) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="default" padding="lg" className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Script not found</h3>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard/scripts")} variant="primary">
            Back to Scripts
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentScript) {
    return null;
  }

  const isGenerating = currentScript.status === "generating";

  // Generating state
  if (isGenerating) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-semibold text-gray-900">
            Generating Your Script
          </h2>
          <p className="text-sm text-gray-500">
            AI is crafting your script based on your topic. This usually takes
            30-60 seconds, but complex scripts may take up to 2 minutes.
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div className="bg-indigo-600 h-2 rounded-full animate-pulse w-2/3" />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Please wait — the page will update automatically when ready.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const scriptId = params.id as string;
              if (scriptId) fetchScript(scriptId);
            }}
          >
            Check Status
          </Button>
        </div>
      </div>
    );
  }

  // Failed state
  if (currentScript.status === "failed") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Card variant="default" padding="lg" className="text-center max-w-md">
          <div className="text-5xl mb-4">❌</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Generation Failed
          </h3>
          <p className="text-sm text-gray-500 mb-2">
            The AI was unable to generate your script. Your credit has been
            refunded.
          </p>
          <p className="text-xs text-gray-400 mb-6">
            You can try again with a different topic or video type.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/dashboard")} variant="primary">
              Try Again
            </Button>
            <Button onClick={handleRegenerate} variant="outline">
              Retry Generation
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Completed state — show the full script detail
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/scripts")}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {currentScript.title || currentScript.topic}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {currentScript.videoType?.replace(/_/g, " ")} ·{" "}
              {currentScript.wordCount || 0} words ·{" "}
              {currentScript.modelUsed || "AI"} ·{" "}
              {new Date(currentScript.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRegenerate}>
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { id: "script" as const, label: "Script & SEO", icon: "📝" },
          { id: "thumbnail" as const, label: "Thumbnails", icon: "🎨" },
        ].map((tab) => (
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

      {/* Script & SEO Tab */}
      {activeTab === "script" && (
        <div className="space-y-6">
          {/* Credit badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Remaining Script Credits:</span>
            <Badge variant={scriptCredits > 0 ? "success" : "danger"}>
              {scriptCredits}
            </Badge>
          </div>

          {/* Script Content */}
          <Card variant="default" padding="none" className="overflow-hidden">
            {currentScript.outline && Array.isArray(currentScript.outline) && (
              <div className="p-6 bg-gray-50 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Outline
                </h3>
                <div className="space-y-2">
                  {currentScript.outline.map((section: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-sm text-gray-600"
                    >
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-medium">
                        {i + 1}
                      </span>
                      <span>{section.title}</span>
                      {section.timestamp && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {section.timestamp}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border-b border-gray-200 px-6 py-3 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentScript.content || "");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy
              </button>
              <button
                onClick={() => {
                  const blob = new Blob([currentScript.content || ""], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${currentScript.title || currentScript.topic || "script"}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans">
                  {currentScript.content || "No content available"}
                </div>
              </div>
            </div>
          </Card>

          {/* SEO Suggestions — inline below script */}
          {currentScript.seoSuggestions ? (
            <Card variant="bordered" padding="lg">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                🔍 SEO Suggestions
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                    Keywords
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentScript.seoSuggestions.keywords?.map(
                      (kw: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {kw}
                        </span>
                      ),
                    ) || <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                    Hashtags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentScript.seoSuggestions.hashtags?.map(
                      (ht: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {ht}
                        </span>
                      ),
                    ) || <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {currentScript.seoSuggestions.tags?.map(
                      (tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ),
                    ) || <span className="text-xs text-gray-400">None</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">
                    Title Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {currentScript.seoSuggestions.titleSuggestions?.map(
                      (title: string, i: number) => (
                        <li
                          key={i}
                          className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700"
                        >
                          {title}
                        </li>
                      ),
                    ) || <li className="text-xs text-gray-400">None</li>}
                  </ul>
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400">SEO suggestions not available yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Thumbnail Tab */}
      {activeTab === "thumbnail" && (
        <div className="space-y-6">
          {/* Credit badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Remaining Thumbnail Credits:</span>
            <Badge variant={thumbnailCredits > 0 ? "success" : "danger"}>
              {thumbnailCredits}
            </Badge>
          </div>

          <Card variant="default" padding="lg">
            {currentScript.thumbnailConcepts?.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentScript.thumbnailConcepts.map(
                    (concept: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                      >
                        <div className="w-full aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {concept.imageUrl ? (
                            <img
                              src={concept.imageUrl}
                              alt={`Thumbnail concept ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-4xl">🎨</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {concept.conceptDescription}
                        </p>
                        {concept.textOverlaySuggestion && (
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Text:</span>{" "}
                            {concept.textOverlaySuggestion}
                          </p>
                        )}
                      </div>
                    ),
                  )}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateThumbnails}
                    loading={generatingThumbnails}
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate Thumbnails
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">🎨</div>
                <p className="text-sm text-gray-500 mb-4">
                  Generate an AI thumbnail image from your script content and SEO keywords.
                </p>
                {thumbnailError && (
                  <p className="text-sm text-red-500 mb-4">{thumbnailError}</p>
                )}
                <Button
                  variant="primary"
                  onClick={handleGenerateThumbnails}
                  loading={generatingThumbnails}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Generate Thumbnails
                </Button>
                <p className="text-xs text-gray-400 mt-3">
                  Uses 1 thumbnail credit. Only charged on successful image generation.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Script Info Footer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Status</p>
          <Badge variant="success">Completed</Badge>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Words</p>
          <p className="text-lg font-semibold text-gray-900">
            {currentScript.wordCount || 0}
          </p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Script Credits</p>
          <p className="text-lg font-semibold text-gray-900">{scriptCredits}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500">Thumbnail Credits</p>
          <p className="text-lg font-semibold text-gray-900">{thumbnailCredits}</p>
        </div>
      </div>
    </div>
  );
}