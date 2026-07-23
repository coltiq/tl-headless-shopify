"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

// Condense once the page has scrolled past the resting header, hide on
// continued downward travel, reveal on any upward scroll.
const CONDENSE_AT = 96;
// Ignore scroll jitter smaller than this before flipping visibility.
const HIDE_DELTA = 6;

export function HeaderScroll({ children }: { children: ReactNode }) {
  const [condensed, setCondensed] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY.current;

        setCondensed(y > CONDENSE_AT);

        if (y <= CONDENSE_AT) {
          setHidden(false);
        } else if (delta > HIDE_DELTA) {
          setHidden(true);
        } else if (delta < -HIDE_DELTA) {
          setHidden(false);
        }

        lastY.current = y;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-site-header
      data-condensed={condensed ? "" : undefined}
      data-hidden={hidden ? "" : undefined}
      className="group fixed inset-x-0 top-0 z-40 bg-white text-tl-ink data-[hidden]:-translate-y-full motion-safe:transition-transform motion-safe:duration-300"
    >
      {children}
    </header>
  );
}
