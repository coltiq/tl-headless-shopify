import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { vehicleLabel } from "lib/fitment";
import { getTruckBuilds } from "lib/shopify";
import { QuoteCta } from "../_components/quote-cta";
import { BuildCard } from "./_components/build-card";

export const metadata: Metadata = {
  title: "Our Builds",
  description: "Trucks that left our shop, start to finish.",
};

// Spec: docs/plans/custom-work.md §3 and §4. §4 said ship a hardcoded array and
// build the metaobject later; the metaobject came first instead, so the grid is
// live from `truck_build` and per-build pages exist from day one.
//
// **A thin banner, not a hero.** Services opens with a full-height photograph
// because its job is to sell. This page's photographs are the grid — a tall
// hero above them would compete with the thing it introduces and push the first
// row under the fold.
//
// The paragraph distinguishing this from Customer Builds is not decoration:
// without it the two pages read as the same thing (spec §7).
export default async function BuildsPage() {
  const builds = await getTruckBuilds();

  return (
    <>
      <section className="bg-tl-shell py-14 text-white md:py-20">
        <div className="page-width">
          <h1 className="font-tl-sans text-4xl font-bold uppercase leading-none tracking-[0.01em] md:text-6xl">
            Our builds
          </h1>
          <p className="mt-4 max-w-[46ch] font-tl-text text-lg text-white/70">
            Trucks that left our shop, start to finish.
          </p>
        </div>
      </section>

      <div className="page-width py-16 md:py-20">
        {builds.length > 0 ? (
          // Four across on desktop, as asked. No filters above it — the set is
          // small enough to read, and Customer Builds is where volume lives.
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
            {builds.map((build) => (
              <BuildCard
                key={build.slug}
                slug={build.slug}
                heading={build.heading}
                summary={build.summary}
                hero={build.hero}
                partCount={build.products.length}
                // Only when the heading is a nickname. Without one the heading
                // *is* the truck, and an eyebrow would repeat it.
                vehicle={
                  build.title && build.vehicle
                    ? vehicleLabel(build.vehicle)
                    : null
                }
              />
            ))}
          </div>
        ) : (
          // Reached when nothing is published — and identically when the
          // metaobject can't be read at all. getTruckBuilds logs the difference;
          // the page renders either way rather than 500ing.
          <p className="max-w-[52ch] border border-dashed border-tl-hairline p-8 font-tl-text text-tl-steel">
            The first builds are going up here shortly.
          </p>
        )}

        <section className="mt-20 border-t border-tl-hairline pt-8">
          <p className="max-w-xl font-tl-text text-tl-steel">
            These are ours, built in our bays. For trucks you built running our
            parts, see{" "}
            <Link
              href="/customer-builds"
              className="text-tl-ink underline underline-offset-4"
            >
              customer builds
            </Link>
            .
          </p>
        </section>

        <QuoteCta heading="Want one of your own?" />
      </div>
      <Footer />
    </>
  );
}
