"use client";

import clsx from "clsx";
import { useVehicles } from "components/vehicles-context";
import {
  fitmentTag,
  readGarage,
  UNIVERSAL_FIT_TAG,
  vehicleLabel,
  type VehicleSelection,
} from "lib/fitment";
import { useEffect, useState } from "react";

// "Fits your truck" island for the PDP — the one place in the funnel that
// otherwise ignores the garage entirely.
//
// The garage lives in a cookie read in the browser, so this renders nothing on
// the server and fills in after hydration. That keeps the product page shell
// cacheable across visitors (same contract as GarageRedirect) at the cost of
// the badge appearing one frame late.
export function FitmentBadge({ tags }: { tags: string[] }) {
  const vehicles = useVehicles();
  const [garage, setGarage] = useState<VehicleSelection | undefined>(undefined);

  useEffect(() => {
    setGarage(readGarage(vehicles));
  }, [vehicles]);

  // No truck set: say nothing rather than guess. The header chip is already
  // prompting for one.
  if (!garage) return null;

  const universal = tags.includes(UNIVERSAL_FIT_TAG);
  const fitsThis = tags.includes(fitmentTag(garage.gen.handle));
  const truck = vehicleLabel(garage);

  // Explicit fitment beats a universal tag: "Fits your 2022 Ford F-150" is a
  // stronger, more specific claim than "Universal fit" when both are true.
  const { text, tone } = fitsThis
    ? { text: `Fits your ${truck}`, tone: "fits" as const }
    : universal
      ? { text: "Universal fit", tone: "fits" as const }
      : { text: `Doesn't fit your ${truck}`, tone: "no" as const };

  return (
    <p
      className={clsx(
        "mb-4 inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-sm font-medium",
        tone === "fits"
          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          : "bg-amber-50 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
      )}
    >
      <span aria-hidden>{tone === "fits" ? "✓" : "!"}</span>
      {text}
    </p>
  );
}
