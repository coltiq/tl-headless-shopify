import Link from "next/link";
import { IconMountain, IconPhone } from "./icons";

// The two links and the locale slot are hardcoded on purpose — they are not part
// of the CMS payload, so editing the announcement metafield can never remove
// them. Callers render nothing when the metafield is null (band collapses).
export function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="hidden h-[38px] bg-tl-indigo text-tl-ann-text md:block md:group-data-[condensed]:hidden">
      <div className="page-width flex h-full items-center">
        <span className="text-xs">{message}</span>
        <span className="ml-auto flex items-center gap-[26px]">
          <Link
            href="/custom-builds"
            className="flex items-center gap-[9px] font-tl-sans text-[11px] font-bold uppercase tracking-[0.12em] text-white"
          >
            <IconMountain className="h-[15px] w-[15px]" />
            Custom builds
          </Link>
          <Link
            href="/get-the-app"
            className="flex items-center gap-[9px] font-tl-sans text-[11px] font-bold uppercase tracking-[0.12em] text-white"
          >
            <IconPhone className="h-[15px] w-3" />
            Get the app
          </Link>
          <span aria-hidden className="h-4 w-px bg-white/25" />
          <span className="font-tl-mono text-[11px] tracking-[0.09em] text-tl-ann-dim">
            USD · EN
          </span>
        </span>
      </div>
    </div>
  );
}

export function MobileAnnouncementBar({ message }: { message: string }) {
  return (
    <div className="flex h-[34px] items-center justify-center bg-tl-indigo px-3.5 group-data-[condensed]:hidden md:hidden">
      {/* Short form: single line, truncated — never wraps. */}
      <span className="truncate text-[11px] text-tl-ann-text">{message}</span>
    </div>
  );
}
