import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("applies variant classes", () => {
    const { container } = render(<Card variant="elevated">Elevated</Card>);

    const card = container.firstElementChild;
    expect(card).toBeInstanceOf(HTMLElement);
    expect(card).toHaveClass("shadow-lg");
  });

  it("applies padding classes", () => {
    const { container } = render(<Card padding="sm">Small padding</Card>);

    const card = container.firstElementChild;
    expect(card).toBeInstanceOf(HTMLElement);
    expect(card).toHaveClass("p-4");
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom-class">Custom</Card>);

    const card = container.firstElementChild;
    expect(card).toBeInstanceOf(HTMLElement);
    expect(card).toHaveClass("custom-class");
  });
});
