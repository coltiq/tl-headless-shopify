"use client";

import clsx from "clsx";
import { MenuItem } from "lib/shopify/types";
import Link from "next/link";
import { ReactNode, useRef, useState } from "react";

// A level-2 item titled "Resources" is pulled out of the rail: its children
// render as the links row beneath the rule (the menu has no fourth level).
const isResources = (item: MenuItem) =>
  item.title.toLowerCase() === "resources";

function chunkColumns<T>(items: T[], count: number): T[][] {
  const size = Math.ceil(items.length / count) || 1;
  const columns: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    columns.push(items.slice(i, i + size));
  }
  return columns;
}

export function DesktopNav({
  items,
  garage,
}: {
  items: MenuItem[];
  garage: ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [rail, setRail] = useState(0);
  const lastPointerWasTouch = useRef(false);

  const close = () => setOpen(null);
  // First rail item preselected so the panel is never half-empty.
  const openPanel = (index: number) => {
    setOpen(index);
    setRail(0);
  };

  const openItem = open !== null ? items[open] : undefined;

  return (
    <div
      className="relative hidden md:block"
      onMouseLeave={close}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
    >
      <div className="h-12 border-b border-tl-hairline transition-[height] group-data-[condensed]:h-11">
        <div className="page-width flex h-full items-center gap-8">
          {items.map((item, index) => {
            const hasPanel = item.items.length > 0;
            return (
              <Link
                key={item.title}
                href={item.path}
                prefetch={true}
                aria-expanded={hasPanel ? open === index : undefined}
                onMouseEnter={() => (hasPanel ? openPanel(index) : close())}
                onFocus={() => (hasPanel ? openPanel(index) : close())}
                onPointerDown={(e) => {
                  lastPointerWasTouch.current = e.pointerType === "touch";
                }}
                onClick={(e) => {
                  // First tap opens the panel; the second tap follows the link,
                  // so touchscreens are never trapped in a hover-only menu.
                  if (
                    hasPanel &&
                    lastPointerWasTouch.current &&
                    open !== index
                  ) {
                    e.preventDefault();
                    openPanel(index);
                  }
                }}
                className={clsx(
                  "relative flex h-full items-center gap-[5px] font-tl-sans text-xs font-semibold uppercase tracking-[0.1em]",
                  hasPanel ? "text-tl-ink" : "text-tl-steel",
                  open === index &&
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-[2.5px] after:bg-tl-indigo",
                )}
              >
                {item.title}
                {hasPanel ? (
                  <span aria-hidden className="text-[8px] text-tl-steel">
                    ▾
                  </span>
                ) : null}
              </Link>
            );
          })}
          <div className="ml-auto">{garage}</div>
        </div>
      </div>

      {openItem && openItem.items.length > 0 ? (
        <MegaPanel item={openItem} rail={rail} onRailChange={setRail} />
      ) : null}
    </div>
  );
}

function MegaPanel({
  item,
  rail,
  onRailChange,
}: {
  item: MenuItem;
  rail: number;
  onRailChange: (index: number) => void;
}) {
  const resources = item.items.find(isResources);
  const railItems = item.items.filter((i) => !isResources(i));
  const active = railItems[Math.min(rail, Math.max(railItems.length - 1, 0))];
  const columns = active ? chunkColumns(active.items, 3) : [];

  return (
    <div className="absolute inset-x-0 top-full z-50 border-b-[2.5px] border-tl-indigo bg-white shadow-[0_26px_60px_-20px_rgba(15,20,48,0.45)]">
      {/* No gutter padding here: the fog rail runs to the page-width boundary
          while its items carry the gutter, keeping text aligned with the nav. */}
      <div className="mx-auto grid max-w-(--container-page) grid-cols-[262px_1fr]">
        <div className="border-r border-tl-hairline bg-tl-fog py-5">
          {railItems.map((railItem, index) => {
            const isActive = index === rail;
            return (
              <Link
                key={railItem.title}
                href={railItem.path}
                prefetch={true}
                onMouseEnter={() => onRailChange(index)}
                onFocus={() => onRailChange(index)}
                className={clsx(
                  "flex h-11 items-center px-(--spacing-gutter) font-tl-text text-sm text-tl-ink",
                  isActive
                    ? "bg-white font-semibold shadow-[inset_3px_0_0_var(--color-tl-indigo)]"
                    : "font-medium",
                )}
              >
                {railItem.title}
                <span
                  aria-hidden
                  className={clsx(
                    "ml-auto text-[11px]",
                    isActive ? "text-tl-indigo" : "text-tl-mute",
                  )}
                >
                  {isActive ? "→" : "›"}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="px-(--spacing-gutter) pb-[30px] pt-[26px]">
          {columns.length > 0 ? (
            <div className="grid grid-cols-3 gap-x-10 gap-y-[26px]">
              {columns.map((column, columnIndex) => (
                <ul key={columnIndex} className="grid list-none gap-2.5 p-0">
                  {column.map((link, linkIndex) => (
                    <li key={link.title}>
                      <Link
                        href={link.path}
                        prefetch={true}
                        className={clsx(
                          "font-tl-text text-sm text-tl-ink",
                          columnIndex === 0 &&
                            linkIndex === 0 &&
                            "font-semibold",
                        )}
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          ) : (
            <p className="font-tl-text text-sm text-tl-mute-white">
              More {item.title.toLowerCase()} coming soon.
            </p>
          )}

          {resources && resources.items.length > 0 ? (
            <div className="mt-[26px] flex flex-wrap gap-[30px] border-t border-tl-hairline pt-5">
              {resources.items.map((link) => (
                <Link
                  key={link.title}
                  href={link.path}
                  prefetch={true}
                  className="flex items-center gap-[7px] font-tl-text text-xs font-medium text-tl-indigo"
                >
                  <span aria-hidden>◆</span>
                  {link.title}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
