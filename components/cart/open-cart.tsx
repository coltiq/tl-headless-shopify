import clsx from "clsx";

export default function OpenCart({
  className,
  quantity,
}: {
  className?: string;
  quantity?: number;
}) {
  return (
    <div className="relative grid h-[46px] w-[46px] place-items-center rounded-[3px] text-tl-ink group-data-[condensed]:h-11 group-data-[condensed]:w-11 max-md:h-11 max-md:w-11">
      <svg
        className={clsx("h-5 w-5", className)}
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        aria-hidden="true"
      >
        <path d="M3 5h3l2 9h8l2-6H7" />
        <circle cx="9" cy="17" r="1.2" />
        <circle cx="15" cy="17" r="1.2" />
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
