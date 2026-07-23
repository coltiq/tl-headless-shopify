"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Form from "next/form";
import { useSearchParams } from "next/navigation";

export default function Search() {
  const searchParams = useSearchParams();

  return (
    <Form action="/search" className="relative w-full max-w-[850px]">
      <input
        key={searchParams?.get("q")}
        type="text"
        name="q"
        placeholder="Search for products..."
        autoComplete="off"
        defaultValue={searchParams?.get("q") || ""}
        className="text-md w-full rounded-lg bg-neutral-900 px-4 py-2 text-white placeholder:text-neutral-400 md:text-sm"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center text-neutral-400">
        <MagnifyingGlassIcon className="h-4" />
      </div>
    </Form>
  );
}

export function SearchSkeleton() {
  return (
    <form className="relative w-full max-w-[850px]">
      <input
        placeholder="Search for products..."
        className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white placeholder:text-neutral-400"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center text-neutral-400">
        <MagnifyingGlassIcon className="h-4" />
      </div>
    </form>
  );
}
