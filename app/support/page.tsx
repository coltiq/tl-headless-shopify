import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { SHOP_PHONE_DISPLAY, SHOP_PHONE_HREF } from "lib/constants";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Shipping, returns, warranty, and answers to the questions we get most.",
};

// TODO: scaffold. The groups below are the agreed shape (OPEN-ITEMS 4.5); the
// articles under them are still to be written, and each one gets its own route
// so it stays indexable and linkable — overlay-only content cannot rank and
// cannot be pasted into a support reply.
//
// This page is the *hub*: the announcement band's Support link lands here, the
// header chat popup stays the lightweight in-context path, and the footer
// carries the same groups as columns. Reserved in
// NEXT_MIDDLEWARE_RESERVED_SEGMENTS so no collection handle can shadow it.
const GROUPS: { title: string; articles: string[] }[] = [
  {
    title: "Orders & Shipping",
    articles: [
      "Shipping policy",
      "Delivery times",
      "Order status",
      "Backorders",
      "International orders",
    ],
  },
  {
    title: "Returns & Warranty",
    articles: [
      "Return policy",
      "Start a return",
      "Warranty",
      "Damaged or missing items",
    ],
  },
  {
    title: "Buying Help",
    articles: [
      "Find your fit",
      "Install guides",
      "Financing",
      "Gift cards",
      "FAQ",
    ],
  },
];

export default function SupportPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="font-tl-sans text-5xl font-bold text-tl-ink">Support</h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Shipping, returns, warranty, and the questions we get most.
        </p>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {GROUPS.map((group) => (
            <div key={group.title}>
              <h2 className="font-tl-sans text-xs font-semibold uppercase tracking-[0.1em] text-tl-ink">
                {group.title}
              </h2>
              <ul className="mt-3.5 grid list-none gap-2.5 p-0">
                {group.articles.map((article) => (
                  // TODO: link each to its own route once written.
                  <li
                    key={article}
                    className="font-tl-text text-sm text-tl-mute"
                  >
                    {article}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-tl-hairline pt-8">
          <h2 className="font-tl-sans text-xs font-semibold uppercase tracking-[0.1em] text-tl-ink">
            Still stuck?
          </h2>
          <p className="mt-3.5 max-w-xl font-tl-text text-sm text-tl-steel">
            <Link href="/contact" className="text-tl-ink underline">
              Send us a message
            </Link>{" "}
            and we&apos;ll get back to you.
            {SHOP_PHONE_DISPLAY ? (
              <>
                {" "}
                For a build or an install, call{" "}
                <a href={SHOP_PHONE_HREF} className="text-tl-ink underline">
                  {SHOP_PHONE_DISPLAY}
                </a>
                .
              </>
            ) : null}
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
