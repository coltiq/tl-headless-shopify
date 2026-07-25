"use client";

import clsx from "clsx";
import { VehicleGeneration } from "lib/fitment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { clearGarageVehicle, setGarageVehicle } from "./actions";
import { IconGarage } from "./icons";
import { VehiclePicker } from "./vehicle-picker";

export function GarageMenu({
  current,
  variant,
}: {
  current: VehicleGeneration | null;
  variant: "row" | "drawer" | "inline";
}) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (handle: string | null) => {
    setOpen(false);
    startTransition(async () => {
      if (handle) {
        await setGarageVehicle(handle);
      } else {
        await clearGarageVehicle();
      }
      router.refresh();
    });
  };

  return (
    <div
      ref={rootRef}
      className={clsx(
        "relative",
        variant === "drawer" && "mx-4 mb-4",
        variant === "inline" && "w-fit",
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "flex items-center gap-[9px] rounded-[3px] bg-tl-indigo px-[13px] text-white transition-colors hover:bg-tl-indigo-lift",
          variant === "row" && "h-9 group-data-[condensed]:h-8",
          variant === "drawer" && "h-12 w-full",
          variant === "inline" && "h-9",
        )}
      >
        <IconGarage
          className={variant === "drawer" ? "h-[17px] w-[17px]" : "h-4 w-4"}
        />
        {current ? (
          variant === "row" ? (
            <>
              <span className="font-tl-sans text-xs font-bold group-data-[condensed]:hidden">
                {current.label}
              </span>
              <span className="hidden font-tl-sans text-xs font-bold group-data-[condensed]:inline">
                {current.shortLabel}
              </span>
            </>
          ) : (
            <span className="font-tl-sans text-[13.5px] font-bold">
              {current.label}
            </span>
          )
        ) : (
          <span
            className={clsx(
              "font-tl-sans font-bold",
              variant === "drawer" ? "text-[13.5px]" : "text-xs",
            )}
          >
            Add Your Truck
          </span>
        )}
        <span
          aria-hidden
          className={clsx(
            "text-[9px] opacity-85",
            variant === "drawer" && "ml-auto",
          )}
        >
          ▾
        </span>
      </button>

      {open ? (
        <div
          className={clsx(
            "absolute top-full z-50 mt-1.5 min-w-64 overflow-hidden rounded-[3px] border border-tl-hairline bg-white shadow-[0_18px_40px_-16px_rgba(15,20,48,0.35)]",
            variant === "row" && "right-0",
            variant === "drawer" && "inset-x-0",
            variant === "inline" && "left-0",
          )}
        >
          <p className="px-4 pb-1.5 pt-3 font-tl-mono text-[9px] uppercase tracking-[0.14em] text-tl-mute-white">
            Your truck
          </p>
          <VehiclePicker current={current} onChoose={choose} />
          {current ? (
            <button
              type="button"
              onClick={() => choose(null)}
              className="flex h-11 w-full items-center border-t border-tl-hairline px-4 text-left font-tl-text text-sm text-tl-steel hover:bg-tl-fog"
            >
              Clear vehicle
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
