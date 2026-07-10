import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AuthNav } from "./AuthNav";
import { useAuthStore } from "@/stores/auth-store";

vi.mock("@/stores/auth-store", () => {
  const mockStore = vi.fn();
  return { useAuthStore: mockStore };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

describe("AuthNav", () => {
  it("shows login button when user is not logged in", () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { user: null, logout: vi.fn(), isLoading: false };
      return selector(state);
    });
    render(<AuthNav />);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Get Started Free")).toBeInTheDocument();
  });

  it("shows user name and dashboard when logged in", () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = {
        user: { email: "test@example.com", name: "Test User" },
        logout: vi.fn(),
        isLoading: false,
      };
      return selector(state);
    });
    render(<AuthNav />);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows email when user has no name", () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = {
        user: { email: "user@example.com" },
        logout: vi.fn(),
        isLoading: false,
      };
      return selector(state);
    });
    render(<AuthNav />);
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    (useAuthStore as any).mockImplementation((selector: any) => {
      const state = { user: null, logout: vi.fn(), isLoading: true };
      return selector(state);
    });
    const { container } = render(<AuthNav />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
