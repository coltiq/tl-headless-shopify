import clsx from "clsx";

// logo.svg is solid white (see public/logo.svg). On a background that
// follows the site's light/dark theme, `adaptive` (default) flips it to
// black in light mode via `invert` and cancels that back to white in dark
// mode via `dark:invert-0`. On a background that's permanently dark (the
// header), pass `adaptive={false}` to skip the invert and show the white
// logo as-is.
export default function LogoSquare({
  alt,
  size,
  adaptive = true,
}: {
  alt: string;
  size?: "sm" | undefined;
  adaptive?: boolean;
}) {
  return (
    <img
      src="/logo.svg"
      alt={alt}
      width={625}
      height={80}
      className={clsx("w-auto", adaptive && "invert dark:invert-0", {
        "h-4": !size,
        "h-3": size === "sm",
      })}
    />
  );
}
