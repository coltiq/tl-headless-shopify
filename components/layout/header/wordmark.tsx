import clsx from "clsx";
import Link from "next/link";

const { SITE_NAME } = process.env;

// The wordmark is inlined rather than an <img src="/logo.svg"> so it inherits
// `currentColor` — it is ink on white today and has to be able to invert on a
// dark ground without a second asset. `public/logo.svg` keeps the original for
// anything off-site (email, press, socials).
//
// **Height comes from the caller's font-size**, which is what all three call
// sites already set (27px desktop, 22px condensed, 21px mobile), so swapping
// the art in changed nothing about the header's sizing or its condensed-scroll
// transition. The multiplier is the one number to tune: the viewBox is 79.76
// tall but the capitals occupy only the top 63.69 of it, so 0.9em lands the cap
// height about where the Barlow Condensed text it replaced sat. Adjust here,
// never at the call sites.
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      prefetch={true}
      aria-label={SITE_NAME}
      className={clsx("inline-flex items-center text-tl-ink", className)}
    >
      <svg
        viewBox="0 0 625.16 79.76"
        fill="currentColor"
        aria-hidden
        focusable="false"
        className="h-[0.9em] w-auto"
      >
        <path d="M126.74.06H4.28L0,16H27L14.17,63.69H33.64L46.41,16h73.34l-3.17,11.81a.3.3,0,0,1-.07.1H62.67L53.09,63.69H72.54l5.31-19.78H96.74L117,79.66h20.34L117.24,44h4.61a12.86,12.86,0,0,0,12.42-9.53l4.88-18.24A12.85,12.85,0,0,0,126.74.06Z" />
        <path d="M206.49.05,193.75,47.63l-.08.09H159.29L172.06.05H152.6L141.25,42.41c-1.64,6.12-.89,11.65,2.11,15.57,2.83,3.68,7.5,5.71,13.15,5.71h33.41c11.35,0,21.07-7.79,24.18-19.38L226,.05Z" />
        <path d="M251,16.26a.18.18,0,0,1,.07-.08h44.77l4.28-16H254.8C243.44.21,233.73,8,230.62,19.58L224.5,42.41c-1.64,6.13-.89,11.66,2.12,15.57,2.82,3.68,7.49,5.71,13.14,5.71H283.1l4.28-16H242.56Z" />
        <polygon points="318.5 37.48 323.74 17.96 323.73 17.96 328.49 0.21 309.01 0.21 292.01 63.69 311.48 63.69 381.71 0.21 359.45 0.21 318.5 37.48" />
        <polygon points="463.95 47.72 421.88 47.72 434.66 0.05 415.19 0.05 398.14 63.69 454.82 63.69 463.95 47.72" />
        <polygon points="519.64 0.06 498.73 0 453.8 79.76 474.29 79.66 506.67 22.19 519.29 63.69 538.89 63.69 519.64 0.06" />
        <path d="M622.59,5c-1.74-2.27-5.14-5-11.51-5H556.17L538.89,63.89H596c9.9,0,18-6.51,20.74-16.59l.51-1.89c1.34-5,.86-9.44-1.24-12.73a22.89,22.89,0,0,0,7.92-12.23l.51-1.89C626.23,11.71,624.42,7.41,622.59,5ZM597.08,47.84a.18.18,0,0,1-.07.08H562.63l2.13-8H599.2Zm6.43-23.93-.09.09H569l.08,0L571.19,16h34.42Z" />
        <polygon points="333.38 43.91 353.52 79.66 373.86 79.66 353.87 44.01 333.38 43.91" />
      </svg>
    </Link>
  );
}
