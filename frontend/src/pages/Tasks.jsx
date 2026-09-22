import { useEffect, useMemo, useState } from 'react';
import { Plus, SearchX, ListChecks } from 'lucide-react';

import TaskCard from '@/components/Dashboard/TaskCard';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Modal from '@/components/common/Modal';
import { TaskSkeleton } from '@/components/common/LoadingSkeleton';

import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/services/api';

const statusOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Blocked', label: 'Blocked' },
];

const priorityOptions = [
  { value: 'All', label: 'All Priorities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

const emptyForm = {
  title: '',
  project: '',
  priority: 'Medium',
  status: 'To Do',
  dueDate: '',
};

export default function Tasks() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const [submitting, setSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  /*
   * Convert backend task data into the structure
   * expected by TaskCard.
   */
  const normalizeTask = (task) => {
    return {
      ...task,

      id: task.id,

      title: task.title || '',

      project:
        task.project ||
        task.project_name ||
        task.projectName ||
        '',

      project_id:
        task.project_id ??
        task.projectId ??
        null,

      priority: task.priority || 'Medium',

      status: task.status || 'To Do',

      progress: Number(task.progress ?? 0),

      dueDate:
        task.dueDate ||
        task.due_date ||
        undefined,
    };
  };

  /*
   * Load projects from the backend.
   *
   * Projects are needed because creating a task
   * requires the project ID.
   */
  const loadProjects = async () => {
    try {
      const result = await api.request('/projects');

      if (!result.success) {
        throw new Error(
          result.message || 'Unable to load projects.'
        );
      }

      const rawProjects = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.projects)
          ? result.data.projects
          : [];

      setProjects(rawProjects);
    } catch (err) {
      console.error('Projects API error:', err);
    }
  };

  /*
   * GET /api/tasks
   */
  const load = async () => {
    setLoading(true);
    setError(false);

    try {
      const [tasksResult, projectsResult] =
        await Promise.all([
          api.request('/tasks'),
          api.request('/projects'),
        ]);

      if (!tasksResult.success) {
        throw new Error(
          tasksResult.message ||
            'Unable to load tasks.'
        );
      }

      const rawTasks = Array.isArray(tasksResult.data)
        ? tasksResult.data
        : Array.isArray(tasksResult.data?.tasks)
          ? tasksResult.data.tasks
          : [];

      const rawProjects =
        projectsResult.success &&
        Array.isArray(projectsResult.data)
          ? projectsResult.data
          : projectsResult.success &&
              Array.isArray(projectsResult.data?.projects)
            ? projectsResult.data.projects
            : [];

      setTasks(rawTasks.map(normalizeTask));
      setProjects(rawProjects);
    } catch (err) {
      console.error('Tasks API error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /*
   * Search + status + priority filtering.
   */
  const filtered = useMemo(() => {
    const q = debouncedSearch
      .toLowerCase()
      .trim();

    return tasks.filter((task) => {
      const matchesQ =
        !q ||
        [
          task.title,
          task.project,
          task.priority,
          task.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);

      const matchesStatus =
        status === 'All' ||
        task.status === status;

      const matchesPriority =
        priority === 'All' ||
        task.priority === priority;

      return (
        matchesQ &&
        matchesStatus &&
        matchesPriority
      );
    });
  }, [
    tasks,
    debouncedSearch,
    status,
    priority,
  ]);

  const hasFilters =
    debouncedSearch.trim() ||
    status !== 'All' ||
    priority !== 'All';

  const clearFilters = () => {
    setSearch('');
    setStatus('All');
    setPriority('All');
  };

  /*
   * Open Add Task modal.
   */
  const openNewTask = () => {
    setForm({
      ...emptyForm,
      project:
        projects.length > 0
          ? String(projects[0].id)
          : '',
    });

    setModalOpen(true);
  };

  /*
   * Create task.
   *
   * POST /api/tasks
   */
  const submit = async (e) => {
    e.preventDefault();

    if (submitting) {
      return;
    }

    if (!form.title.trim()) {
      window.alert(
        'Please enter a task title.'
      );
      return;
    }

    if (!form.project) {
      window.alert(
        'Please select a project.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const selectedProject = projects.find(
        (project) =>
          String(project.id) ===
          String(form.project)
      );

      if (!selectedProject) {
        throw new Error(
          'Selected project was not found.'
        );
      }

      const taskData = {
        title: form.title.trim(),

        project_id: Number(
          selectedProject.id
        ),

        priority: form.priority,

        status: form.status,

        progress:
          form.status === 'Completed'
            ? 100
            : 0,

        ...(form.dueDate
          ? {
              due_date: form.dueDate,
            }
          : {}),
      };

      const result = await api.request(
        '/tasks',
        {
          method: 'POST',
          body: JSON.stringify(taskData),
        }
      );

      if (!result.success) {
        throw new Error(
          result.message ||
            'Unable to create task.'
        );
      }

      setModalOpen(false);
      setForm(emptyForm);

      /*
       * Reload from MySQL so the displayed
       * tasks represent the actual backend state.
       */
      await load();
    } catch (err) {
      console.error(
        'Create task error:',
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : 'Unable to create task.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage and filter your development tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewTask}
          disabled={
            submitting ||
            projects.length === 0
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          Add Task
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-2">
          <FilterDropdown
            label="Status"
            ariaLabel="Filter by status"
            value={status}
            onChange={setStatus}
            options={statusOptions}
          />

          <FilterDropdown
            label="Priority"
            ariaLabel="Filter by priority"
            value={priority}
            onChange={setPriority}
            options={priorityOptions}
          />

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-accent hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      {loading ? (
        <TaskSkeleton />
      ) : error ? (
        <ErrorState
          message="We couldn't load your tasks."
          onRetry={load}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={
            hasFilters
              ? SearchX
              : ListChecks
          }
          title={
            hasFilters
              ? 'No tasks found'
              : 'No tasks yet'
          }
          message={
            hasFilters
              ? 'There are no tasks matching your current filters.'
              : 'Add your first task to get started.'
          }
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={openNewTask}
                disabled={projects.length === 0}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                + Add Task
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-text-tertiary">
            {filtered.length} task
            {filtered.length === 1
              ? ''
              : 's'}
          </p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filtered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
              />
            ))}
          </div>
        </>
      )}

      {/* Add Task Modal */}
      <Modal
        open={modalOpen}
        onClose={() => {
          if (!submitting) {
            setModalOpen(false);
          }
        }}
        title="Add Task"
        footer={
          <>
            <button
              type="button"
              onClick={() =>
                setModalOpen(false)
              }
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="new-task-form"
              disabled={submitting}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? 'Adding...'
                : 'Add Task'}
            </button>
          </>
        }
      >
        <form
          id="new-task-form"
          onSubmit={submit}
          className="space-y-4"
        >
          {/* Task Title */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Task Title
            </label>

            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. Implement JWT Authentication"
            />
          </div>

          {/* Project + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Project
              </label>

              <select
                required
                value={form.project}
                onChange={(e) =>
                  setForm({
                    ...form,
                    project: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {projects.length === 0 ? (
                  <option value="">
                    No projects available
                  </option>
                ) : (
                  projects.map((project) => (
                    <option
                      key={project.id}
                      value={project.id}
                    >
                      {project.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="High">
                  High
                </option>
                <option value="Medium">
                  Medium
                </option>
                <option value="Low">
                  Low
                </option>
              </select>
            </div>
          </div>

          {/* Status + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Status
              </label>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="To Do">
                  To Do
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Blocked">
                  Blocked
                </option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-text-secondary">
                Due Date
              </label>

              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dueDate: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}