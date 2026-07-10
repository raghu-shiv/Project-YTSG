import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCreditsStore } from "../credits-store";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: vi.fn(),
}));

// Mock auth-store
vi.mock("../auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      updateCredits: vi.fn(),
    })),
  },
}));

describe("credits-store", () => {
  beforeEach(() => {
    useCreditsStore.setState({
      balance: 0,
      transactions: [],
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with default state", () => {
    const state = useCreditsStore.getState();
    expect(state.balance).toBe(0);
    expect(state.transactions).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should clear error", () => {
    useCreditsStore.setState({ error: "Some error" });
    useCreditsStore.getState().clearError();
    expect(useCreditsStore.getState().error).toBeNull();
  });
});