import Image from "next/image";
import Link from "next/link";

import type { Image as ShopifyImage } from "lib/shopify/types";

// One cell of the Our Builds grid, and the only entry point to a build's page.
//
// The photograph is the card — everything under it is a caption, sized to stay
// legible at a quarter of the page width. That's why the truck and the part
// count are mono metadata rather than more sentences: at this size a second
// paragraph is noise, but two short facts still read.
export function BuildCard({
  slug,
  title,
  summary,
  hero,
  vehicle,
  partCount,
}: {
  slug: string;
  title: string;
  summary: string | null;
  hero: ShopifyImage | null;
  /** Composed "2022 Ford F-150" — never a bare generation. */
  vehicle: string | null;
  partCount: number;
}) {
  return (
    <Link href={`/custom-work/builds/${slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-tl-fog">
        {hero ? (
          <Image
            src={hero.url}
            alt={hero.altText}
            fill
            // Four across at desktop, two at tablet, one on a phone. Getting
            // this wrong is the difference between a 400px file and a 1600px
            // one on a grid that is mostly photograph.
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          // A build with no hero image still links — the page behind it may
          // have a gallery. Better a quiet placeholder than a missing card.
          <div className="flex h-full items-end p-4">
            <span className="font-tl-mono text-[10px] uppercase tracking-[0.14em] text-tl-mute-white">
              No photo yet
            </span>
          </div>
        )}
      </div>

      {vehicle ? (
        <p className="mt-4 font-tl-mono text-[10px] uppercase tracking-[0.16em] text-tl-mute-white">
          {vehicle}
        </p>
      ) : null}
      <h2 className="mt-2 font-tl-sans text-xl font-bold uppercase leading-tight tracking-[0.01em] text-tl-ink underline decoration-transparent underline-offset-[6px] transition-colors group-hover:decoration-tl-indigo">
        {title}
      </h2>
      {summary ? (
        <p className="mt-2 line-clamp-2 font-tl-text text-sm leading-snug text-tl-steel">
          {summary}
        </p>
      ) : null}
      {partCount > 0 ? (
        <p className="mt-3 font-tl-mono text-[10px] uppercase tracking-[0.14em] text-tl-mute-white">
          {partCount} {partCount === 1 ? "part" : "parts"} installed
        </p>
      ) : null}
    </Link>
  );
}
