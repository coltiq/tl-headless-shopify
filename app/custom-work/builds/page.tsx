import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Our Builds",
  description: "Trucks that left our shop, start to finish.",
};

// TODO: scaffold. Outline in docs/plans/custom-work.md §3, content source in §4
// — the grid has no backing store yet, which is the same decision the blog is
// waiting on.
//
// The paragraph distinguishing this from Community's Customer Builds is not
// decoration: without it the two pages read as the same thing (spec §7).
export default function BuildsPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Our builds
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Trucks that left our shop, start to finish.
        </p>

        {/* TODO: the grid — photo, truck, scope, one line each. No filters. */}

        <section className="mt-16 border-t border-tl-hairline pt-8">
          <p className="max-w-xl font-tl-text text-tl-steel">
            These are ours, built in our bays. For trucks you built running our
            parts, see{" "}
            <Link
              href="/community"
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
