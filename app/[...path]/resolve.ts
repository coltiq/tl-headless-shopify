import { ancestorsOf, indexByHandle, indexByPath } from "lib/categories";
import { resolveVehiclePath, type VehicleGeneration } from "lib/fitment";
import { getCategoryTree, getCollection, getVehicles } from "lib/shopify";
import type { CategoryNode, Collection } from "lib/shopify/types";

// One crumb of the breadcrumb trail — a subset of CategoryNode so the
// breadcrumb island never has to care where the trail came from.
export type Crumb = { title: string; path: string };

export type CategoryResolution =
  // A node in the category tree. `collection` is undefined only when the
  // node's `collection` reference is missing or points at a collection that
  // has been deleted or unpublished — the page then renders child links
  // instead of a grid (see the safety net in page.tsx).
  | {
      kind: "category";
      node: CategoryNode;
      collection: Collection | undefined;
      gen: VehicleGeneration | undefined;
      ancestors: Crumb[];
      // Direct child categories, used by the safety net below and nowhere
      // else — the grid never has to merge descendants (decision 6).
      children: Crumb[];
    }
  // A live collection with no position in the nav tree (gift-cards, the-lab,
  // best-sellers…). Renders flat at /<handle>, no redirect.
  | { kind: "flat"; collection: Collection; gen: VehicleGeneration | undefined }
  // The handle has a tree position, so /<handle> is not the canonical URL.
  | { kind: "redirect"; to: string }
  | { kind: "none" };

// Resolution order (PLAN-CATEGORY-URLS.md Step 3). Steps 1–2 are in-memory
// lookups against the cached index, so trying both costs nothing and a real
// category always beats a vehicle reading of the same segments.
//
//   1. whole path in the category index?            → category, no vehicle
//   2. ≥4 segments, path minus last 3 in the index
//      AND the last 3 resolve to a generation?      → category + vehicle
//   3. single segment that is a live collection?    → flat (or 308 if in tree)
//   4. 4 segments, [0] a live collection,
//      [1..3] a generation?                         → flat + vehicle (or 308)
//   5. nothing                                      → notFound()
//
// Every branch reads only `use cache` functions, so the page shell stays
// prerenderable and generateMetadata can re-run this and reach the same
// verdict for free.
export async function resolveCategoryPath(
  rawSegments: string[],
): Promise<CategoryResolution> {
  const segments = rawSegments.filter(Boolean);
  if (segments.length === 0) return { kind: "none" };

  const nodes = await getCategoryTree();
  const byPath = indexByPath(nodes);
  const path = `/${segments.join("/")}`;

  // 1 — the whole path is a category.
  const exact = byPath.get(path);
  if (exact) return categoryResolution(exact, undefined, byPath);

  // 2 — category + vehicle suffix, at any depth.
  if (segments.length >= 4) {
    const base = `/${segments.slice(0, -3).join("/")}`;
    const node = byPath.get(base);
    if (node) {
      const gen = await resolveVehicleSegments(segments.slice(-3));
      // The base is a real category, so these last three segments can only
      // ever have been a vehicle. Nothing further can match.
      return gen ? categoryResolution(node, gen, byPath) : { kind: "none" };
    }
  }

  const byHandle = indexByHandle(nodes);

  // 3 — a bare collection handle.
  if (segments.length === 1) {
    const handle = segments[0]!;
    const inTree = byHandle.get(handle);
    if (inTree) return { kind: "redirect", to: inTree.path };

    const collection = await liveCollection(handle);
    return collection
      ? { kind: "flat", collection, gen: undefined }
      : { kind: "none" };
  }

  // 4 — a bare collection handle plus a vehicle.
  if (segments.length === 4) {
    const handle = segments[0]!;
    const gen = await resolveVehicleSegments(segments.slice(1));
    if (gen) {
      const inTree = byHandle.get(handle);
      if (inTree) {
        return {
          kind: "redirect",
          to: `${inTree.path}/${segments.slice(1).join("/").toLowerCase()}`,
        };
      }

      const collection = await liveCollection(handle);
      // Lifestyle collections have no vehicle URLs.
      if (collection && !collection.fitmentDisabled) {
        return { kind: "flat", collection, gen };
      }
    }
  }

  // 5
  return { kind: "none" };
}

// getCollection doesn't filter hidden-* handles — without this guard
// /hidden-homepage-featured-items would be a public page.
async function liveCollection(handle: string): Promise<Collection | undefined> {
  if (handle.startsWith("hidden")) return undefined;
  return getCollection(handle);
}

// Vehicle segments are lowercased before resolution: /lighting/Ford/f150/2021
// is a link somebody will eventually type or paste, and 404ing it is pure
// loss. generateMetadata canonicalizes it back to the lowercase form.
async function resolveVehicleSegments(
  segments: string[],
): Promise<VehicleGeneration | undefined> {
  return resolveVehiclePath(
    await getVehicles(),
    segments.map((segment) => segment.toLowerCase()),
  );
}

async function categoryResolution(
  node: CategoryNode,
  gen: VehicleGeneration | undefined,
  byPath: Map<string, CategoryNode>,
): Promise<CategoryResolution> {
  const ancestors = ancestorsOf(node, byPath).map(toCrumb);
  const children = node.childPaths
    .map((childPath) => byPath.get(childPath))
    .filter((child): child is CategoryNode => Boolean(child))
    .map(toCrumb);

  const collection = node.collectionHandle
    ? await getCollection(node.collectionHandle)
    : undefined;

  if (!collection) {
    // A live nav link pointing at a dead page is worse than a loud log. The
    // page renders child links; vehicle URLs beneath it have nothing to
    // filter, so they 404.
    console.error(
      node.collectionHandle
        ? `Category ${node.path} references collection "${node.collectionHandle}", which is missing, deleted, or unpublished from the sales channel`
        : `Category ${node.path} ("${node.title}") has no collection reference`,
    );
    return gen
      ? { kind: "none" }
      : {
          kind: "category",
          node,
          collection: undefined,
          gen: undefined,
          ancestors,
          children,
        };
  }

  if (gen && collection.fitmentDisabled) return { kind: "none" };

  return { kind: "category", node, collection, gen, ancestors, children };
}

export function toCrumb(node: CategoryNode): Crumb {
  return { title: node.title, path: node.path };
}
