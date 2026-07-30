import type { Metadata } from "next";

import Footer from "components/layout/footer";

export const metadata: Metadata = {
  title: "The Manual",
  description:
    "How things work — suspension, wiring, lifts, and what we learned building them.",
};

// TODO: scaffold. Spec in docs/plans/the-manual.md.
//
// An L1 in its own right, not a child of Community: it is reference and
// expertise, where Community is about people. It is also the section most
// likely to bring strangers to the site at all, which is a poor reason to
// bury it two clicks down.
//
// **Reference, not a blog.** Articles are written to be looked up and updated
// in place, so nothing here carries a dateline — a neglected blog advertises
// the neglect, a manual just looks like reference.
//
// Articles live at /the-manual/<slug> and need the content source settled
// before any of them exist (community.md §3.3 — a metaobject, shared with
// Customer Builds).
export default function TheManualPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          The Manual
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          How things work — suspension, wiring, lifts, and what we learned
          building them.
        </p>

        {/* TODO: the index. Grouped by topic rather than dated: electrical,
            suspension, lighting, buying guides. */}
        {/* TODO: decide whether topics become L2 nav entries or stay
            on-page — see the spec. */}
      </div>
      <Footer />
    </>
  );
}
