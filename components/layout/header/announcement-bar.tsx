import type { Announcement, AnnouncementBarLink } from "lib/shopify/types";
import Link from "next/link";
import { AnnouncementRotator } from "./announcement-rotator";

// Both bands are entirely admin-driven now (docs/shopify-setup.md Part 1.4):
// the rotating copy comes from `custom.announcement_list`, the utility links
// from `custom.announcement_bar_links`. Either list being empty collapses its
// half of the band — callers must not render a bar with nothing in it, and the
// header's spacer height depends on the same emptiness checks.
//
// The locale slot stays hardcoded: it reflects what the storefront actually
// supports, not an editorial choice.
export function AnnouncementBar({
  announcements,
  links,
}: {
  announcements: Announcement[];
  links: AnnouncementBarLink[];
}) {
  return (
    <div className="hidden h-[38px] bg-tl-indigo text-tl-ann-text md:block md:group-data-[condensed]:hidden">
      <div className="page-width flex h-full items-center">
        <AnnouncementRotator items={announcements} className="text-xs" />
        <span className="ml-auto flex items-center gap-[26px]">
          {links.map((link) => (
            <BarLink key={`${link.url}-${link.label}`} link={link} />
          ))}
          {links.length > 0 ? (
            <span aria-hidden className="h-4 w-px bg-white/25" />
          ) : null}
          <span className="font-tl-mono text-[11px] tracking-[0.09em] text-tl-ann-dim">
            USD · EN
          </span>
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
        className="truncate text-[11px] text-tl-ann-text"
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
  const className =
    "flex items-center gap-[9px] font-tl-sans text-[11px] font-bold uppercase tracking-[0.12em] text-white";

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

// A plain <img>, not next/image: these are ~15px icons on a fixed-height band,
// where optimization saves nothing, and Shopify serves uploaded SVGs — which
// next/image refuses without `dangerouslyAllowSVG`. Decorative, because the
// link's own label sits right beside it.
export function BarLinkIcon({
  link,
  className = "h-[15px] w-auto",
}: {
  link: AnnouncementBarLink;
  className?: string;
}) {
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
