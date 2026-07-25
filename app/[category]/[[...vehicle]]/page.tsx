import type { Metadata } from "next";

import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import FilterList from "components/layout/search/filter";
import { defaultSort, sorting } from "lib/constants";
import {
  fitmentTag,
  productFitsGeneration,
  resolveVehiclePath,
  UNIVERSAL_FIT_TAG,
  type VehicleGeneration,
} from "lib/fitment";
import { getCollection, getCollectionProducts } from "lib/shopify";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import GarageRedirect from "../garage-redirect";

type Params = Promise<{ category: string; vehicle?: string[] }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(props: {
  params: Params;
}): Promise<Metadata> {
  const { category, vehicle } = await props.params;
  const collection = await getCollection(category);

  if (!collection || category.startsWith("hidden")) return notFound();

  if (!vehicle || vehicle.length === 0) {
    return {
      title: collection.seo?.title || collection.title,
      description:
        collection.seo?.description ||
        collection.description ||
        `${collection.title} products`,
      // ?sort=/?all= variants must not index separately.
      alternates: { canonical: `/${category}` },
    };
  }

  if (collection.fitmentDisabled) return notFound();

  const gen = resolveVehiclePath(vehicle);
  if (!gen) return notFound();

  return {
    title: `${gen.label} ${collection.title}`,
    description: `${collection.title} that fits your ${gen.label}.`,
    // Every in-range year serves identical content, so all year variants
    // canonicalize to the generation's first-year URL. Switch to
    // self-referencing canonicals if fitment ever becomes year-specific
    // within a generation.
    alternates: {
      canonical: `/${category}/${gen.make}/${gen.model}/${gen.yearStart}`,
    },
  };
}

export default async function CategoryPage(props: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { category, vehicle } = await props.params;
  const collection = await getCollection(category);

  // getCollection doesn't filter hidden-* handles — without this guard
  // /hidden-homepage-featured-items would be a public page.
  if (!collection || category.startsWith("hidden")) notFound();

  let gen: VehicleGeneration | undefined;
  if (vehicle && vehicle.length > 0) {
    // Lifestyle collections have no vehicle URLs.
    if (collection.fitmentDisabled) notFound();
    gen = resolveVehiclePath(vehicle);
    if (!gen) notFound();
  }

  // props.searchParams is intentionally never awaited here: only the
  // Suspense-wrapped grid reads it, so the page shell stays prerenderable
  // under cacheComponents and the grid is the only dynamic hole.
  return (
    <section className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 text-black md:flex-row dark:text-white">
      <div className="order-last min-h-screen w-full md:order-none">
        <h1 className="mb-2 text-2xl font-bold">{collection.title}</h1>
        {collection.description ? (
          <p className="mb-4 text-neutral-500 dark:text-neutral-400">
            {collection.description}
          </p>
        ) : null}
        {gen ? (
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            Showing {collection.title} that fits your {gen.label}.{" "}
            <Link
              href={`/${category}?all=1`}
              className="underline underline-offset-4"
            >
              View all {collection.title}
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
            category={category}
            collectionTitle={collection.title}
            gen={gen}
            searchParams={props.searchParams}
          />
        </Suspense>
        {/* Bare fitment-enabled view only: lifestyle pages never bounce to a
            vehicle URL, and the vehicle view rendering it would loop. Suspense
            is required — it calls useSearchParams. */}
        {!gen && !collection.fitmentDisabled ? (
          <Suspense fallback={null}>
            <GarageRedirect category={category} />
          </Suspense>
        ) : null}
      </div>
      <div className="order-none flex-none md:order-last md:w-[125px]">
        <FilterList list={sorting} title="Sort by" />
      </div>
    </section>
  );
}

async function SortedGrid({
  category,
  collectionTitle,
  gen,
  searchParams,
}: {
  category: string;
  collectionTitle: string;
  gen?: VehicleGeneration;
  searchParams?: SearchParams;
}) {
  const { sort } = ((await searchParams) ?? {}) as { sort?: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Same-type filters OR together, so this is fits-<gen> OR fits-universal —
  // the first: 100 cap then applies to matching products only.
  const products = await getCollectionProducts({
    collection: category,
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
            No {collectionTitle} fit your {gen.label} yet.{" "}
            <Link
              href={`/${category}?all=1`}
              className="underline underline-offset-4"
            >
              View all {collectionTitle}
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
