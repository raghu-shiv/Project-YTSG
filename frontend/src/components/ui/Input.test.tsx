import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Input } from "./Input";

describe("Input", () => {
  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("renders input element", () => {
    render(<Input label="Name" placeholder="Enter name" />);
    expect(screen.getByPlaceholderText("Enter name")).toBeInTheDocument();
  });

  it("calls onChange handler", () => {
    const handleChange = vi.fn();
    render(<Input label="Test" onChange={handleChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "new value" } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it("displays error message", () => {
    render(<Input label="Test" error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("applies error styling", () => {
    const { container } = render(<Input label="Test" error="Error" />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("border-red-300");
  });

  it("forwards ref correctly", () => {
    const ref = { current: null };
    render(<Input label="Ref test" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});