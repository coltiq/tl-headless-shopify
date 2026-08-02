"use client";

import clsx from "clsx";
import { MenuItem } from "lib/shopify/types";
import Link from "next/link";
import { Fragment, ReactNode, useRef, useState } from "react";

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

  // Dismissal is on click rather than on a pathname effect. usePathname() here
  // makes this route bail out of caching — the component sits outside any
  // Suspense boundary — and the click handlers fire immediately anyway, where
  // an effect would leave the panel up until the route committed.

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
                    return;
                  }
                  // Navigating, so the panel goes with it. Without this it
                  // stays up over the new page until the cursor happens to
                  // leave it, since onMouseLeave is the only other dismissal.
                  close();
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
        <MegaPanel
          item={openItem}
          rail={rail}
          onRailChange={setRail}
          onNavigate={close}
        />
      ) : null}
    </div>
  );
}

function MegaPanel({
  item,
  rail,
  onRailChange,
  onNavigate,
}: {
  item: MenuItem;
  rail: number;
  onRailChange: (index: number) => void;
  onNavigate: () => void;
}) {
  // Level-2 items styled "links-row" are pulled out of the rail: their
  // children render as the links row beneath the rule.
  const linksRow = item.items
    .filter((child) => child.style === "links-row")
    .flatMap((child) => child.items);
  // Same mechanic as links-row: the container is a holder, its children are the
  // content. Rendered as plain text, not links — it is a claim, not navigation.
  const proof = item.items
    .filter((child) => child.style === "proof")
    .flatMap((child) => child.items);
  const feature = item.items.find((child) => child.style === "feature");
  const railItems = item.items.filter(
    (child) => !child.style || child.style === "feature",
  );
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
    const cards = feature
      ? railItems.filter((child) => child !== feature)
      : railItems;
    return (
      <PanelShell onNavigate={onNavigate}>
        <div className="mx-auto max-w-(--container-page) px-(--spacing-gutter) pb-[34px] pt-[30px]">
          {feature ? (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
              {/* Two-up past three cards. Stacked in one column they run about
                  110px each, so a fourth turns a 320px panel into a 440px one
                  — taller than the feature card it is meant to sit beside. */}
              <div
                className={clsx(
                  "grid content-start gap-3",
                  cards.length > 3 && "sm:grid-cols-2",
                )}
              >
                {cards.map((child) => (
                  <FlatCard key={child.title} item={child} compact />
                ))}
              </div>
              <FeatureCard item={feature} />
            </div>
          ) : (
            <FlatItems items={cards} />
          )}
          {linksRow.length > 0 ? <LinksRow links={linksRow} /> : null}
          {proof.length > 0 ? <ProofRow items={proof} /> : null}
        </div>
      </PanelShell>
    );
  }

  return (
    <PanelShell onNavigate={onNavigate}>
      {/* No gutter padding here: the fog rail runs to the page-width boundary
          while its items carry the gutter, keeping text aligned with the nav. */}
      <div className="mx-auto grid max-w-(--container-page) grid-cols-[262px_1fr]">
        <div className="border-r border-tl-shell-line bg-tl-shell-deep py-5">
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
                  "flex h-11 items-center px-(--spacing-gutter) font-tl-text text-sm text-white",
                  isActive
                    ? "bg-tl-shell font-semibold shadow-[inset_3px_0_0_#fff]"
                    : "font-medium",
                )}
              >
                {railItem.title}
                <span
                  aria-hidden
                  className={clsx(
                    "ml-auto text-[11px]",
                    isActive ? "text-white" : "text-white/45",
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
                          <span className="font-tl-text text-sm font-semibold text-white">
                            {group.title}
                          </span>
                        ) : (
                          <Link
                            href={group.path}
                            prefetch={true}
                            className="font-tl-text text-sm font-semibold text-white"
                          >
                            {group.title}
                          </Link>
                        )
                      ) : (
                        <Link
                          href={group.path}
                          prefetch={true}
                          className="font-tl-text text-sm text-white/75 transition-colors hover:text-white"
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
                                className="font-tl-text text-sm text-white/75 transition-colors hover:text-white"
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
              <p className="font-tl-text text-sm font-semibold text-white">
                {active.title}
              </p>
              {active.description ? (
                <p className="mt-2 font-tl-text text-sm text-white/70">
                  {active.description}
                </p>
              ) : null}
              <Link
                href={active.path}
                prefetch={true}
                className="mt-4 inline-flex items-center gap-[7px] font-tl-text text-xs font-medium text-white"
              >
                Visit {active.title}
                <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            // Only reachable when every level-2 item is styled "links-row",
            // leaving no rail at all.
            <p className="font-tl-text text-sm text-white/45">
              More {item.title.toLowerCase()} coming soon.
            </p>
          )}

          {linksRow.length > 0 ? <LinksRow links={linksRow} /> : null}
          {proof.length > 0 ? <ProofRow items={proof} /> : null}
        </div>
      </div>
    </PanelShell>
  );
}

// The panel takes the header's palette, not the page's: `tl-shell` for the
// body so it reads as coming forward from the darker nav row above it, and
// `tl-shell-deep` for the rail and the cards, which are the recessed surfaces —
// the same relationship white-on-fog had in the light version.
//
// Accents go white rather than indigo. The brand blue is only a few steps off
// these greys and vanishes against them; it survives as a fill (the primary
// button, the panel's bottom rule) but not as a hairline or a small glyph.
//
// Hovers are white overlays rather than new tokens, so they compose on
// whichever dark ground they land on.
function PanelShell({
  children,
  onNavigate,
}: {
  children: ReactNode;
  onNavigate: () => void;
}) {
  return (
    // Any click in here dismisses the panel. Catching it on the container
    // rather than on each link covers the cards, the rail, the feature and the
    // links row at once — and keeps working for whatever gets added next.
    <div
      onClick={onNavigate}
      className="absolute inset-x-0 top-full z-50 border-b-[2.5px] border-tl-indigo bg-tl-shell shadow-[0_26px_60px_-20px_rgba(0,0,0,0.55)]"
    >
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
        <FlatCard key={child.title} item={child} />
      ))}
    </div>
  );
}

function FlatCard({ item, compact }: { item: MenuItem; compact?: boolean }) {
  return (
    <Link
      href={item.path}
      prefetch={true}
      className={clsx(
        "group/card flex flex-col rounded-[3px] border border-tl-shell-line bg-tl-shell-deep p-5 transition-colors hover:border-white/30 hover:bg-white/[0.06]",
        // Stacked beside a feature card they no longer need the minimum height
        // that keeps them even across a row.
        !compact && "min-h-[104px]",
      )}
    >
      {/* 18px against the description's 13px. Both sat at 14px, so the title
          was carrying the hierarchy on weight and case alone — not enough for
          the element that is actually the link. Tracking eases off as the size
          grows; uppercase needs less of it the bigger it gets. */}
      <span className="font-tl-sans text-lg font-bold uppercase leading-none tracking-[0.02em] text-white">
        {item.title}
      </span>
      {item.description ? (
        <span className="mt-2.5 font-tl-text text-[13px] leading-snug text-white/65">
          {item.description}
        </span>
      ) : null}
      {!compact ? (
        <span
          aria-hidden
          className="mt-auto pt-3 font-tl-sans text-xs font-semibold text-white opacity-0 transition-opacity group-hover/card:opacity-100"
        >
          View →
        </span>
      ) : null}
    </Link>
  );
}

// The panel's one changing thing. Text sits over the image rather than under
// it, so the card reads as a photograph rather than a photograph with a
// caption bolted on.
//
// Degrades to a dark card when no image is set, so the section ships before
// the photograph exists — the same rule the rest of the nav follows for
// missing admin data.
function FeatureCard({ item }: { item: MenuItem }) {
  return (
    <Link
      href={item.path}
      prefetch={true}
      className="group/feature relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[3px] bg-tl-ink p-6 text-white"
    >
      {item.image ? (
        // A plain <img>: Shopify serves these already sized, and the panel only
        // renders on hover, where next/image's placeholder machinery buys
        // nothing.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image.url}
          alt={item.image.altText ?? ""}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover/feature:scale-[1.03]"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-tl-ink via-tl-ink/60 to-tl-ink/10"
      />
      <div className="relative">
        {item.kicker ? (
          <span className="font-tl-mono text-[10px] uppercase tracking-[0.14em] text-white/75">
            {item.kicker}
          </span>
        ) : null}
        <p className="mt-2 font-tl-sans text-[22px] font-bold uppercase leading-none tracking-[0.01em]">
          {item.title}
        </p>
        {item.description ? (
          <p className="mt-2.5 max-w-[42ch] font-tl-text text-sm text-white/80">
            {item.description}
          </p>
        ) : null}
        {/* Blank falls back to "View", which works under any title. Set it
            when the card deserves better wording — "See the build" — and
            leave it alone otherwise. */}
        <span className="mt-4 inline-block font-tl-sans text-xs font-bold uppercase tracking-[0.08em]">
          {item.cta ?? "View"} →
        </span>
      </div>
    </Link>
  );
}

// Facts, not navigation — so plain text, at the very foot, below the buttons
// rather than beside them. `link` is ignored entirely, which is what lets a
// phone number sit here without becoming a control nobody can use on a
// desktop.
//
// Separated by middots rather than spacing alone: this line reads as one
// statement — a city, a number, hours — not a list of unrelated items.
function ProofRow({ items }: { items: MenuItem[] }) {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-tl-mono text-[10px] uppercase tracking-[0.12em] text-white/45">
      {items.map((entry, index) => (
        <Fragment key={`${entry.title}-${index}`}>
          {index > 0 ? <span aria-hidden>·</span> : null}
          <span>{entry.title}</span>
        </Fragment>
      ))}
    </div>
  );
}

// Buttons, not a line of coloured words. A ◆ and indigo text read as
// decoration, which left the one part of the panel that asks for the sale
// looking like a caption. **The first entry is the primary** and renders
// filled; the rest are outlined — so authoring order decides the hierarchy,
// with no new field to set.
//
// **A tel: entry renders as text, not a button.** This panel is desktop-only
// (`hidden md:block`), and nobody taps a number on a desktop — an interactive
// phone button there is a control that does nothing when clicked. The number
// still shows, because seeing it is the point. The same entry is tappable in
// the mobile drawer, which is where a call can actually happen.
//
// next/link only for in-app paths otherwise: this row is also where an
// off-site financing application lands, and prefetching those is wrong.
function LinksRow({ links }: { links: MenuItem[] }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-tl-shell-line pt-6">
      {links.map((link, index) => {
        if (link.path.startsWith("tel:")) {
          return (
            <span
              key={`${link.title}-${index}`}
              className="inline-flex h-10 items-center font-tl-sans text-xs font-bold uppercase tracking-[0.08em] text-white/60"
            >
              {link.title}
            </span>
          );
        }
        const className = clsx(
          "inline-flex h-10 items-center rounded-[3px] px-5 font-tl-sans text-xs font-bold uppercase tracking-[0.08em] transition-colors",
          index === 0
            ? "bg-tl-indigo text-white hover:bg-tl-indigo-lift"
            : "border border-white/25 text-white hover:border-white hover:bg-white/[0.08]",
        );
        return link.path.startsWith("/") ? (
          <Link
            key={`${link.title}-${index}`}
            href={link.path}
            prefetch={true}
            className={className}
          >
            {link.title}
          </Link>
        ) : (
          <a
            key={`${link.title}-${index}`}
            href={link.path}
            className={className}
            rel="noopener noreferrer"
          >
            {link.title}
          </a>
        );
      })}
    </div>
  );
}
