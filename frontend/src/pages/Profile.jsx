import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Briefcase,
  Calendar,
  Code2,
  CheckCircle2,
  Clock,
  ArrowLeft,
  TrendingUp,
  Target,
  Zap,
  Pencil,
  Plus,
  Trash2,
  X,
  Check,
} from 'lucide-react';

import api from '@/services/api';
import ErrorState from '@/components/common/ErrorState';

const statConfig = [
  {
    label: 'Active Projects',
    key: 'activeProjects',
    icon: Code2,
    accent: 'text-accent',
    bg: 'bg-accent-soft',
  },
  {
    label: 'Completed Tasks',
    key: 'completedTasks',
    icon: CheckCircle2,
    accent: 'text-success',
    bg: 'bg-success/10',
  },
  {
    label: 'In Progress',
    key: 'inProgressTasks',
    icon: Clock,
    accent: 'text-info',
    bg: 'bg-info/10',
  },
];

const formatJoinedDate = (dateValue) => {
  if (!dateValue) {
    return '—';
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

const getInitials = (name) => {
  if (!name) {
    return 'U';
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ============================
  // SKILL STATE
  // ============================
  const [showSkillForm, setShowSkillForm] = useState(false);

  const [skillForm, setSkillForm] = useState({
    name: '',
    level: 50,
  });

  const [editingSkillId, setEditingSkillId] = useState(null);
  const [skillSaving, setSkillSaving] = useState(false);
  const [skillDeletingId, setSkillDeletingId] = useState(null);
  const [skillError, setSkillError] = useState('');

  // ============================
  // LOAD PROFILE
  // ============================
  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.request('/profile');

      if (!response.data) {
        throw new Error('Profile data was not received.');
      }

      setProfile(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // LOAD SKILLS
  // ============================
  const loadSkills = async () => {
    try {
      const response = await api.request('/profile/skills');

      if (!response.success) {
        throw new Error(
          response.message || 'Failed to load skills.'
        );
      }

      setProfile((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          skills: response.data || [],
        };
      });
    } catch (err) {
      console.error('Failed to load skills:', err);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // ============================
  // OPEN ADD SKILL FORM
  // ============================
  const openAddSkillForm = () => {
    setSkillForm({
      name: '',
      level: 50,
    });

    setEditingSkillId(null);
    setSkillError('');
    setShowSkillForm(true);
  };

  // ============================
  // OPEN EDIT SKILL FORM
  // ============================
  const openEditSkillForm = (skill) => {
    setSkillForm({
      name: skill.name || '',
      level: Number(skill.level) || 0,
    });

    setEditingSkillId(skill.id);
    setSkillError('');
    setShowSkillForm(true);
  };

  // ============================
  // CLOSE SKILL FORM
  // ============================
  const closeSkillForm = () => {
    if (skillSaving) {
      return;
    }

    setShowSkillForm(false);
    setEditingSkillId(null);
    setSkillError('');

    setSkillForm({
      name: '',
      level: 50,
    });
  };

  // ============================
  // SAVE SKILL
  // ============================
  const saveSkill = async (e) => {
    e.preventDefault();

    setSkillError('');

    const name = skillForm.name.trim();
    const level = Number(skillForm.level);

    if (!name) {
      setSkillError('Skill name is required.');
      return;
    }

    if (!Number.isInteger(level) || level < 0 || level > 100) {
      setSkillError(
        'Skill proficiency must be between 0 and 100.'
      );
      return;
    }

    try {
      setSkillSaving(true);

      const isEditing = editingSkillId !== null;

      const response = await api.request(
        isEditing
          ? `/profile/skills/${editingSkillId}`
          : '/profile/skills',
        {
          method: isEditing ? 'PUT' : 'POST',
          body: JSON.stringify({
            name,
            level,
          }),
        }
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to save skill.'
        );
      }

      await loadSkills();

      closeSkillForm();
    } catch (err) {
      console.error('Failed to save skill:', err);

      setSkillError(
        err instanceof Error
          ? err.message
          : 'Unable to save skill.'
      );
    } finally {
      setSkillSaving(false);
    }
  };

  // ============================
  // DELETE SKILL
  // ============================
  const deleteSkill = async (skillId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this skill?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setSkillDeletingId(skillId);

      const response = await api.request(
        `/profile/skills/${skillId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.success) {
        throw new Error(
          response.message || 'Unable to delete skill.'
        );
      }

      setProfile((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          skills: (current.skills || []).filter(
            (skill) => skill.id !== skillId
          ),
        };
      });
    } catch (err) {
      console.error('Failed to delete skill:', err);

      alert(
        err instanceof Error
          ? err.message
          : 'Unable to delete skill.'
      );
    } finally {
      setSkillDeletingId(null);
    }
  };

  // ============================
  // LOADING
  // ============================
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-surface-2" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface-2" />
        </div>

        <div className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-32 animate-pulse rounded-2xl border border-border bg-surface"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-surface lg:col-span-3" />
        </div>
      </div>
    );
  }

  // ============================
  // ERROR
  // ============================
  if (error || !profile) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="Back to dashboard"
            className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-text-secondary">
              View your developer profile and workspace details.
            </p>
          </div>
        </div>

        <ErrorState
          title="Unable to load profile"
          message={error || 'Profile data is unavailable.'}
          onRetry={loadProfile}
        />
      </div>
    );
  }

  const {
    user,
    stats,
    completionRate,
    productivity,
    streak,
    skills = [],
  } = profile;

  const userName = user?.name || 'User';
  const userEmail = user?.email || '—';
  const userRole = user?.role || 'Software Developer';
  const joinedDate = formatJoinedDate(user?.joinedDate);

  const activeProjects = stats?.activeProjects ?? 0;
  const completedTasks = stats?.completedTasks ?? 0;
  const inProgressTasks = stats?.inProgressTasks ?? 0;
  const totalTasks = stats?.totalTasks ?? 0;

  const productivityValue = Number(productivity ?? 0);
  const completionRateValue = Number(completionRate ?? 0);
  const streakValue = Number(streak ?? 0);

  const highlights = [
    {
      icon: TrendingUp,
      label: 'Productivity',
      value: `${productivityValue}%`,
      sub: 'Based on task completion',
      color: 'text-success',
    },
    {
      icon: Target,
      label: 'Completion rate',
      value: `${completionRateValue}%`,
      sub: `${completedTasks} of ${totalTasks} tasks`,
      color: 'text-accent',
    },
    {
      icon: Zap,
      label: 'Streak',
      value: `${streakValue} ${
        streakValue === 1 ? 'day' : 'days'
      }`,
      sub: 'Current activity streak',
      color: 'text-warning',
    },
  ];

  const details = [
    {
      label: 'Email',
      value: userEmail,
      icon: Mail,
    },
    {
      label: 'Role',
      value: userRole,
      icon: Briefcase,
    },
    {
      label: 'Joined',
      value: joinedDate,
      icon: Calendar,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/"
          aria-label="Back to dashboard"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            View your developer profile and workspace details.
          </p>
        </div>
      </div>

      {/* Hero card */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-soft">
        <div className="relative h-32 bg-gradient-to-r from-accent/15 via-accent/5 to-transparent">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 50%, rgb(var(--accent) / 0.3), transparent 60%)',
            }}
          />
        </div>

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    getInitials(userName)
                  )}&backgroundColor=4f46e5`}
                  alt={`${userName} avatar`}
                  className="h-24 w-24 rounded-2xl border-4 border-surface shadow-card"
                />

                <span
                  className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full border-2 border-surface bg-success"
                  title="Online"
                />
              </div>

              <div className="pb-1.5">
                <h2 className="text-xl font-bold text-text-primary">
                  {userName}
                </h2>

                <p className="text-sm text-text-secondary">
                  {userRole}
                </p>

                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Active
                  </span>

                  <span className="text-xs text-text-tertiary">
                    · DevFlow since {joinedDate}
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/settings"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Link>
          </div>

          {/* Detail rows */}
          <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <div
                  key={detail.label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 transition-colors hover:border-text-tertiary"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-accent">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-text-tertiary">
                      {detail.label}
                    </p>

                    <p className="truncate text-sm font-medium text-text-primary">
                      {detail.value}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {highlights.map((highlight) => {
          const Icon = highlight.icon;

          return (
            <div
              key={highlight.label}
              className="rounded-2xl border border-border bg-surface p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-surface-2 ${highlight.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="text-2xl font-bold tracking-tight text-text-primary">
                  {highlight.value}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-text-primary">
                {highlight.label}
              </p>

              <p className="text-xs text-text-tertiary">
                {highlight.sub}
              </p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Workspace overview */}
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-2">
          <h2 className="text-base font-semibold text-text-primary">
            Workspace overview
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Your current development activity in DevFlow.
          </p>

          <div className="mt-5 space-y-3">
            {statConfig.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-4 rounded-xl border border-border bg-surface-2 p-4 transition-colors hover:border-text-tertiary"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.bg} ${stat.accent}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1">
                    <p className="text-xs text-text-tertiary">
                      {stat.label}
                    </p>

                    <p className="text-2xl font-bold tracking-tight text-text-primary">
                      {stats?.[stat.key] ?? 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Skills */}
        <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft lg:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-text-primary">
                Skills
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Technologies used across your projects, with proficiency.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddSkillForm}
              className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>

          {/* Add/Edit skill form */}
          {showSkillForm && (
            <form
              onSubmit={saveSkill}
              className="mt-5 rounded-xl border border-border bg-surface-2 p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    {editingSkillId !== null
                      ? 'Edit Skill'
                      : 'Add Skill'}
                  </h3>

                  <p className="mt-0.5 text-xs text-text-tertiary">
                    Set the technology and your proficiency level.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeSkillForm}
                  disabled={skillSaving}
                  className="rounded-lg p-1.5 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary disabled:opacity-50"
                  aria-label="Close skill form"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {skillError && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  {skillError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="skillName"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Skill Name
                  </label>

                  <input
                    id="skillName"
                    value={skillForm.name}
                    onChange={(e) =>
                      setSkillForm({
                        ...skillForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. React"
                    disabled={skillSaving}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                  />
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label
                      htmlFor="skillLevel"
                      className="text-sm font-medium text-text-secondary"
                    >
                      Proficiency
                    </label>

                    <span className="text-sm font-semibold text-accent">
                      {skillForm.level}%
                    </span>
                  </div>

                  <input
                    id="skillLevel"
                    type="range"
                    min="0"
                    max="100"
                    value={skillForm.level}
                    onChange={(e) =>
                      setSkillForm({
                        ...skillForm,
                        level: Number(e.target.value),
                      })
                    }
                    disabled={skillSaving}
                    className="mt-2 w-full accent-[rgb(var(--accent))]"
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={skillSaving}
                  className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Check className="h-4 w-4" />

                  {skillSaving
                    ? 'Saving...'
                    : editingSkillId !== null
                      ? 'Update Skill'
                      : 'Add Skill'}
                </button>

                <button
                  type="button"
                  onClick={closeSkillForm}
                  disabled={skillSaving}
                  className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-tertiary disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Skills list */}
          {skills.length > 0 ? (
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
              {skills.map((skill) => {
                const level = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(skill.level) || 0
                  )
                );

                return (
                  <div key={skill.id || skill.name}>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <span className="font-mono text-sm font-medium text-text-primary">
                        {skill.name}
                      </span>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text-tertiary">
                          {level}%
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            openEditSkillForm(skill)
                          }
                          className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-surface-2 hover:text-accent"
                          aria-label={`Edit ${skill.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteSkill(skill.id)
                          }
                          disabled={
                            skillDeletingId === skill.id
                          }
                          className="rounded-md p-1 text-text-tertiary transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${skill.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent/70 transition-[width] duration-500 ease-out"
                        style={{
                          width: `${level}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-xl border border-border bg-surface-2 px-4 py-8 text-center">
              <p className="text-sm text-text-secondary">
                No skills added yet.
              </p>

              <button
                type="button"
                onClick={openAddSkillForm}
                className="mt-3 text-sm font-medium text-accent hover:underline"
              >
                Add your first skill
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}