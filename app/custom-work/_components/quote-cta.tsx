import Link from "next/link";

import { SHOP_PHONE_DISPLAY, SHOP_PHONE_HREF } from "lib/constants";

// Every page in this section ends the same way (docs/plans/custom-work.md §3),
// so the block lives here rather than drifting four ways.
//
// The `_components` folder name keeps it out of the route tree — a directory
// prefixed with an underscore is private in the App Router, so this never
// becomes /custom-work/_components.
//
// The phone is a real tap-to-call here, unlike in the header: everyone reading
// this page is a shop customer, so it carries none of the ecommerce
// support-volume risk that kept the number out of the nav.
export function QuoteCta({ heading }: { heading: string }) {
  return (
    <section className="mt-20 border-t border-tl-hairline pt-10">
      <h2 className="font-tl-sans text-2xl font-bold uppercase tracking-[0.01em] text-tl-ink">
        {heading}
      </h2>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Link
          href="/quote"
          className="inline-flex h-12 items-center rounded-[3px] bg-tl-indigo px-6 font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-tl-indigo-lift"
        >
          Start a quote
        </Link>
        {SHOP_PHONE_DISPLAY ? (
          <a
            href={SHOP_PHONE_HREF}
            className="font-tl-sans text-sm font-medium text-tl-ink underline underline-offset-4 hover:text-tl-indigo"
          >
            Or call {SHOP_PHONE_DISPLAY}
          </a>
        ) : null}
      </div>
    </section>
  );
}
