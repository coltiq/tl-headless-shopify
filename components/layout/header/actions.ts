"use server";

import { findGeneration, GARAGE_COOKIE } from "lib/fitment";
import { getVehicles } from "lib/shopify";
import { cookies } from "next/headers";

export async function setGarageVehicle(handle: string): Promise<void> {
  // Only handles from the live generation list may be written.
  if (!findGeneration(await getVehicles(), handle)) return;

  (await cookies()).set(GARAGE_COOKIE, handle, {
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
