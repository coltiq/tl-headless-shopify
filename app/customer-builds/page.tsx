import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";

export const metadata: Metadata = {
  title: "Customer Builds",
  description: "Trucks we built, and what went into each one.",
};

// TODO: scaffold. Spec in docs/plans/customer-builds.md.
//
// An L1 named for the thing rather than a container. It was a child of
// Community until a look at the segment showed nobody wraps this: Custom
// Offsets puts Search Gallery and Add My Truck at top level, Rough Country
// surfaces Customer Builds directly, Krietz Customs leads with Gallery. The
// gallery is the draw, so it belongs in the bar.
//
// **One page, not a section.** The grid, the social feed and the submit CTA
// all live here, which is why this L1 has no children and renders as a plain
// link with no dropdown. It graduates to a container the day the grid outgrows
// sharing a page — not before, or it is three thin cards again.
//
// Reserved in PROXY_RESERVED_SEGMENTS so no collection handle can shadow it.
export default function CustomerBuildsPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Customer builds
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Trucks we built, and what went into each one.
        </p>

        {/* TODO: the grid. Photo, truck, parts, one line each — at 100+ entries
            anything heavier never gets published. Every entry carries a vehicle
            reference from day one (spec §2.2): filtering by truck,
            model-specific search traffic, and "builds like yours" against the
            garage all depend on it, and retrofitting it later never happens. */}

        {/* TODO: filter by vehicle, reusing the garage's make/model slugs. */}

        {/* TODO: the social feed. Needs a fallback for when the API is down or
            rate-limited — it cannot be allowed to take the page with it. */}

        <section className="mt-20 border-t border-tl-hairline pt-10">
          <h2 className="font-tl-sans text-2xl font-bold uppercase tracking-[0.01em] text-tl-ink">
            Running our parts?
          </h2>
          <p className="mt-4 max-w-xl font-tl-text text-tl-steel">
            Send us your truck and we&apos;ll put it up here.
          </p>
          {/* TODO: the submission form — vehicle picked with the garage's
              picker rather than free text, a rights checkbox, and a queue a
              human works through. Nothing publishes unreviewed. Spec §3. */}
          <Link
            href="/contact"
            className="mt-6 inline-flex h-12 items-center rounded-[3px] bg-tl-indigo px-6 font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-tl-indigo-lift"
          >
            Submit your build
          </Link>
        </section>
      </div>
      <Footer />
    </>
  );
}
