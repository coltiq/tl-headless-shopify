import clsx from "clsx";
import CartModal from "components/cart/modal";
import OpenCart from "components/cart/open-cart";
import { getAnnouncement, getHeaderMenu } from "lib/shopify";
import { ensureStartsWith } from "lib/utils";
import Link from "next/link";
import { Suspense } from "react";
import { AnnouncementBar, MobileAnnouncementBar } from "./announcement-bar";
import { DesktopNav } from "./desktop-nav";
import { GarageChip, GarageChipFallback } from "./garage-chip";
import { HeaderScroll } from "./header-scroll";
import { IconAccount, IconChat } from "./icons";
import { IconBurger } from "./icons";
import { MobileDrawer } from "./mobile-drawer";
import { MobileLinksBand } from "./mobile-links";
import { SearchField, SearchFieldSkeleton } from "./search";
import { Wordmark } from "./wordmark";

// The mega panel renders whatever this menu contains — populate all three
// levels in Shopify admin for the full three-tier panel.
const HEADER_MENU_HANDLE = "main-menu-v2";

const utilityIcon =
  "grid h-[46px] w-[46px] place-items-center rounded-[3px] text-tl-ink group-data-[condensed]:h-11 group-data-[condensed]:w-11";

export async function Header() {
  const [menu, announcement] = await Promise.all([
    getHeaderMenu(HEADER_MENU_HANDLE),
    getAnnouncement(),
  ]);

  // Hosted customer accounts live on the Shopify domain.
  const accountHref = process.env.SHOPIFY_STORE_DOMAIN
    ? `${ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")}/account`
    : "/account";

  return (
    <>
      <HeaderScroll>
        {announcement.desktop ? (
          <AnnouncementBar message={announcement.desktop} />
        ) : null}
        {announcement.mobile ? (
          <MobileAnnouncementBar message={announcement.mobile} />
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
              <Link
                href="/contact"
                aria-label="Contact"
                className={utilityIcon}
              >
                <IconChat className="h-5 w-5" />
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
            aria-label="Contact"
            className="grid h-11 w-11 place-items-center text-tl-ink"
          >
            <IconChat className="h-5 w-5" />
          </Link>
          <Suspense fallback={<OpenCart />}>
            <CartModal primary={false} />
          </Suspense>
        </div>

        {/* Mobile: hardcoded links band */}
        <MobileLinksBand />
      </HeaderScroll>

      {/* Offset the page by the real resting header height. The announcement
          bands collapse when their metafield is null, so the height is
          conditional — never a hardcoded constant. */}
      <div
        aria-hidden
        className={clsx(
          "md:hidden",
          announcement.mobile ? "h-[128px]" : "h-[94px]",
        )}
      />
      <div
        aria-hidden
        className={clsx(
          "hidden md:block",
          announcement.desktop ? "h-[158px]" : "h-[120px]",
        )}
      />
    </>
  );
}
