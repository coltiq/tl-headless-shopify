import Grid from "components/grid";
import ProductGridItems from "components/layout/product-grid-items";
import FitmentToggle from "components/layout/search/fitment-toggle";
import { defaultSort, sorting } from "lib/constants";
import {
  fitmentSearchClause,
  GARAGE_COOKIE,
  resolveGarageCookie,
} from "lib/fitment";
import { getProducts, getVehicles } from "lib/shopify";
import { cookies } from "next/headers";

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

  // What's in the garage and whether the filter is applied are separate:
  // ?all=1 turns the filter off, but the toggle must stay visible (in its off
  // state) so the visitor can turn it back on.
  const garage = resolveGarageCookie(
    await getVehicles(),
    (await cookies()).get(GARAGE_COOKIE)?.value,
  );
  const applyFitment = Boolean(garage) && all !== "1";
  const query = applyFitment
    ? [searchValue, fitmentSearchClause(garage!.gen.handle)]
        .filter(Boolean)
        .join(" ")
    : searchValue;

  const products = await getProducts({ sortKey, reverse, query });
  const resultsText = products.length > 1 ? "results" : "result";

  return (
    <>
      <FitmentToggle garage={garage ?? null} />
      {searchValue ? (
        <p className="mb-4">
          {products.length === 0
            ? `There are no products that match ${applyFitment ? "your truck and " : ""}`
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
