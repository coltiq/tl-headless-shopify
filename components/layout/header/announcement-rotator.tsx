"use client";

import type { Announcement } from "lib/shopify/types";
import Link from "next/link";
import { useEffect, useState } from "react";

const ROTATE_MS = 7000;

// Cycles the announcement list in place. A single announcement never starts a
// timer, so the common case is effectively static.
//
// Pauses on hover and on keyboard focus: auto-advancing text that can't be
// stopped is a genuine problem for anyone reading slowly, and the band is small
// enough that a visible pause control would cost more than it gives. No
// aria-live — announcing marketing copy every seven seconds is hostile.
export function AnnouncementRotator({
  items,
  className,
}: {
  items: Announcement[];
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % items.length),
      ROTATE_MS,
    );
    return () => clearInterval(id);
  }, [items.length, paused]);

  // The list can shrink between renders (an admin edit lands mid-session), so
  // never index past the end.
  const item = items[index % items.length];
  if (!item) return null;

  return (
    <span
      className={className}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <AnnouncementContent item={item} />
    </span>
  );
}

function AnnouncementContent({ item }: { item: Announcement }) {
  const { label, url, linkText } = item;

  if (!url) return <>{label}</>;

  // No link text → the whole announcement is the click target, undecorated.
  if (!linkText) {
    return (
      <AnnouncementLink href={url} className="hover:underline">
        {label}
      </AnnouncementLink>
    );
  }

  // Otherwise only the matching run is clickable, and it's underlined so it
  // reads as a link inside a sentence. The reshape step has already guaranteed
  // the run exists in the label.
  const at = label.indexOf(linkText);
  return (
    <>
      {label.slice(0, at)}
      <AnnouncementLink href={url} className="underline underline-offset-2">
        {linkText}
      </AnnouncementLink>
      {label.slice(at + linkText.length)}
    </>
  );
}

// Admin can enter either an in-app path or a full URL to somewhere else;
// next/link is for the former only.
function AnnouncementLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className} rel="noopener noreferrer">
      {children}
    </a>
  );
}
