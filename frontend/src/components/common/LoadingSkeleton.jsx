export function SkeletonBlock({ className = '', style }) {
  return <div className={`skeleton rounded ${className}`} style={style} />;
}

export default function LoadingSkeleton({ variant = 'dashboard' }) {
  if (variant === 'stats') return <StatsSkeleton />;
  if (variant === 'project') return <ProjectSkeleton />;
  if (variant === 'task') return <TaskSkeleton />;
  if (variant === 'chart') return <ChartSkeleton />;
  return <DashboardSkeleton />;
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-10 w-10 rounded-xl" />
            <SkeletonBlock className="h-5 w-14 rounded-full" />
          </div>
          <SkeletonBlock className="mt-4 h-3 w-20" />
          <SkeletonBlock className="mt-2 h-7 w-16" />
          <SkeletonBlock className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export function ProjectSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <div className="flex items-start justify-between">
            <SkeletonBlock className="h-5 w-32" />
            <SkeletonBlock className="h-6 w-20 rounded-full" />
          </div>
          <SkeletonBlock className="mt-3 h-3 w-full" />
          <SkeletonBlock className="mt-2 h-3 w-2/3" />
          <SkeletonBlock className="mt-4 h-2 w-full rounded-full" />
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <SkeletonBlock key={j} className="h-6 w-16 rounded-md" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-surface p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <SkeletonBlock className="h-4 w-48" />
            <SkeletonBlock className="h-6 w-16 rounded-md" />
          </div>
          <div className="mt-3 flex gap-2">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-3 w-16" />
          </div>
          <SkeletonBlock className="mt-3 h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <SkeletonBlock className="h-5 w-40" />
      <div className="mt-6 flex items-end gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1">
            <SkeletonBlock className="w-full" style={{ height: `${60 + ((i * 13) % 80)}px` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <StatsSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-28" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-4 shadow-soft">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
