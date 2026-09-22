import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ icon: Icon, title, value, supportingInfo, trend, trendDirection = 'up', accentClass = 'bg-accent-soft text-accent' }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-center justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClass}`}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trendDirection === 'up' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
            }`}
          >
            {trendDirection === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-text-secondary">{title}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight text-text-primary">{value}</p>
      {supportingInfo && <p className="mt-1.5 text-xs text-text-tertiary">{supportingInfo}</p>}
    </div>
  );
}
