import type { Metadata } from "next";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import FilterList from "components/layout/search/filter";
import { defaultSort, sorting } from "lib/constants";
import {
  fitmentTag,
  productFitsGeneration,
  UNIVERSAL_FIT_TAG,
  type VehicleGeneration,
} from "lib/fitment";
import {
  getCategoryTree,
  getCollectionProducts,
  getCollections,
} from "lib/shopify";
import { ogImageUrl } from "lib/utils";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "./breadcrumbs";
import GarageRedirect from "./garage-redirect";
import { resolveCategoryPath, type Crumb } from "./resolve";

type Params = Promise<{ path: string[] }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// Every tree path plus every out-of-tree collection handle, so all category
// shells prerender. In-tree handles are deliberately absent: /<handle> 308s to
// the derived path, and there is nothing to prerender about a redirect.
export async function generateStaticParams() {
  const [nodes, collections] = await Promise.all([
    getCategoryTree(),
    getCollections(),
  ]);
  const inTree = new Set(
    nodes.map((node) => node.collectionHandle).filter(Boolean),
  );

  return [
    ...nodes.map((node) => ({ path: node.segments })),
    ...collections
      .filter(
        (collection) =>
          collection.handle &&
          !collection.handle.startsWith("hidden") &&
          !inTree.has(collection.handle),
      )
      .map((collection) => ({ path: [collection.handle] })),
  ];
}

// Mirrors the page's resolution and reaches the same verdict independently —
// every branch is a `use cache` read, so running it twice is free.
export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { path } = await props.params;
  const resolved = await resolveCategoryPath(path);

  if (resolved.kind === "none") return notFound();
  // The redirect fires in the page, but cacheComponents degrades it to a
  // client-side one — so this URL can still be crawled. The canonical is what
  // keeps exactly one indexable URL per category until that changes.
  if (resolved.kind === "redirect") {
    return { alternates: { canonical: resolved.to } };
  }

  const collection = resolved.collection;
  const basePath =
    resolved.kind === "category"
      ? resolved.node.path
      : `/${resolved.collection.handle}`;
  const title =
    collection?.seo?.title ||
    (resolved.kind === "category" ? resolved.node.title : collection?.title) ||
    "";
  const description =
    collection?.seo?.description ||
    collection?.description ||
    `${title} products`;

  // A catch-all segment can't carry an `opengraph-image` file, so the card is
  // requested from the shared handler by title.
  const openGraph = (cardTitle: string) => ({
    images: [{ url: ogImageUrl(cardTitle), width: 1200, height: 630 }],
  });

  if (!resolved.gen) {
    return {
      title,
      // ?sort=/?all= variants must not index separately. For the flat
      // fallback this is still the tree path when one exists, because the 308
      // has already sent every visitor there.
      description,
      alternates: { canonical: basePath },
      openGraph: openGraph(collection?.seo?.title || title),
    };
  }

  const gen = resolved.gen;
  return {
    title: `${gen.label} ${title}`,
    description: `${title} that fits your ${gen.label}.`,
    openGraph: openGraph(`${gen.label} ${title}`),
    // Every in-range year serves identical content, so all year variants
    // canonicalize to the generation's first-year URL. Switch to
    // self-referencing canonicals if fitment ever becomes year-specific
    // within a generation.
    alternates: {
      canonical: `${basePath}/${gen.make}/${gen.model}/${gen.yearStart}`,
    },
  };
}

export default async function CategoryPage(props: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { path } = await props.params;
  const resolved = await resolveCategoryPath(path);

  if (resolved.kind === "none") notFound();
  // Flat → deep. Under cacheComponents the shell is flushed before this is
  // reached, so Next serves a client-side `__next-page-redirect` rather than
  // an HTTP 308 — same root cause as the 200-status 404s. The canonical tag
  // on the destination is what carries the SEO weight until that changes; see
  // docs/PHASE3-RED-FLAGS.md.
  if (resolved.kind === "redirect") permanentRedirect(resolved.to);

  const isCategory = resolved.kind === "category";
  const collection = resolved.collection;
  const basePath = isCategory
    ? resolved.node.path
    : `/${resolved.collection.handle}`;
  // The nav label wins for a category: it is the text the visitor clicked and
  // the text in the breadcrumb trail. Collections keep their own title.
  const title = isCategory ? resolved.node.title : resolved.collection.title;
  const gen = resolved.gen;
  const trail = isCategory ? resolved.ancestors : [];

  // Safety net, not a render mode: a node whose collection reference is
  // missing or points at a deleted/unpublished collection renders its child
  // links so a one-field admin slip can't leave a live nav link on a dead
  // page. resolveCategoryPath has already logged it.
  if (!collection) {
    return (
      <CategoryShell
        trail={trail}
        title={title}
        current={title}
        description={null}
      >
        <ChildLinks items={isCategory ? resolved.children : []} />
      </CategoryShell>
    );
  }

  // props.searchParams is intentionally never awaited here: only the
  // Suspense-wrapped grid reads it, so the page shell stays prerenderable
  // under cacheComponents and the grid is the only dynamic hole.
  return (
    <CategoryShell
      trail={trail}
      title={title}
      current={gen ? gen.label : title}
      description={collection.description || null}
      sortRail
    >
      {gen ? (
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Showing {title} that fits your {gen.label}.{" "}
          <Link
            href={`${basePath}?all=1`}
            className="underline underline-offset-4"
          >
            View all {title}
          </Link>
        </p>
      ) : null}
      <Suspense
        fallback={
          <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {Array(12)
              .fill(0)
              .map((_, index) => (
                <Grid.Item
                  key={index}
                  className="animate-pulse bg-neutral-100 dark:bg-neutral-800"
                />
              ))}
          </Grid>
        }
      >
        <SortedGrid
          collectionHandle={collection.handle}
          basePath={basePath}
          title={title}
          gen={gen}
          searchParams={props.searchParams}
        />
      </Suspense>
      {/* Bare fitment-enabled view only: lifestyle pages never bounce to a
          vehicle URL, and the vehicle view rendering it would loop. Suspense
          is required — it calls useSearchParams. */}
      {!gen && !collection.fitmentDisabled ? (
        <Suspense fallback={null}>
          <GarageRedirect basePath={basePath} />
        </Suspense>
      ) : null}
    </CategoryShell>
  );
}

function CategoryShell({
  trail,
  title,
  current,
  description,
  sortRail = false,
  children,
}: {
  trail: Crumb[];
  title: string;
  current: string;
  description: string | null;
  sortRail?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
      <div className="order-last min-h-screen w-full md:order-none">
        <Breadcrumbs trail={trail} current={current} />
        <h1 className="mb-2 text-2xl font-bold">{title}</h1>
        {description ? (
          <p className="mb-4 text-neutral-500 dark:text-neutral-400">
            {description}
          </p>
        ) : null}
        {children}
      </div>
      {sortRail ? (
        <div className="order-none flex-none md:order-last md:w-[125px]">
          <FilterList list={sorting} title="Sort by" />
        </div>
      ) : null}
    </section>
  );
}

function ChildLinks({ items }: { items: Crumb[] }) {
  if (items.length === 0) {
    return <p className="py-3 text-lg">This category isn&apos;t available.</p>;
  }

  return (
    <ul className="flex flex-col gap-2 py-3 text-lg">
      {items.map((child) => (
        <li key={child.path}>
          <Link href={child.path} className="underline underline-offset-4">
            {child.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

async function SortedGrid({
  collectionHandle,
  basePath,
  title,
  gen,
  searchParams,
}: {
  collectionHandle: string;
  basePath: string;
  title: string;
  gen?: VehicleGeneration;
  searchParams?: SearchParams;
}) {
  const { sort } = ((await searchParams) ?? {}) as { sort?: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Every category is one query with native Shopify sorting: collection
  // membership cascades in admin, so a parent collection already contains
  // everything beneath it and no page has to merge its descendants.
  //
  // Same-type filters OR together, so this is fits-<gen> OR fits-universal —
  // the first: 100 cap then applies to matching products only.
  const products = await getCollectionProducts({
    collection: collectionHandle,
    sortKey,
    reverse,
    ...(gen && {
      filters: [{ tag: fitmentTag(gen.handle) }, { tag: UNIVERSAL_FIT_TAG }],
    }),
  });

  // Safety net: until the Tag filter is enabled in the Search & Discovery
  // app, Shopify silently ignores `filters` and returns the unfiltered list.
  const visible = gen
    ? products.filter((product) =>
        productFitsGeneration(product.tags, gen.handle),
      )
    : products;

  if (visible.length === 0) {
    return (
      <p className="py-3 text-lg">
        {gen ? (
          <>
            No {title} fit your {gen.label} yet.{" "}
            <Link
              href={`${basePath}?all=1`}
              className="underline underline-offset-4"
            >
              View all {title}
            </Link>
          </>
        ) : (
          "No products found in this collection"
        )}
      </p>
    );
  }

  return (
    <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      <ProductGridItems products={visible} />
    </Grid>
  );
}
