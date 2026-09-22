import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  ListChecks,
  Clock,
  Gauge,
  ArrowRight,
  SearchX,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import StatCard from '@/components/Dashboard/StatCard';
import ProductivityChart from '@/components/Dashboard/ProductivityChart';
import ProjectCard from '@/components/Dashboard/ProjectCard';
import TaskCard from '@/components/Dashboard/TaskCard';
import ActivityTimeline from '@/components/Dashboard/ActivityTimeline';
import SearchBar from '@/components/common/SearchBar';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton';

import { useDebounce } from '@/hooks/useDebounce';
import { getGreeting } from '@/utils/helpers';
import { api } from '@/services/api';

const normalizeProject = (project) => {
  let technologies = project.technologies || [];

  if (typeof technologies === 'string') {
    try {
      technologies = JSON.parse(technologies);
    } catch {
      technologies = technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  if (!Array.isArray(technologies)) {
    technologies = [];
  }

  return {
    ...project,
    id: project.id,
    name: project.name || '',
    description: project.description || '',
    status: project.status || 'To Do',
    progress: Number(project.progress ?? 0),
    technologies,
    taskCount: Number(
      project.taskCount ??
        project.task_count ??
        project.tasks_count ??
        0
    ),
    lastUpdated:
      project.updated_at ||
      project.updatedAt ||
      project.created_at ||
      project.createdAt ||
      new Date().toISOString(),
  };
};

const extractProjects = (response) => {
  const data = response?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.projects)) {
    return data.projects;
  }

  if (Array.isArray(response?.projects)) {
    return response.projects;
  }

  return [];
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [dashboardData, setDashboardData] = useState({
    totalProjects: 0,
    totalTasks: 0,
    averageProgress: 0,
    taskStats: [],
    recentTasks: [],
    weeklyProductivity: [],
  });

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const load = async () => {
    setLoading(true);
    setError(false);

    try {
      // Load dashboard summary + real projects
      // directly from the backend.
      const [dashboardResult, projectsResult] =
        await Promise.all([
          api.request('/dashboard'),
          api.request('/projects'),
        ]);

      if (
        !dashboardResult.success ||
        !dashboardResult.data
      ) {
        throw new Error(
          dashboardResult.message ||
            'Unable to load dashboard data.'
        );
      }

      if (!projectsResult.success) {
        throw new Error(
          projectsResult.message ||
            'Unable to load projects.'
        );
      }

      const rawProjects =
        extractProjects(projectsResult);

      setDashboardData({
        totalProjects:
          dashboardResult.data.totalProjects ?? 0,

        totalTasks:
          dashboardResult.data.totalTasks ?? 0,

        averageProgress:
          dashboardResult.data.averageProgress ?? 0,

        taskStats: Array.isArray(
          dashboardResult.data.taskStats
        )
          ? dashboardResult.data.taskStats
          : [],

        recentTasks: Array.isArray(
          dashboardResult.data.recentTasks
        )
          ? dashboardResult.data.recentTasks
          : [],

        weeklyProductivity: Array.isArray(
          dashboardResult.data.weeklyProductivity
        )
          ? dashboardResult.data.weeklyProductivity
          : [],
      });

      setProjects(
        rawProjects.map(normalizeProject)
      );
    } catch (err) {
      console.error('Dashboard API error:', err);

      setProjects([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // --------------------------------------------------
  // PROJECT SEARCH
  // --------------------------------------------------

  const filteredProjects = useMemo(() => {
    const q = debouncedSearch
      .toLowerCase()
      .trim();

    if (!q) {
      return projects;
    }

    return projects.filter((project) => {
      const technologies = Array.isArray(
        project.technologies
      )
        ? project.technologies
        : [];

      return [
        project.name,
        project.description,
        project.status,
        ...technologies,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [debouncedSearch, projects]);

  // --------------------------------------------------
  // RECENT TASKS FROM BACKEND
  // --------------------------------------------------

  const dashboardTasks = useMemo(() => {
    return Array.isArray(
      dashboardData.recentTasks
    )
      ? dashboardData.recentTasks
      : [];
  }, [dashboardData.recentTasks]);

  const filteredTasks = useMemo(() => {
    const q = debouncedSearch
      .toLowerCase()
      .trim();

    if (!q) {
      return dashboardTasks;
    }

    return dashboardTasks.filter((task) => {
      return [
        task.title,
        task.project,
        task.project_name,
        task.priority,
        task.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  }, [debouncedSearch, dashboardTasks]);

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return <DashboardSkeleton />;
  }

  // --------------------------------------------------
  // ERROR
  // --------------------------------------------------

  if (error) {
    return (
      <ErrorState
        message="We couldn't load your dashboard data."
        onRetry={load}
      />
    );
  }

  const hasQuery =
    debouncedSearch.trim().length > 0;

  const totalProjects =
    dashboardData.totalProjects;

  const totalTasks =
    dashboardData.totalTasks;

  const averageProgress = Math.round(
    Number(
      dashboardData.averageProgress
    ) || 0
  );

  // --------------------------------------------------
  // IN-PROGRESS TASK COUNT
  // --------------------------------------------------

  const inProgressTasks =
    dashboardData.taskStats.reduce(
      (total, stat) => {
        const status = String(
          stat.status ||
            stat.name ||
            ''
        ).toLowerCase();

        if (
          status === 'in progress' ||
          status === 'in-progress' ||
          status === 'in_progress'
        ) {
          return (
            total +
            Number(
              stat.count ||
                stat.total ||
                0
            )
          );
        }

        return total;
      },
      0
    );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          {getGreeting()}, {user?.name || 'Developer'}{' '}
          <span className="inline-block animate-fade-in">
            👋
          </span>
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Here's what's happening with your
          development work today.
        </p>
      </div>

      {/* Search */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects, tasks..."
          className="sm:max-w-sm"
        />

        {hasQuery && (
          <p className="text-xs text-text-tertiary">
            {filteredProjects.length +
              filteredTasks.length}{' '}
            results for “{debouncedSearch}”
          </p>
        )}
      </div>

      {!hasQuery && (
        <>
          {/* Statistics */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              icon={FolderKanban}
              title="Total Projects"
              value={String(totalProjects)}
              supportingInfo="From your projects"
              accentClass="bg-accent-soft text-accent"
            />

            <StatCard
              icon={ListChecks}
              title="Total Tasks"
              value={String(totalTasks)}
              supportingInfo="Across all projects"
              accentClass="bg-success/10 text-success"
            />

            <StatCard
              icon={Clock}
              title="In Progress"
              value={String(inProgressTasks)}
              supportingInfo="Currently active"
              accentClass="bg-info/10 text-info"
            />

            <StatCard
              icon={Gauge}
              title="Productivity"
              value={`${averageProgress}%`}
              supportingInfo="Average project progress"
              accentClass="bg-warning/10 text-warning"
            />

          </div>

          {/* Chart + Activity */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

            <div className="lg:col-span-2">
              <ProductivityChart
                data={
                  dashboardData.weeklyProductivity
                }
              />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="text-base font-semibold text-text-primary">
                  Recent Activity
                </h3>

                <Link
                  to="/activity"
                  className="flex items-center gap-1 text-xs font-medium text-accent hover:underline"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </Link>

              </div>

              <ActivityTimeline limit={4} />

            </div>

          </div>
        </>
      )}

      {/* Projects */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-lg font-semibold text-text-primary">
            Projects{' '}

            {hasQuery && (
              <span className="text-sm font-normal text-text-tertiary">
                ({filteredProjects.length})
              </span>
            )}
          </h2>

          <Link
            to="/projects"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

        </div>

        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={
              hasQuery
                ? 'No projects found'
                : 'No projects yet'
            }
            message={
              hasQuery
                ? 'No projects match your search. Try a different keyword.'
                : 'Create your first project to get started.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {(hasQuery
              ? filteredProjects
              : filteredProjects.slice(0, 4)
            ).map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}

          </div>
        )}

      </section>

      {/* Recent Tasks */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <h2 className="text-lg font-semibold text-text-primary">
            Recent Tasks{' '}

            {hasQuery && (
              <span className="text-sm font-normal text-text-tertiary">
                ({filteredTasks.length})
              </span>
            )}
          </h2>

          <Link
            to="/tasks"
            className="flex items-center gap-1 text-sm font-medium text-accent hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

        </div>

        {filteredTasks.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={
              hasQuery
                ? 'No tasks found'
                : 'No recent tasks'
            }
            message={
              hasQuery
                ? 'No tasks match your search. Try a different keyword.'
                : 'Create a task to see it here.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            {(hasQuery
              ? filteredTasks
              : filteredTasks.slice(0, 4)
            ).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}

          </div>
        )}

      </section>

    </div>
  );
}