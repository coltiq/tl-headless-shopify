import type { Metadata } from "next";

import Footer from "components/layout/footer";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Build Pricing",
  description:
    "Starting prices for every service, and what moves the number on your truck.",
};

// TODO: scaffold. Not in the original spec — added once the links row needed a
// third button for the visitor who is not ready to ask for a quote yet.
//
// **Ranges, not floors.** "From $800" anchors someone at $800 and makes the
// $2,400 quote feel like a switch. A range plus a typical figure costs nothing
// and defuses that before it reaches the phone.
//
// **Every service needs its "what moves the number" line** — lift height,
// re-gearing, wheel and tyre choice. That line is where the expertise shows and
// it pre-empts the call the bare table would generate.
//
// Offers stay off this page: a pricing page leading with discounts reads as a
// sale, which fights the standard the shop sells on. The announcement rotator
// is the home for those.
export default function PricingPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Build pricing
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          What things start at, and what moves the number on your truck.
        </p>

        {/* TODO: the chart — per service, a range, a typical figure, and one
            line on what drives it.

            /custom-work/services already deep-links four sections by id, so
            these are a contract: #rock-lights, #wheel-lights, #lifts,
            #paint-matching. Any one the chart won't cover should lose its link
            there rather than keep a dead anchor here. */}
        {/* TODO: the shop labour rate. */}
        {/* TODO: one or two real builds with their actual totals. */}

        <QuoteCta heading="Get a number for your truck" />
      </div>
      <Footer />
    </>
  );
}
