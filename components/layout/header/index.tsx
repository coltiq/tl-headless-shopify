import clsx from "clsx";
import CartModal from "components/cart/modal";
import OpenCart from "components/cart/open-cart";
import { HEADER_MENU_HANDLE, NAV_ROOT_HANDLE } from "lib/constants";
import { getAnnouncements, getNavMenu } from "lib/shopify";
import { ensureStartsWith } from "lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { AnnouncementBar, MobileAnnouncementBar } from "./announcement-bar";
import { DesktopNav } from "./desktop-nav";
import { GarageChip, GarageChipFallback } from "./garage-chip";
import { HeaderScroll } from "./header-scroll";
import { IconAccount, IconHelp } from "./icons";
import { IconBurger } from "./icons";
import { MobileDrawer } from "./mobile-drawer";
import { MobileLinksBand } from "./mobile-links";
import { SearchField, SearchFieldSkeleton } from "./search";
import { Wordmark } from "./wordmark";

// The nav is sourced from the nav_item metaobject tree rooted at
// NAV_ROOT_HANDLE (see docs/shopify-setup.md) and renders up to four levels.
// Until the metaobject exists in admin, the native menu serves as the fallback
// (capped at three levels by Shopify). The same tree derives the category URL
// space, so both handles live in lib/constants.ts.
const utilityIcon =
  "grid h-[46px] w-[46px] place-items-center rounded-[3px] text-tl-ink group-data-[condensed]:h-11 group-data-[condensed]:w-11";

export async function Header() {
  const [
    menu,
    { announcements, barLinks, mobileAnnouncements, mobileBarLinks },
  ] = await Promise.all([
    getNavMenu(NAV_ROOT_HANDLE, HEADER_MENU_HANDLE),
    getAnnouncements(),
  ]);

  // The desktop band holds the rotating copy *and* the utility links, so it
  // survives either list being empty and only collapses when both are —
  // otherwise adding bar links before writing an announcement would silently
  // hide them.
  const hasDesktopBand = announcements.length > 0 || barLinks.length > 0;

  // Every band collapses when its content is empty, so the spacer below has to
  // be computed from the same checks rather than hardcoded — and from the
  // *mobile* lists for the mobile spacer, since they can differ.
  const mobileOffset =
    60 +
    (mobileAnnouncements.length > 0 ? 34 : 0) +
    (mobileBarLinks.length > 0 ? 34 : 0);
  const desktopOffset = 120 + (hasDesktopBand ? 38 : 0);

  // Hosted customer accounts live on the Shopify domain.
  const accountHref = process.env.SHOPIFY_STORE_DOMAIN
    ? `${ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")}/account`
    : "/account";

  return (
    <>
      <HeaderScroll>
        {hasDesktopBand ? (
          <AnnouncementBar announcements={announcements} links={barLinks} />
        ) : null}
        {mobileAnnouncements.length > 0 ? (
          <MobileAnnouncementBar announcements={mobileAnnouncements} />
        ) : null}

        {/* Desktop: brand + utility row */}
        <div className="hidden h-[72px] border-b border-tl-hairline transition-[height] group-data-[condensed]:h-14 md:block">
          <div className="page-width flex h-full items-center">
            <Wordmark className="text-[27px] group-data-[condensed]:text-[22px]" />
            <Suspense fallback={<SearchFieldSkeleton variant="desktop" />}>
              <SearchField variant="desktop" />
            </Suspense>
            <div className="ml-6 flex items-center gap-0.5">
              <a
                href={accountHref}
                aria-label="Account"
                className={utilityIcon}
              >
                <IconAccount className="h-5 w-5" />
              </a>
              <Link href="/contact" aria-label="Help" className={utilityIcon}>
                <IconHelp className="h-5 w-5" />
              </Link>
              <Suspense fallback={<OpenCart />}>
                <CartModal />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Desktop: nav row + mega menu */}
        <DesktopNav
          items={menu}
          garage={
            <Suspense fallback={<GarageChipFallback variant="row" />}>
              <GarageChip variant="row" />
            </Suspense>
          }
        />

        {/* Mobile: brand bar */}
        <div className="flex h-[60px] items-center gap-2.5 border-b border-tl-hairline px-3 md:hidden">
          <Suspense
            fallback={
              <div
                aria-hidden
                className="-ml-1.5 grid h-11 w-11 place-items-center text-tl-ink"
              >
                <IconBurger className="h-[13px] w-[19px]" />
              </div>
            }
          >
            <MobileDrawer
              menu={menu}
              accountHref={accountHref}
              wordmark={<Wordmark className="text-[21px]" />}
              garage={
                <Suspense fallback={<GarageChipFallback variant="drawer" />}>
                  <GarageChip variant="drawer" />
                </Suspense>
              }
            />
          </Suspense>
          <Wordmark className="text-[21px]" />
          <span className="ml-auto" />
          <Link
            href="/contact"
            aria-label="Help"
            className="grid h-11 w-11 place-items-center text-tl-ink"
          >
            <IconHelp className="h-5 w-5" />
          </Link>
          <Suspense fallback={<OpenCart />}>
            <CartModal primary={false} />
          </Suspense>
        </div>

        {/* Mobile: the same utility links the desktop band shows */}
        <MobileLinksBand links={mobileBarLinks} />
      </HeaderScroll>

      {/* Offset the page by the real resting header height. Both bands
          collapse when their list is empty, so the height is computed — never
          a hardcoded constant. */}
      <div
        aria-hidden
        className="md:hidden"
        style={{ height: `${mobileOffset}px` }}
      />
      <div
        aria-hidden
        className="hidden md:block"
        style={{ height: `${desktopOffset}px` }}
      />
    </>
  );
}
