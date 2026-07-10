"use client";

import { useRef, useEffect, useState, ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Optional placeholder shown while loading */
  placeholder?: ReactNode;
  /** Override the default root margin (default: "200px") */
  rootMargin?: string;
  /** Skip lazy loading and render immediately */
  immediate?: boolean;
}

export default function LazySection({
  children,
  className = "",
  id,
  placeholder,
  rootMargin = "200px",
  immediate = false,
}: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(immediate);

  useEffect(() => {
    if (immediate) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, immediate]);

  return (
    <div ref={ref} id={id} className={className}>
      {isVisible
        ? children
        : placeholder || (
            <div className="min-h-[200px] flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
    </div>
  );
}