// Garage / fitment helpers. This module must stay client-safe (no next/headers)
// so the search island can reuse the same matching logic in the browser.

export type VehicleGeneration = {
  handle: string;
  label: string;
  shortLabel: string;
  // URL slugs, not display names: lowercase alphanumeric, no hyphens or spaces
  // (e.g. "chevy"/"silverado", "ford"/"f150"). The vehicle metaobject must use
  // these exact values — live URLs bake them in.
  make: string;
  model: string;
  yearStart: number;
  yearEnd: number;
};

export const GARAGE_COOKIE = "tl_garage";

export const UNIVERSAL_FIT_TAG = "fits-universal";

// TODO: source from metaobject — hardcoded stub until the full vehicle picker ships.
export const VEHICLE_GENERATIONS: VehicleGeneration[] = [
  {
    handle: "ford-f150-2021-2026",
    label: "2021+ Ford F-150",
    shortLabel: "21+ F-150",
    make: "ford",
    model: "f150",
    yearStart: 2021,
    yearEnd: 2026,
  },
  {
    handle: "ford-f150-2015-2020",
    label: "2015–2020 Ford F-150",
    shortLabel: "15–20 F-150",
    make: "ford",
    model: "f150",
    yearStart: 2015,
    yearEnd: 2020,
  },
  {
    handle: "chevy-silverado-2019-2025",
    label: "2019+ Chevy Silverado 1500",
    shortLabel: "19+ Silverado",
    make: "chevy",
    model: "silverado",
    yearStart: 2019,
    yearEnd: 2025,
  },
  {
    handle: "ram-1500-2019-2025",
    label: "2019+ Ram 1500",
    shortLabel: "19+ Ram 1500",
    make: "ram",
    model: "1500",
    yearStart: 2019,
    yearEnd: 2025,
  },
  {
    handle: "toyota-tacoma-2016-2023",
    label: "2016–2023 Toyota Tacoma",
    shortLabel: "16–23 Tacoma",
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

export function findGeneration(
  handle: string | undefined | null,
): VehicleGeneration | undefined {
  if (!handle) return undefined;
  return VEHICLE_GENERATIONS.find((gen) => gen.handle === handle);
}

// Canonical URL segments for a generation. The garage cookie stores only the
// generation handle, so the first year is the deterministic canonical link;
// resolveVehiclePath accepts any in-range year.
export function vehiclePathSegments(gen: VehicleGeneration): string[] {
  return [gen.make, gen.model, String(gen.yearStart)];
}

// Resolves /<category>/<make>/<model>/<year> segments to a generation.
// Exactly 3 segments for now — loosen here (only) if drivetrain/trim segments
// are ever added.
export function resolveVehiclePath(
  segments: string[],
): VehicleGeneration | undefined {
  if (segments.length !== 3) return undefined;
  const [make, model, yearSegment] = segments;
  if (!make || !model || !yearSegment) return undefined;
  if (!/^\d{4}$/.test(yearSegment)) return undefined;
  const year = Number(yearSegment);
  return VEHICLE_GENERATIONS.find(
    (gen) =>
      gen.make === make &&
      gen.model === model &&
      gen.yearStart <= year &&
      year <= gen.yearEnd,
  );
}

// Reads the garage cookie in the browser. Returns undefined during SSR.
export function readGarageGeneration(): VehicleGeneration | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${GARAGE_COOKIE}=([^;]+)`),
  );
  return findGeneration(match ? decodeURIComponent(match[1]!) : undefined);
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
