"use client";

import { HTMLAttributes, forwardRef } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "bordered" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
}

const cardVariants = {
  default: "bg-white shadow-sm border border-gray-200",
  bordered: "bg-white border-2 border-indigo-100",
  elevated: "bg-white shadow-lg border border-gray-100",
  outlined: "bg-white border border-gray-200",
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { className, variant = "default", padding = "md", children, ...props },
    ref,
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-xl transition-all duration-200",
          cardVariants[variant],
          paddings[padding],
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";
