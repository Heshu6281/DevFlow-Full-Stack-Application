export default function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-2 text-text-tertiary">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base font-semibold text-text-primary">{title}</h3>
      {message && (
        <p className="mt-1.5 max-w-sm text-sm text-text-secondary">{message}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
