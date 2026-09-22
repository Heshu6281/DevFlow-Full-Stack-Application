const config = {
  High: 'bg-error/10 text-error ring-error/20',
  Medium: 'bg-warning/10 text-warning ring-warning/20',
  Low: 'bg-success/10 text-success ring-success/20',
};

export default function PriorityBadge({ priority }) {
  const cls = config[priority] || config.Low;
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {priority}
    </span>
  );
}
