import * as OutlineIcons from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

// Resolves a metaobject's `icon_text` to a Heroicons component by its **exact
// export name** — `PhoneIcon`, `WrenchScrewdriverIcon`, `TruckIcon`. Authors
// copy the name straight from heroicons.com rather than looking it up in a
// curated key list, so adding an icon is admin-only and needs no deploy.
//
// The whole 24px outline set is therefore reachable, and the namespace import
// defeats tree-shaking by design. That is affordable **only because every
// caller is a server component** — `announcement-bar.tsx` and
// `mobile-links.tsx` carry no `"use client"`, so the browser receives rendered
// SVG markup and none of this reaches the client bundle. **Importing this from
// a client component would ship ~300 icons to every visitor.**
//
// Unknown names log and resolve to null rather than throwing: one bad admin
// entry must never blank the band.
const icons = OutlineIcons as unknown as Record<
  string,
  IconComponent | undefined
>;

export function resolveIcon(name: string | null): IconComponent | null {
  if (!name) return null;

  // hasOwnProperty, not a bare index: an `icon_text` of `toString` would
  // otherwise resolve to a function and be rendered as a component.
  const Icon = Object.prototype.hasOwnProperty.call(icons, name)
    ? icons[name]
    : undefined;

  if (!Icon) {
    console.error(
      `Unknown icon_text "${name}" — expected an exact Heroicons 24px outline export name (e.g. PhoneIcon). See heroicons.com.`,
    );
    return null;
  }

  return Icon;
}
