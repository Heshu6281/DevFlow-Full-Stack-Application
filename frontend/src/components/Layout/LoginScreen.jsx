import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Code2,
  Sun,
  Moon,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
} from 'lucide-react';

export default function LoginScreen({
  theme,
  onToggleTheme,
  onLogin,
  onRegister,
  loading = false,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const isRegister = location.pathname === '/register';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const switchMode = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');

    if (isRegister) {
      navigate('/login');
    } else {
      navigate('/register');
    }
  };

  const submit = async (e) => {
    e.preventDefault();

    setError('');
    setSuccess('');

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your name.');
        return;
      }

      if (!email.trim()) {
        setError('Please enter your email.');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      try {
        await onRegister(
          name.trim(),
          email.trim(),
          password
        );

        setSuccess(
          'Account created successfully. Please sign in.'
        );

        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');

        navigate('/login');
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to create your account. Please try again.'
        );
      }

      return;
    }

    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please try again.'
      );
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Theme toggle */}
      <button
        type="button"
        onClick={onToggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-4 rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
            <Code2 className="h-6 w-6" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Welcome to DevFlow
          </h1>

          <p className="mt-1 text-sm text-text-secondary">
            {isRegister
              ? 'Create your developer workspace'
              : 'Sign in to your developer workspace'}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={submit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          {/* Name - Register only */}
          {isRegister && (
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Full Name
              </label>

              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                  aria-hidden="true"
                />

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="Your full name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Email
            </label>

            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                aria-hidden="true"
              />

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-text-secondary"
            >
              Password
            </label>

            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                aria-hidden="true"
              />

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Confirm Password - Register only */}
          {isRegister && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1.5 block text-sm font-medium text-text-secondary"
              >
                Confirm Password
              </label>

              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                  aria-hidden="true"
                />

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-60"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-500"
            >
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div
              role="status"
              className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-600"
            >
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRegister ? (
              <UserPlus className="h-4 w-4" />
            ) : (
              <LogIn className="h-4 w-4" />
            )}

            {loading
              ? isRegister
                ? 'Creating Account...'
                : 'Signing In...'
              : isRegister
                ? 'Create Account'
                : 'Sign In'}
          </button>

          {/* Switch Login/Register */}
          <div className="pt-1 text-center">
            <p className="text-xs text-text-tertiary">
              {isRegister
                ? 'Already have an account?'
                : "Don't have an account?"}
            </p>

            <button
              type="button"
              onClick={switchMode}
              disabled={loading}
              className="mt-1 text-sm font-medium text-accent hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRegister ? 'Sign In' : 'Create an Account'}
            </button>
          </div>

          {/* Login information */}
          {!isRegister && (
            <p className="text-center text-xs text-text-tertiary">
              Enter your registered email and password to sign in.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}