"use client";

import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { useId, useRef, useState } from "react";

const HOVER_OPEN_DELAY_MS = 150;
const HOVER_CLOSE_DELAY_MS = 250;

export default function NavDropdown({ item }: { item: Menu }) {
  const [open, setOpen] = useState(false);
  const liRef = useRef<HTMLLIElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const panelId = useId();

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const scheduleOpen = () => {
    clearTimers();
    openTimer.current = setTimeout(() => setOpen(true), HOVER_OPEN_DELAY_MS);
  };

  const scheduleClose = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(false), HOVER_CLOSE_DELAY_MS);
  };

  const closeNow = () => {
    clearTimers();
    setOpen(false);
  };

  return (
    <li
      ref={liRef}
      className="relative"
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          closeNow();
          triggerRef.current?.focus();
        }
      }}
      onBlur={(e) => {
        if (!liRef.current?.contains(e.relatedTarget as Node | null)) {
          closeNow();
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className="flex items-center gap-1 text-neutral-300 underline-offset-4 hover:text-white hover:underline"
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            const firstLink = liRef.current?.querySelector("a");
            (firstLink as HTMLAnchorElement | null)?.focus();
          }
        }}
      >
        {item.title}
        <ChevronDownIcon className="h-3 w-3" aria-hidden />
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute top-full left-0 z-(--z-index-dropdown) min-w-40 rounded-md border border-neutral-200 bg-white py-2 shadow-md dark:border-neutral-700 dark:bg-black"
        >
          <ul>
            {item.items?.map((child) => (
              <li key={child.title}>
                <Link
                  href={child.path}
                  prefetch={true}
                  className="block px-4 py-2 text-sm text-neutral-500 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
                >
                  {child.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}
