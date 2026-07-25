import { baseUrl } from "lib/utils";
import Link from "next/link";
import type { Crumb } from "./resolve";

// Trail above the <h1>, plus BreadcrumbList JSON-LD. The trail comes from the
// nav tree's parent chain, not from splitting the URL, so heading-only nodes
// (which contribute no segment) never show up as a crumb.
//
// On a vehicle URL the trail ends at the category and the vehicle reads as the
// current crumb — the last item is always the page you're on, and it is never
// a link.
export function Breadcrumbs({
  trail,
  current,
}: {
  trail: Crumb[];
  current: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      ...trail.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 2,
        name: crumb.title,
        item: `${baseUrl}${crumb.path}`,
      })),
      // The current page carries no `item`: it's the URL being viewed.
      {
        "@type": "ListItem",
        position: trail.length + 2,
        name: current,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-2">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <li>
            <Link href="/" className="hover:underline underline-offset-4">
              Home
            </Link>
          </li>
          {trail.map((crumb) => (
            <li key={crumb.path} className="flex items-center gap-x-1.5">
              <span aria-hidden>/</span>
              <Link
                href={crumb.path}
                className="hover:underline underline-offset-4"
              >
                {crumb.title}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-x-1.5">
            <span aria-hidden>/</span>
            <span
              aria-current="page"
              className="text-neutral-700 dark:text-neutral-200"
            >
              {current}
            </span>
          </li>
        </ol>
      </nav>
    </>
  );
}
