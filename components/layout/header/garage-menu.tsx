"use client";

import clsx from "clsx";
import {
  vehicleLabel,
  vehicleShortLabel,
  type VehicleSelection,
} from "lib/fitment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { clearGarageVehicle, setGarageVehicle } from "./actions";
import { IconGarage } from "./icons";
import { VehiclePicker } from "./vehicle-picker";

export function GarageMenu({
  current,
  variant,
}: {
  current: VehicleSelection | null;
  variant: "row" | "drawer" | "inline";
}) {
  const [open, setOpen] = useState(false);
  // The panel has two faces: a summary when a truck is already set, and the
  // picker. `editing` is the way from the first to the second, and it resets
  // on close so reopening always lands on the summary.
  const [editing, setEditing] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setEditing(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const choose = (selection: VehicleSelection | null) => {
    setOpen(false);
    startTransition(async () => {
      if (selection) {
        await setGarageVehicle(selection.gen.handle, selection.year);
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
                {vehicleLabel(current)}
              </span>
              <span className="hidden font-tl-sans text-xs font-bold group-data-[condensed]:inline">
                {vehicleShortLabel(current)}
              </span>
            </>
          ) : (
            <span className="font-tl-sans text-[13.5px] font-bold">
              {vehicleLabel(current)}
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
            // min-w-72 (288px), not 64: the fields carry two lines and a
            // chevron now. 288px is also exactly the drawer variant's width on
            // a 320px screen given its mx-4 container, so nothing overflows.
            "absolute top-full z-50 mt-1.5 min-w-72 overflow-hidden rounded-[3px] border border-tl-hairline bg-white shadow-[0_18px_40px_-16px_rgba(15,20,48,0.35)]",
            variant === "row" && "right-0",
            variant === "drawer" && "inset-x-0",
            variant === "inline" && "left-0",
          )}
        >
          {current && !editing ? (
            // Settled state. Someone who already has a truck set is opening
            // this to check it, swap it, or turn it off — not to fill in three
            // selects again, which is what they were shown before.
            <div className="flex flex-col gap-3.5 px-4 pb-4 pt-4">
              <p className="font-tl-sans text-lg font-bold uppercase leading-none tracking-[0.02em] text-tl-ink">
                My truck
              </p>

              <div className="flex flex-col gap-2">
                <p className="font-tl-sans text-[11px] font-bold uppercase tracking-[0.1em] text-tl-ink">
                  Currently shopping for:
                </p>
                {/* Not a select: this app holds one truck, so a chevron here
                    would open nothing. Display only. */}
                <div className="flex h-[54px] items-center gap-3 rounded-[3px] border border-tl-hairline bg-tl-fog px-3.5">
                  <IconGarage className="h-5 w-5 shrink-0 text-tl-indigo" />
                  <span className="truncate font-tl-sans text-[15px] font-bold uppercase tracking-[0.02em] text-tl-ink">
                    {vehicleLabel(current)}
                  </span>
                </div>
              </div>

              {/* Stacked, not side by side as in the reference: that panel is
                  ~430px and this one is 288px, where the pair collides. */}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="h-12 rounded-[3px] border border-tl-ink font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-tl-ink transition-colors hover:bg-tl-fog"
              >
                Change truck
              </button>
              <button
                type="button"
                onClick={() => choose(null)}
                className="text-center font-tl-sans text-[11px] font-medium uppercase tracking-[0.1em] text-tl-ink underline underline-offset-4 hover:text-tl-indigo"
              >
                Shop without a truck
              </button>
            </div>
          ) : (
            // No title here: the chip this drops out of already says it, and
            // each field labels itself.
            <div className="pt-4">
              <VehiclePicker current={current} onChoose={choose} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
