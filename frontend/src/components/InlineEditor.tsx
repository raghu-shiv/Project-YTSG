"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { apiClient } from "@/lib/api";

interface InlineEditorProps {
  initialContent: string;
  scriptId: string;
}

export function InlineEditor({ initialContent, scriptId }: InlineEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">(
    "idle",
  );
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showDownload, setShowDownload] = useState(false);

  const save = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        await apiClient(`/scripts/${scriptId}`, {
          method: "PUT",
          body: { content: text },
        });
        setSaveStatus("saved");
      } catch {
        setSaveStatus("idle");
      }
    },
    [scriptId],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setContent(text);
    setSaveStatus("idle");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(text), 2000);
  };

  const handleDownload = async (format: "txt" | "docx") => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scripts/${scriptId}/download?format=${format}`,
        {
        headers: { Authorization: `Bearer ${localStorage.getItem("ysg-token")}` },
        },
      );
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `script-${scriptId}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: download as plain text
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `script-${scriptId}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setShowDownload(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className="w-3 h-3 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          )}
          {saveStatus === "saved" && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Saved
            </span>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setShowDownload(!showDownload)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
          {showDownload && (
            <>
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px] overflow-hidden">
                <button
                  onClick={() => handleDownload("txt")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  .txt
                </button>
                <button
                  onClick={() => handleDownload("docx")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  .docx
                </button>
              </div>
              <div
                className="fixed inset-0 z-0"
                onClick={() => setShowDownload(false)}
              />
            </>
          )}
        </div>
      </div>
      <textarea
        value={content}
        onChange={handleChange}
        className="w-full min-h-[400px] p-4 bg-white border border-gray-200 rounded-xl text-sm leading-relaxed text-gray-700 font-sans resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        placeholder="Start writing your script..."
      />
    </div>
  );
}
