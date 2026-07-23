import { Menu } from "lib/shopify/types";
import Link from "next/link";
import NavDropdown from "./nav-dropdown";

export default function NavRow({ menu }: { menu: Menu[] }) {
  if (!menu.length) return null;

  return (
    <nav
      aria-label="Primary"
      className="hidden h-10 items-center bg-neutral-900 md:flex"
    >
      <div className="page-width flex w-full justify-center">
        <ul className="flex items-center gap-x-8 text-sm">
          {menu.map((item) =>
            item.items?.length ? (
              <NavDropdown key={item.title} item={item} />
            ) : (
              <li key={item.title}>
                <Link
                  href={item.path}
                  prefetch={true}
                  className="text-neutral-300 underline-offset-4 hover:text-white hover:underline"
                >
                  {item.title}
                </Link>
              </li>
            ),
          )}
        </ul>
      </div>
    </nav>
  );
}
