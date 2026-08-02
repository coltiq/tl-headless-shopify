// This file is required, not cosmetic. The route has no generateStaticParams,
// so under cacheComponents the slug is runtime data and every access to it must
// sit behind a Suspense boundary — without one the build fails outright with
// "Uncached data was accessed outside of <Suspense>". `loading.tsx` is the
// page-level way to declare that boundary.
//
// Shapes match the real page's hero and title so the swap doesn't jump.
export default function Loading() {
  return (
    <>
      <div className="aspect-[21/9] w-full animate-pulse bg-tl-fog" />
      <div className="page-width py-16 md:py-20">
        <div className="h-3 w-24 animate-pulse rounded-[2px] bg-tl-fog" />
        <div className="mt-8 h-3 w-40 animate-pulse rounded-[2px] bg-tl-fog" />
        <div className="mt-6 h-12 w-full max-w-lg animate-pulse rounded-[3px] bg-tl-fog" />
        <div className="mt-6 h-4 w-full max-w-md animate-pulse rounded-[2px] bg-tl-fog" />
      </div>
    </>
  );
}
