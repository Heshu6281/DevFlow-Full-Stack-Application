import { Calendar, FolderKanban } from 'lucide-react';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import PriorityBadge from '@/components/common/PriorityBadge';
import { formatDate } from '@/utils/helpers';

export default function TaskCard({ task }) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4 shadow-soft transition-all duration-200 hover:border-text-tertiary hover:shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-text-primary">{task.title}</h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
            <FolderKanban className="h-3.5 w-3.5" />
            {task.project}
          </p>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between">
          <StatusBadge status={task.status} />
          <span className="text-xs font-medium text-text-secondary">{task.progress}%</span>
        </div>
        <ProgressBar value={task.progress} />
      </div>

      {task.dueDate && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
          <Calendar className="h-3.5 w-3.5" />
          Due {formatDate(task.dueDate)}
        </div>
      )}
    </article>
  );
}
