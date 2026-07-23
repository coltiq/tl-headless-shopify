import { findGeneration, GARAGE_COOKIE } from "lib/fitment";
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

  return (
    <GarageMenu
      current={findGeneration(cookieValue) ?? null}
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
    <div
      aria-hidden
      className="h-9 w-44 rounded-[3px] bg-tl-indigo group-data-[condensed]:h-8"
    />
  );
}
