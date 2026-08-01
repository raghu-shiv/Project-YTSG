"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Badge, LoadingSpinner } from "@/components/ui";
import { useScriptsStore } from "@/stores";

export default function ScriptsPage() {
  const router = useRouter();
  const scripts = useScriptsStore((state) => state.scripts);
  const isLoading = useScriptsStore((state) => state.isLoading);
  const fetchScripts = useScriptsStore((state) => state.fetchScripts);

  useEffect(() => {
    document.title = "My Scripts | YT Scripts";
    fetchScripts().catch(() => {
      // Error handled silently in store
    });
  }, [fetchScripts]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "generating":
        return <Badge variant="warning">Generating...</Badge>;
      case "failed":
        return <Badge variant="error">Failed</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getVideoTypeIcon = (videoType: string) => {
    switch (videoType?.toLowerCase()) {
      case "educational":
        return "🎓";
      case "tech review":
        return "💻";
      case "tutorial":
        return "📖";
      case "vlog":
        return "🎬";
      case "listicle":
        return "📋";
      case "review":
        return "⭐";
      default:
        return "📺";
    }
  };

  if (isLoading && scripts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Scripts</h1>
          <p className="text-gray-500 mt-1">
            {scripts.length} {scripts.length === 1 ? "script" : "scripts"} generated
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")}>Generate New</Button>
      </div>

      {scripts.length === 0 ? (
        <Card variant="outlined" padding="lg">
          <div className="text-center py-12">
            <div className="text-4xl mb-4" aria-hidden="true">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No scripts yet
            </h3>
            <p className="text-gray-500 mb-6">
              Generate your first AI-powered YouTube script.
            </p>
            <Button onClick={() => router.push("/dashboard")}>
              Create Your First Script
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4" role="list" aria-label="Script list">
          {scripts.map((script: any) => (
            <Card
              key={script.id}
              variant="outlined"
              padding="md"
              className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all"
              onClick={() => router.push(`/dashboard/scripts/${script.id}`)}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  router.push(`/dashboard/scripts/${script.id}`);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-2xl flex-shrink-0" aria-hidden="true">
                    {getVideoTypeIcon(script.videoType)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {script.title || script.topic}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {script.videoType
                        ? `${script.videoType} • `
                        : ""}
                      {script.wordCount
                        ? `${script.wordCount} words`
                        : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {getStatusBadge(script.status)}
                  <span className="text-xs text-gray-400">
                    {new Date(script.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}