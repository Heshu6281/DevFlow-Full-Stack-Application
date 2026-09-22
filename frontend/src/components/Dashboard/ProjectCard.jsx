import { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Calendar, Pencil, Trash2 } from 'lucide-react';
import ProgressBar from '@/components/common/ProgressBar';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDate } from '@/utils/helpers';

export default function ProjectCard({ project, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const closeMenu = (event) => {
      if (!menuRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, [menuOpen]);

  return (
    <article className="group rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">{project.name}</h3>
          <p className="mt-1 text-sm text-text-secondary line-clamp-2">{project.description}</p>
        </div>
        <div className="relative" ref={menuRef}>
          <button type="button" aria-label={`Options for ${project.name}`} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="rounded-lg p-1 text-text-tertiary opacity-0 transition-opacity hover:bg-surface-2 group-hover:opacity-100 focus:opacity-100">
          <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-border bg-surface p-1 shadow-card-hover">
              <button type="button" onClick={() => { setMenuOpen(false); onEdit?.(project); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary">
                <Pencil className="h-4 w-4" /> Edit project
              </button>
              <button type="button" onClick={() => { setMenuOpen(false); onDelete?.(project); }} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-error hover:bg-error/10">
                <Trash2 className="h-4 w-4" /> Delete project
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium text-text-secondary">Progress</span>
          <span className="text-xs font-semibold text-text-primary">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.technologies.map((tech) => (
          <span
            key={tech}
            className="rounded-md bg-surface-2 px-2 py-1 font-mono text-xs text-text-secondary"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <StatusBadge status={project.status} />
        <div className="flex items-center gap-3 text-xs text-text-tertiary">
          <span>{project.taskCount} tasks</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(project.lastUpdated)}
          </span>
        </div>
      </div>
    </article>
  );
}
