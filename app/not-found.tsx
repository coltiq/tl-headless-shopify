import Footer from "components/layout/footer";
import { getCategoryTree } from "lib/shopify";
import type { Metadata } from "next";
import Link from "next/link";

// Under cacheComponents the route shell is flushed before notFound() is
// reached, so Next cannot set a 404 status — this page returns **200**. That
// is app-wide and predates the fitment work (/product/does-not-exist behaves
// the same). `noindex` is the mitigation: it keeps these pages out of the
// index even though the status code says otherwise. Watch Search Console for
// soft-404s after launch and escalate to a middleware handle-allowlist only if
// they actually show up.
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  // Top-level categories only (depth 1) — the useful "where did you mean to
  // go" list, and short enough not to become a second nav.
  const top = (await getCategoryTree())
    .filter((node) => node.parentPath === null)
    .slice(0, 8);

  return (
    <>
      <div className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 py-20">
        <div className="max-w-xl">
          <p className="font-tl-mono text-xs uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 text-neutral-500 dark:text-neutral-400">
            The link may be out of date, or the part may have moved. Try a
            search, or start from one of the categories below.
          </p>

          <form action="/search" className="mt-6 flex gap-2">
            <input
              type="text"
              name="q"
              placeholder="Search parts…"
              autoComplete="off"
              className="h-10 w-full rounded-[3px] border border-neutral-300 bg-white px-3 text-sm text-black dark:border-neutral-700 dark:bg-black dark:text-white"
            />
            <button
              type="submit"
              className="h-10 flex-none rounded-[3px] bg-tl-indigo px-4 text-xs font-bold text-white transition-colors hover:bg-tl-indigo-lift"
            >
              Search
            </button>
          </form>
        </div>

        {top.length > 0 ? (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide">
              Shop by category
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {top.map((node) => (
                <li key={node.path}>
                  <Link
                    href={node.path}
                    className="underline underline-offset-4"
                  >
                    {node.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
      <Footer />
    </>
  );
}
