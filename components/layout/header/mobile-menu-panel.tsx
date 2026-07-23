"use client";

import { Dialog, Transition } from "@headlessui/react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Menu } from "lib/shopify/types";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";

export default function MobileMenuPanel({
  menu,
  isOpen,
  onClose,
}: {
  menu: Menu[];
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentParent, setCurrentParent] = useState<Menu | null>(null);

  useEffect(() => {
    if (!isOpen) setCurrentParent(null);
  }, [isOpen]);

  const items = currentParent ? (currentParent.items ?? []) : menu;

  return (
    <Transition show={isOpen}>
      <Dialog
        id="mobile-menu-panel"
        onClose={onClose}
        className="relative z-(--z-index-mobile-overlay)"
      >
        <Transition.Child
          as={Fragment}
          enter="transition-all ease-in-out duration-300"
          enterFrom="opacity-0 backdrop-blur-none"
          enterTo="opacity-100 backdrop-blur-[.5px]"
          leave="transition-all ease-in-out duration-200"
          leaveFrom="opacity-100 backdrop-blur-[.5px]"
          leaveTo="opacity-0 backdrop-blur-none"
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
          <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex h-full w-full flex-col bg-white pb-6 dark:bg-black">
            <div className="flex items-center gap-2 p-4">
              {currentParent ? (
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
                  onClick={() => setCurrentParent(null)}
                  aria-label="Back"
                >
                  <ChevronLeftIcon className="h-6" />
                </button>
              ) : null}
              <button
                className="ml-auto flex h-11 w-11 items-center justify-center rounded-md border border-neutral-200 text-black transition-colors dark:border-neutral-700 dark:text-white"
                onClick={onClose}
                aria-label="Close mobile menu"
              >
                <XMarkIcon className="h-6" />
              </button>
            </div>

            {currentParent ? (
              <p className="px-4 pb-2 text-xl font-medium text-black dark:text-white">
                {currentParent.title}
              </p>
            ) : null}

            {items.length ? (
              <ul className="flex w-full flex-col px-4">
                {items.map((item) => (
                  <li
                    key={item.title}
                    className="py-2 text-xl text-black transition-colors hover:text-neutral-500 dark:text-white"
                  >
                    {item.items?.length ? (
                      <button
                        className="flex w-full items-center justify-between"
                        onClick={() => setCurrentParent(item)}
                      >
                        {item.title}
                        <ChevronRightIcon className="h-5" aria-hidden />
                      </button>
                    ) : (
                      <Link href={item.path} prefetch={true} onClick={onClose}>
                        {item.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
