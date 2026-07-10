import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LazySection from "./LazySection";

describe("LazySection", () => {
  it("renders children immediately when immediate prop is true", () => {
    render(
      <LazySection immediate>
        <div>Visible Content</div>
      </LazySection>,
    );
    expect(screen.getByText("Visible Content")).toBeInTheDocument();
  });

  it("shows placeholder when not visible", () => {
    render(
      <LazySection placeholder={<div>Loading...</div>}>
        <div>Hidden Content</div>
      </LazySection>,
    );
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows spinner placeholder by default", () => {
    const { container } = render(
      <LazySection>
        <div>Hidden</div>
      </LazySection>,
    );
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("applies className to wrapper", () => {
    const { container } = render(
      <LazySection className="test-class" immediate>
        <div>Content</div>
      </LazySection>,
    );
    const wrapper = container.firstChild;
    expect(wrapper?.className).toContain("test-class");
  });
});