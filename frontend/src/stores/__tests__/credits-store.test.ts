import { describe, it, expect, beforeEach, vi } from "vitest";
import { useCreditsStore } from "../credits-store";

vi.mock("@/lib/api", () => ({
  apiClient: vi.fn(),
}));

vi.mock("../auth-store", () => ({
  useAuthStore: {
    getState: vi.fn(() => ({
      updateScriptCredits: vi.fn(),
      updateThumbnailCredits: vi.fn(),
    })),
  },
}));

describe("credits-store", () => {
  beforeEach(() => {
    useCreditsStore.setState({
      scriptCredits: 0,
      thumbnailCredits: 0,
      transactions: [],
      isLoading: false,
      error: null,
    });
  });

  it("should initialize with default state", () => {
    const state = useCreditsStore.getState();

    expect(state.scriptCredits).toBe(0);
    expect(state.thumbnailCredits).toBe(0);
    expect(state.transactions).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("should clear error", () => {
    useCreditsStore.setState({
      error: "Some error",
    });

    useCreditsStore.getState().clearError();

    expect(useCreditsStore.getState().error).toBeNull();
  });

  it("should update script and thumbnail credits independently", () => {
    useCreditsStore.setState({
      scriptCredits: 10,
      thumbnailCredits: 5,
    });

    const state = useCreditsStore.getState();

    expect(state.scriptCredits).toBe(10);
    expect(state.thumbnailCredits).toBe(5);
  });
});
