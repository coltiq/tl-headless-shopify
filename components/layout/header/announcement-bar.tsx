import { SHOP_PHONE_DISPLAY } from "lib/constants";
import { resolveIcon } from "lib/icons";
import type { Announcement, AnnouncementBarLink } from "lib/shopify/types";
import Link from "next/link";
import { AnnouncementRotator } from "./announcement-rotator";

// Both bands are entirely admin-driven now (docs/shopify-setup.md Part 1.4):
// the rotating copy comes from `custom.announcement_list`, the utility links
// from `custom.announcement_bar_links`. Either list being empty collapses its
// half of the band — callers must not render a bar with nothing in it, and the
// header's spacer height depends on the same emptiness checks.
//
// **One family and one colour across the whole band**: `font-tl-sans` in
// white, on both breakpoints. It previously mixed the body font, a mono
// readout, and two text colours.
//
// Size and weight answer to role rather than being uniform: the announcement
// is sentence-case 11px, the uppercase links are 10px semibold, because
// uppercase carries full cap-height on every letter and outweighs matched
// sentence-case badly. Tracking follows the same logic — 0.1em on the links,
// 0.09em on the number, none on the announcement.
//
// The right slot holds the shop's phone number, from lib/constants.ts rather
// than admin: it's business data, not editorial copy, and it changes about
// never. Empty constants collapse the slot along with its divider.
//
// **Desktop only** — MobileAnnouncementBar carries the rotator and nothing
// else, so mobile's tap-to-call lives in the contact popup instead.
export function AnnouncementBar({
  announcements,
  links,
}: {
  announcements: Announcement[];
  links: AnnouncementBarLink[];
}) {
  return (
    <div className="hidden h-[38px] bg-tl-indigo text-white md:block md:group-data-[condensed]:hidden">
      <div className="page-width flex h-full items-center">
        <AnnouncementRotator
          items={announcements}
          className="font-tl-sans text-[11px] text-white"
        />
        <span className="ml-auto flex items-center gap-[26px]">
          {links.map((link) => (
            <BarLink key={`${link.url}-${link.label}`} link={link} />
          ))}
          {links.length > 0 && SHOP_PHONE_DISPLAY ? (
            <span aria-hidden className="h-4 w-px bg-white/25" />
          ) : null}
          {/* Text, not a link. Nobody taps a number on a desktop, and a link
              there only invites the misread this label exists to prevent —
              that this is a general support line rather than the build line.
              Mobile keeps tap-to-call, at the foot of the drawer.

              Labelled, not bare: an unlabelled number in a global band reads
              as ecommerce support to every visitor with a late package.
              Reuses the nav's own wording so the two agree. */}
          {SHOP_PHONE_DISPLAY ? (
            <span className="flex items-center gap-2.5 font-tl-sans text-[11px] tracking-[0.09em] text-white">
              <span className="text-tl-ann-dim">Custom Work</span>
              {SHOP_PHONE_DISPLAY}
            </span>
          ) : null}
        </span>
      </div>
    </div>
  );
}

export function MobileAnnouncementBar({
  announcements,
}: {
  announcements: Announcement[];
}) {
  return (
    <div className="flex h-[34px] items-center justify-center bg-tl-indigo px-3.5 group-data-[condensed]:hidden md:hidden">
      {/* Short form: single line, truncated — never wraps. */}
      <AnnouncementRotator
        items={announcements}
        className="truncate font-tl-sans text-[11px] text-white"
      />
    </div>
  );
}

function BarLink({ link }: { link: AnnouncementBarLink }) {
  const content = (
    <>
      <BarLinkIcon link={link} />
      {link.label}
    </>
  );
  // 10px semibold, not 11px bold: uppercase carries full cap-height on every
  // letter, so at a matched pixel size it reads noticeably larger than the
  // sentence-case announcement beside it. Mobile keeps 11px bold — there the
  // links are a standalone band with nothing to balance against.
  const className =
    "flex items-center gap-[9px] font-tl-sans text-[10px] font-semibold uppercase tracking-[0.1em] text-white";

  return link.url.startsWith("/") ? (
    <Link href={link.url} className={className}>
      {content}
    </Link>
  ) : (
    <a href={link.url} className={className} rel="noopener noreferrer">
      {content}
    </a>
  );
}

// `icon_text` wins over an uploaded file: it resolves to inline SVG that
// inherits currentColor, so it tracks the band's text in every state, where an
// uploaded file is stuck at the colour it was drawn in. The file stays the
// escape hatch for genuinely custom art. Neither present renders nothing —
// the label alone reads fine, and a placeholder glyph would make a
// misconfigured entry look deliberate.
//
// The uploaded branch is a plain <img>, not next/image: these are ~15px icons
// on a fixed-height band, where optimization saves nothing, and Shopify serves
// uploaded SVGs — which next/image refuses without `dangerouslyAllowSVG`.
// Decorative either way, because the link's own label sits right beside it.
export function BarLinkIcon({
  link,
  className = "h-[15px] w-auto",
}: {
  link: AnnouncementBarLink;
  className?: string;
}) {
  const Icon = resolveIcon(link.iconName);
  if (Icon) {
    // aspect-square because callers size by height with `w-auto`, and a
    // Heroicons SVG carries no intrinsic width to derive one from.
    return <Icon aria-hidden className={`${className} aspect-square`} />;
  }

  if (!link.icon) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={link.icon.url}
      alt=""
      width={link.icon.width}
      height={link.icon.height}
      className={className}
    />
  );
}
