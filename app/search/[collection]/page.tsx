import { indexByHandle } from "lib/categories";
import { getCategoryTree } from "lib/shopify";
import { permanentRedirect } from "next/navigation";

// Legacy route from the upstream template. Nothing links here any more, and a
// canonical tag is weaker than a redirect, so every hit is sent to the
// canonical category URL: the derived tree path when the handle has a tree
// position, the flat path otherwise.
//
// Caveat, same root cause as the 200-status 404s: under cacheComponents the
// route shell is flushed before permanentRedirect() is reached, so Next
// degrades this to a client-side `__next-page-redirect` rather than an HTTP
// 308. `export const dynamic` would fix it but is rejected outright by
// cacheComponents. A real 308 needs the proxy — see
// docs/plans/OPEN-ITEMS.md.
export default async function LegacyCollectionPage(props: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await props.params;
  const node = indexByHandle(await getCategoryTree()).get(collection);

  permanentRedirect(node ? node.path : `/${collection}`);
}
