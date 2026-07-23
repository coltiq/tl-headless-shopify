"use client";

import { Bars3Icon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CartTrigger from "components/cart/cart-trigger";
import OpenCart from "components/cart/open-cart";
import LogoSquare from "components/logo-square";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import MobileMenuPanel from "./mobile-menu-panel";
import MobileSearchPanel from "./mobile-search-panel";

type ActivePanel = "none" | "search" | "menu";

export default function MobileNav({
  menu,
  siteName,
}: {
  menu: Menu[];
  siteName: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activePanel, setActivePanel] = useState<ActivePanel>("none");
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setActivePanel("none");
  }, [pathname, searchParams]);

  useEffect(() => {
    if (activePanel !== "search") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActivePanel("none");
        searchButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activePanel]);

  const toggleSearch = () =>
    setActivePanel((panel) => (panel === "search" ? "none" : "search"));
  const toggleMenu = () =>
    setActivePanel((panel) => (panel === "menu" ? "none" : "menu"));

  return (
    <div className="page-width relative flex h-20 items-center justify-between md:hidden">
      <Link href="/" prefetch={true} className="flex flex-none items-center">
        <LogoSquare alt={`${siteName} logo`} adaptive={false} />
      </Link>
      <div className="flex flex-none items-center gap-2">
        <button
          ref={searchButtonRef}
          aria-label="Search"
          aria-expanded={activePanel === "search"}
          aria-controls="mobile-search-panel"
          onClick={toggleSearch}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-600 text-white transition-colors"
        >
          <MagnifyingGlassIcon className="h-4" />
        </button>
        <Suspense fallback={<OpenCart />}>
          <CartTrigger />
        </Suspense>
        <button
          aria-label="Open mobile menu"
          aria-expanded={activePanel === "menu"}
          aria-controls="mobile-menu-panel"
          onClick={toggleMenu}
          className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-600 text-white transition-colors"
        >
          <Bars3Icon className="h-4" />
        </button>
      </div>
      <MobileSearchPanel isOpen={activePanel === "search"} />
      <MobileMenuPanel
        menu={menu}
        isOpen={activePanel === "menu"}
        onClose={() => setActivePanel("none")}
      />
    </div>
  );
}
