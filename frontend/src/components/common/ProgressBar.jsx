export default function ProgressBar({ value, className = '', showLabel = false }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className={`h-2 w-full overflow-hidden rounded-full bg-surface-2 ${className}`}>
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="mt-1 block text-right text-xs font-medium text-text-tertiary">
          {clamped}%
        </span>
      )}
    </div>
  );
}
