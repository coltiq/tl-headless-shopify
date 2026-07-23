import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import { defaultSort, sorting } from "lib/constants";
import {
  findGeneration,
  fitmentSearchClause,
  GARAGE_COOKIE,
} from "lib/fitment";
import { getProducts } from "lib/shopify";
import { cookies } from "next/headers";
import Link from "next/link";

export const metadata = {
  title: "Search",
  description: "Search for products in the store.",
};

export default async function SearchPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const {
    sort,
    q: searchValue,
    all,
  } = searchParams as { [key: string]: string };
  const { sortKey, reverse } =
    sorting.find((item) => item.slug === sort) || defaultSort;

  // Results are filtered to the garage vehicle via fitment tags unless the
  // visitor explicitly widens with ?all=1.
  const garage =
    all === "1"
      ? undefined
      : findGeneration((await cookies()).get(GARAGE_COOKIE)?.value);
  const query = garage
    ? [searchValue, fitmentSearchClause(garage.handle)]
        .filter(Boolean)
        .join(" ")
    : searchValue;

  const products = await getProducts({ sortKey, reverse, query });
  const resultsText = products.length > 1 ? "results" : "result";

  const widenParams = new URLSearchParams({ all: "1" });
  if (searchValue) widenParams.set("q", searchValue);
  if (sort) widenParams.set("sort", sort);
  const widenUrl = `/search?${widenParams}`;

  return (
    <>
      {garage ? (
        <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
          Showing parts that fit your {garage.label}.{" "}
          <Link href={widenUrl} className="underline underline-offset-4">
            Widen to all trucks
          </Link>
        </p>
      ) : null}
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? `There are no products that match ${garage ? "your truck and " : ""}`
            : `Showing ${products.length} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : null}
      {products.length > 0 ? (
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <ProductGridItems products={products} />
        </Grid>
      ) : null}
    </>
  );
}
