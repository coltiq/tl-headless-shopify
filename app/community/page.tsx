import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Builds, stories, and what we stand for — the side of Truck Lab that isn't a transaction.",
};

// TODO: scaffold. The children below are the agreed starting set; Events and
// Giveaways join them when they exist.
//
// Named Community rather than About because it is the one section whose
// contents are expected to grow: About shrinks the moment events land, Journal
// narrows to articles, and a place name makes company philosophy read as
// furniture. Community absorbs all of it, and it makes The Standard fit — under
// this heading "what we stand for" reads as the terms of belonging rather than
// corporate boilerplate.
//
// **Customer Builds is the one that has to ship.** Without user content behind
// it the section name over-promises, and customer trucks are also free content,
// social proof to link from product pages, and model-specific search traffic.
// Distinct from Custom Work's Our Builds, which is the shop's own work.
//
// Reserved in NEXT_MIDDLEWARE_RESERVED_SEGMENTS so no collection handle can
// shadow it.
const CHILDREN: { title: string; blurb: string; href: string | null }[] = [
  {
    title: "Blog",
    blurb: "Build breakdowns, product deep dives, and what we're working on.",
    // TODO: needs a content source decision before a route exists — Shopify
    // articles are queryable on the Storefront API, which would beat a deploy
    // per post. Gets its own name at that point.
    href: null,
  },
  {
    title: "Customer Builds",
    blurb: "Trucks you built, running our parts.",
    href: null,
  },
  {
    title: "The Standard",
    blurb: "The bar we hold ourselves to, and why it costs what it costs.",
    href: "/the-standard",
  },
];

export default function CommunityPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="font-tl-sans text-5xl font-bold text-tl-ink">
          Community
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Builds, stories, and what we stand for — the side of this that
          isn&apos;t a transaction.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {CHILDREN.map((child) => (
            <div key={child.title}>
              <h2 className="font-tl-sans text-xs font-semibold uppercase tracking-[0.1em] text-tl-ink">
                {child.href ? (
                  <Link href={child.href}>{child.title}</Link>
                ) : (
                  child.title
                )}
              </h2>
              <p className="mt-3 font-tl-text text-sm text-tl-steel">
                {child.blurb}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
