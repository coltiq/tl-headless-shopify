"use client";

import clsx from "clsx";
import { useVehicles } from "components/vehicles-context";
import {
  productFitsGeneration,
  readGarage,
  UNIVERSAL_FIT_TAG,
  vehicleShortLabel,
  type VehicleSelection,
} from "lib/fitment";
import { PredictiveSearchResult } from "lib/shopify/types";
import Form from "next/form";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconGarage, IconSearch } from "./icons";

const EMPTY: PredictiveSearchResult = { products: [], collections: [] };

// Static stand-in while the real field (which reads useSearchParams) suspends.
export function SearchFieldSkeleton({
  variant = "desktop",
}: {
  variant?: "desktop" | "drawer";
}) {
  return (
    <div
      className={
        variant === "desktop"
          ? "ml-auto w-full max-w-[560px] group-data-[condensed]:max-w-[440px]"
          : "mx-4 mb-3 mt-3.5"
      }
    >
      <div
        className={clsx(
          "flex items-center rounded-[3px] border-[1.5px] border-tl-ink",
          variant === "desktop"
            ? "h-11 gap-[11px] px-[15px] group-data-[condensed]:h-10"
            : "h-[46px] gap-2.5 px-[13px]",
        )}
      >
        <IconSearch
          className={clsx(
            "h-[15px] w-[15px] shrink-0",
            variant === "desktop" ? "text-tl-ink" : "text-tl-steel",
          )}
        />
        <span className="truncate font-tl-text text-sm text-tl-steel">
          {variant === "desktop"
            ? "Search parts, brands, or part number"
            : "Search parts or part number"}
        </span>
      </div>
    </div>
  );
}

export function SearchField({
  variant = "desktop",
}: {
  variant?: "desktop" | "drawer";
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const vehicles = useVehicles();
  const [value, setValue] = useState(searchParams?.get("q") || "");
  const [results, setResults] = useState<PredictiveSearchResult>(EMPTY);
  const [open, setOpen] = useState(false);
  const [garage, setGarage] = useState<VehicleSelection | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const query = value.trim();
  const hasQuery = query.length >= 2;

  // Debounced predictions.
  useEffect(() => {
    if (!hasQuery) {
      setResults(EMPTY);
      return;
    }
    const timer = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `/api/predictive-search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        if (res.ok) setResults(await res.json());
      } catch {
        // Aborted or offline — keep the previous predictions.
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [query, hasQuery]);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  // Close on outside pointer.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // predictiveSearch takes no tag filter, so garage pre-filtering happens here
  // on the returned set; when nothing fits we fall back to the unfiltered
  // predictions with fitment indicated per result.
  const fitting = garage
    ? results.products.filter((p) =>
        productFitsGeneration(p.tags, garage.gen.handle),
      )
    : results.products;
  const filtered = !!garage && fitting.length > 0;
  const products = filtered ? fitting : results.products;
  const hasAny = products.length > 0 || results.collections.length > 0;
  const showDropdown = open && hasQuery;

  const searchAllUrl = `/search?${new URLSearchParams({ q: query })}`;
  const widenUrl = `/search?${new URLSearchParams({ q: query, all: "1" })}`;

  const groupLabel =
    "px-[15px] pb-[7px] pt-3 font-tl-mono text-[9px] uppercase tracking-[0.14em] text-tl-mute-white";
  const row =
    "flex items-center gap-[11px] px-[15px] py-[9px] font-tl-text text-[13.5px] text-tl-ink hover:bg-tl-fog";

  return (
    <div
      ref={rootRef}
      className={clsx(
        "relative",
        variant === "desktop"
          ? "ml-auto w-full max-w-[560px] group-data-[condensed]:max-w-[440px]"
          : "mx-4 mb-3 mt-3.5",
      )}
      onKeyDown={(e) => {
        if (e.key === "Escape") setOpen(false);
      }}
    >
      <Form
        action="/search"
        onSubmit={() => setOpen(false)}
        className={clsx(
          "flex items-center rounded-[3px] border-[1.5px] border-tl-ink transition-[height]",
          variant === "desktop"
            ? "h-11 gap-[11px] px-[15px] group-data-[condensed]:h-10"
            : "h-[46px] gap-2.5 px-[13px]",
        )}
      >
        <IconSearch
          className={clsx(
            "h-[15px] w-[15px] shrink-0",
            variant === "desktop" ? "text-tl-ink" : "text-tl-steel",
          )}
        />
        <input
          ref={inputRef}
          type="text"
          name="q"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setGarage(readGarage(vehicles));
            setOpen(true);
          }}
          placeholder={
            variant === "desktop"
              ? "Search parts, brands, or part number"
              : "Search parts or part number"
          }
          autoComplete="off"
          aria-label="Search"
          aria-expanded={showDropdown}
          data-search-input
          className="min-w-0 flex-1 bg-transparent font-tl-text text-sm text-tl-ink placeholder:text-tl-steel"
        />
      </Form>

      {showDropdown ? (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[4px] border border-tl-hairline bg-white shadow-[0_18px_40px_-16px_rgba(15,20,48,0.35)]">
          {products.length > 0 ? (
            <>
              <p className={groupLabel}>
                {filtered && garage
                  ? `Parts · fit your ${vehicleShortLabel(garage)}`
                  : "Parts"}
              </p>
              {garage && !filtered ? (
                <p className="px-[15px] pb-2 font-tl-text text-xs text-tl-mute-white">
                  No exact matches for your {vehicleShortLabel(garage)} —
                  showing all parts.
                </p>
              ) : null}
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={product.path}
                  prefetch={true}
                  className={row}
                  onClick={() => setOpen(false)}
                >
                  <IconSearch className="h-[15px] w-[15px] shrink-0 text-tl-mute" />
                  <span className="truncate">{product.title}</span>
                  {garage && !filtered ? (
                    <span className="ml-1 shrink-0 rounded-[2px] bg-tl-tint px-[5px] py-0.5 font-tl-mono text-[9px] tracking-[0.08em] text-tl-indigo">
                      {product.tags.includes(UNIVERSAL_FIT_TAG)
                        ? "Universal"
                        : "Check fitment"}
                    </span>
                  ) : null}
                  {product.sku ? (
                    <span className="ml-auto shrink-0 font-tl-mono text-[11px] text-tl-mute-white">
                      {product.sku}
                    </span>
                  ) : null}
                </Link>
              ))}
            </>
          ) : null}

          {results.collections.length > 0 ? (
            <>
              <p className={groupLabel}>Categories</p>
              {results.collections.map((collection) => (
                <Link
                  key={collection.id}
                  href={collection.path}
                  prefetch={true}
                  className={row}
                  onClick={() => setOpen(false)}
                >
                  <IconGarage className="h-[15px] w-[15px] shrink-0 text-tl-mute" />
                  <span className="truncate">{collection.title}</span>
                </Link>
              ))}
            </>
          ) : null}

          {!hasAny ? (
            <p className="px-[15px] pb-2 pt-3 font-tl-text text-[13.5px] text-tl-steel">
              No matches for &ldquo;{query}&rdquo;.
            </p>
          ) : null}

          {/* Never a dead end: full search always reachable, plus a widen path
              when a garage vehicle is filtering results. */}
          <div className="border-t border-tl-hairline">
            <Link
              href={hasAny ? searchAllUrl : "/search"}
              className="flex items-center px-[15px] py-[10px] font-tl-text text-xs font-medium text-tl-indigo hover:bg-tl-fog"
              onClick={() => setOpen(false)}
            >
              {hasAny ? `See all results for “${query}”` : "Browse all parts"}
            </Link>
            {garage ? (
              <Link
                href={widenUrl}
                className="flex items-center px-[15px] pb-[10px] font-tl-text text-xs font-medium text-tl-indigo hover:bg-tl-fog"
                onClick={() => setOpen(false)}
              >
                Widen to all trucks
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
