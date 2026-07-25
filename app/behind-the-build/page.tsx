import type { Metadata } from "next";

import Footer from "components/layout/footer";

export const metadata: Metadata = {
  title: "Behind The Build",
};

// TODO: placeholder — L1 nav section landing page, to be custom-built.
// L1 items are standalone destinations outside the category URL space
// (docs/plans/PLAN-CATEGORY-URLS.md decision 2), so this static route shadows
// the [...path] catch-all.
export default function BehindTheBuildPage() {
  return (
    <>
      <div className="mx-8 max-w-2xl py-20 sm:mx-auto">
        <h1 className="text-5xl font-bold">Behind The Build</h1>
      </div>
      <Footer />
    </>
  );
}
