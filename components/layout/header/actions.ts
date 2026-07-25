"use server";

import { encodeGarageCookie, findGeneration, GARAGE_COOKIE } from "lib/fitment";
import { getVehicles } from "lib/shopify";
import { cookies } from "next/headers";

export async function setGarageVehicle(
  handle: string,
  year: number,
): Promise<void> {
  // Only handles from the live generation list may be written.
  const gen = findGeneration(await getVehicles(), handle);
  if (!gen) return;

  // And only a year that generation actually covers — the cookie is the source
  // of every "2022 Ford F-150" the visitor reads, so it must not be able to
  // claim a year the truck doesn't come in.
  if (!Number.isInteger(year) || year < gen.yearStart || year > gen.yearEnd) {
    return;
  }

  (await cookies()).set(GARAGE_COOKIE, encodeGarageCookie({ gen, year }), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    // Readable in the browser: the search island filters predictions against it.
    httpOnly: false,
  });
}

export async function clearGarageVehicle(): Promise<void> {
  (await cookies()).delete(GARAGE_COOKIE);
}
