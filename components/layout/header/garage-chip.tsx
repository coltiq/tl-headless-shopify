import { GARAGE_COOKIE, resolveGarageCookie } from "lib/fitment";
import { getVehicles } from "lib/shopify";
import { cookies } from "next/headers";
import { GarageMenu } from "./garage-menu";

// Request-scoped cookie read — always mount behind <Suspense> so it can't opt
// the rest of the header out of caching.
export async function GarageChip({
  variant = "row",
}: {
  variant?: "row" | "drawer";
}) {
  const cookieValue = (await cookies()).get(GARAGE_COOKIE)?.value;
  // A cookie whose generation no longer exists in Shopify degrades to "no
  // truck" — the same path as any unknown handle.
  const vehicles = await getVehicles();

  return (
    <GarageMenu
      current={resolveGarageCookie(vehicles, cookieValue) ?? null}
      variant={variant}
    />
  );
}

// Matches the chip's footprint so the Suspense swap causes no layout shift.
export function GarageChipFallback({
  variant = "row",
}: {
  variant?: "row" | "drawer";
}) {
  return variant === "drawer" ? (
    <div aria-hidden className="mx-4 mb-4 h-12 rounded-[3px] bg-tl-indigo" />
  ) : (
    // Full height and square, tracking the row: the real chip is full-bleed in
    // the nav now, so the old 36px rounded pill popped on hydration.
    <div aria-hidden className="h-full w-56 bg-tl-indigo" />
  );
}
