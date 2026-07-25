"use client";

import { useVehicles } from "components/vehicles-context";
import type { VehicleGeneration } from "lib/fitment";
import { useState } from "react";

// Slugs seed the dropdowns; the full display name lives in `label`, so
// capitalizing here is purely cosmetic ("ford" → "Ford").
function titleCase(slug: string): string {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

const selectClass =
  "h-10 w-full rounded-[3px] border border-tl-hairline bg-white px-2 font-tl-text text-sm text-tl-ink focus:bg-tl-fog focus:outline-none disabled:text-tl-mute-white";

// Cascading Year → Make → Model selects. Native <select> on purpose: mobile
// ergonomics beat a custom listbox here.
//
// The cookie stores only the generation handle — the exact year chosen here is
// not persisted (vehicle URLs canonicalize to the generation's first year), it
// only narrows the make/model lists.
export function VehiclePicker({
  current,
  onChoose,
}: {
  current: VehicleGeneration | null;
  onChoose: (handle: string) => void;
}) {
  const vehicles = useVehicles();

  const [year, setYear] = useState<number | null>(current?.yearStart ?? null);
  const [make, setMake] = useState<string | null>(current?.make ?? null);
  const [model, setModel] = useState<string | null>(current?.model ?? null);

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

  return (
    <div className="flex flex-col gap-2 px-4 pb-3">
      <label className="flex flex-col gap-1">
        <span className="font-tl-mono text-[9px] uppercase tracking-[0.14em] text-tl-mute-white">
          Year
        </span>
        <select
          className={selectClass}
          value={year ?? ""}
          onChange={(e) => {
            // Changing an upstream select invalidates everything downstream.
            setYear(e.target.value ? Number(e.target.value) : null);
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
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-tl-mono text-[9px] uppercase tracking-[0.14em] text-tl-mute-white">
          Make
        </span>
        <select
          className={selectClass}
          value={make ?? ""}
          disabled={year === null}
          onChange={(e) => {
            setMake(e.target.value || null);
            setModel(null);
          }}
        >
          <option value="">Select make</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {titleCase(m)}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-tl-mono text-[9px] uppercase tracking-[0.14em] text-tl-mute-white">
          Model
        </span>
        <select
          className={selectClass}
          value={model ?? ""}
          disabled={make === null}
          onChange={(e) => setModel(e.target.value || null)}
        >
          <option value="">Select model</option>
          {models.map((m) => (
            <option key={m} value={m}>
              {titleCase(m)}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        disabled={!resolved}
        onClick={() => resolved && onChoose(resolved.handle)}
        className="mt-1 h-10 rounded-[3px] bg-tl-indigo font-tl-sans text-xs font-bold text-white transition-colors hover:bg-tl-indigo-lift disabled:bg-tl-hairline disabled:text-tl-mute-white"
      >
        {current ? "Update truck" : "Add my truck"}
      </button>
    </div>
  );
}
