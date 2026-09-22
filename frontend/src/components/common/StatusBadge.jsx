import { CheckCircle2, Circle, Clock, PauseCircle } from 'lucide-react';

const config = {
  'In Progress': { cls: 'bg-info/10 text-info', icon: Clock },
  Completed: { cls: 'bg-success/10 text-success', icon: CheckCircle2 },
  'To Do': { cls: 'bg-text-tertiary/10 text-text-secondary', icon: Circle },
  Blocked: { cls: 'bg-error/10 text-error', icon: PauseCircle },
};

export default function StatusBadge({ status }) {
  const cfg = config[status] || config['To Do'];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.cls}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {status}
    </span>
  );
}
