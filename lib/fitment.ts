// Garage / fitment helpers. This module must stay client-safe (no next/headers)
// so the search island can reuse the same matching logic in the browser.

export type VehicleGeneration = {
  handle: string;
  // Display names **without years** — "Ford F-150", "Chevy Silverado 1500".
  // The year is composed in at render time from the visitor's actual choice
  // (vehicleLabel), so one generation reads as "2022 Ford F-150" for one
  // visitor and "2024 Ford F-150" for another. Two generations of the same
  // truck therefore share a label, which is correct: it is the same truck.
  label: string;
  // Condensed form for the header chip and inline badges — "F-150".
  shortLabel: string;
  // URL slugs, not display names: lowercase alphanumeric, no hyphens or spaces
  // (e.g. "chevy"/"silverado", "ford"/"f150"). The vehicle metaobject must use
  // these exact values — live URLs bake them in.
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
};

// A truck as the visitor sees it: the exact year they picked, plus the
// generation that year falls into.
//
// **The generation is internal.** It exists to pick a `fits-*` tag and to keep
// one canonical URL per year range; it is never displayed. Everything the
// visitor reads is built from `year` + the generation's year-less label.
export type VehicleSelection = {
  gen: VehicleGeneration;
  year: number;
};

export const GARAGE_COOKIE = "tl_garage";

export const UNIVERSAL_FIT_TAG = "fits-universal";

// Served by getVehicles() only until vehicle metaobject entries exist in admin
// (and whenever the metaobject fetch fails). The live list comes from Shopify;
// these five exist so the app works before/without that admin setup.
export const FALLBACK_VEHICLE_GENERATIONS: VehicleGeneration[] = [
  {
    handle: "ford-f150-2021-2026",
    label: "Ford F-150",
    shortLabel: "F-150",
    make: "ford",
    model: "f150",
    yearStart: 2021,
    yearEnd: 2026,
  },
  {
    handle: "ford-f150-2015-2020",
    label: "Ford F-150",
    shortLabel: "F-150",
    make: "ford",
    model: "f150",
    yearStart: 2015,
    yearEnd: 2020,
  },
  {
    handle: "chevy-silverado-2019-2025",
    label: "Chevy Silverado 1500",
    shortLabel: "Silverado",
    make: "chevy",
    model: "silverado",
    yearStart: 2019,
    yearEnd: 2025,
  },
  {
    handle: "ram-1500-2019-2025",
    label: "Ram 1500",
    shortLabel: "Ram 1500",
    make: "ram",
    model: "1500",
    yearStart: 2019,
    yearEnd: 2025,
  },
  {
    handle: "toyota-tacoma-2016-2023",
    label: "Toyota Tacoma",
    shortLabel: "Tacoma",
    make: "toyota",
    model: "tacoma",
    yearStart: 2016,
    yearEnd: 2023,
  },
];

// The canonical generation handle, derived from fields — never read from the
// vehicle metaobject's own Shopify handle. Cookie values and fits-* product
// tags embed this string, so it must be deterministic and immune to admin
// handle typos/auto-generation. All stub handles above already match.
export function vehicleHandle(
  make: string,
  model: string,
  yearStart: number,
  yearEnd: number,
): string {
  return `${make}-${model}-${yearStart}-${yearEnd}`;
}

// Every lookup takes the vehicle list explicitly — this module stays
// client-safe and never fetches. Server callers pass `await getVehicles()`;
// client islands pass `useVehicles()`.
export function findGeneration(
  vehicles: VehicleGeneration[],
  handle: string | undefined | null,
): VehicleGeneration | undefined {
  if (!handle) return undefined;
  return vehicles.find((gen) => gen.handle === handle);
}

// A year the generation actually covers. Guards the case where admin narrows
// year_start/year_end after a visitor already chose — showing a year the
// generation no longer covers would be a lie, so fall back to its first year.
function coveredYear(gen: VehicleGeneration, year: number | undefined): number {
  if (year === undefined) return gen.yearStart;
  return year >= gen.yearStart && year <= gen.yearEnd ? year : gen.yearStart;
}

// Everything a visitor reads about their truck. "2022 Ford F-150" — never
// "2021+ Ford F-150", which is the generation and is nobody's truck.
export function vehicleLabel({ gen, year }: VehicleSelection): string {
  return `${year} ${gen.label}`;
}

export function vehicleShortLabel({ gen, year }: VehicleSelection): string {
  return `${year} ${gen.shortLabel}`;
}

// URL segments for a selection. The visitor's own year rides in the URL — it
// resolves identically to any other in-range year, and the page canonicalizes
// to the generation's first year so the ranking signal still concentrates on
// one URL per generation.
export function vehiclePathSegments({ gen, year }: VehicleSelection): string[] {
  return [gen.make, gen.model, String(coveredYear(gen, year))];
}

// Resolves /<category>/<make>/<model>/<year> segments. Exactly 3 segments for
// now — loosen here (only) if drivetrain/trim segments are ever added. Returns
// the year from the URL, not the generation's first year: the page shows the
// year the visitor is actually looking at.
export function resolveVehiclePath(
  vehicles: VehicleGeneration[],
  segments: string[],
): VehicleSelection | undefined {
  if (segments.length !== 3) return undefined;
  const [make, model, yearSegment] = segments;
  if (!make || !model || !yearSegment) return undefined;
  if (!/^\d{4}$/.test(yearSegment)) return undefined;
  const year = Number(yearSegment);
  const gen = vehicles.find(
    (candidate) =>
      candidate.make === make &&
      candidate.model === model &&
      candidate.yearStart <= year &&
      year <= candidate.yearEnd,
  );
  return gen ? { gen, year } : undefined;
}

// The garage cookie is `<generation handle>:<year>` — the generation drives
// fitment, the year drives every piece of text the visitor sees. A bare handle
// with no year is still accepted: it predates per-year garages and degrades to
// the generation's first year.
export function encodeGarageCookie({ gen, year }: VehicleSelection): string {
  return `${gen.handle}:${coveredYear(gen, year)}`;
}

// Resolves a raw cookie value against the live vehicle list. A generation that
// no longer exists degrades silently to "no truck", which is the desired
// behavior.
export function resolveGarageCookie(
  vehicles: VehicleGeneration[],
  value: string | undefined | null,
): VehicleSelection | undefined {
  if (!value) return undefined;

  const [handle, yearPart] = value.split(":");
  const gen = findGeneration(vehicles, handle);
  if (!gen) return undefined;

  const year =
    yearPart && /^\d{4}$/.test(yearPart) ? Number(yearPart) : undefined;

  return { gen, year: coveredYear(gen, year) };
}

// Browser-side read of the same cookie. Returns undefined during SSR.
export function readGarage(
  vehicles: VehicleGeneration[],
): VehicleSelection | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${GARAGE_COOKIE}=([^;]+)`),
  );
  return resolveGarageCookie(
    vehicles,
    match ? decodeURIComponent(match[1]!) : undefined,
  );
}

export function fitmentTag(generationHandle: string): string {
  return `fits-${generationHandle}`;
}

// Storefront search query clause: matches the vehicle's tag or universal-fit parts.
export function fitmentSearchClause(generationHandle: string): string {
  return `(tag:${fitmentTag(generationHandle)} OR tag:${UNIVERSAL_FIT_TAG})`;
}

export function productFitsGeneration(
  tags: string[],
  generationHandle: string,
): boolean {
  return (
    tags.includes(fitmentTag(generationHandle)) ||
    tags.includes(UNIVERSAL_FIT_TAG)
  );
}
