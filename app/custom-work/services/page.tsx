import type { Metadata } from "next";
import Link from "next/link";

import Footer from "components/layout/footer";
import {
  BUILD_PHONE_DISPLAY,
  BUILD_PHONE_HREF,
  LIGHTING_PHONE_DISPLAY,
  LIGHTING_PHONE_HREF,
  SHOP_PHONE_DISPLAY,
  SHOP_PHONE_HREF,
} from "lib/constants";
import { CallBar } from "../_components/call-bar";
import { ImageSlot } from "../_components/image-slot";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Rock lights, wheel lights, lifts, paint matching, powder coating — from one install to a full build. Tuscaloosa, Alabama.",
};

// Spec: docs/plans/custom-work.md §3. Purely the offer — how the shop runs
// belongs to Inside the Shop, and keeping that line drawn is what stops the two
// pages converging.
//
// **Four services carry the page.** Rock lights, wheel lights, lifts and paint
// matching are what the shop is actually known for, so they get photographs and
// room; everything else is a list. A page that gave fourteen services equal
// weight would say the shop does everything and is known for nothing.
//
// **The quote form is the primary action, not the phone.** Whoever picks up
// takes down a name, a truck and a list — they can't price a job — so a
// call-first page would promise an answer the call can't give. The form asks
// the same questions with no transcription in the middle and no opening hours.
// The number stays visible everywhere, described accurately.
//
// **The direct lines are a footnote, not a structure.** An earlier pass grouped
// every service under the owner who does it; that made an internal split the
// visitor's problem. They're two numbers at the bottom for people who already
// know what they want.
//
// This page deliberately does not use the shared QuoteCta — it needs the
// callback expectation set alongside the buttons, which that block has no room
// for.

// `price` deep-links the pricing page rather than the product catalogue. A link
// to the rock light collection would trade an install lead for a kit sale and
// drop the visitor out of the funnel — and this section's own argument is that
// anyone can sell you the parts. Products get sold on the Parts side.
//
// TODO(pricing): these anchors don't exist yet — app/custom-work/pricing is
// still a scaffold. They land at the top of the page until it has sections. Any
// service the chart won't cover should lose its link rather than keep a dead
// one.
//
// TODO(copy): `spec` is the most persuasive thing on the page precisely because
// it's concrete, so every figure has to be true. Rock lights are confirmed;
// check the other three.
const FEATURED = [
  {
    title: "Rock lights",
    lead: "Pods under the truck, wiring you can't see, and no rattle six months later. The install is the product — anyone can sell you a kit. Run the controller and the whole thing lives on our own app.",
    // Not "8–40". A range reads as a menu with a ceiling; the floor and the
    // absence of one are two different facts, and the second is the claim
    // worth making.
    spec: "8 pods minimum · no maximum · custom or plug-and-play harness",
    price: "/custom-work/pricing#rock-lights",
    imageBrief:
      "The truck at night, lit from underneath, parked somewhere dark. Shot low and from the front three-quarter so the glow spills across the ground. This is the money shot of the whole page.",
  },
  {
    title: "Wheel lights",
    // The hardware is the whole pitch. A self-tapper backing out is a failure
    // the customer has probably already had, so naming the thing we don't do
    // beats any adjective about quality.
    lead: "Rings mounted on bolts and lock nuts — not the self-tappers most installs run, which work loose with vibration. Two rows for a clean glow, twenty for a show truck, all on the same app as the rock lights.",
    // Not "switch or app" — the app is always there, and a switch panel is
    // something you add to it. Framing them as alternatives got the product
    // wrong. This also keeps the slot on a fact the lead doesn't already have.
    spec: "2, 4, 5, 10 & 20-row rings · bolts and lock nuts · optional switch panel",
    price: "/custom-work/pricing#wheel-lights",
    imageBrief:
      "One wheel, tight and square on, ring lit, dark background — a product photograph more than a truck photograph. If you have a build shot of the mounts bolted up before the wheel went back on, use that instead: it proves the hardware claim this row is making.",
  },
  {
    title: "Lifts & leveling",
    lead: "From a leveling kit on a Saturday to a full lift with the geometry sorted out. We'll tell you what the tire size you want actually requires.",
    spec: "2–8 in. · alignment after · re-gear when it needs it",
    price: "/custom-work/pricing#lifts",
    imageBrief:
      "A truck on the lift with the suspension exposed, or a before/after of the same truck at ride height. Show the work, not just the stance.",
  },
  {
    title: "Paint matching",
    lead: "Bumpers, flares, hard parts and panels matched to your factory code and blended so the repair doesn't announce itself.",
    spec: "OEM code match · blended · panels & hard parts",
    price: "/custom-work/pricing#paint-matching",
    imageBrief:
      "A freshly matched part next to the truck it's going on — close enough to see there's no seam in the colour. A bumper or a set of flares works well.",
  },
];

// Everything the featured four don't cover. Flat and unglamorous on purpose:
// its job is to answer "do you do X" for the person scanning for one word.
const ALSO = [
  "Light bars & pods",
  "Ditch & reverse lighting",
  "Wiring, harnesses & switch panels",
  "Audio & 12V power",
  "Powder coating",
  "Suspension & re-gearing",
  "Wheels & tires",
  "Bumpers, armor & steps",
  "Bed covers & tonneaus",
  "Exhaust work",
  "Full builds, start to finish",
];

// Two numbers for people who already know which side of the shop they need.
// Both fall back to the main line while empty, so the page ships today and
// splits by editing lib/constants.ts — no dead tel: link in the meantime.
const DIRECT_LINES = [
  {
    label: "Lighting & electrical",
    scope: "Rock lights, wheel lights, wiring, audio",
    display: LIGHTING_PHONE_DISPLAY || SHOP_PHONE_DISPLAY,
    href: LIGHTING_PHONE_HREF || SHOP_PHONE_HREF,
  },
  {
    label: "Suspension, paint & builds",
    scope: "Lifts, powder coating, paint matching, full builds",
    display: BUILD_PHONE_DISPLAY || SHOP_PHONE_DISPLAY,
    href: BUILD_PHONE_HREF || SHOP_PHONE_HREF,
  },
];

export default function ServicesPage() {
  return (
    <>
      <HeroBanner />
      {/* pb-28 clears the mobile call bar, which would otherwise sit on top of
          the closing CTA — the one element it must never cover. */}
      <div className="page-width pb-28 pt-20 md:pb-24 md:pt-28">
        <Featured />
        <Also />
        <Costs />
        <DirectLines />
        <Closing />
      </div>
      <CallBar />
      <Footer />
    </>
  );
}

// The whole niche is sold on photographs, so the page opens with one at full
// bleed rather than arguing in text above a picture. Everything below it is
// constrained to page-width; this is the only element that breaks out.
//
// The layout is final while the photograph is missing — the dark plate below is
// exactly the surface the image will sit on, and the scrim is already in place,
// so dropping the file in moves nothing. To fill it, add above the scrim:
//
//   <Image src={hero} alt="" fill priority className="object-cover" />
//
// and delete the brief note.
function HeroBanner() {
  return (
    <section className="relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden bg-tl-shell-deep md:min-h-[78svh] md:max-h-[840px]">
      {/* Scrim. Sized so the type stays legible over a bright dusk shot without
          flattening the photograph into a grey rectangle. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/20"
      />

      {/* Photo brief — delete this block with the image. */}
      <div className="page-width pointer-events-none absolute inset-x-0 top-0 pt-8">
        <p className="ml-auto max-w-[34ch] border border-dashed border-white/25 bg-white/[0.04] p-4 font-tl-text text-sm leading-snug text-white/70">
          <span className="mb-1.5 block font-tl-mono text-[10px] uppercase tracking-[0.14em] text-white/50">
            Banner photo
          </span>
          The best truck you have ever finished, shot wide outside the shop at
          dusk with the rock lights on. Leave room low and left for the
          headline, and keep the sky out of the bottom third so the text stays
          readable.
        </p>
      </div>

      <div className="page-width relative w-full pb-14 pt-40 md:pb-20">
        <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
          Tuscaloosa, Alabama · By appointment only
        </p>
        <h1 className="mt-5 max-w-[16ch] font-tl-sans text-5xl font-bold uppercase leading-[0.95] tracking-[-0.01em] text-white md:text-7xl lg:text-8xl">
          What we do to trucks
        </h1>
        <p className="mt-6 max-w-[46ch] font-tl-text text-lg leading-relaxed text-white/75">
          Rock lights, wheel lights, lifts, paint matching, powder coating —
          from one install to a truck built from the frame up.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
          <Link
            href="/quote"
            className="inline-flex h-14 items-center rounded-[3px] bg-white px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-tl-ink transition-colors hover:bg-white/85"
          >
            Start a quote
          </Link>
          {SHOP_PHONE_DISPLAY ? (
            <a
              href={SHOP_PHONE_HREF}
              className="inline-flex h-14 items-center rounded-[3px] border border-white/40 px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white/[0.08]"
            >
              Or call {SHOP_PHONE_DISPLAY}
            </a>
          ) : null}
        </div>
        {/* Promises a reply, not a price. Most jobs can't be quoted off a form
            — people arrive with an idea rather than a spec, and working out
            what they actually want is the job. So the only same-evening
            commitment is that someone answers. */}
        <p className="mt-5 font-tl-mono text-[11px] uppercase tracking-[0.12em] text-white/55">
          We get back to you the same evening
        </p>
      </div>
    </section>
  );
}

function Featured() {
  return (
    <section>
      <SectionHeading
        eyebrow="What we're known for"
        title="Four things we do more than anything else"
      />

      <div className="mt-12 grid gap-14 md:gap-20">
        {FEATURED.map((service, i) => (
          <article
            key={service.title}
            className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            // Alternating sides: with four photographs stacked, a fixed column
            // turns the section into a catalogue. The zigzag makes each one
            // land as its own thing.
          >
            <ImageSlot
              ratio="aspect-[3/2]"
              brief={service.imageBrief}
              className={i % 2 === 1 ? "md:order-2" : undefined}
            />
            <div>
              <h3 className="font-tl-sans text-4xl font-bold uppercase leading-none tracking-[0.01em] text-tl-ink md:text-5xl">
                {service.title}
              </h3>
              <p className="mt-5 max-w-[44ch] font-tl-text text-lg leading-relaxed text-tl-steel">
                {service.lead}
              </p>
              {/* The scope of the job in the fewest possible words, with its
                  price link riding the same rule. Mono and rule-topped so the
                  row reads as a spec sheet rather than four more CTAs — it's
                  the concrete detail that makes the paragraph credible, and
                  "what does that cost" is the next question either way. */}
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-tl-hairline pt-4 font-tl-mono text-[11px] uppercase tracking-[0.12em]">
                <p className="max-w-[42ch] leading-relaxed text-tl-mute-white">
                  {service.spec}
                </p>
                <Link
                  href={service.price}
                  className="shrink-0 text-tl-indigo underline underline-offset-4 transition-colors hover:text-tl-indigo-lift"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Also() {
  return (
    <section className="mt-24 border-t border-tl-hairline pt-14">
      <SectionHeading
        eyebrow="Also in the shop"
        title="And the rest of it"
        lead="If it bolts to a truck, ask. We turn down work we'd do badly, and we'll say so on the first call."
      />
      <ul className="mt-9 grid list-none gap-x-10 gap-y-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {ALSO.map((item) => (
          <li
            key={item}
            className="flex items-baseline gap-3 border-b border-tl-hairline pb-3 font-tl-text text-[15px] text-tl-ink"
          >
            <span aria-hidden className="text-tl-hairline">
              —
            </span>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Costs() {
  return (
    <section className="mt-24 border-t border-tl-hairline pt-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="What it costs"
            title="Most of it gets figured out together"
          />
          <div className="mt-6 grid max-w-[54ch] gap-4 font-tl-text leading-relaxed text-tl-steel">
            <p>
              Almost nothing here has one price. A lift depends on the height,
              whether you&apos;re re-gearing, and what you&apos;re running for
              wheels and tires — a number before those answers would be a guess.
            </p>
            <p>
              Most people come to us with an idea rather than a parts list, so
              the first conversation is usually about working out what you
              actually want. Simple jobs we can price on the spot. Bigger ones
              take a call or two, and you&apos;ll see a written number before
              anything starts.
            </p>
          </div>
          <Link
            href="/custom-work/pricing"
            className="mt-7 inline-flex items-center gap-2 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-tl-indigo underline underline-offset-4"
          >
            See what things start at
            <span aria-hidden>→</span>
          </Link>
        </div>

        <ImageSlot
          ratio="aspect-[4/3]"
          brief="Something that reads as care rather than commerce — a torque wrench on a fastener, a panel gap being checked, hands doing detail work. It is arguing that the price buys attention, so avoid anything that looks like paperwork."
        />
      </div>
    </section>
  );
}

function DirectLines() {
  return (
    <section className="mt-24 border-t border-tl-hairline pt-14">
      <SectionHeading
        eyebrow="Direct lines"
        title="Skip a step"
        lead="If you already know what you need, these reach the person doing the work. We're on tools during the day, so whoever picks up will take your details and one of us calls you back that evening."
      />
      <div className="mt-9 grid gap-5 sm:grid-cols-2">
        {DIRECT_LINES.map((line) =>
          line.display ? (
            <a
              key={line.label}
              href={line.href}
              className="group rounded-[3px] border border-tl-hairline p-7 transition-colors hover:border-tl-ink"
            >
              <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
                {line.label}
              </p>
              <p className="mt-3 font-tl-sans text-2xl font-bold tracking-[-0.01em] text-tl-ink underline decoration-tl-hairline underline-offset-[6px] transition-colors group-hover:decoration-tl-indigo">
                {line.display}
              </p>
              <p className="mt-2 font-tl-text text-sm text-tl-steel">
                {line.scope}
              </p>
            </a>
          ) : null,
        )}
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="mt-24 rounded-[3px] bg-tl-shell px-8 py-14 text-center text-white md:px-10 md:py-20">
      {/* "What you want done" assumed a spec the visitor usually doesn't have,
          which is the main thing stopping people starting a form at all.
          Naming that as normal is the cheapest conversion win on the page. */}
      <h2 className="mx-auto max-w-[18ch] font-tl-sans text-4xl font-bold uppercase leading-[1.02] tracking-[0.01em] md:text-5xl">
        Tell us what you&apos;re thinking
      </h2>
      <p className="mx-auto mt-5 max-w-[48ch] font-tl-text text-lg text-white/70">
        Not sure exactly what you want yet? That&apos;s most people. Give us the
        year, make and model and roughly what you&apos;re after, and we&apos;ll
        work the rest out with you.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        <Link
          href="/quote"
          className="inline-flex h-14 items-center rounded-[3px] bg-white px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-tl-ink transition-colors hover:bg-white/85"
        >
          Start a quote
        </Link>
        {SHOP_PHONE_DISPLAY ? (
          <a
            href={SHOP_PHONE_HREF}
            className="inline-flex h-14 items-center rounded-[3px] border border-white/30 px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white/[0.08]"
          >
            Or call {SHOP_PHONE_DISPLAY}
          </a>
        ) : null}
      </div>

      <p className="mt-8 font-tl-mono text-[10px] uppercase tracking-[0.14em] text-white/45">
        Tuscaloosa, AL · By appointment only · In-house wiring &amp; suspension
      </p>
    </section>
  );
}

function SectionHeading({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <div>
      <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
        {eyebrow}
      </p>
      <h2 className="mt-4 max-w-[20ch] font-tl-sans text-4xl font-bold uppercase leading-[1.02] tracking-[0.01em] text-tl-ink">
        {title}
      </h2>
      {lead ? (
        <p className="mt-4 max-w-[52ch] font-tl-text text-lg leading-relaxed text-tl-steel">
          {lead}
        </p>
      ) : null}
    </div>
  );
}
