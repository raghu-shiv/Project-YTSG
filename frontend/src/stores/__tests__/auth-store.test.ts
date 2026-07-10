import { describe, it, expect, beforeEach, vi } from "vitest";
import { useAuthStore } from "../auth-store";
import { apiClient } from "@/lib/api";

// Mock apiClient
vi.mock("@/lib/api", () => ({
  apiClient: vi.fn(),
}));

const mockedApiClient = vi.mocked(apiClient);

describe("auth-store", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      token: null,
      isInitialized: false,
      isLoading: false,
    });
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isInitialized).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  it("should set user and token on successful login", async () => {
    const mockUser = { id: "1", email: "test@test.com", name: "Test", creditBalance: 5 };
    const mockToken = "mock-jwt-token";
    mockedApiClient.mockResolvedValueOnce({ user: mockUser, token: mockToken });

    await useAuthStore.getState().login("test@test.com", "password123");

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe("test@test.com");
    expect(state.token).toBe(mockToken);
    expect(localStorage.getItem("ysg-token")).toBe(mockToken);
    expect(mockedApiClient).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: { email: "test@test.com", password: "password123" },
    });
  });

  it("should throw error on failed login", async () => {
    mockedApiClient.mockRejectedValueOnce(new Error("Invalid credentials"));

    await expect(
      useAuthStore.getState().login("test@test.com", "wrong"),
    ).rejects.toThrow("Invalid credentials");
  });

  it("should set user and token on successful register", async () => {
    const mockUser = { id: "1", email: "test@test.com", name: "Test", creditBalance: 5 };
    const mockToken = "mock-jwt-token";
    mockedApiClient.mockResolvedValueOnce({ user: mockUser, token: mockToken });

    await useAuthStore.getState().register("test@test.com", "password123", "Test");

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe("test@test.com");
    expect(state.token).toBe(mockToken);
    expect(localStorage.getItem("ysg-token")).toBe(mockToken);
    expect(mockedApiClient).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { email: "test@test.com", password: "password123", name: "Test" },
    });
  });

  it("should clear user and token on logout", () => {
    localStorage.setItem("ysg-token", "mock-token");
    useAuthStore.setState({
      user: { id: "1", email: "test@test.com", name: "Test", creditBalance: 5 },
      token: "mock-token",
      isInitialized: true,
    });

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem("ysg-token")).toBeNull();
  });

  it("should update credit balance", () => {
    useAuthStore.setState({
      user: { id: "1", email: "test@test.com", name: "Test", creditBalance: 5 },
      isInitialized: true,
    });

    useAuthStore.getState().updateCredits(10);

    const state = useAuthStore.getState();
    expect(state.user?.creditBalance).toBe(10);
  });

  it("should set user via setUser", () => {
    const mockUser = { id: "2", email: "new@test.com", name: "New User" };
    useAuthStore.getState().setUser(mockUser);

    expect(useAuthStore.getState().user?.email).toBe("new@test.com");
  });

  it("should fetch profile when token exists on initialize", async () => {
    const mockUser = { id: "1", email: "test@test.com", name: "Test", creditBalance: 10 };
    localStorage.setItem("ysg-token", "valid-token");
    mockedApiClient.mockResolvedValueOnce(mockUser);

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe("test@test.com");
    expect(state.isInitialized).toBe(true);
  });

  it("should clear state on failed profile fetch", async () => {
    localStorage.setItem("ysg-token", "expired-token");
    mockedApiClient.mockRejectedValueOnce(new Error("Unauthorized"));

    await useAuthStore.getState().initialize();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isInitialized).toBe(true);
  });
});