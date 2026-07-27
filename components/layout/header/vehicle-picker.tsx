"use client";

import clsx from "clsx";
import { useVehicles } from "components/vehicles-context";
import type { VehicleGeneration, VehicleSelection } from "lib/fitment";
import { useState } from "react";
import { IconChevronDown } from "./icons";

// Slugs seed the dropdowns; the full display name lives in `label`, so
// capitalizing here is purely cosmetic ("ford" → "Ford").
function titleCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

// One field: the label sits *inside* the box above the value, so an empty
// field reads as a sentence — "Select / Year" — and a filled one keeps its
// name visible instead of trading it for the answer.
//
// The native <select> is still the control, stretched over the whole box at
// zero opacity. That keeps the OS picker on mobile, keyboard behaviour, and
// form semantics — none of which a custom listbox gives back for free — while
// letting the box carry two lines of type that a bare <select> cannot.
//
// Type is Archivo and IBM Plex Mono, matching the bar this panel drops out of.
// **`<option>` text is browser-controlled**: the popup list uses whatever the
// OS decides on Windows and some Chrome builds, and no CSS reliably overrides
// it — which is part of why the field's own text is drawn rather than relying
// on the select's rendering.
function Field({
  name,
  value,
  display,
  disabled,
  onChange,
  children,
}: {
  name: string;
  value: string;
  display: string | null;
  disabled: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={clsx(
        "relative flex h-[60px] items-center gap-2 rounded-[3px] border bg-white px-3.5 focus-within:border-tl-indigo",
        disabled ? "border-tl-hairline" : "border-tl-ink",
      )}
    >
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="font-tl-mono text-[9px] uppercase leading-none tracking-[0.14em] text-tl-mute-white">
          {display ? name : "Select"}
        </span>
        <span
          className={clsx(
            "truncate font-tl-sans text-base font-bold uppercase leading-none tracking-[0.02em]",
            disabled ? "text-tl-mute-white" : "text-tl-ink",
          )}
        >
          {display ?? name}
        </span>
      </span>
      <IconChevronDown className="ml-auto h-4 w-4 shrink-0 text-tl-steel" />
      <select
        aria-label={name}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
      >
        {children}
      </select>
    </label>
  );
}

// Cascading Year → Make → Model selects. Native <select> on purpose: mobile
// ergonomics beat a custom listbox here.
//
// Both halves of the answer are kept: the **generation** decides which
// `fits-*` tag matches, and the **exact year** is what the visitor sees
// everywhere afterwards. Pick 2022 and the site says "2022 Ford F-150", not
// "2021+ Ford F-150" — the generation never surfaces.
export function VehiclePicker({
  current,
  onChoose,
  onCancel,
}: {
  current: VehicleSelection | null;
  onChoose: (selection: VehicleSelection) => void;
  // Present when the picker was reached from the summary via "Edit vehicle" —
  // there is a state to go back to, so the bottom slot offers Cancel instead.
  onCancel?: () => void;
}) {
  const vehicles = useVehicles();

  const [year, setYear] = useState<number | null>(current?.year ?? null);
  const [make, setMake] = useState<string | null>(current?.gen.make ?? null);
  const [model, setModel] = useState<string | null>(current?.gen.model ?? null);

  // Derivations are pure and cheap at this list size — recomputed in render.
  const years = [
    ...new Set(
      vehicles.flatMap((gen) =>
        Array.from(
          { length: gen.yearEnd - gen.yearStart + 1 },
          (_, i) => gen.yearStart + i,
        ),
      ),
    ),
  ].sort((a, b) => b - a);

  const covers = (gen: VehicleGeneration, y: number) =>
    gen.yearStart <= y && y <= gen.yearEnd;

  const makes =
    year === null
      ? []
      : [
          ...new Set(
            vehicles.filter((gen) => covers(gen, year)).map((gen) => gen.make),
          ),
        ].sort();

  const models =
    year === null || make === null
      ? []
      : [
          ...new Set(
            vehicles
              .filter((gen) => gen.make === make && covers(gen, year))
              .map((gen) => gen.model),
          ),
        ].sort();

  // Unique by construction: reshapeVehicles drops overlapping year ranges for
  // the same make+model.
  const resolved =
    year === null || make === null || model === null
      ? undefined
      : vehicles.find(
          (gen) =>
            gen.make === make && gen.model === model && covers(gen, year),
        );

  const dirty = year !== null || make !== null || model !== null;

  return (
    <div className="flex flex-col gap-2.5 px-4 pb-4">
      <Field
        name="Year"
        value={year?.toString() ?? ""}
        display={year?.toString() ?? null}
        disabled={false}
        onChange={(v) => {
          // Changing an upstream field invalidates everything downstream.
          setYear(v ? Number(v) : null);
          setMake(null);
          setModel(null);
        }}
      >
        <option value="">Select year</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Field>

      <Field
        name="Make"
        value={make ?? ""}
        display={make ? titleCase(make) : null}
        disabled={year === null}
        onChange={(v) => {
          setMake(v || null);
          setModel(null);
        }}
      >
        <option value="">Select make</option>
        {makes.map((m) => (
          <option key={m} value={m}>
            {titleCase(m)}
          </option>
        ))}
      </Field>

      <Field
        name="Model"
        value={model ?? ""}
        display={model ? titleCase(model) : null}
        disabled={make === null}
        onChange={(v) => setModel(v || null)}
      >
        <option value="">Select model</option>
        {models.map((m) => (
          <option key={m} value={m}>
            {titleCase(m)}
          </option>
        ))}
      </Field>

      <button
        type="button"
        disabled={!resolved || year === null}
        onClick={() =>
          resolved && year !== null && onChoose({ gen: resolved, year })
        }
        className="mt-0.5 h-[52px] rounded-[3px] bg-tl-indigo font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-tl-indigo-lift disabled:bg-tl-hairline disabled:text-tl-mute-white"
      >
        {current ? "Update my truck" : "Add my truck"}
      </button>

      {/* Start over, as in the reference — always present, not swapped out for
          anything. Cancel replaces it only when the picker was reached from
          the summary, where there is a state to go back to. */}
      <button
        type="button"
        disabled={!onCancel && !dirty}
        onClick={() => {
          if (onCancel) return onCancel();
          setYear(null);
          setMake(null);
          setModel(null);
        }}
        className="text-center font-tl-sans text-[11px] font-medium uppercase tracking-[0.1em] text-tl-ink underline underline-offset-4 hover:text-tl-indigo disabled:text-tl-mute-white disabled:no-underline"
      >
        {onCancel ? "Cancel" : "Start over"}
      </button>
    </div>
  );
}
