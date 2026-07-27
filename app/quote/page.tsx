import type { Metadata } from "next";

import Footer from "components/layout/footer";
import { SHOP_PHONE_DISPLAY, SHOP_PHONE_HREF } from "lib/constants";

export const metadata: Metadata = {
  title: "Get a Quote",
  description:
    "Tell us about your truck and what you want done. Full builds and single installs both start here.",
};

// TODO: placeholder — the questionnaire itself is still to be built.
//
// **Question one must be the scope split**: full build vs install / package.
// The announcement band's CTA is deliberately broad ("Get A Quote") so it
// recruits the bolt-on customer as well as the ground-up one — see
// docs/shopify-setup.md Part 4.2 on why Custom Work is named the way it is. If
// this form opens with ground-up questions, every install enquiry bounces and
// the broad CTA becomes a liability instead of a funnel.
//
// This is the one page where the phone number belongs up front: everybody
// reading it is a shop customer by definition, so it carries none of the
// ecommerce-support-volume risk that kept the number out of the mobile band.
//
// Reserved in PROXY_RESERVED_SEGMENTS so no collection handle can
// shadow it.
export default function QuotePage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Get a quote
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Tell us about your truck and what you want done. A full build and a
          single install both start here.
        </p>

        {/* TODO: the questionnaire. Scope split first, then branch. */}

        {SHOP_PHONE_DISPLAY ? (
          <p className="mt-9 font-tl-text text-sm text-tl-steel">
            Rather talk it through?{" "}
            <a href={SHOP_PHONE_HREF} className="text-tl-ink underline">
              {SHOP_PHONE_DISPLAY}
            </a>
          </p>
        ) : null}
      </div>
      <Footer />
    </>
  );
}
