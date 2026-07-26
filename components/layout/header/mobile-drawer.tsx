"use client";

import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { MenuItem } from "lib/shopify/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { SHOP_PHONE_DISPLAY, SHOP_PHONE_HREF } from "lib/constants";
import {
  IconAccount,
  IconBurger,
  IconChat,
  IconClose,
  IconPhone,
} from "./icons";
import { SearchField } from "./search";

const drawerRowClass =
  "flex h-[52px] w-full items-center border-b border-tl-hairline px-4 font-tl-sans text-[13px] font-semibold uppercase tracking-[0.09em]";

export function MobileDrawer({
  menu,
  garage,
  wordmark,
  accountHref,
}: {
  menu: MenuItem[];
  garage: ReactNode;
  wordmark: ReactNode;
  accountHref: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  // Path of drilled-in menu items; empty = root panel. The drawer always
  // opens at root.
  const [stack, setStack] = useState<MenuItem[]>([]);
  const openDrawer = () => {
    setStack([]);
    setIsOpen(true);
  };
  const closeDrawer = () => setIsOpen(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
    setStack([]);
  }, [pathname, searchParams]);

  const panelItem = stack.length > 0 ? stack[stack.length - 1] : undefined;

  return (
    <>
      <button
        onClick={openDrawer}
        aria-label="Open menu"
        className="-ml-1.5 grid h-11 w-11 place-items-center text-tl-ink md:hidden"
      >
        <IconBurger className="h-[13px] w-[19px]" />
      </button>
      <Transition show={isOpen}>
        <Dialog onClose={closeDrawer} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-all ease-in-out duration-300"
            enterFrom="translate-x-[-100%]"
            enterTo="translate-x-0"
            leave="transition-all ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-[-100%]"
          >
            <Dialog.Panel className="fixed inset-0 flex h-full w-full flex-col overflow-y-auto bg-white pb-6 text-tl-ink">
              <div className="flex h-[60px] shrink-0 items-center gap-2.5 border-b border-tl-hairline px-3">
                <button
                  onClick={closeDrawer}
                  aria-label="Close menu"
                  className="-ml-1.5 grid h-11 w-11 shrink-0 place-items-center text-tl-ink"
                >
                  <IconClose className="h-[15px] w-[15px]" />
                </button>
                {wordmark}
              </div>

              {panelItem ? (
                <DrawerPanel
                  item={panelItem}
                  parentTitle={
                    stack.length > 1
                      ? stack[stack.length - 2]!.title
                      : "Main menu"
                  }
                  onBack={() => setStack((prev) => prev.slice(0, -1))}
                  onDrill={(child) => setStack((prev) => [...prev, child])}
                  onNavigate={closeDrawer}
                />
              ) : (
                <>
                  {/* Search, garage, and account sections live only on the
                      root panel; drilled-in panels show just the submenu. */}
                  <SearchField variant="drawer" />
                  {garage}

                  {menu.length ? (
                    <ul className="border-t border-tl-hairline">
                      {menu.map((item, index) => (
                        <li key={`${item.title}-${index}`}>
                          {item.items.length ? (
                            <button
                              onClick={() => setStack([item])}
                              className={clsx(drawerRowClass, "text-tl-ink")}
                            >
                              {item.title}
                              <span
                                aria-hidden
                                className="ml-auto text-base text-tl-mute-white"
                              >
                                ›
                              </span>
                            </button>
                          ) : (
                            <Link
                              href={item.path}
                              prefetch={true}
                              onClick={closeDrawer}
                              className={clsx(drawerRowClass, "text-tl-steel")}
                            >
                              {item.title}
                              <span
                                aria-hidden
                                className="ml-auto text-base text-tl-mute-white"
                              >
                                ›
                              </span>
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <p className="px-4 pb-1.5 pt-4 font-tl-mono text-[9.5px] uppercase tracking-[0.14em] text-tl-mute-white">
                    Your account
                  </p>
                  <a
                    href={accountHref}
                    className="flex h-12 items-center gap-[11px] px-4 font-tl-text text-[13.5px]"
                  >
                    <IconAccount className="h-[17px] w-[17px]" />
                    Account &amp; orders
                  </a>
                  <Link
                    href="/contact"
                    onClick={closeDrawer}
                    className="flex h-12 items-center gap-[11px] px-4 font-tl-text text-[13.5px]"
                  >
                    <IconChat className="h-[17px] w-[17px]" />
                    Contact support
                  </Link>

                  {/* Tap-to-call closes out the drawer, replacing a dead
                      `USD · EN` readout. This is mobile's phone affordance:
                      the announcement band that carries it on desktop renders
                      the rotator only at this width. */}
                  {SHOP_PHONE_DISPLAY ? (
                    <a
                      href={SHOP_PHONE_HREF}
                      className="mt-2.5 flex h-12 items-center gap-[11px] border-t border-tl-hairline px-4 font-tl-text text-[13.5px]"
                    >
                      <IconPhone className="h-[17px] w-[17px]" />
                      Call {SHOP_PHONE_DISPLAY}
                    </a>
                  ) : null}
                </>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}

// A drilled-in submenu: back row, a "View all" link to the item's own page
// (tapping a row drills in, so this is how the item's destination stays
// reachable), then its children — branches drill deeper, leaves navigate.
function DrawerPanel({
  item,
  parentTitle,
  onBack,
  onDrill,
  onNavigate,
}: {
  item: MenuItem;
  parentTitle: string;
  onBack: () => void;
  onDrill: (item: MenuItem) => void;
  onNavigate: () => void;
}) {
  return (
    <div className="border-t border-tl-hairline">
      <button onClick={onBack} className={clsx(drawerRowClass, "text-tl-ink")}>
        <span aria-hidden className="mr-2.5 text-base text-tl-mute-white">
          ‹
        </span>
        {parentTitle}
      </button>
      {item.path !== "#" ? (
        <Link
          href={item.path}
          prefetch={true}
          onClick={onNavigate}
          className={clsx(drawerRowClass, "text-tl-indigo")}
        >
          View all {item.title}
        </Link>
      ) : null}
      <ul>
        {item.items.map((child, index) => (
          <li key={`${child.title}-${index}`}>
            {child.items.length ? (
              <button
                onClick={() => onDrill(child)}
                className={clsx(drawerRowClass, "text-tl-ink")}
              >
                {child.title}
                <span
                  aria-hidden
                  className="ml-auto text-base text-tl-mute-white"
                >
                  ›
                </span>
              </button>
            ) : (
              <Link
                href={child.path}
                prefetch={true}
                onClick={onNavigate}
                className={clsx(drawerRowClass, "text-tl-steel")}
              >
                {child.title}
                <span
                  aria-hidden
                  className="ml-auto text-base text-tl-mute-white"
                >
                  ›
                </span>
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
