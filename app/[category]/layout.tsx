import Footer from "components/layout/footer";
import { Suspense } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Boundary for the page's dynamic params — without it cacheComponents
          refuses to prerender the route shell (blocking-route error). */}
      <div className="w-full">
        <Suspense fallback={null}>{children}</Suspense>
      </div>
      <Footer />
    </>
  );
}
