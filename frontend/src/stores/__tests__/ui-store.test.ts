import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "../ui-store";

describe("ui-store", () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true });
  });

  it("should initialize with sidebar open", () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
  });

  it("should toggle sidebar", () => {
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("should set sidebar explicitly", () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);

    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });
});