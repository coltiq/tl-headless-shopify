import clsx from "clsx";

// A reserved space for a photograph that does not exist yet, with a note
// saying what to shoot. Deliberately styled rather than left blank: an empty
// div reads as a broken page, and a grey box reads as an oversight. This reads
// as a decision.
//
// Delete the component call and drop the <Image> in when the photo arrives —
// the aspect ratio is set here so the layout does not move when it does.
export function ImageSlot({
  ratio,
  brief,
  tone = "light",
  className,
}: {
  /** Tailwind aspect class, e.g. "aspect-[21/9]". Set it so swapping in the
   *  real photograph causes no layout shift. */
  ratio: string;
  /** What to shoot. Written for whoever is holding the camera. */
  brief: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col justify-end rounded-[3px] border border-dashed p-5",
        ratio,
        tone === "dark"
          ? "border-white/25 bg-white/[0.04]"
          : "border-tl-hairline bg-tl-fog",
        className,
      )}
    >
      <span
        className={clsx(
          "font-tl-mono text-[10px] uppercase tracking-[0.14em]",
          tone === "dark" ? "text-white/50" : "text-tl-mute-white",
        )}
      >
        Photo
      </span>
      <p
        className={clsx(
          "mt-1.5 max-w-[46ch] font-tl-text text-sm leading-snug",
          tone === "dark" ? "text-white/70" : "text-tl-steel",
        )}
      >
        {brief}
      </p>
    </div>
  );
}
