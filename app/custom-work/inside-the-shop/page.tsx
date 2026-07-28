import type { Metadata } from "next";

import Footer from "components/layout/footer";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Inside the Shop",
  description: "The bays, the tools, and the people running them.",
};

// TODO: scaffold. Outline in docs/plans/custom-work.md §3.
//
// This page is spatial — where the work happens. The commercial sequence
// (quote → scope → schedule → build → handoff) belongs on Services, and
// splitting them is what keeps the two pages from converging.
export default function InsideTheShopPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Inside the shop
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          The bays, the tools, and the people running them.
        </p>

        {/* TODO: the place — bays and equipment, photo-led. */}
        {/* TODO: the people — the team. */}
        {/* TODO: how a truck moves through the shop, spatially. */}
        {/* TODO: feed slot — reserved, renders nothing until the content
            source is settled. */}

        <QuoteCta heading="Come see it" />
      </div>
      <Footer />
    </>
  );
}
