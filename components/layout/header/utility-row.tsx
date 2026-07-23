import CartTrigger from "components/cart/cart-trigger";
import OpenCart from "components/cart/open-cart";
import LogoSquare from "components/logo-square";
import Search, { SearchSkeleton } from "components/layout/search";
import Link from "next/link";
import { Suspense } from "react";
import AccountLink from "./account-link";
import ContactLink from "./contact-link";

const { SITE_NAME } = process.env;

export default function UtilityRow() {
  return (
    <div className="page-width hidden h-20 items-center gap-6 md:flex">
      <Link href="/" prefetch={true} className="flex flex-none items-center">
        <LogoSquare alt={`${SITE_NAME} logo`} adaptive={false} />
      </Link>
      <div className="flex flex-1 justify-center">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
      </div>
      <div className="flex flex-none items-center gap-1">
        <AccountLink />
        <ContactLink />
        <Suspense fallback={<OpenCart />}>
          <CartTrigger />
        </Suspense>
      </div>
    </div>
  );
}
