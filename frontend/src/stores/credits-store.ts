import { create } from "zustand";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "./auth-store";

type Transaction = {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
};

type CreditsState = {
  balance: number;
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchBalance: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  purchaseCredits: (planId: string, amount: number) => Promise<void>;
  clearError: () => void;
};

export const useCreditsStore = create<CreditsState>()((set) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  error: null,

  fetchBalance: async () => {
    try {
      const data = await apiClient("/credits/balance");
      const balance = data.balance ?? data.creditBalance ?? 0;
      set({ balance });
      // Sync with auth store so sidebar shows correct balance
      useAuthStore.getState().updateCredits(balance);
    } catch (err: any) {
      set({ error: err.message || "Failed to fetch balance" });
    }
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const transactions = await apiClient("/credits/transactions");
      set({ transactions, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to fetch transactions",
        isLoading: false,
      });
    }
  },

  purchaseCredits: async (planId: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiClient("/payments/create-order", {
        method: "POST",
        body: { planId, amount },
      });
      // After successful payment, refresh balance
      if (result.success) {
        await useCreditsStore.getState().fetchBalance();
      }
      set({ isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || "Failed to purchase credits",
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
