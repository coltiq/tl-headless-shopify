import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "components/layout/footer";
import { vehicleLabel } from "lib/fitment";
import { getTruckBuild, getTruckBuilds } from "lib/shopify";
import { QuoteCta } from "../../_components/quote-cta";

// **No generateStaticParams**, deliberately. Under cacheComponents it must
// return at least one param or the build fails, and the honest answer here is
// that there may be zero published builds — the definition doesn't have to
// exist for the site to build. The slug stays runtime data, exactly like
// /product/[handle], and getTruckBuilds() is cached so the page still costs one
// shared Shopify request rather than one per build.
export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const build = await getTruckBuild(slug);

  if (!build) return notFound();

  // The truck belongs in the title tag even when the heading is already the
  // truck — search results have no eyebrow to carry it.
  const title =
    build.title && build.vehicle
      ? `${build.title} — ${vehicleLabel(build.vehicle)}`
      : build.heading;

  return {
    title,
    description: build.summary ?? undefined,
    openGraph: build.hero
      ? {
          images: [
            {
              url: build.hero.url,
              width: build.hero.width,
              height: build.hero.height,
              alt: build.hero.altText,
            },
          ],
        }
      : null,
  };
}

// The page behind every card in the Our Builds grid.
//
// Every section below the title is conditional. A build is publishable with a
// title and a slug alone, so an entry that only has photographs still renders a
// real page rather than a scaffold full of empty headings — which is what makes
// it safe to put a build up the day it leaves the bay and fill it in later.
export default async function BuildPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const build = await getTruckBuild(slug);

  if (!build) return notFound();

  // Only when the heading is a nickname — otherwise the heading is the truck
  // and the line above it would repeat itself.
  const vehicle =
    build.title && build.vehicle ? vehicleLabel(build.vehicle) : null;
  const scope = build.scope ? scopeLabel(build.scope) : null;

  return (
    <>
      {build.hero ? (
        <div className="relative aspect-[21/9] w-full bg-tl-fog">
          <Image
            src={build.hero.url}
            alt={build.hero.altText}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="page-width py-16 md:py-20">
        <Link
          href="/custom-work/builds"
          className="font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white underline underline-offset-4 transition-colors hover:text-tl-ink"
        >
          ← All builds
        </Link>

        {vehicle || scope ? (
          <p className="mt-8 font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
            {[vehicle, scope].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        <h1 className="mt-4 max-w-[18ch] font-tl-sans text-4xl font-bold uppercase leading-[1.02] tracking-[0.01em] text-tl-ink md:text-6xl">
          {build.heading}
        </h1>
        {build.summary ? (
          <p className="mt-5 max-w-[52ch] font-tl-text text-lg leading-relaxed text-tl-steel">
            {build.summary}
          </p>
        ) : null}

        {build.body ? (
          <div className="mt-12 max-w-[62ch] border-t border-tl-hairline pt-10">
            {/* Multi-line text from the metaobject: blank lines separate
                paragraphs. Rendered as text, never as HTML — admin copy is not
                a template. */}
            {build.body
              .split(/\n{2,}/)
              .map((paragraph) => paragraph.trim())
              .filter(Boolean)
              .map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-4 font-tl-text leading-relaxed text-tl-steel first:mt-0"
                >
                  {paragraph}
                </p>
              ))}
          </div>
        ) : null}

        {build.products.length > 0 ? (
          <section className="mt-16 border-t border-tl-hairline pt-10">
            <h2 className="font-tl-sans text-2xl font-bold uppercase tracking-[0.01em] text-tl-ink">
              What&apos;s on it
            </h2>
            {/* The retail cross-link the spec asks for, and the reason products
                are references rather than typed text: every part on the truck
                is something you can buy. */}
            <p className="mt-3 max-w-[52ch] font-tl-text text-tl-steel">
              Everything we installed on this truck, and everything we&apos;d
              install on yours.
            </p>
            <ul className="mt-8 grid list-none gap-x-5 gap-y-8 p-0 sm:grid-cols-3 lg:grid-cols-5">
              {build.products.map((product) => (
                <li key={product.handle}>
                  <Link href={`/product/${product.handle}`} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-[3px] bg-tl-fog">
                      {product.image ? (
                        <Image
                          src={product.image.url}
                          alt={product.image.altText}
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : null}
                    </div>
                    <p className="mt-3 font-tl-text text-sm leading-snug text-tl-ink underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-tl-indigo">
                      {product.title}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {build.gallery.length > 0 ? (
          <section className="mt-16 border-t border-tl-hairline pt-10">
            <h2 className="font-tl-sans text-2xl font-bold uppercase tracking-[0.01em] text-tl-ink">
              The build
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {build.gallery.map((image) => (
                <div
                  key={image.url}
                  className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-tl-fog"
                >
                  <Image
                    src={image.url}
                    alt={image.altText}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <QuoteCta heading="Want one of your own?" />
      </div>
      <Footer />
    </>
  );
}

// `scope` is free-form in admin, so an unrecognised value renders as itself
// rather than disappearing or printing a raw preset key.
function scopeLabel(scope: string): string {
  const known: Record<string, string> = {
    "full-build": "Full build",
    install: "Install",
  };
  return known[scope] ?? scope;
}
