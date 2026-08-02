import { create } from "zustand";
import { apiClient } from "@/lib/api";

type Script = {
  id: string;
  title?: string;
  topic: string;
  videoType: string;
  content?: string;
  status: string;
  wordCount?: number;
  modelUsed?: string;
  createdAt: string;
  updatedAt: string;
};

type GenerationProgress = {
  stage: string;
  progress: number;
  message: string;
};

type ScriptsState = {
  scripts: Script[];
  currentScript: Script | null;
  isGenerating: boolean;
  isLoading: boolean;
  generationProgress: GenerationProgress | null;
  error: string | null;
  fetchScripts: () => Promise<void>;
  fetchScript: (id: string) => Promise<void>;
  generateScript: (
    topic: string,
    videoType: string,
    niche?: string,
  ) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  updateScript: (id: string, content: string) => Promise<void>;
  setCurrentScript: (script: Script | null) => void;
  setGenerationProgress: (progress: GenerationProgress | null) => void;
  clearError: () => void;
};

export const useScriptsStore = create<ScriptsState>()((set) => ({
  scripts: [],
  currentScript: null,
  isGenerating: false,
  isLoading: false,
  generationProgress: null,
  error: null,

  fetchScripts: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient("/scripts");
      set({ scripts: data.scripts || data || [], isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch scripts",
        isLoading: false,
      });
    }
  },

  fetchScript: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const script = await apiClient(`/scripts/${id}`);
      set({ currentScript: script, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch script", isLoading: false });
    }
  },

  generateScript: async (topic: string, videoType: string, niche?: string) => {
    set({ isGenerating: true, generationProgress: null, error: null });

    try {
      const result = await apiClient("/scripts", {
        method: "POST",
        body: { topic, videoType, nicheId: niche },
      });

      if (result.script) {
        set((state) => ({
          scripts: [result.script, ...state.scripts],
          currentScript: result.script,
          isGenerating: false,
          generationProgress: null,
        }));
      } else if (result.id) {
        set((state) => ({
          scripts: [result, ...state.scripts],
          currentScript: result,
          isGenerating: false,
          generationProgress: null,
        }));
      } else {
        set({
          isGenerating: true,
          generationProgress: {
            stage: "queued",
            progress: 0,
            message: "Script generation queued...",
          },
        });
      }
    } catch (err: any) {
      set({
        isGenerating: false,
        error: err.message || "Failed to generate script",
      });
    }
  },

  deleteScript: async (id: string) => {
    try {
      await apiClient(`/scripts/${id}`, { method: "DELETE" });
      set((state) => ({
        scripts: state.scripts.filter((s) => s.id !== id),
        currentScript:
          state.currentScript?.id === id ? null : state.currentScript,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to delete script" });
    }
  },

  updateScript: async (id: string, content: string) => {
    try {
      const updated = await apiClient(`/scripts/${id}`, {
        method: "PATCH",
        body: { content },
      });
      set((state) => ({
        scripts: state.scripts.map((s) => (s.id === id ? updated : s)),
        currentScript:
          state.currentScript?.id === id ? updated : state.currentScript,
      }));
    } catch (err: any) {
      set({ error: err.message || "Failed to update script" });
    }
  },

  setCurrentScript: (script: Script | null) => {
    set({ currentScript: script });
  },

  setGenerationProgress: (progress: GenerationProgress | null) => {
    set({ generationProgress: progress });
  },

  clearError: () => {
    set({ error: null });
  },
}));
