import { buildNavProjection } from "lib/categories";
import {
  HIDDEN_PRODUCT_TAG,
  NAV_ROOT_HANDLE,
  SHOPIFY_GRAPHQL_API_ENDPOINT,
  TAGS,
} from "lib/constants";
import {
  FALLBACK_VEHICLE_GENERATIONS,
  vehicleHandle,
  type VehicleGeneration,
} from "lib/fitment";
import { isShopifyError } from "lib/type-guards";
import { ensureStartsWith } from "lib/utils";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  addToCartMutation,
  createCartMutation,
  editCartItemsMutation,
  removeFromCartMutation,
} from "./mutations/cart";
import { getCartQuery } from "./queries/cart";
import {
  getCollectionProductsQuery,
  getCollectionQuery,
  getCollectionsQuery,
} from "./queries/collection";
import { getHeaderMenuQuery, getMenuQuery } from "./queries/menu";
import { getNavMenuQuery } from "./queries/nav";
import { getPredictiveSearchQuery } from "./queries/predictive-search";
import { getShopAnnouncementQuery } from "./queries/shop";
import {
  getProductQuery,
  getProductRecommendationsQuery,
  getProductsQuery,
} from "./queries/product";
import { getVehiclesQuery } from "./queries/vehicles";
import {
  Announcement,
  Cart,
  CategoryNode,
  Collection,
  Connection,
  Image,
  Menu,
  MenuItem,
  PredictiveSearchResult,
  Product,
  ShopifyAddToCartOperation,
  ShopifyCart,
  ShopifyCartOperation,
  ShopifyCollection,
  ShopifyCollectionOperation,
  ShopifyCollectionProductsOperation,
  ShopifyCollectionsOperation,
  ShopifyCreateCartOperation,
  ShopifyHeaderMenuItem,
  ShopifyHeaderMenuOperation,
  ShopifyMenuOperation,
  ShopifyNavItem,
  ShopifyNavMenuOperation,
  ShopifyPredictiveSearchOperation,
  ShopifyProduct,
  ShopifyProductOperation,
  ShopifyProductRecommendationsOperation,
  ShopifyProductsOperation,
  ShopifyRemoveFromCartOperation,
  ShopifyShopAnnouncementOperation,
  ShopifyUpdateCartOperation,
  ShopifyVehicleNode,
  ShopifyVehiclesOperation,
} from "./types";

const domain = process.env.SHOPIFY_STORE_DOMAIN
  ? ensureStartsWith(process.env.SHOPIFY_STORE_DOMAIN, "https://")
  : "";
const endpoint = domain ? `${domain}${SHOPIFY_GRAPHQL_API_ENDPOINT}` : "";
const key = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN!;

type ExtractVariables<T> = T extends { variables: object }
  ? T["variables"]
  : never;

export async function shopifyFetch<T>({
  query,
  variables,
  buyerIp,
}: {
  query: string;
  variables?: ExtractVariables<T>;
  buyerIp?: string;
}): Promise<{ status: number; body: T } | never> {
  try {
    if (!endpoint) {
      throw new Error("SHOPIFY_STORE_DOMAIN environment variable is not set");
    }

    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Shopify-Storefront-Private-Token": key,
        ...(buyerIp && { "Shopify-Storefront-Buyer-IP": buyerIp }),
      },
      body: JSON.stringify({
        ...(query && { query }),
        ...(variables && { variables }),
      }),
    });

    const body = await result.json();

    if (body.errors) {
      throw body.errors[0];
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    if (isShopifyError(e)) {
      throw {
        cause: e.cause?.toString() || "unknown",
        status: e.status || 500,
        message: e.message,
        query,
      };
    }

    throw {
      error: e,
      query,
    };
  }
}

const removeEdgesAndNodes = <T>(array: Connection<T>): T[] => {
  return array.edges.map((edge) => edge?.node);
};

const reshapeCart = (cart: ShopifyCart): Cart => {
  if (!cart.cost?.totalTaxAmount) {
    cart.cost.totalTaxAmount = {
      amount: "0.0",
      currencyCode: cart.cost.totalAmount.currencyCode,
    };
  }

  return {
    ...cart,
    lines: removeEdgesAndNodes(cart.lines),
  };
};

const reshapeCollection = (
  collection: ShopifyCollection,
): Collection | undefined => {
  if (!collection) {
    return undefined;
  }

  return {
    ...collection,
    path: `/${collection.handle}`,
    // Missing metafield → fitment on: Parts collections need no admin setup;
    // only Lifestyle collections set custom.fitment_disabled = true.
    fitmentDisabled: collection.fitmentDisabled?.value === "true",
  };
};

const reshapeCollections = (collections: ShopifyCollection[]) => {
  const reshapedCollections = [];

  for (const collection of collections) {
    if (collection) {
      const reshapedCollection = reshapeCollection(collection);

      if (reshapedCollection) {
        reshapedCollections.push(reshapedCollection);
      }
    }
  }

  return reshapedCollections;
};

const reshapeImages = (images: Connection<Image>, productTitle: string) => {
  const flattened = removeEdgesAndNodes(images);

  return flattened.map((image) => {
    const filename = image.url.match(/.*\/(.*)\..*/)?.[1];
    return {
      ...image,
      altText: image.altText || `${productTitle} - ${filename}`,
    };
  });
};

const reshapeProduct = (
  product: ShopifyProduct,
  filterHiddenProducts: boolean = true,
) => {
  if (
    !product ||
    (filterHiddenProducts && product.tags.includes(HIDDEN_PRODUCT_TAG))
  ) {
    return undefined;
  }

  const { images, variants, ...rest } = product;

  return {
    ...rest,
    images: reshapeImages(images, product.title),
    variants: removeEdgesAndNodes(variants),
  };
};

const reshapeProducts = (products: ShopifyProduct[]) => {
  const reshapedProducts = [];

  for (const product of products) {
    if (product) {
      const reshapedProduct = reshapeProduct(product);

      if (reshapedProduct) {
        reshapedProducts.push(reshapedProduct);
      }
    }
  }

  return reshapedProducts;
};

// The buyer's IP can only be read in request-scoped contexts (server actions,
// route handlers) — not inside `use cache` functions, which are shared across visitors.
async function getBuyerIp(): Promise<string | undefined> {
  const requestHeaders = await headers();

  return (
    requestHeaders.get("x-real-ip") ??
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    undefined
  );
}

export async function createCart(): Promise<Cart> {
  const res = await shopifyFetch<ShopifyCreateCartOperation>({
    query: createCartMutation,
    buyerIp: await getBuyerIp(),
  });

  return reshapeCart(res.body.data.cartCreate.cart);
}

export async function addToCart(
  lines: { merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyAddToCartOperation>({
    query: addToCartMutation,
    variables: {
      cartId,
      lines,
    },
    buyerIp: await getBuyerIp(),
  });
  return reshapeCart(res.body.data.cartLinesAdd.cart);
}

export async function removeFromCart(lineIds: string[]): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyRemoveFromCartOperation>({
    query: removeFromCartMutation,
    variables: {
      cartId,
      lineIds,
    },
    buyerIp: await getBuyerIp(),
  });

  return reshapeCart(res.body.data.cartLinesRemove.cart);
}

export async function updateCart(
  lines: { id: string; merchandiseId: string; quantity: number }[],
): Promise<Cart> {
  const cartId = (await cookies()).get("cartId")?.value!;
  const res = await shopifyFetch<ShopifyUpdateCartOperation>({
    query: editCartItemsMutation,
    variables: {
      cartId,
      lines,
    },
    buyerIp: await getBuyerIp(),
  });

  return reshapeCart(res.body.data.cartLinesUpdate.cart);
}

export async function getCart(): Promise<Cart | undefined> {
  "use cache: private";

  const cartId = (await cookies()).get("cartId")?.value;

  if (!cartId) {
    return undefined;
  }

  const res = await shopifyFetch<ShopifyCartOperation>({
    query: getCartQuery,
    variables: { cartId },
  });

  // Old carts becomes `null` when you checkout.
  if (!res.body.data.cart) {
    return undefined;
  }

  return reshapeCart(res.body.data.cart);
}

export async function getCollection(
  handle: string,
): Promise<Collection | undefined> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyCollectionOperation>({
    query: getCollectionQuery,
    variables: {
      handle,
    },
  });

  return reshapeCollection(res.body.data.collection);
}

export async function getCollectionProducts({
  collection,
  reverse,
  sortKey,
  filters,
}: {
  collection: string;
  reverse?: boolean;
  sortKey?: string;
  // Shopify honors `filters` only once the matching filter (e.g. Tag) is
  // enabled in the Search & Discovery app — otherwise it's silently ignored
  // and the unfiltered list comes back, so callers must keep an in-memory
  // safety net.
  filters?: { tag: string }[];
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.collections, TAGS.products);
  cacheLife("days");

  if (!endpoint) {
    console.log(
      `Skipping getCollectionProducts for '${collection}' - Shopify not configured`,
    );
    return [];
  }

  const res = await shopifyFetch<ShopifyCollectionProductsOperation>({
    query: getCollectionProductsQuery,
    variables: {
      handle: collection,
      reverse,
      sortKey: sortKey === "CREATED_AT" ? "CREATED" : sortKey,
      filters,
    },
  });

  if (!res.body.data.collection) {
    console.log(`No collection found for \`${collection}\``);
    return [];
  }

  return reshapeProducts(
    removeEdgesAndNodes(res.body.data.collection.products),
  );
}

export async function getCollections(): Promise<Collection[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log("Skipping getCollections - Shopify not configured");
    return [
      {
        handle: "",
        title: "All",
        description: "All products",
        seo: {
          title: "All",
          description: "All products",
        },
        path: "/search",
        updatedAt: new Date().toISOString(),
        fitmentDisabled: false,
      },
    ];
  }

  const res = await shopifyFetch<ShopifyCollectionsOperation>({
    query: getCollectionsQuery,
  });
  const shopifyCollections = removeEdgesAndNodes(res.body?.data?.collections);
  const collections = [
    {
      handle: "",
      title: "All",
      description: "All products",
      seo: {
        title: "All",
        description: "All products",
      },
      path: "/search",
      updatedAt: new Date().toISOString(),
      fitmentDisabled: false,
    },
    // Filter out the `hidden` collections.
    // Collections that start with `hidden-*` need to be hidden on the search page.
    ...reshapeCollections(shopifyCollections).filter(
      (collection) => !collection.handle.startsWith("hidden"),
    ),
  ];

  return collections;
}

export async function getMenu(handle: string): Promise<Menu[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getMenu for '${handle}' - Shopify not configured`);
    return [];
  }

  const res = await shopifyFetch<ShopifyMenuOperation>({
    query: getMenuQuery,
    variables: {
      handle,
    },
  });

  return (
    res.body?.data?.menu?.items.map((item: { title: string; url: string }) => ({
      title: item.title,
      path: menuUrlToPath(item.url),
    })) || []
  );
}

// Order matters: strip "/collections/<handle>" to "/<handle>" before mapping
// the bare "/collections" link to "/search".
const menuUrlToPath = (url: string): string =>
  url
    .replace(domain, "")
    .replace("/collections/", "/")
    .replace("/collections", "/search")
    .replace("/pages", "");

const reshapeMenuItems = (items: ShopifyHeaderMenuItem[] = []): MenuItem[] =>
  items.map((item) => ({
    title: item.title,
    path: item.url ? menuUrlToPath(item.url) : "#",
    items: reshapeMenuItems(item.items),
  }));

export async function getHeaderMenu(handle: string): Promise<MenuItem[]> {
  "use cache";
  cacheTag(TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log(
      `Skipping getHeaderMenu for '${handle}' - Shopify not configured`,
    );
    return [];
  }

  const res = await shopifyFetch<ShopifyHeaderMenuOperation>({
    query: getHeaderMenuQuery,
    variables: {
      handle,
    },
  });

  return reshapeMenuItems(res.body?.data?.menu?.items);
}

// The raw L1 nodes of the nav_item tree, or null when the metaobject can't be
// read — callers decide what to do about that (the menu falls back to the
// native Shopify menu; the category index has no fallback and goes empty).
export async function getNavTree(
  handle: string = NAV_ROOT_HANDLE,
): Promise<ShopifyNavItem[] | null> {
  "use cache";
  cacheTag(TAGS.menu, TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getNavTree for '${handle}' - Shopify not configured`);
    return null;
  }

  try {
    const res = await shopifyFetch<ShopifyNavMenuOperation>({
      query: getNavMenuQuery,
      variables: {
        handle,
      },
    });
    const root = res.body?.data?.metaobject;
    if (root) {
      return root.children?.references?.nodes ?? [];
    }
  } catch (e) {
    // A missing unauthenticated_read_metaobjects scope or disabled storefront
    // access on the definition throws rather than resolving null — callers
    // must degrade, not crash.
    console.error(`getNavTree for '${handle}' failed`, e);
  }

  return null;
}

export async function getNavMenu(
  handle: string,
  fallbackMenuHandle: string,
): Promise<MenuItem[]> {
  "use cache";
  // Dual-tagged on purpose: while the nav_item metaobject is missing this
  // serves the native-menu fallback, whose cache tags don't propagate to this
  // outer entry — the collections tag keeps it fresh via collection webhooks.
  // Drop TAGS.collections once the metaobject migration is complete.
  cacheTag(TAGS.menu, TAGS.collections);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getNavMenu for '${handle}' - Shopify not configured`);
    return [];
  }

  const tree = await getNavTree(handle);
  if (tree) {
    return buildNavProjection(tree, menuUrlToPath).menu;
  }

  console.error(
    `getNavMenu for '${handle}' has no nav_item tree, using fallback menu`,
  );
  return getHeaderMenu(fallbackMenuHandle);
}

// The flat category index every URL in the category space resolves against.
// Empty when the nav_item tree is unreadable: the native-menu fallback has no
// slugs, so there is nothing to derive paths from — single-segment collection
// URLs still work through the flat fallback in app/[...path].
export async function getCategoryTree(): Promise<CategoryNode[]> {
  "use cache";
  cacheTag(TAGS.menu, TAGS.collections);
  cacheLife("days");

  const tree = await getNavTree();
  if (!tree) return [];

  return buildNavProjection(tree, menuUrlToPath).categories;
}

const reshapeVehicles = (nodes: ShopifyVehicleNode[]): VehicleGeneration[] => {
  const slug = /^[a-z0-9]+$/;
  const year = /^\d{4}$/;
  const valid: VehicleGeneration[] = [];

  // Per-entry validation — one bad admin entry must not blank the picker.
  for (const node of nodes) {
    const make = node.make?.value;
    const model = node.model?.value;
    const yearStartRaw = node.yearStart?.value;
    const yearEndRaw = node.yearEnd?.value;
    const label = node.label?.value;

    if (
      !make ||
      !slug.test(make) ||
      !model ||
      !slug.test(model) ||
      !yearStartRaw ||
      !year.test(yearStartRaw) ||
      !yearEndRaw ||
      !year.test(yearEndRaw) ||
      !label
    ) {
      console.error("Dropping invalid vehicle metaobject entry", node);
      continue;
    }

    const yearStart = Number(yearStartRaw);
    const yearEnd = Number(yearEndRaw);

    if (yearStart > yearEnd) {
      console.error(
        `Dropping vehicle entry with year_start > year_end: ${make} ${model} ${yearStart}-${yearEnd}`,
      );
      continue;
    }

    valid.push({
      handle: vehicleHandle(make, model, yearStart, yearEnd),
      label,
      shortLabel: node.shortLabel?.value || label,
      make,
      model,
      yearStart,
      yearEnd,
    });
  }

  // Drives picker ordering and makes overlap-dropping deterministic.
  valid.sort(
    (a, b) =>
      a.make.localeCompare(b.make) ||
      a.model.localeCompare(b.model) ||
      b.yearStart - a.yearStart,
  );

  // Overlap guard: two entries sharing make+model with intersecting year
  // ranges would make year → generation resolution ambiguous. Keep the first
  // (post-sort), drop the rest — admin fixes the data; the app never guesses.
  const vehicles: VehicleGeneration[] = [];
  for (const gen of valid) {
    const overlap = vehicles.find(
      (kept) =>
        kept.make === gen.make &&
        kept.model === gen.model &&
        kept.yearStart <= gen.yearEnd &&
        gen.yearStart <= kept.yearEnd,
    );
    if (overlap) {
      console.error(
        `Dropping vehicle entry ${gen.handle}: year range overlaps ${overlap.handle}`,
      );
      continue;
    }
    vehicles.push(gen);
  }

  return vehicles;
};

export async function getVehicles(): Promise<VehicleGeneration[]> {
  "use cache";
  cacheTag(TAGS.vehicles);
  cacheLife("days");

  if (!endpoint) {
    console.log("Skipping getVehicles - Shopify not configured");
    return FALLBACK_VEHICLE_GENERATIONS;
  }

  try {
    const res = await shopifyFetch<ShopifyVehiclesOperation>({
      query: getVehiclesQuery,
    });
    const metaobjects = res.body.data.metaobjects;

    // Silent truncation would read as "vehicle missing from picker".
    if (metaobjects.pageInfo.hasNextPage) {
      console.error(
        "getVehicles: over 250 vehicle metaobjects — entries beyond the page cap are missing",
      );
    }

    const vehicles = reshapeVehicles(metaobjects.nodes);

    // Definition exists but has no (valid) entries yet → fallback stubs.
    if (vehicles.length > 0) {
      return vehicles;
    }
  } catch (e) {
    // A missing unauthenticated_read_metaobjects scope, no `vehicle`
    // definition, or disabled storefront access throws rather than resolving
    // null — serve the fallback stubs, same pattern as getNavMenu.
    console.error("getVehicles failed, using fallback generations", e);
  }

  return FALLBACK_VEHICLE_GENERATIONS;
}

export async function getAnnouncement(): Promise<Announcement> {
  "use cache";
  cacheLife("hours");

  if (!endpoint) {
    return { desktop: null, mobile: null };
  }

  const res = await shopifyFetch<ShopifyShopAnnouncementOperation>({
    query: getShopAnnouncementQuery,
  });

  // Shop metafields resolve to null until set in admin — callers must collapse
  // the band rather than render an empty bar.
  return {
    desktop: res.body.data.shop.announcement?.value || null,
    mobile: res.body.data.shop.announcementMobile?.value || null,
  };
}

export async function getPredictiveSearch(
  query: string,
): Promise<PredictiveSearchResult> {
  "use cache";
  cacheTag(TAGS.products, TAGS.collections);
  cacheLife("hours");

  if (!endpoint) {
    return { products: [], collections: [] };
  }

  const res = await shopifyFetch<ShopifyPredictiveSearchOperation>({
    query: getPredictiveSearchQuery,
    variables: {
      query,
    },
  });

  const result = res.body.data.predictiveSearch;

  if (!result) {
    return { products: [], collections: [] };
  }

  return {
    products: result.products
      .filter((product) => !product.tags.includes(HIDDEN_PRODUCT_TAG))
      .map((product) => ({
        id: product.id,
        title: product.title,
        path: `/product/${product.handle}`,
        sku: removeEdgesAndNodes(product.variants)[0]?.sku || null,
        tags: product.tags,
      })),
    collections: result.collections
      .filter((collection) => !collection.handle.startsWith("hidden"))
      .map((collection) => ({
        id: collection.id,
        title: collection.title,
        path: `/${collection.handle}`,
      })),
  };
}

export async function getProduct(handle: string): Promise<Product | undefined> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  if (!endpoint) {
    console.log(`Skipping getProduct for '${handle}' - Shopify not configured`);
    return undefined;
  }

  const res = await shopifyFetch<ShopifyProductOperation>({
    query: getProductQuery,
    variables: {
      handle,
    },
  });

  return reshapeProduct(res.body.data.product, false);
}

export async function getProductRecommendations(
  productId: string,
): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductRecommendationsOperation>({
    query: getProductRecommendationsQuery,
    variables: {
      productId,
    },
  });

  return reshapeProducts(res.body.data.productRecommendations);
}

export async function getProducts({
  query,
  reverse,
  sortKey,
}: {
  query?: string;
  reverse?: boolean;
  sortKey?: string;
}): Promise<Product[]> {
  "use cache";
  cacheTag(TAGS.products);
  cacheLife("days");

  const res = await shopifyFetch<ShopifyProductsOperation>({
    query: getProductsQuery,
    variables: {
      query,
      reverse,
      sortKey,
    },
  });

  return reshapeProducts(removeEdgesAndNodes(res.body.data.products));
}

// This is called from `app/api/revalidate.ts` so providers can control revalidation logic.
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  // We always need to respond with a 200 status code to Shopify,
  // otherwise it will continue to retry the request.
  const collectionWebhooks = [
    "collections/create",
    "collections/delete",
    "collections/update",
  ];
  const productWebhooks = [
    "products/create",
    "products/delete",
    "products/update",
  ];
  // nav_item + vehicle metaobject edits; subscriptions must be created via the
  // Admin API — see docs/shopify-setup.md (Part 9).
  const metaobjectWebhooks = [
    "metaobjects/create",
    "metaobjects/delete",
    "metaobjects/update",
  ];
  const topic = (await headers()).get("x-shopify-topic") || "unknown";
  const secret = req.nextUrl.searchParams.get("secret");
  const isCollectionUpdate = collectionWebhooks.includes(topic);
  const isProductUpdate = productWebhooks.includes(topic);
  const isMetaobjectUpdate = metaobjectWebhooks.includes(topic);

  if (!secret || secret !== process.env.SHOPIFY_REVALIDATION_SECRET) {
    console.error("Invalid revalidation secret.");
    return NextResponse.json({ status: 401 });
  }

  if (!isCollectionUpdate && !isProductUpdate && !isMetaobjectUpdate) {
    // We don't need to revalidate anything for any other topics.
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections, "seconds");
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products, "seconds");
  }

  if (isMetaobjectUpdate) {
    // The x-shopify-topic header is identical for nav_item and vehicle
    // subscriptions — telling them apart would mean parsing the webhook body's
    // `type` field. Both caches are tiny and metaobject edits are rare admin
    // actions, so revalidate both; parse the body if that trade ever changes.
    revalidateTag(TAGS.menu, "seconds");
    revalidateTag(TAGS.vehicles, "seconds");
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
