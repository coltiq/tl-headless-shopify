"use client";

import Search, { SearchSkeleton } from "components/layout/search";
import { Suspense, useEffect, useRef } from "react";

export default function MobileSearchPanel({ isOpen }: { isOpen: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const focusIfPresent = () => {
      const input = container.querySelector("input");
      if (input && document.activeElement !== input) {
        input.focus();
        return true;
      }
      return false;
    };

    if (focusIfPresent()) return;

    const observer = new MutationObserver(() => {
      if (focusIfPresent()) observer.disconnect();
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="mobile-search-panel"
      ref={containerRef}
      className="page-width absolute top-full left-0 z-(--z-index-dropdown) w-full bg-neutral-900 py-3 shadow-md"
    >
      <Suspense fallback={<SearchSkeleton />}>
        <Search />
      </Suspense>
    </div>
  );
}
