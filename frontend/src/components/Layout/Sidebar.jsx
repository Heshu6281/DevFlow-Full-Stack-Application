import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Activity,
  BarChart3,
  Settings,
  Bot,
  Code2,
  ArrowUpRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';

import api from '@/services/api';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: ListChecks },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ open, onNavigate }) {
  const [pulse, setPulse] = useState({
    progress: 0,
    completedTasks: 0,
  });

  const [pulseLoading, setPulseLoading] = useState(true);

  useEffect(() => {
    const loadPulse = async () => {
      try {
        setPulseLoading(true);

        const response = await api.request('/analytics');

        if (!response?.success) {
          throw new Error(
            response?.message || 'Unable to load analytics.'
          );
        }

       const data = response?.data || {};
const overview = data.overview || {};

const progress = Number(
  overview.averageTaskProgress || 0
);

const completedTasks = Number(
  overview.completedTasks || 0
);

        setPulse({
          progress: Math.max(0, Math.min(100, Math.round(progress))),
          completedTasks: Math.max(
            0,
            Math.round(completedTasks)
          ),
        });
      } catch (error) {
        console.error(
          'Workspace Pulse analytics error:',
          error
        );

        setPulse({
          progress: 0,
          completedTasks: 0,
        });
      } finally {
        setPulseLoading(false);
      }
    };

    loadPulse();
  }, []);

  const progress = pulse.progress;
  const completedTasks = pulse.completedTasks;

  return (
    <aside
      className={`${
        open ? 'xl:flex' : 'xl:hidden'
      } hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface`}
    >
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
          <Code2 className="h-5 w-5" />
        </div>

        <span className="text-lg font-bold tracking-tight text-text-primary">
          DevFlow
        </span>
      </div>

      <nav
        className="flex-1 space-y-1 px-3 py-4"
        aria-label="Main navigation"
      >
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-tertiary">
          Workspace
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent-soft text-accent'
                  : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary',
              ].join(' ')
            }
          >
            <item.icon
              className="h-[18px] w-[18px] shrink-0"
              aria-hidden="true"
            />

            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="relative overflow-hidden rounded-2xl border border-accent/15 bg-gradient-to-br from-accent-soft via-surface to-surface-2 p-4 shadow-soft">
          <div className="absolute -right-5 -top-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl" />

          <div className="relative">
            <div className="flex items-start justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
                <Zap className="h-4 w-4" />
              </div>

              <span className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">
                {pulseLoading
                  ? 'Loading'
                  : progress >= 70
                    ? 'On track'
                    : 'In progress'}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold text-text-primary">
              Workspace pulse
            </p>

            <p className="mt-0.5 text-xs text-text-secondary">
              Your productivity this week.
            </p>

            <div className="mt-3 flex items-center justify-between text-[11px]">
              <span className="text-text-tertiary">
                Weekly progress
              </span>

              <span className="font-semibold text-text-primary">
                {pulseLoading ? '—' : `${progress}%`}
              </span>
            </div>

            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-accent transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] text-text-tertiary">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" />

                {pulseLoading
                  ? '— tasks done'
                  : `${completedTasks} ${
                      completedTasks === 1
                        ? 'task'
                        : 'tasks'
                    } done`}
              </span>

              <NavLink
                to="/analytics"
                className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-accent hover:underline"
              >
                Insights
                <ArrowUpRight className="h-3 w-3" />
              </NavLink>
            </div>
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-text-tertiary">
          DevFlow v1.0 · Built for developers
        </p>
      </div>
    </aside>
  );
}