import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative grid h-[46px] w-[46px] place-items-center rounded-[3px] text-white group-data-[condensed]:h-11 group-data-[condensed]:w-11 max-md:h-11 max-md:w-11">
      <svg
        className={clsx("h-5 w-5", className)}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        {/* Shifted up 1.4 from where it was drawn. The wheels hung at cy=17
            with nothing above y=5, putting this glyph's centre at 11.6 while
            IconHelp sits at 10.0 and IconAccount at 10.4 — so the cart read as
            ~1.4px low next to them even though all three boxes are identical
            46px grids. Corrected here rather than with a transform on the
            element, so every consumer of the icon gets it. */}
        <path d="M3 3.6h3l2 9h8l2-6H7" />
        <circle cx="9" cy="15.6" r="1.2" />
        <circle cx="15" cy="15.6" r="1.2" />
      </svg>
      {/* Screen readers announce count changes; the visual bubble is decorative. */}
      <span aria-live="polite" className="sr-only">
        {quantity ? `Cart, ${quantity} items` : "Cart, empty"}
      </span>
      {quantity ? (
        <span
          aria-hidden
          className="absolute right-0.5 top-[3px] grid h-[17px] w-[17px] place-items-center rounded-full bg-tl-indigo font-tl-mono text-[9.5px] text-white"
        >
          {quantity}
        </span>
      ) : null}
    </div>
  );
}
