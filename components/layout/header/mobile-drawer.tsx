"use client";

import { Dialog, Transition } from "@headlessui/react";
import clsx from "clsx";
import { MenuItem } from "lib/shopify/types";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { IconAccount, IconBurger, IconChat, IconClose } from "./icons";
import { SearchField } from "./search";

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
  const openDrawer = () => setIsOpen(true);
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
  }, [pathname, searchParams]);

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

              {/* Search and garage live only in the drawer, above the category list. */}
              <SearchField variant="drawer" />
              {garage}

              {menu.length ? (
                <ul className="border-t border-tl-hairline">
                  {menu.map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.path}
                        prefetch={true}
                        onClick={closeDrawer}
                        className={clsx(
                          "flex h-[52px] items-center border-b border-tl-hairline px-4 font-tl-sans text-[13px] font-semibold uppercase tracking-[0.09em]",
                          item.items.length ? "text-tl-ink" : "text-tl-steel",
                        )}
                      >
                        {item.title}
                        <span
                          aria-hidden
                          className="ml-auto text-base text-tl-mute-white"
                        >
                          ›
                        </span>
                      </Link>
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

              <div className="mt-2.5 border-t border-tl-hairline px-4 py-3.5 font-tl-mono text-[10.5px] tracking-[0.09em] text-tl-steel">
                USD · EN
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
