import { useEffect, useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  User,
  Shield,
  Palette,
  Check,
  Globe,
  Clock,
  Monitor,
  Lock,
  X,
} from 'lucide-react';

import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import ErrorState from '@/components/common/ErrorState';

function Toggle({
  checked,
  onChange,
  label,
  description,
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="pr-4">
        <p className="text-sm font-medium text-text-primary">
          {label}
        </p>

        {description && (
          <p className="text-xs text-text-tertiary">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-accent' : 'bg-surface-2'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-soft sm:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-text-primary">
            {title}
          </h2>

          {description && (
            <p className="text-xs text-text-tertiary">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

const themeOptions = [
  {
    id: 'light',
    label: 'Light',
    icon: Sun,
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: Moon,
  },
  {
    id: 'system',
    label: 'System',
    icon: Monitor,
  },
];

export default function Settings({
  theme,
  onToggleTheme,
}) {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({
    reminders: true,
    updates: true,
    report: false,
    mentions: true,
  });

  const [account, setAccount] = useState({
    name: '',
    email: '',
    role: 'Software Developer',
    timezone: 'Asia/Kolkata (IST)',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [activeTheme, setActiveTheme] = useState(theme);

  // ============================
  // CHANGE PASSWORD STATE
  // ============================
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // ============================
  // LOAD CURRENT USER
  // ============================
  const loadAccount = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const response = await api.request(`/users/${user.id}`);

      if (!response.success || !response.data) {
        throw new Error(
          response.message ||
            'Unable to load account information.'
        );
      }

      setAccount((current) => ({
        ...current,
        name: response.data.name || '',
        email: response.data.email || '',
        role:
          response.data.role ||
          'Software Developer',
      }));
    } catch (err) {
      console.error(
        'Failed to load account:',
        err
      );
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // LOAD NOTIFICATION SETTINGS
  // ============================
  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      const response = await api.request(
        `/settings/${user.id}`
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message ||
            'Unable to load notification settings.'
        );
      }

      setNotifications({
        reminders: Boolean(
          response.data.reminders
        ),
        updates: Boolean(
          response.data.updates
        ),
        report: Boolean(
          response.data.report
        ),
        mentions: Boolean(
          response.data.mentions
        ),
      });
    } catch (err) {
      console.error(
        'Failed to load notification settings:',
        err
      );
    }
  };

  useEffect(() => {
    loadAccount();
    loadNotifications();
  }, [user?.id]);

  // ============================
  // UPDATE NOTIFICATION SETTING
  // ============================
  const updateNotification = async (
    key,
    value
  ) => {
    const previousSettings = notifications;

    const updatedSettings = {
      ...notifications,
      [key]: value,
    };

    setNotifications(updatedSettings);

    try {
      const response = await api.request(
        `/settings/${user.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(
            updatedSettings
          ),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message ||
            'Unable to update notification settings.'
        );
      }

      setNotifications({
        reminders: Boolean(
          response.data.reminders
        ),
        updates: Boolean(
          response.data.updates
        ),
        report: Boolean(
          response.data.report
        ),
        mentions: Boolean(
          response.data.mentions
        ),
      });
    } catch (err) {
      console.error(
        'Failed to update notification settings:',
        err
      );

      setNotifications(previousSettings);

      alert(
        err.message ||
          'Unable to update notification settings.'
      );
    }
  };

  // ============================
  // THEME
  // ============================
  const selectTheme = (id) => {
    setActiveTheme(id);

    if (id === 'system') {
      const prefersDark =
        window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches;

      if (
        (prefersDark && theme === 'light') ||
        (!prefersDark && theme === 'dark')
      ) {
        onToggleTheme();
      }
    } else if (id !== theme) {
      onToggleTheme();
    }
  };

  // ============================
  // SAVE ACCOUNT
  // ============================
  const save = async (e) => {
    e.preventDefault();

    if (!user?.id) return;

    try {
      setSaving(true);
      setSaved(false);

      const response = await api.request(
        `/users/${user.id}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            name: account.name.trim(),
            email: account.email.trim(),
            role: account.role.trim(),
          }),
        }
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message ||
            'Unable to save account information.'
        );
      }

      const updatedUser = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role:
          response.data.role ||
          'Software Developer',
      };

      localStorage.setItem(
        'devflow_user',
        JSON.stringify(updatedUser)
      );

      setAccount((current) => ({
        ...current,
        name: response.data.name || '',
        email: response.data.email || '',
        role:
          response.data.role ||
          'Software Developer',
      }));

      setSaved(true);

      setTimeout(
        () => setSaved(false),
        2200
      );
    } catch (err) {
      console.error(
        'Failed to save account:',
        err
      );

      alert(
        err.message ||
          'Unable to save account information.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================
  // OPEN PASSWORD FORM
  // ============================
  const openPasswordForm = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    setPasswordError('');
    setPasswordSuccess(false);
    setShowPasswordForm(true);
  };

  // ============================
  // CLOSE PASSWORD FORM
  // ============================
  const closePasswordForm = () => {
    if (passwordSaving) return;

    setShowPasswordForm(false);

    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

    setPasswordError('');
    setPasswordSuccess(false);
  };

  // ============================
  // CHANGE PASSWORD
  // ============================
  const changePassword = async (e) => {
    e.preventDefault();

    setPasswordError('');
    setPasswordSuccess(false);

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        'Please fill in all password fields.'
      );
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        'New password must be at least 6 characters long.'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        'New password and confirm password do not match.'
      );
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        'New password must be different from your current password.'
      );
      return;
    }

    try {
      setPasswordSaving(true);

      const response = await api.request(
        '/auth/change-password',
        {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            'Unable to change password.'
        );
      }

      setPasswordSuccess(true);

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 1800);
    } catch (err) {
      console.error(
        'Failed to change password:',
        err
      );

      setPasswordError(
        err instanceof Error
          ? err.message
          : 'Unable to change password.'
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  // ============================
  // LOADING
  // ============================
  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Settings
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Loading your account settings...
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-soft">
            <div className="space-y-4">
              <div className="h-5 w-32 animate-pulse rounded bg-surface-2" />

              <div className="h-10 w-full animate-pulse rounded bg-surface-2" />

              <div className="h-10 w-full animate-pulse rounded bg-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================
  // ERROR
  // ============================
  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Settings
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            Manage your preferences, notifications,
            and account.
          </p>
        </div>

        <ErrorState
          message="We couldn't load your account information."
          onRetry={loadAccount}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Settings
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage your preferences, notifications,
          and account.
        </p>
      </div>

      <div className="mx-auto max-w-2xl space-y-6">

        {/* ============================
            APPEARANCE
        ============================ */}
        <Section
          icon={Palette}
          title="Appearance"
          description="Choose how DevFlow looks for you."
        >
          <div className="py-4">
            <p className="mb-3 text-sm font-medium text-text-primary">
              Theme
            </p>

            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const selected =
                  activeTheme === opt.id;

                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      selectTheme(opt.id)
                    }
                    aria-pressed={selected}
                    className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                      selected
                        ? 'border-accent bg-accent-soft text-accent ring-1 ring-accent'
                        : 'border-border bg-surface-2 text-text-secondary hover:border-text-tertiary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />

                    <span className="text-sm font-medium">
                      {opt.label}
                    </span>

                    {selected && (
                      <Check className="h-3.5 w-3.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </Section>

        {/* ============================
            NOTIFICATIONS
        ============================ */}
        <Section
          icon={Bell}
          title="Notifications"
          description="Decide what DevFlow should alert you about."
        >
          <Toggle
            label="Task reminders"
            description="Get notified about upcoming due dates"
            checked={notifications.reminders}
            onChange={(value) =>
              updateNotification(
                'reminders',
                value
              )
            }
          />

          <Toggle
            label="Project updates"
            description="Notifications when projects change status"
            checked={notifications.updates}
            onChange={(value) =>
              updateNotification(
                'updates',
                value
              )
            }
          />

          <Toggle
            label="Weekly productivity report"
            description="A summary of your week, every Monday"
            checked={notifications.report}
            onChange={(value) =>
              updateNotification(
                'report',
                value
              )
            }
          />

          <Toggle
            label="Mentions & comments"
            description="When someone mentions you on a task"
            checked={notifications.mentions}
            onChange={(value) =>
              updateNotification(
                'mentions',
                value
              )
            }
          />
        </Section>

        {/* ============================
            PREFERENCES
        ============================ */}
        <Section
          icon={Globe}
          title="Preferences"
          description="Localization and workspace defaults."
        >
          <div className="py-4">
            <label
              htmlFor="timezone"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Timezone
            </label>

            <select
              id="timezone"
              value={account.timezone}
              onChange={(e) =>
                setAccount({
                  ...account,
                  timezone: e.target.value,
                })
              }
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option>
                Asia/Kolkata (IST)
              </option>

              <option>
                America/New_York (EST)
              </option>

              <option>
                Europe/London (GMT)
              </option>

              <option>
                Asia/Tokyo (JST)
              </option>
            </select>
          </div>

          <div className="flex items-center gap-3 py-4">
            <Clock className="h-4 w-4 text-text-tertiary" />

            <p className="text-sm text-text-secondary">
              Times across DevFlow will display in
              this timezone.
            </p>
          </div>
        </Section>

        {/* ============================
            ACCOUNT
        ============================ */}
        <Section
          icon={User}
          title="Account"
          description="Update your personal information."
        >
          <form
            onSubmit={save}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Name
                </label>

                <input
                  id="name"
                  value={account.name}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      name: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={account.email}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      email: e.target.value,
                    })
                  }
                  required
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="mb-1.5 block text-sm font-medium text-text-secondary"
                >
                  Role
                </label>

                <input
                  id="role"
                  value={account.role}
                  onChange={(e) =>
                    setAccount({
                      ...account,
                      role: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

              {saved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-success animate-fade-in">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        </Section>

        {/* ============================
            SECURITY
        ============================ */}
        <Section
          icon={Shield}
          title="Security"
          description="Manage your sign-in and session."
        >
          {/* PASSWORD */}
          <div className="py-4">
            {!showPasswordForm ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Password
                  </p>

                  <p className="text-xs text-text-tertiary">
                    Update your account password.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openPasswordForm}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-tertiary"
                >
                  <Lock className="h-4 w-4" />
                  Change password
                </button>
              </div>
            ) : (
              <form
                onSubmit={changePassword}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Change password
                    </p>

                    <p className="mt-1 text-xs text-text-tertiary">
                      Choose a new password for your account.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closePasswordForm}
                    disabled={passwordSaving}
                    className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary disabled:opacity-50"
                    aria-label="Cancel password change"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {passwordError && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-500">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2.5 text-sm text-green-500">
                    <Check className="h-4 w-4" />
                    Password changed successfully.
                  </div>
                )}

                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Current Password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    value={
                      passwordData.currentPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword:
                          e.target.value,
                      })
                    }
                    autoComplete="current-password"
                    disabled={passwordSaving}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    New Password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    value={
                      passwordData.newPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword:
                          e.target.value,
                      })
                    }
                    autoComplete="new-password"
                    disabled={passwordSaving}
                    minLength={6}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                  />

                  <p className="mt-1 text-xs text-text-tertiary">
                    Minimum 6 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-text-secondary"
                  >
                    Confirm New Password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    value={
                      passwordData.confirmPassword
                    }
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword:
                          e.target.value,
                      })
                    }
                    autoComplete="new-password"
                    disabled={passwordSaving}
                    minLength={6}
                    required
                    className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-60"
                  />
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {passwordSaving
                      ? 'Changing...'
                      : 'Update Password'}
                  </button>

                  <button
                    type="button"
                    onClick={closePasswordForm}
                    disabled={passwordSaving}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-tertiary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* TWO FACTOR AUTHENTICATION */}
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">
                Two-factor authentication
              </p>

              <p className="text-xs text-text-tertiary">
                Add an extra layer of security
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-surface-2 px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:border-text-tertiary"
            >
              Enable 2FA
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}