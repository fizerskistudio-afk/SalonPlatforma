export default function AdminLoading() {
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div
        className="animate-pulse space-y-6"
        aria-label="Učitavanje administracije"
        aria-live="polite"
      >
        <div className="h-48 rounded-[2rem] border border-white/[0.06] bg-white/[0.035]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 rounded-2xl border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="h-80 rounded-[2rem] border border-white/[0.06] bg-white/[0.03]" />
          <div className="h-80 rounded-[2rem] border border-white/[0.06] bg-white/[0.03]" />
        </div>
      </div>
    </div>
  );
}
