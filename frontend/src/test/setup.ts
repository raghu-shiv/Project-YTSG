import "@testing-library/jest-dom";
import React from "react";

// Make React available globally for JSX transform
(globalThis as any).React = React;

// Mock IntersectionObserver for LazySection tests
(globalThis as any).IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};