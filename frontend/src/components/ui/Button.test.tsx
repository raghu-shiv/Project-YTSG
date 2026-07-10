import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant classes correctly", () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("bg-indigo-600");
  });

  it("applies size classes correctly", () => {
    const { container } = render(<Button size="sm">Small</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("rounded-lg");
  });

  it("shows loading spinner when loading", () => {
    const { container } = render(<Button loading>Loading</Button>);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("disables button when loading", () => {
    render(
      <Button loading onClick={vi.fn()}>
        Loading
      </Button>,
    );
    expect(screen.getByText("Loading").closest("button")).toBeDisabled();
  });

  it("disables button when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText("Disabled").closest("button")).toBeDisabled();
  });
});