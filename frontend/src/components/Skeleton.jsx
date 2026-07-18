export function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/40 bg-white/40 backdrop-blur-xl animate-pulse">
      <div className="h-36 bg-bronze/10" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-bronze/10 rounded w-2/3" />
        <div className="h-3 bg-bronze/10 rounded w-full" />
        <div className="h-3 bg-bronze/10 rounded w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
