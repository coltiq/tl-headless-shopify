"use client";

import clsx from "clsx";
import {
  vehicleLabel,
  vehicleShortLabel,
  type VehicleSelection,
} from "lib/fitment";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { clearGarageVehicle, setGarageVehicle } from "./actions";
import { IconChevronDown, IconGarage } from "./icons";
import { VehiclePicker } from "./vehicle-picker";

const actionRowClass =
  "flex h-10 w-full items-center px-3.5 text-left font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-tl-ink hover:bg-tl-fog";

export function GarageMenu({
  current,
  variant,
}: {
  current: VehicleSelection | null;
  variant: "row" | "drawer" | "inline";
}) {
  const [open, setOpen] = useState(false);
  // null = the summary. "edit" seeds the picker from the current truck, "add"
  // starts it empty — the one real difference between those two actions when
  // the app holds a single vehicle. Both reset on close, so reopening always
  // lands on the summary.
  const [editing, setEditing] = useState<null | "edit" | "add">(null);
  const [expanded, setExpanded] = useState(true);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setEditing(null);
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
            // Settled state, laid out as the reference: heading, label, the
            // vehicle in a disclosure box, then Add Vehicle beside Shop
            // Without Vehicle.
            <div className="flex flex-col gap-4 px-4 pb-5 pt-4">
              <p className="font-tl-sans text-[22px] font-bold uppercase leading-none tracking-[0.01em] text-tl-ink">
                My vehicles
              </p>

              <div className="flex flex-col gap-2">
                <p className="font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-tl-ink">
                  Currently shopping for:
                </p>
                <div className="rounded-[3px] border border-tl-hairline">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                    className="flex h-[60px] w-full items-center gap-3 px-3.5 text-left"
                  >
                    <IconGarage className="h-5 w-5 shrink-0 text-tl-indigo" />
                    <span className="truncate font-tl-sans text-base font-bold uppercase tracking-[0.02em] text-tl-ink">
                      {vehicleLabel(current)}
                    </span>
                    {/* The reference's hairline between label and chevron. */}
                    <span
                      aria-hidden
                      className="ml-auto h-5 w-px shrink-0 bg-tl-hairline"
                    />
                    <IconChevronDown
                      className={clsx(
                        "h-4 w-4 shrink-0 text-tl-steel transition-transform",
                        expanded && "rotate-180",
                      )}
                    />
                  </button>

                  {expanded ? (
                    <div className="flex flex-col border-t border-tl-hairline py-1.5">
                      {/* /search with a truck set already filters to what fits
                          — the toggle defaults on. No vehicle segments here:
                          the URL grammar deliberately keeps them off search. */}
                      <Link
                        href="/search"
                        prefetch={true}
                        onClick={() => setOpen(false)}
                        className={actionRowClass}
                      >
                        Recommended products
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditing("edit")}
                        className={actionRowClass}
                      >
                        Edit vehicle
                      </button>
                      <button
                        type="button"
                        onClick={() => choose(null)}
                        className={actionRowClass}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Both actions from the reference. With one truck they are not
                  redundant: Add opens an empty picker, Delete inside the box
                  removes the truck, and Shop Without Vehicle clears it as a
                  browsing choice rather than a management one. */}
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                <button
                  type="button"
                  onClick={() => setEditing("add")}
                  className="h-12 flex-none rounded-[3px] border border-tl-steel px-6 font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-tl-ink transition-colors hover:border-tl-ink hover:bg-tl-fog"
                >
                  Add vehicle
                </button>
                <button
                  type="button"
                  onClick={() => choose(null)}
                  className="font-tl-sans text-xs font-medium uppercase tracking-[0.06em] text-tl-ink underline underline-offset-4 hover:text-tl-indigo"
                >
                  Shop without vehicle
                </button>
              </div>
            </div>
          ) : (
            // No title here: the chip this drops out of already says it, and
            // each field labels itself.
            <div className="pt-4">
              <VehiclePicker
                // "Add vehicle" opens empty; "Edit vehicle" opens on the truck
                // that is already set.
                current={editing === "add" ? null : current}
                onChoose={choose}
                onCancel={current ? () => setEditing(null) : undefined}
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
