import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Financing",
  description: "Ways to pay for a build without paying for it all at once.",
};

// TODO: scaffold. The third and fourth buttons in the Custom Work links row
// point here and at /custom-work/pricing.
//
// Nested under the section rather than sitting at /financing because this is
// *build* financing — a five-figure job over months. Instalments on a $200
// light bar are a checkout feature, not this page. If it ever covers both,
// move it to the root and reserve the segment; until then it costs no
// namespace.
//
// Say the numbers plainly: who the lender is, typical terms, what a monthly
// looks like on a real build total, and whether applying affects credit. A
// financing page that will not name a rate reads as a page hiding one.
export default function FinancingPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Financing
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Ways to pay for a build without paying for it all at once.
        </p>

        {/* TODO: who the lender is and what the terms actually are. */}
        {/* TODO: a worked example against a real build total. */}
        {/* TODO: what applying involves, and whether it touches credit. */}

        <section className="mt-16 border-t border-tl-hairline pt-8">
          <p className="max-w-xl font-tl-text text-tl-steel">
            Working out what your truck would cost first?{" "}
            <Link
              href="/custom-work/pricing"
              className="text-tl-ink underline underline-offset-4"
            >
              Build pricing
            </Link>{" "}
            has starting prices for every service.
          </p>
        </section>

        <QuoteCta heading="Ready when you are" />
      </div>
      <Footer />
    </>
  );
}
