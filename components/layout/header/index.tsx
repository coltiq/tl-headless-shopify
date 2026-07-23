import CartEffects from "components/cart/cart-effects";
import CartSheet from "components/cart/modal";
import { AnnouncementBar } from "components/layout/announcement-bar";
import { getMenu } from "lib/shopify";
import { Suspense } from "react";
import MobileNav from "./mobile-nav";
import NavRow from "./nav-row";
import UtilityRow from "./utility-row";

const { SITE_NAME } = process.env;

export async function Header() {
  const menu = await getMenu("next-js-frontend-header-menu");

  return (
    <>
      <header className="sticky top-0 z-(--z-index-header) bg-neutral-800">
        <AnnouncementBar />
        <UtilityRow />
        <NavRow menu={menu} />
        <Suspense fallback={null}>
          <MobileNav menu={menu} siteName={SITE_NAME!} />
        </Suspense>
      </header>
      <Suspense fallback={null}>
        <CartEffects />
        <CartSheet />
      </Suspense>
    </>
  );
}
