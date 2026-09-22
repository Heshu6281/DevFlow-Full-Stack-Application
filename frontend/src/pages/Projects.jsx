import { useEffect, useMemo, useState } from 'react';
import { Plus, SearchX, FolderKanban } from 'lucide-react';

import ProjectCard from '@/components/Dashboard/ProjectCard';
import SearchBar from '@/components/common/SearchBar';
import FilterDropdown from '@/components/common/FilterDropdown';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Modal from '@/components/common/Modal';
import { ProjectSkeleton } from '@/components/common/LoadingSkeleton';
import { useDebounce } from '@/hooks/useDebounce';
import { api } from '@/services/api';

const statusOptions = [
  { value: 'All', label: 'All Statuses' },
  { value: 'To Do', label: 'To Do' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Completed', label: 'Completed' },
];

const sortOptions = [
  { value: 'recent', label: 'Recently Updated' },
  { value: 'progress', label: 'Progress' },
  { value: 'name', label: 'Name' },
];

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
    progress: Number(project.progress || 0),
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

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('recent');

  // IMPORTANT: start with an empty array.
  // No mock/static project data is used.
  const [projects, setProjects] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [form, setForm] = useState({
    name: '',
    description: '',
    technologies: '',
    status: 'To Do',
  });

  const debouncedSearch = useDebounce(search, 250);

  // --------------------------------------------------
  // GET PROJECTS
  // --------------------------------------------------
  const load = async () => {
    try {
      setLoading(true);
      setError(false);

      const response = await api.request('/projects');

      const backendProjects = extractProjects(response);

      setProjects(backendProjects.map(normalizeProject));
    } catch (err) {
      console.error('Failed to load projects:', err);
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
  // FILTER + SORT
  // --------------------------------------------------
  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();

    let list = projects.filter((project) => {
      const technologies = Array.isArray(project.technologies)
        ? project.technologies
        : [];

      const searchableText = [
        project.name,
        project.description,
        project.status,
        ...technologies,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        !q || searchableText.includes(q);

      const matchesStatus =
        status === 'All' || project.status === status;

      return matchesSearch && matchesStatus;
    });

    list = [...list];

    if (sort === 'progress') {
      list.sort((a, b) => b.progress - a.progress);
    } else if (sort === 'name') {
      list.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.lastUpdated).getTime() -
          new Date(a.lastUpdated).getTime()
      );
    }

    return list;
  }, [projects, debouncedSearch, status, sort]);

  const hasFilters =
    debouncedSearch.trim() || status !== 'All';

  const clearFilters = () => {
    setSearch('');
    setStatus('All');
  };

  // --------------------------------------------------
  // NEW PROJECT
  // --------------------------------------------------
  const openNewProject = () => {
    setEditingProject(null);

    setForm({
      name: '',
      description: '',
      technologies: '',
      status: 'To Do',
    });

    setModalOpen(true);
  };

  // --------------------------------------------------
  // EDIT PROJECT
  // --------------------------------------------------
  const openEditProject = (project) => {
    setEditingProject(project);

    setForm({
      name: project.name,
      description: project.description,
      technologies: project.technologies.join(', '),
      status: project.status,
    });

    setModalOpen(true);
  };

  // --------------------------------------------------
  // DELETE PROJECT
  // --------------------------------------------------
  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError(false);

      await api.request(`/projects/${project.id}`, {
        method: 'DELETE',
      });

      await load();
    } catch (err) {
      console.error('Failed to delete project:', err);

      window.alert(
        err.message || 'Failed to delete project.'
      );
    }
  };

  // --------------------------------------------------
  // CREATE / UPDATE PROJECT
  // --------------------------------------------------
  const submit = async (e) => {
    e.preventDefault();

    try {
      setError(false);

      const technologies = form.technologies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        technologies,
        status: form.status,
      };

      if (editingProject) {
        await api.request(
          `/projects/${editingProject.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        );
      } else {
        await api.request('/projects', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      setForm({
        name: '',
        description: '',
        technologies: '',
        status: 'To Do',
      });

      setEditingProject(null);
      setModalOpen(false);

      // Reload from MySQL so the UI always shows
      // the actual backend state.
      await load();
    } catch (err) {
      console.error('Failed to save project:', err);

      window.alert(
        err.message || 'Failed to save project.'
      );
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Projects
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Track progress across your development work.
          </p>
        </div>

        <button
          type="button"
          onClick={openNewProject}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
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
            label="Sort"
            ariaLabel="Sort projects"
            value={sort}
            onChange={setSort}
            options={sortOptions}
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

      {loading ? (
        <ProjectSkeleton />
      ) : error ? (
        <ErrorState
          message="We couldn't load your projects."
          onRetry={load}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={hasFilters ? SearchX : FolderKanban}
          title={
            hasFilters
              ? 'No projects found'
              : 'No projects yet'
          }
          message={
            hasFilters
              ? 'No projects match your current filters.'
              : 'Create your first project to get started.'
          }
          action={
            hasFilters ? (
              <button
                onClick={clearFilters}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={openNewProject}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                + New Project
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="text-sm text-text-tertiary">
            {filtered.length} project
            {filtered.length === 1 ? '' : 's'}
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={openEditProject}
                onDelete={deleteProject}
              />
            ))}
          </div>
        </>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingProject
            ? 'Edit Project'
            : 'New Project'
        }
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-text-secondary hover:bg-surface-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="project-form"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {editingProject
                ? 'Save Changes'
                : 'Create Project'}
            </button>
          </>
        }
      >
        <form
          id="project-form"
          onSubmit={submit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Project Name
            </label>

            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="e.g. RentHub"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Description
            </label>

            <textarea
              required
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              rows={3}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="Short description..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">
              Technologies (comma-separated)
            </label>

            <input
              value={form.technologies}
              onChange={(e) =>
                setForm({
                  ...form,
                  technologies: e.target.value,
                })
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              placeholder="React, Node.js"
            />
          </div>

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
              <option value="To Do">To Do</option>
              <option value="In Progress">
                In Progress
              </option>
              <option value="Completed">
                Completed
              </option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}