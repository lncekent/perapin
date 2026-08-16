export function DashboardSkeleton() {
  return (
    <div className="animate-fade-up space-y-5">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-4 w-32 animate-pulse rounded-md bg-slate-100" />
      </div>

      {/* Hero card skeleton */}
      <div className="h-44 animate-pulse rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300" />

      {/* Stats row skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>

      {/* Action cards skeleton */}
      <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />

      {/* List skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
