import type { Metadata } from "next";

import Footer from "components/layout/footer";

export const metadata: Metadata = {
  title: "Lifestyle",
};

// TODO: placeholder — L1 nav section landing page, to be custom-built.
// L1 items are standalone destinations outside the category URL space
// (CLAUDE.md, "The category URL space"), so this static route shadows
// the [...path] catch-all.
export default function LifestylePage() {
  return (
    <>
      <div className="mx-8 max-w-2xl py-20 sm:mx-auto">
        <h1 className="text-5xl font-bold">Lifestyle</h1>
      </div>
      <Footer />
    </>
  );
}
