import Link from "next/link";
import { IconMountain, IconPhone } from "./icons";

// Band is visually 34px; each link bleeds 5px above and below via negative
// margin so the touch target hits 44px. The divider stops a centre mis-tap
// landing on the wrong link.
// Grid keeps the divider at the exact centre; each link is centred in its half.
export function MobileLinksBand() {
  return (
    <div className="grid h-[34px] grid-cols-[1fr_1px_1fr] bg-tl-indigo group-data-[condensed]:hidden md:hidden">
      <span className="flex items-stretch justify-center">
        <Link
          href="/custom-builds"
          className="-my-[5px] flex w-full max-w-[190px] items-center justify-center gap-[7px] px-3 py-[5px] font-tl-sans text-[11px] font-bold uppercase tracking-[0.1em] text-white"
        >
          <IconMountain className="h-3 w-3" />
          Custom builds
        </Link>
      </span>
      <span aria-hidden className="my-2 bg-white/20" />
      <span className="flex items-stretch justify-center">
        <Link
          href="/get-the-app"
          className="-my-[5px] flex w-full max-w-[190px] items-center justify-center gap-[7px] px-3 py-[5px] font-tl-sans text-[11px] font-bold uppercase tracking-[0.1em] text-white"
        >
          <IconPhone className="h-3 w-2.5" />
          Get the app
        </Link>
      </span>
    </div>
  );
}
