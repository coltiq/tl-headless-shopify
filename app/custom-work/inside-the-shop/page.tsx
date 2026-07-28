import type { Metadata } from "next";

import Footer from "components/layout/footer";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Inside the Shop",
  description: "The shop, and how a truck moves from design to delivery.",
};

// TODO: scaffold. Outline in docs/plans/custom-work.md §3.
//
// The shop and how it operates. **The process lives here** — design, build,
// delivery — told visually against the space it happens in, rather than as a
// commercial sequence on Services. Services stays purely the offer.
//
// No team section: the people belong to the brand story, not the shop tour.
export default function InsideTheShopPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Inside the shop
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          The shop, and how a truck moves from design to delivery.
        </p>

        {/* TODO: the place — one bay today, photo-led; retail area when built. */}
        {/* TODO: how the shop operates — design, build, delivery. */}
        {/* TODO: feed slot — reserved, renders nothing until the content
            source is settled. */}

        <QuoteCta heading="Come see it" />
      </div>
      <Footer />
    </>
  );
}
