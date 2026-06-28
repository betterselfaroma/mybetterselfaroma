function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-taupe-200/45 ${className}`} />;
}

export default function MemberLoading() {
  return (
    <div className="space-y-8">
      <div>
        <SkeletonBlock className="h-9 w-64" />
        <SkeletonBlock className="mt-3 h-4 w-44" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-taupe-200/60 bg-cream-50 p-4 shadow-sm">
            <SkeletonBlock className="h-10 w-10 rounded-full" />
            <SkeletonBlock className="mt-4 h-4 w-24" />
            <SkeletonBlock className="mt-2 h-3 w-14" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.5rem] border border-taupe-200/60 bg-cream-50 p-6 shadow-card">
        <SkeletonBlock className="h-7 w-72" />
        <SkeletonBlock className="mt-4 h-4 w-full" />
        <SkeletonBlock className="mt-2 h-4 w-5/6" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
          <SkeletonBlock className="h-12" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-24" />
        ))}
      </div>
    </div>
  );
}
