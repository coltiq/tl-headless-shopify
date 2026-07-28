import { getCategoryTree, getCollections, getProducts } from "lib/shopify";
import { baseUrl, validateEnvironmentVariables } from "lib/utils";
import { MetadataRoute } from "next";

type Route = {
  url: string;
  lastModified: string;
};

export const dynamic = "force-dynamic";

// Static code routes with no Shopify content behind them. Every one of these
// permanently claims its path — a static route always beats the [...path]
// catch-all, so no collection can ever use those handles. The four L1 nav
// sections are the last four; the rest are ordinary pages.
const STATIC_ROUTES = [
  "",
  "/search",
  "/contact",
  "/app",
  "/support",
  "/quote",
  "/financing",
  "/parts",
  "/custom-work",
  "/custom-work/services",
  "/custom-work/builds",
  "/custom-work/inside-the-shop",
  "/custom-work/pricing",
  "/lifestyle",
  "/community",
  "/the-standard",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  validateEnvironmentVariables();

  const now = new Date().toISOString();
  const routesMap = STATIC_ROUTES.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  // Category URLs are the tree paths, not the collection handles: /<handle>
  // 308s to the derived path whenever the handle has a tree position, so only
  // out-of-tree collections belong here flat.
  //
  // Vehicle URLs stay out of the sitemap (Phase 2 decision, unchanged) —
  // categories × generations is a combinatorial explosion of near-duplicate
  // pages, and they're all reachable by crawl anyway.
  const categoriesPromise = getCategoryTree();
  const collectionsPromise = getCollections();

  const categoryRoutes = async (): Promise<Route[]> => {
    const [categories, collections] = await Promise.all([
      categoriesPromise,
      collectionsPromise,
    ]);
    const inTree = new Set(
      categories.map((node) => node.collectionHandle).filter(Boolean),
    );
    const updatedAt = new Map(
      collections.map((collection) => [
        collection.handle,
        collection.updatedAt,
      ]),
    );

    return [
      ...categories.map((node) => ({
        url: `${baseUrl}${node.path}`,
        lastModified:
          (node.collectionHandle && updatedAt.get(node.collectionHandle)) ||
          now,
      })),
      ...collections
        .filter(
          (collection) =>
            collection.handle &&
            !collection.handle.startsWith("hidden") &&
            !inTree.has(collection.handle),
        )
        .map((collection) => ({
          url: `${baseUrl}/${collection.handle}`,
          lastModified: collection.updatedAt,
        })),
    ];
  };

  const productsPromise = getProducts({}).then((products) =>
    products.map((product) => ({
      url: `${baseUrl}/product/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  );

  let fetchedRoutes: Route[] = [];

  try {
    fetchedRoutes = (
      await Promise.all([categoryRoutes(), productsPromise])
    ).flat();
  } catch (error) {
    throw JSON.stringify(error, null, 2);
  }

  return [...routesMap, ...fetchedRoutes];
}
