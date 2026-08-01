import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";

type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneVerified?: boolean;
  emailVerified?: boolean;
  role?: string;
  scriptCredits?: number;
  thumbnailCredits?: number;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  updateScriptCredits: (credits: number) => void;
  updateThumbnailCredits: (credits: number) => void;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const data = await apiClient("/auth/login", {
            method: "POST",
            body: { email, password },
          });
          localStorage.setItem("ysg-token", data.token);
          set({ token: data.token, user: data.user, isLoading: false, isInitialized: true });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.message || "Login failed");
        }
      },

      register: async (email: string, password: string, name?: string) => {
        set({ isLoading: true });
        try {
          const data = await apiClient("/auth/register", {
            method: "POST",
            body: { email, password, name },
          });
          localStorage.setItem("ysg-token", data.token);
          set({ token: data.token, user: data.user, isLoading: false, isInitialized: true });
        } catch (err: any) {
          set({ isLoading: false });
          throw new Error(err.message || "Registration failed");
        }
      },

      logout: () => {
        localStorage.removeItem("ysg-token");
        set({ token: null, user: null, isLoading: false });
      },

      fetchProfile: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const user = await apiClient("/users/profile");
          set({ user, isLoading: false, isInitialized: true });
        } catch {
          localStorage.removeItem("ysg-token");
          set({
            token: null,
            user: null,
            isLoading: false,
            isInitialized: true,
          });
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setToken: (token: string) => {
        localStorage.setItem("ysg-token", token);
        set({ token });
      },

      updateScriptCredits: (credits: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, scriptCredits: credits } });
        }
      },

      updateThumbnailCredits: (credits: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, thumbnailCredits: credits } });
        }
      },

      initialize: async () => {
        const token = localStorage.getItem("ysg-token");
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        set({ token });
        try {
          const user = await apiClient("/users/profile");
          set({ user, isLoading: false, isInitialized: true });
        } catch {
          localStorage.removeItem("ysg-token");
          set({ token: null, user: null, isLoading: false, isInitialized: true });
        }
      },
    }),
    {
      name: "ysg-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);