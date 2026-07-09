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
    fetchScripts();
  }, [fetchScripts]);

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

  if (isLoading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Scripts</h1>
          <p className="text-gray-500 mt-1">
            All your generated scripts in one place
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")} variant="primary">
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Script
        </Button>
      </div>

      {scripts.length === 0 ? (
        <Card variant="default" padding="lg" className="text-center py-16">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No scripts yet
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Create your first script to get started
          </p>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="primary"
            size="lg"
          >
            Create Your First Script
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {scripts.map((script: any, index: number) => (
            <div
              key={script.id}
              onClick={() => router.push(`/dashboard/scripts/${script.id}`)}
              className="group bg-white p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all duration-200 animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
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
                      {script.wordCount || 0} words ·{" "}
                      {new Date(script.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {getStatusBadge(script.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
