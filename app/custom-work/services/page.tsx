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
    "Lighting, lifts, paint matching, powder coating — from a single install to a full build. Tuscaloosa, Alabama.",
};

// Spec: docs/plans/custom-work.md §3. Purely the offer — how the shop runs
// belongs to Inside the Shop, and keeping that line drawn is what stops the two
// pages converging.
//
// **The organising idea is that services are grouped by who does them.** A
// generic service grid with a contacts block bolted underneath would say the
// same things and mean less; grouping the work under the two people who do it
// makes the structure carry the shop's actual shape, and puts a phone number
// inside the section a visitor is already reading. It is also the one thing
// here a national retailer cannot copy.
//
// **The phone is primary everywhere, the form is secondary.** Calls are the
// highest-converting lead source in automotive and callers arrive at the
// decision stage, where form submitters are still comparing. So every call to
// action is call-first, and the mobile sticky bar exists for the same reason.
//
// This page deliberately does not use the shared QuoteCta: that block leads
// with the quote, which is right for the other three pages and backwards here.

type Division = {
  eyebrow: string;
  title: string;
  lead: string;
  services: string[];
  phoneDisplay: string;
  phoneHref: string;
  imageBrief: string;
};

// TODO: add each owner's name above the role — "Ask for <name>" converts better
// than a department, and it is the whole point of splitting the lines.
//
// Phones fall back to the shop number while the direct lines are empty, so this
// ships today and becomes two lines by editing `lib/constants.ts`.
const DIVISIONS: Division[] = [
  {
    eyebrow: "Electrical & lighting",
    title: "Lights, wiring, and 12V",
    lead: "Every harness we run is built to be looked at. If a job touches a wire, this is the half of the shop doing it.",
    services: [
      "Rock lights",
      "Wheel ring lights",
      "Light bars & pods",
      "Ditch & reverse lighting",
      "Wiring, harnesses & switch panels",
      "Audio & 12V power",
    ],
    phoneDisplay: LIGHTING_PHONE_DISPLAY || SHOP_PHONE_DISPLAY,
    phoneHref: LIGHTING_PHONE_HREF || SHOP_PHONE_HREF,
    imageBrief:
      "A clean harness mid-install — loom, connectors, zip-tie runs. Close and lit. This is the photograph that proves the whole claim, so shoot the tidiest job you have.",
  },
  {
    eyebrow: "Suspension, finish & builds",
    title: "Lift it, coat it, build it",
    lead: "Everything from a levelling kit on a Saturday to a truck that lives here for eleven weeks. One person coordinates the whole build.",
    services: [
      "Lifts & levelling",
      "Suspension & re-gearing",
      "Wheels & tires",
      "Paint matching",
      "Powder coating",
      "Bumpers, armor & steps",
      "Full builds, start to finish",
    ],
    phoneDisplay: BUILD_PHONE_DISPLAY || SHOP_PHONE_DISPLAY,
    phoneHref: BUILD_PHONE_HREF || SHOP_PHONE_HREF,
    imageBrief:
      "A truck on the lift mid-build, or fresh powder-coated parts laid out before assembly. Wide enough to read as a shop, close enough to see the finish.",
  },
];

export default function ServicesPage() {
  return (
    <>
      {/* pb-28 clears the mobile call bar, which would otherwise sit on top of
          the closing CTA — the one element it must never cover. */}
      <div className="page-width pb-28 pt-16 md:pb-24">
        <Hero />
        <Divisions />
        <Costs />
        <Closing />
      </div>
      <CallBar />
      <Footer />
    </>
  );
}

function Hero() {
  return (
    <section>
      <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
        Tuscaloosa, Alabama · By appointment
      </p>
      <h1 className="mt-5 max-w-[16ch] font-tl-sans text-5xl font-bold uppercase leading-[0.95] tracking-[-0.01em] text-tl-ink md:text-7xl">
        What we do to trucks
      </h1>
      <p className="mt-6 max-w-[52ch] font-tl-text text-lg leading-relaxed text-tl-steel">
        Lighting, lifts, paint matching, powder coating — from one install to a
        truck built from the frame up. There are two of us, and you&apos;ll talk
        to whichever one is doing the work.
      </p>

      <div className="mt-9 flex flex-wrap items-center gap-x-4 gap-y-3">
        {SHOP_PHONE_DISPLAY ? (
          <a
            href={SHOP_PHONE_HREF}
            className="inline-flex h-14 items-center rounded-[3px] bg-tl-indigo px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-tl-indigo-lift"
          >
            Call {SHOP_PHONE_DISPLAY}
          </a>
        ) : null}
        <Link
          href="/quote"
          className="inline-flex h-14 items-center rounded-[3px] border border-tl-ink px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-tl-ink transition-colors hover:bg-tl-fog"
        >
          Or start a quote
        </Link>
      </div>
      {/* Reassurance sits under the buttons rather than in them: the label says
          what happens, this says what it costs you to find out. */}
      <p className="mt-4 font-tl-text text-sm text-tl-mute-white">
        No obligation. We&apos;ll tell you if a job isn&apos;t worth doing.
      </p>

      <ImageSlot
        ratio="aspect-[21/9]"
        className="mt-14"
        brief="The best truck you have ever finished, shot wide outside the shop — ideally at dusk with the rock lights on. This is the first thing anyone sees, so it should be the single most impressive photograph you own."
      />
    </section>
  );
}

function Divisions() {
  return (
    <section className="mt-24">
      <SectionHeading
        eyebrow="Who does what"
        title="Two halves of one shop"
        lead="The work splits cleanly, so the phone does too. Call the half that owns your job and you skip a step."
      />

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {DIVISIONS.map((division) => (
          <article
            key={division.title}
            // Dark on a light page: these two panels are the page, and the
            // shell colour ties them to the header rather than inventing a
            // fourth surface. It also makes the phone numbers the brightest
            // thing in the section, which is the point.
            className="flex flex-col rounded-[3px] bg-tl-shell p-8 text-white md:p-10"
          >
            <p className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
              {division.eyebrow}
            </p>
            <h3 className="mt-4 font-tl-sans text-3xl font-bold uppercase leading-none tracking-[0.01em]">
              {division.title}
            </h3>
            <p className="mt-4 max-w-[44ch] font-tl-text leading-relaxed text-white/70">
              {division.lead}
            </p>

            <ImageSlot
              ratio="aspect-[16/10]"
              tone="dark"
              className="mt-8"
              brief={division.imageBrief}
            />

            <ul className="mt-8 grid list-none gap-x-6 gap-y-2.5 p-0 sm:grid-cols-2">
              {division.services.map((service) => (
                <li
                  key={service}
                  className="flex items-baseline gap-2.5 font-tl-text text-[15px] text-white/85"
                >
                  <span aria-hidden className="text-white/35">
                    —
                  </span>
                  {service}
                </li>
              ))}
            </ul>

            {division.phoneDisplay ? (
              <div className="mt-auto pt-9">
                <a
                  href={division.phoneHref}
                  className="inline-flex h-14 items-center rounded-[3px] bg-white px-7 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-tl-ink transition-colors hover:bg-white/85"
                >
                  Call {division.phoneDisplay}
                </a>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <p className="mt-6 font-tl-text text-sm text-tl-steel">
        Not sure which one you need?{" "}
        {SHOP_PHONE_DISPLAY ? (
          <>
            Call{" "}
            <a
              href={SHOP_PHONE_HREF}
              className="text-tl-ink underline underline-offset-4"
            >
              {SHOP_PHONE_DISPLAY}
            </a>{" "}
            and we&apos;ll point you at the right one.
          </>
        ) : (
          <>Call the shop and we&apos;ll point you at the right one.</>
        )}
      </p>
    </section>
  );
}

function Costs() {
  return (
    <section className="mt-24 border-t border-tl-hairline pt-14">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <SectionHeading
            eyebrow="What it costs"
            title="We&rsquo;ll give you a range before you commit"
          />
          <div className="mt-6 grid max-w-[54ch] gap-4 font-tl-text leading-relaxed text-tl-steel">
            <p>
              Almost nothing here has one price. A lift install depends on the
              height, whether you&apos;re re-gearing, and what you&apos;re
              running for wheels and tires — so a number without those answers
              would be a guess.
            </p>
            <p>
              What we can tell you up front is the range, what moves it, and
              what your truck specifically is likely to land at. That takes one
              phone call.
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

function Closing() {
  return (
    <section className="mt-24 rounded-[3px] bg-tl-shell-deep px-8 py-14 text-center text-white md:px-10 md:py-20">
      <h2 className="mx-auto max-w-[18ch] font-tl-sans text-4xl font-bold uppercase leading-[1.02] tracking-[0.01em] md:text-5xl">
        Tell us what you want done
      </h2>
      <p className="mx-auto mt-5 max-w-[46ch] font-tl-text text-lg text-white/70">
        A five-minute call is usually faster than a form. If it&apos;s easier to
        type it out, the quote form asks the same questions.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {SHOP_PHONE_DISPLAY ? (
          <a
            href={SHOP_PHONE_HREF}
            className="inline-flex h-14 items-center rounded-[3px] bg-white px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-tl-ink transition-colors hover:bg-white/85"
          >
            Call {SHOP_PHONE_DISPLAY}
          </a>
        ) : null}
        <Link
          href="/quote"
          className="inline-flex h-14 items-center rounded-[3px] border border-white/30 px-8 font-tl-sans text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-white hover:bg-white/[0.08]"
        >
          Start a quote
        </Link>
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
