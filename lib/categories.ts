// Category-path helpers. This module must stay client-safe (no next/*, no
// fetching) so the breadcrumb trail and any future client island can reuse the
// same path logic the server resolver uses.
//
// The category URL space is *derived from the nav_item tree*: an author types a
// slug, the app builds the path from tree position with L1 (the four nav
// sections) contributing no segment. See CLAUDE.md, "The category URL space".

import { NAV_LEVEL_CAPS } from "lib/constants";
import type { CategoryNode, MenuItem, ShopifyNavItem } from "lib/shopify/types";

// Lowercase alphanumeric plus internal hyphens.
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
// A four-digit slug would collide with the year segment of a vehicle URL
// (/lighting/2021 is ambiguous with /<category>/<make>/<model>/<year>).
const YEAR_PATTERN = /^\d{4}$/;

export function isValidCategorySlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && !YEAR_PATTERN.test(slug);
}

export function joinCategoryPath(parentPath: string, slug: string): string {
  return `${parentPath}/${slug}`;
}

const navStyle = (node: ShopifyNavItem) =>
  node.style?.value === "links-row" ? ("links-row" as const) : undefined;

// Walks one level of the tree below `parentPath`, appending every category it
// finds to `out` and returning the menu items plus the category paths that
// belong to `parentPath` directly.
//
// Walk rules (CLAUDE.md, "The category URL space"):
//  - a node contributes a segment only if it has a valid, unique `slug`;
//  - a node without a slug is a menu heading — its children attach to *its*
//    parent's path, so headings never appear in a URL or a breadcrumb;
//  - an invalid or duplicated slug drops that node and its whole subtree from
//    the category space (`parentPath` of null below), but the menu entries
//    stay so the breakage is visible rather than a silently missing branch.
//
// Per-node validation, dropping offenders with console.error: one bad admin
// entry must never blank the category space (same discipline as
// reshapeVehicles).
function walkNavLevel(
  nodes: ShopifyNavItem[],
  parentPath: string | null,
  out: CategoryNode[],
  level: 2 | 3 | 4,
  linkToPath: (link: string) => string,
): { items: MenuItem[]; paths: string[] } {
  const items: MenuItem[] = [];
  const paths: string[] = [];
  const siblingSlugs = new Set<string>();

  const cap = NAV_LEVEL_CAPS[`l${level}`];
  if (nodes.length >= cap) {
    console.error(
      `nav_item level ${level} is at its cap of ${cap} under "${parentPath || "(root)"}" — any further entries are silently dropped by the query and have no URL`,
    );
  }

  for (const node of nodes) {
    // A missing label means the node is either a non-Metaobject reference
    // (deserialized as {}) or a misconfigured entry — drop it.
    const title = node?.label?.value;
    if (!title) continue;

    const slug = node.slug?.value?.trim() ?? "";
    let path: string | null = null;

    if (slug && parentPath !== null) {
      if (!isValidCategorySlug(slug)) {
        console.error(
          `Dropping nav_item "${title}" from the category index: invalid slug "${slug}" (lowercase alphanumeric plus internal hyphens, never four digits)`,
        );
      } else if (siblingSlugs.has(slug)) {
        console.error(
          `Dropping nav_item "${title}" from the category index: duplicate sibling slug "${slug}"`,
        );
      } else {
        siblingSlugs.add(slug);
        path = joinCategoryPath(parentPath, slug);
      }
    }

    // Heading (no slug at all) → children keep the parent's path. Dropped node
    // (slug present but rejected) → null, which drops the subtree too.
    const childParent = slug ? path : parentPath;
    // L4 is the deepest level the query fetches, so it has no children to
    // walk; the type keeps that fact from drifting out of sync with nav.ts.
    const child =
      level === 4
        ? { items: [] as MenuItem[], paths: [] as string[] }
        : walkNavLevel(
            node.children?.references?.nodes ?? [],
            childParent,
            out,
            (level + 1) as 3 | 4,
            linkToPath,
          );

    items.push({
      title,
      // The derived path wins; `link` remains the escape hatch for
      // non-category destinations and for entries not yet migrated to slugs.
      path: path ?? (node.link?.value ? linkToPath(node.link.value) : "#"),
      style: navStyle(node),
      items: child.items,
    });

    if (path !== null) {
      const handle = node.collection?.reference?.handle;
      out.push({
        path,
        segments: path.slice(1).split("/"),
        slug,
        title,
        collectionHandle: handle || null,
        layout: node.layout?.value === "landing" ? "landing" : "grid",
        // Default true: unset/absent means the grid follows the sections.
        showGrid: node.showGrid?.value !== "false",
        parentPath: parentPath || null,
        childPaths: child.paths,
      });
      paths.push(path);
    } else {
      // A heading's children are the parent's children as far as URLs go.
      paths.push(...child.paths);
    }
  }

  return { items, paths };
}

// One walk, two projections — the menu and the category index can never
// disagree, because they come from the same pass over the same tree.
//
// `l1Nodes` are the root nav_item's children. L1 is a section, not a segment:
// it groups the menu and contributes nothing to any URL, so its own
// destination comes from `link` (a custom code route) and its children start
// the path at "".
//
// `linkToPath` maps a raw `link` field value to an app path; it is injected so
// this module never has to read the store domain and stays client-safe.
export function buildNavProjection(
  l1Nodes: ShopifyNavItem[],
  linkToPath: (link: string) => string,
): { menu: MenuItem[]; categories: CategoryNode[] } {
  const categories: CategoryNode[] = [];
  const menu: MenuItem[] = [];

  if (l1Nodes.length >= NAV_LEVEL_CAPS.l1) {
    console.error(
      `nav_item level 1 is at its cap of ${NAV_LEVEL_CAPS.l1} — any further entries are silently dropped by the query and have no URL`,
    );
  }

  for (const node of l1Nodes) {
    const title = node?.label?.value;
    if (!title) continue;

    const child = walkNavLevel(
      node.children?.references?.nodes ?? [],
      "",
      categories,
      2,
      linkToPath,
    );

    menu.push({
      title,
      path: node.link?.value ? linkToPath(node.link.value) : "#",
      style: navStyle(node),
      items: child.items,
    });
  }

  // Two L1 sections can each hold a child with the same slug; the per-level
  // sibling check can't see across them, so collapse duplicates globally.
  const seen = new Set<string>();
  const unique = categories.filter((node) => {
    if (seen.has(node.path)) {
      console.error(
        `Dropping duplicate category path ${node.path} ("${node.title}") — two nav_item entries claim it`,
      );
      return false;
    }
    seen.add(node.path);
    return true;
  });

  return { menu, categories: unique };
}

export function indexByPath(nodes: CategoryNode[]): Map<string, CategoryNode> {
  const map = new Map<string, CategoryNode>();
  for (const node of nodes) {
    map.set(node.path, node);
  }
  return map;
}

// Collection handle → the node that owns it. First in walk order wins: a
// collection referenced from two places in the tree renders at both paths but
// canonicalizes (and 308s) to one.
export function indexByHandle(
  nodes: CategoryNode[],
): Map<string, CategoryNode> {
  const map = new Map<string, CategoryNode>();
  for (const node of nodes) {
    if (node.collectionHandle && !map.has(node.collectionHandle)) {
      map.set(node.collectionHandle, node);
    }
  }
  return map;
}

// Root-first ancestors, excluding the node itself. Walks `parentPath` rather
// than re-splitting the path, so heading-only nodes (which contribute no
// segment) can never appear in the trail.
export function ancestorsOf(
  node: CategoryNode,
  byPath: Map<string, CategoryNode>,
): CategoryNode[] {
  const trail: CategoryNode[] = [];
  const seen = new Set<string>([node.path]);
  let current = node.parentPath ? byPath.get(node.parentPath) : undefined;

  while (current && !seen.has(current.path)) {
    seen.add(current.path);
    trail.unshift(current);
    current = current.parentPath ? byPath.get(current.parentPath) : undefined;
  }

  return trail;
}
