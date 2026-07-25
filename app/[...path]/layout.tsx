import Grid from "components/grid";
import Footer from "components/layout/footer";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Boundary for the page's dynamic params — without it cacheComponents
          refuses to prerender the route shell (blocking-route error). The
          fallback is a real shell rather than null so a cold category page
          doesn't paint header-and-footer around nothing. */}
      <div className="w-full">
        <Suspense fallback={<CategorySkeleton />}>{children}</Suspense>
      </div>
      <Footer />
    </>
  );
}

function CategorySkeleton() {
  return (
    <section
      aria-hidden
      className="mx-auto flex max-w-(--breakpoint-2xl) flex-col gap-8 px-4 pb-4 md:flex-row"
    >
      <div className="order-last min-h-screen w-full md:order-none">
        <div className="mb-2 h-4 w-48 animate-pulse rounded-sm bg-neutral-100 dark:bg-neutral-800" />
        <div className="mb-6 h-8 w-64 animate-pulse rounded-sm bg-neutral-100 dark:bg-neutral-800" />
        <Grid className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array(12)
            .fill(0)
            .map((_, index) => (
              <Grid.Item
                key={index}
                className="animate-pulse bg-neutral-100 dark:bg-neutral-800"
              />
            ))}
        </Grid>
      </div>
      <div className="order-none flex-none md:order-last md:w-[125px]">
        <div className="h-40 w-full animate-pulse rounded-sm bg-neutral-100 dark:bg-neutral-800" />
      </div>
    </section>
  );
}
