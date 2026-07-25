"use client";

import clsx from "clsx";
import { GarageMenu } from "components/layout/header/garage-menu";
import { VehicleGeneration } from "lib/fitment";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// "Fits my vehicle" control for /search. With a garage truck it's a switch —
// on by default, off when ?all=1 — that rewrites the URL while preserving q
// and sort. Without one it renders the garage picker; choosing a truck runs
// the server action and refreshes with the filter auto-applied.
export default function FitmentToggle({
  garage,
}: {
  garage: VehicleGeneration | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!garage) {
    return (
      <div className="mb-4">
        <GarageMenu current={null} variant="inline" />
      </div>
    );
  }

  const on = searchParams.get("all") !== "1";

  const toggle = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (on) {
      params.set("all", "1");
    } else {
      params.delete("all");
    }
    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={toggle}
      className="mb-4 flex items-center gap-2"
    >
      <span
        className={clsx(
          "relative h-5 w-9 flex-none rounded-full transition-colors",
          on ? "bg-tl-indigo" : "bg-neutral-300 dark:bg-neutral-600",
        )}
      >
        <span
          className={clsx(
            "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
            on && "translate-x-4",
          )}
        />
      </span>
      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
        Fits my {garage.shortLabel}
      </span>
    </button>
  );
}
