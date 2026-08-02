import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import { ImageSlot } from "../_components/image-slot";
import { QuoteCta } from "../_components/quote-cta";

export const metadata: Metadata = {
  title: "Inside the Shop",
  description:
    "One bay in Tuscaloosa, and how a truck moves through it — design, order, install, delivery.",
};

// Spec: docs/plans/custom-work.md §3, and its §8 risk. **The process lives
// here, not on Services.** Services is the commercial offer; this is the
// physical place and what happens in it. Keeping that line drawn is the most
// likely content failure in this section, so anything reading as a price, a
// service list or a sales sequence belongs on the other page.
//
// No team section — the people belong to the brand story, not the shop tour.
//
// **The thesis: one bay means the room becomes each stage in turn.** At a
// bigger shop a truck moves between bays and the process is a floor plan. Here
// it's a calendar, and the same space is the design table, the staging area and
// the install bay in sequence. That's the honest version and it's also the
// better story, so the page is built on it.
//
// **Numbering is used here and almost nowhere else on the site**, because this
// is one of the few places the content genuinely is an ordered sequence — the
// reader needs to know order comes before install. Barlow Condensed carries the
// numerals: it's in the design system, barely used anywhere else, and
// stencilled numerals are the right vernacular for a shop wall.

const STAGES = [
  {
    n: "01",
    title: "Design",
    lead: "We work out what the truck should be before a single part is ordered — what fits, what it costs, and what your budget actually buys. Most people arrive with an idea rather than a list, and this is where it becomes one.",
    // "You" is the structural device on this page, in place of a duration or a
    // price. It encodes something true and reassuring: almost none of this
    // needs anything from the customer.
    you: "Tell us the truck and the idea.",
    imageBrief:
      "The design end of the bay — a laptop or a printed part list on the bench, ideally with a truck behind it. It doesn't need to be tidy, it needs to look like thinking.",
  },
  {
    n: "02",
    title: "Order",
    lead: "Everything gets sourced and staged before your truck comes in. Parts land here, get checked against the list, and anything going out for coating goes out early — so the bay is never tied up waiting on a box.",
    you: "Approve the list and the number.",
    imageBrief:
      "Boxes and parts staged on the floor or a bench before a build — the pile that becomes one truck. This single shot does more for trust than any paragraph about planning.",
  },
  {
    n: "03",
    title: "Install",
    lead: "One bay, one truck at a time. Harnesses get loomed and hidden, hardware gets torqued, coated parts come back and go on. Nothing gets rushed to make room for the next job, because there is no next job until yours leaves.",
    // TODO(copy): confirm the photo updates line before this ships — it's the
    // most quotable promise on the page and the easiest to be held to.
    you: "Nothing. We send photos as it goes.",
    imageBrief:
      "The truck up on the lift mid-install, panels off, wiring visible. The least glamorous and most convincing photograph on the page — resist tidying up for it.",
  },
  {
    n: "04",
    title: "Delivery",
    lead: "You see it before you take it. We walk the truck with you, show you the app and the switch, and hand over the leftover hardware along with anything that came off. Then it goes out clean.",
    you: "Drive it.",
    imageBrief:
      "The finished truck leaving, or the walk-around happening — owner and truck in the same frame. Outside, end of day if you can get it.",
  },
];

export default function InsideTheShopPage() {
  return (
    <>
      <HeroBanner />
      <ThePlace />
      <TheProcess />
      {/* Feed slot, reserved by spec §3.4 — renders nothing until the content
          source is settled. An empty section under a heading is worse than no
          section, so there is deliberately no markup here yet. */}
      <div className="page-width pb-20 md:pb-24">
        <QuoteCta heading="Come see it" />
      </div>
      <Footer />
    </>
  );
}

// The hero states the whole page in one screen: the room, and the four things
// that happen in it. The stage strip along the bottom is the page's table of
// contents — a visitor who reads nothing else still leaves knowing the
// sequence.
//
// Shorter than the Services hero, which has to sell, and built the same way so
// dropping the photograph in moves nothing:
//
//   <Image src={shop} alt="" fill priority className="object-cover" />
//
// goes above the scrim, and the brief note deletes with it.
function HeroBanner() {
  return (
    <section className="relative isolate flex min-h-[460px] flex-col justify-end overflow-hidden bg-tl-shell-deep md:min-h-[62svh] md:max-h-[680px]">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/50 to-black/25"
      />

      {/* Photo brief — delete this block with the image. */}
      <div className="page-width pointer-events-none absolute inset-x-0 top-0 pt-8">
        <p className="ml-auto max-w-[34ch] border border-dashed border-white/25 bg-white/[0.04] p-4 font-tl-text text-sm leading-snug text-white/70">
          <span className="mb-1.5 block font-tl-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
            Banner photo
          </span>
          The bay itself, wide, door open, a truck in it. Shoot from the doorway
          so the room reads as a room rather than a close-up. Keep the bottom
          third quiet — the headline sits there.
        </p>
      </div>

      <div className="page-width relative w-full pb-10 pt-36 md:pb-12">
        <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
          Tuscaloosa, Alabama · By appointment only
        </p>
        <h1 className="mt-5 max-w-[14ch] font-tl-sans text-5xl font-bold uppercase leading-[0.95] tracking-[-0.01em] text-white md:text-7xl">
          Inside the shop
        </h1>
        <p className="mt-5 max-w-[48ch] font-tl-text text-lg leading-relaxed text-white/75">
          One bay, one truck at a time, and everything that happens between
          dropping it off and driving it home.
        </p>

        {/* The page's spine, previewed. Same numerals and same order as the
            process section below. */}
        <ol className="mt-10 flex list-none flex-wrap gap-x-7 gap-y-2 border-t border-white/15 p-0 pt-5">
          {STAGES.map((stage) => (
            <li
              key={stage.n}
              className="font-tl-mono text-[10px] uppercase tracking-[0.16em]"
            >
              <span className="text-white/35">{stage.n}</span>{" "}
              <span className="text-white/75">{stage.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Small is the fact, so the page leads with it and treats it as the reason to
// choose the shop rather than something to work around. Pretending to be bigger
// is the one thing that would make a one-bay shop look worse than it is.
function ThePlace() {
  return (
    <section className="page-width py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
        <div>
          <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
            The place
          </p>
          <h2 className="mt-4 max-w-[16ch] font-tl-sans text-4xl font-bold uppercase leading-[1.02] tracking-[0.01em] text-tl-ink md:text-5xl">
            One bay, and that&apos;s on purpose
          </h2>
          <div className="mt-6 grid max-w-[52ch] gap-4 font-tl-text text-lg leading-relaxed text-tl-steel">
            <p>
              Everything happens in one bay in Tuscaloosa. One truck is in it at
              a time, booked by appointment, so nothing sits half-finished while
              a walk-in jumps the line.
            </p>
            <p>
              It also means we turn work away when the calendar is full rather
              than take it and stack it. If we give you a date, the bay is
              yours.
            </p>
            <p className="text-tl-mute-white">
              A retail space is coming. Right now the shop is a shop.
            </p>
          </div>

          <dl className="mt-9 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-tl-hairline pt-6 sm:grid-cols-3">
            {[
              ["Bays", "One"],
              ["Trucks at a time", "One"],
              ["Walk-ins", "By appointment"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="font-tl-mono text-[10px] uppercase tracking-[0.14em] text-tl-mute-white">
                  {label}
                </dt>
                <dd className="mt-1.5 font-tl-sans text-lg font-bold uppercase tracking-[0.01em] text-tl-ink">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="grid gap-5">
          <ImageSlot
            ratio="aspect-[4/3]"
            brief="The bay from the inside with a truck on the lift — the working shot. People look at this one longest, so pick the day the shop looked most like itself."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            <ImageSlot
              ratio="aspect-square"
              brief="A corner that says who works here — the bench, the tool wall, the coating rack."
            />
            <ImageSlot
              ratio="aspect-square"
              brief="Detail. A loom being taped, a torque wrench, parts laid out. Close and specific."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// The signature. Built as a work order rather than a marketing funnel: a ruled
// row per stage, the number set large in condensed type down the left like a
// bay marking, and a "You" line saying what the customer owes at that point.
// The rule-and-numeral column is what makes it read as a shop document instead
// of a four-step graphic.
function TheProcess() {
  return (
    <section className="bg-tl-fog py-20 md:py-28">
      <div className="page-width">
        <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
          How a truck moves through
        </p>
        <h2 className="mt-4 max-w-[20ch] font-tl-sans text-4xl font-bold uppercase leading-[1.02] tracking-[0.01em] text-tl-ink md:text-5xl">
          Design, order, install, delivery
        </h2>
        <p className="mt-5 max-w-[54ch] font-tl-text text-lg leading-relaxed text-tl-steel">
          With one bay there is nowhere for a truck to move to, so the room
          changes instead — design table, staging area, install bay, in that
          order.
        </p>

        <ol className="mt-14 list-none p-0">
          {STAGES.map((stage) => (
            <li
              key={stage.n}
              className="grid gap-x-8 gap-y-6 border-t border-tl-hairline py-10 first:border-t-2 first:border-t-tl-ink md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,17rem)] md:py-12"
            >
              {/* Structure, not decoration — the numerals sit at low contrast
                  and let the titles carry.

                  Italic and 700 because that is the only Barlow Condensed the
                  app loads (app/layout.tsx sets `style: ["italic"]`, weights
                  700/800), so anything else silently falls back to a synthesised
                  face. It also happens to be right: slanted condensed numerals
                  read as race numbers, and this is the first real use of a
                  typeface the site has been loading and never showing. */}
              <span
                aria-hidden
                className="font-tl-condensed text-6xl font-bold italic leading-none tracking-[-0.01em] text-tl-ink/20 md:text-7xl"
              >
                {stage.n}
              </span>

              <div>
                <h3 className="font-tl-sans text-2xl font-bold uppercase tracking-[0.01em] text-tl-ink md:text-3xl">
                  {stage.title}
                </h3>
                <p className="mt-4 max-w-[52ch] font-tl-text leading-relaxed text-tl-steel">
                  {stage.lead}
                </p>
                <p className="mt-5 font-tl-mono text-[11px] uppercase leading-relaxed tracking-[0.12em] text-tl-mute-white">
                  <span className="text-tl-ink">You</span> · {stage.you}
                </p>
              </div>

              <ImageSlot ratio="aspect-[4/3]" brief={stage.imageBrief} />
            </li>
          ))}
        </ol>

        <p className="mt-10 font-tl-text text-tl-steel">
          The trucks that have been through it are on{" "}
          <Link
            href="/custom-work/builds"
            className="text-tl-ink underline underline-offset-4"
          >
            our builds
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
