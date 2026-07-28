import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Lighting, lifts, bumpers, wheels, wiring — what we do and how a job runs.",
};

// TODO: scaffold. Outline in docs/plans/custom-work.md §3.
//
// **Purely the offer** — what we will do to someone's truck. How the shop runs
// is Inside the Shop's job, told against the space it happens in. Keeping the
// two apart is what stops the pages converging.
export default function ServicesPage() {
  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Our services
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          A full build or a single install — the work is the same standard
          either way.
        </p>

        {/* TODO: grouped service list — lighting installs, lift and leveling,
            bumpers and armour, wheels and tyres, audio, wiring and electrical,
            full builds. One line of copy each. */}
        <Section title="What we do" />

        <Section title="What it costs">
          <p className="mt-4 max-w-xl font-tl-text text-tl-steel">
            Starting prices for every service, and what moves the number, are on{" "}
            <Link
              href="/custom-work/pricing"
              className="text-tl-ink underline underline-offset-4"
            >
              build pricing
            </Link>
            .
          </p>
        </Section>

        <QuoteCta heading="Tell us what you're after" />
      </div>
      <Footer />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="mt-16">
      <h2 className="font-tl-sans text-2xl font-bold uppercase tracking-[0.01em] text-tl-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
