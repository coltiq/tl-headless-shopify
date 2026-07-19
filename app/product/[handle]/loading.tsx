export default function Loading() {
  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4">
      <div className="flex flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12 lg:flex-row lg:gap-8 dark:border-neutral-800 dark:bg-black">
        <div className="h-full w-full basis-full lg:basis-4/6">
          <div className="relative aspect-square h-full max-h-[550px] w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </div>
        <div className="basis-full lg:basis-2/6">
          <div className="mb-6 h-10 w-3/4 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
          <div className="mb-6 h-8 w-1/3 animate-pulse rounded-full bg-neutral-100 dark:bg-neutral-800" />
          <div className="h-40 w-full animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-800" />
        </div>
      </div>
    </div>
  );
}
