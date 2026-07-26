import type { Metadata } from "next";

import Footer from "components/layout/footer";
import { APP_STORE_URL, PLAY_STORE_URL } from "lib/constants";

export const metadata: Metadata = {
  title: "App",
  description: "Control your Truck Lab lighting from your phone.",
};

// TODO: scaffold. Still to fill in — the app's real name, screenshots of the
// control UI, and the feature list. Store links live in lib/constants.ts and
// each button collapses while its URL is empty, so no dead store link can ship.
//
// This is a static code route, so it permanently reserves `/app` the same way
// the L1 sections do (NEXT_MIDDLEWARE_RESERVED_SEGMENTS in lib/constants.ts).
// Deliberately a page rather than a direct store link: two platforms cannot
// share one header slot, and a shopper who has not bought lights yet needs to
// see what the app *is* before being asked to install anything. It is also the
// page that grows into the shopping-and-learning hub without changing URL.
export default function AppPage() {
  const hasStoreLinks = APP_STORE_URL || PLAY_STORE_URL;

  return (
    <>
      <div className="page-width py-20">
        <h1 className="max-w-2xl font-tl-sans text-5xl font-bold text-tl-ink">
          Control your lighting from your phone
        </h1>
        <p className="mt-5 max-w-xl font-tl-text text-lg text-tl-steel">
          Every Truck Lab lighting kit is a system, not a set of bulbs. The app
          is the control hub for all of it.
        </p>

        {hasStoreLinks ? (
          <div className="mt-9 flex flex-wrap gap-3.5">
            {/* TODO: swap for the official App Store / Google Play badge art. */}
            {APP_STORE_URL ? (
              <a
                href={APP_STORE_URL}
                rel="noopener noreferrer"
                className="flex h-12 items-center rounded-[3px] bg-tl-ink px-6 font-tl-sans text-xs font-semibold uppercase tracking-[0.1em] text-white"
              >
                Download on the App Store
              </a>
            ) : null}
            {PLAY_STORE_URL ? (
              <a
                href={PLAY_STORE_URL}
                rel="noopener noreferrer"
                className="flex h-12 items-center rounded-[3px] border border-tl-hairline px-6 font-tl-sans text-xs font-semibold uppercase tracking-[0.1em] text-tl-ink"
              >
                Get it on Google Play
              </a>
            ) : null}
          </div>
        ) : null}

        {/* TODO: screenshots of the control UI, then the feature list. */}
      </div>
      <Footer />
    </>
  );
}
