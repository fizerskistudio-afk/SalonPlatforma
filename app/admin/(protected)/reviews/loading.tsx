export default function AdminReviewsLoading() {
  return (
    <div
      className="space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      role="status"
      aria-live="polite"
    >
      <div className="h-40 animate-pulse rounded-[2rem] border border-white/[0.07] bg-white/[0.04] motion-reduce:animate-none" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from(
          {
            length: 4,
          }
        ).map(
          (
            _,
            index
          ) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-white/[0.07] bg-white/[0.035] motion-reduce:animate-none"
            />
          )
        )}
      </div>

      <div className="h-72 animate-pulse rounded-[2rem] border border-white/[0.07] bg-white/[0.035] motion-reduce:animate-none" />

      <span className="sr-only">
        Učitavanje recenzija…
      </span>
    </div>
  );
}
