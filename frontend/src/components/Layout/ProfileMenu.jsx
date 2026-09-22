import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function ProfileMenu({
  theme,
  onToggleTheme,
  onLogout,
}) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('');

  const ref = useRef(null);
  const navigate = useNavigate();

  const { user } = useAuth();

  // Close profile menu when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClick);

    return () => {
      document.removeEventListener('mousedown', onClick);
    };
  }, []);

  // Load latest profile information from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.request('/profile');

        console.log('PROFILE RESPONSE:', response);

        const profileUser = response?.data?.user;

        if (profileUser?.role) {
          setRole(profileUser.role);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const logout = () => {
    setOpen(false);
    onLogout();
  };

  // Get name from logged-in user
  const fullName = user?.name || 'Developer';

  // Show first name in navbar
  const firstName = fullName.trim().split(/\s+/)[0];

  // Generate initials automatically
  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return (
      parts[0].charAt(0) +
      parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const initials = getInitials(fullName);

  // Role comes from backend
  const displayRole = role || 'Software Developer';

  return (
    <div className="relative" ref={ref}>
      {/* Profile button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-surface-2"
      >
        <img
          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            initials
          )}&backgroundColor=4f46e5`}
          alt={`${fullName} avatar`}
          className="h-8 w-8 rounded-full"
        />

        <span className="hidden text-left sm:block">
          <span className="block text-sm font-medium leading-tight text-text-primary">
            {firstName}
          </span>

          <span className="block text-xs leading-tight text-text-tertiary">
            {displayRole}
          </span>
        </span>

        <ChevronDown
          className="h-4 w-4 text-text-tertiary"
          aria-hidden="true"
        />
      </button>

      {/* Profile dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-xl border border-border bg-surface shadow-card-hover animate-fade-in">
          {/* User information */}
          <div className="border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-text-primary">
              {fullName}
            </p>

            <p className="text-xs text-text-tertiary">
              {displayRole}
            </p>
          </div>

          <nav className="py-1" aria-label="Profile menu">
            {/* My Profile */}
            <button
              type="button"
              onClick={() => go('/profile')}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            >
              <User className="h-4 w-4" />
              My Profile
            </button>

            {/* Settings */}
            <button
              type="button"
              onClick={() => go('/settings')}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            >
              <SettingsIcon className="h-4 w-4" />
              Settings
            </button>

            {/* Theme */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:bg-surface-2 hover:text-text-primary"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}

              {theme === 'dark'
                ? 'Light Mode'
                : 'Dark Mode'}
            </button>

            <div className="my-1 border-t border-border" />

            {/* Logout */}
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}