"use client";

import clsx from "clsx";
import { MenuItem } from "lib/shopify/types";
import Link from "next/link";
import { ReactNode, useRef, useState } from "react";

// Distributes level-3 groups across the panel columns without reordering:
// authored order is preserved by cutting to the next column once a group's
// midpoint overshoots the column's even share of the weight still to place,
// so wildly uneven groups don't shuffle. Weight ≈ rendered rows (heading +
// links + inter-group gap); a childless group renders as one plain link.
function distributeGroups(groups: MenuItem[], count: number): MenuItem[][] {
  if (groups.length === 0) return [];
  const weightOf = (group: MenuItem) =>
    group.items.length > 0 ? group.items.length + 2 : 1;
  let unplaced = groups.reduce((sum, group) => sum + weightOf(group), 0);
  const columns: MenuItem[][] = [];
  let column: MenuItem[] = [];
  let columnWeight = 0;
  for (const group of groups) {
    const columnsLeft = count - columns.length;
    if (
      column.length > 0 &&
      columns.length < count - 1 &&
      columnWeight + weightOf(group) / 2 >
        (columnWeight + unplaced) / columnsLeft
    ) {
      columns.push(column);
      column = [];
      columnWeight = 0;
    }
    column.push(group);
    columnWeight += weightOf(group);
    unplaced -= weightOf(group);
  }
  columns.push(column);
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
      <div className="h-12 border-b border-tl-shell-line bg-tl-shell-deep transition-[height] group-data-[condensed]:h-11">
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
                  // Pure white for every item, panel or not. The dimmed state
                  // that used to mark childless items was hard to read on the
                  // dark nav, and the caret already says which ones open.
                  "relative flex h-full items-center gap-[5px] font-tl-sans text-xs font-semibold uppercase tracking-[0.1em] text-white",
                  open === index &&
                    // White, not indigo: the brand blue is barely visible on the dark
                    // nav, and this marker has one job.
                    "after:absolute after:inset-x-0 after:-bottom-px after:h-[2.5px] after:bg-white",
                )}
              >
                {item.title}
                {hasPanel ? (
                  <span aria-hidden className="text-[8px] text-white">
                    ▾
                  </span>
                ) : null}
              </Link>
            );
          })}
          <div className="ml-auto h-full">{garage}</div>
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
  // Level-2 items styled "links-row" are pulled out of the rail: their
  // children render as the links row beneath the rule.
  const linksRow = item.items
    .filter((child) => child.style === "links-row")
    .flatMap((child) => child.items);
  const railItems = item.items.filter((child) => child.style !== "links-row");
  const active = railItems[Math.min(rail, Math.max(railItems.length - 1, 0))];
  const columns = active ? distributeGroups(active.items, 3) : [];

  // The rail exists to show one item's children beside all the others' names.
  // A section where nothing has children — Community, Custom Work — has no
  // second level to show, so the rail would sit beside a permanently empty
  // body. Those render flat instead: the items themselves, with room for the
  // line of copy the rail's 44px rows have nowhere to put.
  //
  // The split is at level 3, not level 4: a section whose rail items have
  // childless children still fills the body, because a childless group renders
  // as a plain link (below).
  const hasAnyChildren = railItems.some(
    (railItem) => railItem.items.length > 0,
  );

  if (!hasAnyChildren && railItems.length > 0) {
    return (
      <PanelShell>
        <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pb-[34px] pt-[30px]">
          <FlatItems items={railItems} />
          {linksRow.length > 0 ? <LinksRow links={linksRow} /> : null}
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell>
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
            <div className="grid grid-cols-3 gap-x-10">
              {columns.map((column, columnIndex) => (
                <div
                  key={columnIndex}
                  className="grid content-start gap-y-[26px]"
                >
                  {column.map((group, groupIndex) => (
                    <div key={`${group.title}-${groupIndex}`}>
                      {/* Level-3 group: heading with its level-4 links below.
                          A childless group reads as a plain link, so a menu
                          that is only three levels deep (e.g. the native-menu
                          fallback) renders as the familiar flat column. */}
                      {group.items.length > 0 ? (
                        group.path === "#" ? (
                          <span className="font-tl-text text-sm font-semibold text-tl-ink">
                            {group.title}
                          </span>
                        ) : (
                          <Link
                            href={group.path}
                            prefetch={true}
                            className="font-tl-text text-sm font-semibold text-tl-ink"
                          >
                            {group.title}
                          </Link>
                        )
                      ) : (
                        <Link
                          href={group.path}
                          prefetch={true}
                          className="font-tl-text text-sm text-tl-ink"
                        >
                          {group.title}
                        </Link>
                      )}
                      {group.items.length > 0 ? (
                        <ul className="mt-2.5 grid list-none gap-2.5 p-0">
                          {group.items.map((link, linkIndex) => (
                            <li key={`${link.title}-${linkIndex}`}>
                              <Link
                                href={link.path}
                                prefetch={true}
                                className="font-tl-text text-sm text-tl-ink"
                              >
                                {link.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : active ? (
            // A childless item inside a section that otherwise has depth: the
            // rail stays, because dropping it would hide its siblings'
            // contents and restructure the panel under the cursor. It gets a
            // body of its own instead of the empty-section message.
            <div className="max-w-[46ch]">
              <p className="font-tl-text text-sm font-semibold text-tl-ink">
                {active.title}
              </p>
              {active.description ? (
                <p className="mt-2 font-tl-text text-sm text-tl-steel">
                  {active.description}
                </p>
              ) : null}
              <Link
                href={active.path}
                prefetch={true}
                className="mt-4 inline-flex items-center gap-[7px] font-tl-text text-xs font-medium text-tl-indigo"
              >
                Visit {active.title}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            // Only reachable when every level-2 item is styled "links-row",
            // leaving no rail at all.
            <p className="font-tl-text text-sm text-tl-mute-white">
              More {item.title.toLowerCase()} coming soon.
            </p>
          )}

          {linksRow.length > 0 ? <LinksRow links={linksRow} /> : null}
        </div>
      </div>
    </PanelShell>
  );
}

function PanelShell({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-x-0 top-full z-50 border-b-[2.5px] border-tl-indigo bg-white shadow-[0_26px_60px_-20px_rgba(15,20,48,0.45)]">
      {children}
    </div>
  );
}

// The flat layout: level-2 items as the content itself, as cards.
//
// Bare headings and a line of copy left the panel reading as empty however
// they were arranged — spread across the container they looked marooned,
// clustered at one end they left the other half dead. The problem was that
// text alone has no visual container in a full-bleed white band. Cards give
// the content edges, so filling the width now looks deliberate.
function FlatItems({ items }: { items: MenuItem[] }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {items.map((child) => (
        <Link
          key={child.title}
          href={child.path}
          prefetch={true}
          className="group/card flex min-h-[104px] flex-col rounded-[3px] border border-tl-hairline bg-tl-fog p-5 transition-colors hover:border-tl-ink hover:bg-white"
        >
          <span className="font-tl-sans text-sm font-bold uppercase tracking-[0.06em] text-tl-ink">
            {child.title}
          </span>
          {child.description ? (
            <span className="mt-2 font-tl-text text-sm leading-snug text-tl-steel">
              {child.description}
            </span>
          ) : null}
          <span
            aria-hidden
            className="mt-auto pt-3 font-tl-sans text-xs font-semibold text-tl-indigo opacity-0 transition-opacity group-hover/card:opacity-100"
          >
            View →
          </span>
        </Link>
      ))}
    </div>
  );
}

function LinksRow({ links }: { links: MenuItem[] }) {
  return (
    <div className="mt-[26px] flex flex-wrap gap-[30px] border-t border-tl-hairline pt-5">
      {links.map((link, linkIndex) => (
        <Link
          key={`${link.title}-${linkIndex}`}
          href={link.path}
          prefetch={true}
          className="flex items-center gap-[7px] font-tl-text text-xs font-medium text-tl-indigo"
        >
          <span aria-hidden>◆</span>
          {link.title}
        </Link>
      ))}
    </div>
  );
}
