"use client";

import { useVehicles } from "components/vehicles-context";
import { readGarageGeneration, vehiclePathSegments } from "lib/fitment";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

// Bounces a bare category page to the garage vehicle's URL. Client-side on
// purpose: vehicle identity lives in the URL, never in a server cookie read,
// so the category shell stays cacheable across visitors. Renders nothing;
// the one-frame flash of the unfiltered grid is an accepted tradeoff.
export default function GarageRedirect({ category }: { category: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicles = useVehicles();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    if (searchParams.get("all") === "1") return;
    const gen = readGarageGeneration(vehicles);
    if (!gen) return;
    const sort = searchParams.get("sort");
    router.replace(
      `/${category}/${vehiclePathSegments(gen).join("/")}${
        sort ? `?sort=${encodeURIComponent(sort)}` : ""
      }`,
    );
  }, [category, router, searchParams, vehicles]);

  return null;
}
