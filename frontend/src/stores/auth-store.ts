import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@/lib/api";

type User = {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  creditBalance?: number;
};

type AuthState = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  setUser: (user: User) => void;
  updateCredits: (balance: number) => void;
  initialize: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,

      login: (token: string, user: User) => {
        localStorage.setItem("token", token);
        set({ token, user, isLoading: false, isInitialized: true });
      },

      logout: () => {
        localStorage.removeItem("token");
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
          localStorage.removeItem("token");
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

      updateCredits: (balance: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, creditBalance: balance } });
        }
      },

      initialize: async () => {
        const { token } = get();
        if (!token) {
          set({ isInitialized: true });
          return;
        }
        await get().fetchProfile();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    },
  ),
);
