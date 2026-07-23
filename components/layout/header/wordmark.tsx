import clsx from "clsx";
import Link from "next/link";

const { SITE_NAME } = process.env;

// Barlow Condensed italic is the approved stand-in for the logo. To swap in a
// real asset later, replace the link contents here — layout stays untouched.
// Callers pass the size (the wordmark renders at 27/22/21px across contexts).
export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      prefetch={true}
      className={clsx(
        "font-tl-condensed font-extrabold uppercase italic leading-none text-tl-ink",
        className,
      )}
    >
      {SITE_NAME}
    </Link>
  );
}
