import type { AnnouncementBarLink } from "lib/shopify/types";
import Link from "next/link";
import { Fragment } from "react";
import { BarLinkIcon } from "./announcement-bar";

// The same `custom.announcement_bar_links` list the desktop band renders —
// editing it in admin has to move both, or the two disagree.
//
// Band is visually 34px; each link bleeds 5px above and below via negative
// margin so the touch target hits 44px. The dividers stop a centre mis-tap
// landing on the wrong link.
//
// Two links is what this band is designed for. More still render, evenly
// split, but they get cramped fast — that's an authoring judgement, not
// something to silently truncate.
export function MobileLinksBand({ links }: { links: AnnouncementBarLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="flex h-[34px] items-stretch bg-tl-indigo group-data-[condensed]:hidden md:hidden">
      {links.map((link, index) => (
        <Fragment key={`${link.url}-${link.label}`}>
          {index > 0 ? (
            <span aria-hidden className="my-2 w-px flex-none bg-white/20" />
          ) : null}
          <span className="flex min-w-0 flex-1 items-stretch justify-center">
            <MobileBarLink link={link} />
          </span>
        </Fragment>
      ))}
    </div>
  );
}

function MobileBarLink({ link }: { link: AnnouncementBarLink }) {
  const content = (
    <>
      <BarLinkIcon link={link} className="h-3 w-auto flex-none" />
      <span className="truncate">{link.label}</span>
    </>
  );
  const className =
    "-my-[5px] flex w-full max-w-[190px] items-center justify-center gap-[7px] px-3 py-[5px] font-tl-sans text-[11px] font-bold tracking-[0.04em] text-white";

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
