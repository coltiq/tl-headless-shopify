// Garage / fitment helpers. This module must stay client-safe (no next/headers)
// so the search island can reuse the same matching logic in the browser.

export type VehicleGeneration = {
  handle: string;
  label: string;
  shortLabel: string;
};

export const GARAGE_COOKIE = "tl_garage";

export const UNIVERSAL_FIT_TAG = "fits-universal";

// TODO: source from metaobject — hardcoded stub until the full vehicle picker ships.
export const VEHICLE_GENERATIONS: VehicleGeneration[] = [
  {
    handle: "ford-f150-2021-2026",
    label: "2021+ Ford F-150",
    shortLabel: "21+ F-150",
  },
  {
    handle: "ford-f150-2015-2020",
    label: "2015–2020 Ford F-150",
    shortLabel: "15–20 F-150",
  },
  {
    handle: "chevy-silverado-2019-2025",
    label: "2019+ Chevy Silverado 1500",
    shortLabel: "19+ Silverado",
  },
  {
    handle: "ram-1500-2019-2025",
    label: "2019+ Ram 1500",
    shortLabel: "19+ Ram 1500",
  },
  {
    handle: "toyota-tacoma-2016-2023",
    label: "2016–2023 Toyota Tacoma",
    shortLabel: "16–23 Tacoma",
  },
];

export function findGeneration(
  handle: string | undefined | null,
): VehicleGeneration | undefined {
  if (!handle) return undefined;
  return VEHICLE_GENERATIONS.find((gen) => gen.handle === handle);
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
