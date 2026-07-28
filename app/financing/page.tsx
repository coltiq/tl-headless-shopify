import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { QuoteCta } from "app/custom-work/_components/quote-cta";

export const metadata: Metadata = {
  title: "Financing",
  description: "Ways to pay for a build without paying for it all at once.",
};

// TODO: scaffold. Reached from the Custom Work links row and, once it exists,
// from the retail side too.
//
// At the root rather than under Custom Work because **one product covers both
// halves of the business** — the same method finances a five-figure build and a
// parts order. A page nested under the shop section would have been invisible
// to every parts customer it also applies to, and reserving one segment is the
// cheaper mistake.
//
// Say the numbers plainly: who the lender is, typical terms, what a monthly
// looks like, and whether applying touches credit. A financing page that will
// not name a rate reads as a page hiding one. Two worked examples, not one —
// a build total and a parts order — or the page silently reads as build-only
// again.
export default function FinancingPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Financing
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Ways to pay for a build — or a cart full of parts — without paying for
          it all at once.
        </p>

        {/* TODO: who the lender is and what the terms actually are. */}
        {/* TODO: two worked examples — a build total and a parts order. */}
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
