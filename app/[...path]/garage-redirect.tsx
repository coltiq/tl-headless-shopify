"use client";

import { useVehicles } from "components/vehicles-context";
import { readGarage, vehiclePathSegments } from "lib/fitment";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Bounces a bare category page to the garage vehicle's URL. Client-side on
// purpose: vehicle identity lives in the URL, never in a server cookie read,
// so the category shell stays cacheable across visitors. Renders nothing;
// the one-frame flash of the unfiltered grid is an accepted tradeoff.
//
// `basePath` is the full category path ("/lighting/rock-lights"), so this works
// identically at any depth.
export default function GarageRedirect({ basePath }: { basePath: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicles = useVehicles();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (searchParams.get("all") === "1") return;
    const garage = readGarage(vehicles);
    if (!garage) return;
    // Carry every param across, not just `sort` — anything dropped here is a
    // filter the visitor set and would silently lose on the bounce.
    const query = searchParams.toString();
    // Lands on the visitor's own year, not the generation's first year: the
    // address bar should say what they picked. The page canonicalizes.
    router.replace(
      `${basePath}/${vehiclePathSegments(garage).join("/")}${
        query ? `?${query}` : ""
      }`,
    );
  }, [basePath, router, searchParams, vehicles]);

  return null;
}
