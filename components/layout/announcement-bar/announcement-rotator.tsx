"use client";

import clsx from "clsx";
import { Announcement } from "lib/shopify/types";
import { useEffect, useState } from "react";

const ROTATION_INTERVAL_MS = 5000;

export function AnnouncementRotator({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const interval = setInterval(
      () => setActiveIndex((index) => (index + 1) % announcements.length),
      ROTATION_INTERVAL_MS,
    );

    return () => clearInterval(interval);
  }, [announcements.length]);

  return (
    <div className="announcement-rotator grid w-full">
      {announcements.map((announcement, index) => {
        const isActive = index === activeIndex;
        // Slides stack in the same grid cell but stay in normal flow, so the
        // text's py-2 sets the bar's height.
        const itemClasses = clsx(
          "announcement-slide col-start-1 row-start-1 flex min-w-0 items-center justify-start py-2 transition-opacity duration-700 motion-reduce:transition-none",
          isActive ? "opacity-100" : "pointer-events-none opacity-0",
        );

        const { text, url, labelText } = announcement;
        // When labelText names a substring of the text, only that part is the
        // link (always underlined); otherwise the whole text links, without
        // any underline.
        const labelStart = url && labelText ? text.indexOf(labelText) : -1;

        if (url && labelStart !== -1 && labelText) {
          return (
            <span
              key={`${text}-${index}`}
              aria-hidden={!isActive}
              className={itemClasses}
            >
              <span className="max-w-full truncate">
                {text.slice(0, labelStart)}
                <a
                  href={url}
                  tabIndex={isActive ? 0 : -1}
                  className="underline underline-offset-2"
                >
                  {labelText}
                </a>
                {text.slice(labelStart + labelText.length)}
              </span>
            </span>
          );
        }

        return url ? (
          <a
            key={`${text}-${index}`}
            href={url}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={itemClasses}
          >
            <span className="max-w-full truncate">{text}</span>
          </a>
        ) : (
          <span
            key={`${text}-${index}`}
            aria-hidden={!isActive}
            className={itemClasses}
          >
            <span className="max-w-full truncate">{text}</span>
          </span>
        );
      })}
    </div>
  );
}
