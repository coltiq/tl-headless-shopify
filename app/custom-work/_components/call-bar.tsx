import Link from "next/link";

import { SHOP_PHONE_DISPLAY, SHOP_PHONE_HREF } from "lib/constants";

// Mobile-only sticky bar: on the one page whose job is conversion, the action
// should never be more than a thumb away — bottom of the viewport, full width,
// which is where a tap target belongs on a phone.
//
// The quote leads and the call follows, matching the page. Whoever answers the
// phone takes a message rather than a price, so the form is the faster route to
// the same two people; the number still rides along for anyone who'd rather
// talk.
//
// Desktop does not get one: the number is in the announcement band on every
// page up there, and nobody taps a number on a laptop.
//
// The page owes this component `pb-28 md:pb-0`, or the bar covers its own
// closing CTA.
export function CallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-tl-shell-line bg-tl-shell px-3 py-3 md:hidden">
      <Link
        href="/quote"
        className="flex h-12 flex-1 items-center justify-center rounded-[3px] bg-tl-indigo font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-white"
      >
        Start a quote
      </Link>
      {SHOP_PHONE_DISPLAY ? (
        <a
          href={SHOP_PHONE_HREF}
          className="flex h-12 flex-1 items-center justify-center rounded-[3px] border border-white/25 font-tl-sans text-xs font-bold uppercase tracking-[0.1em] text-white"
        >
          Call the shop
        </a>
      ) : null}
    </div>
  );
}
