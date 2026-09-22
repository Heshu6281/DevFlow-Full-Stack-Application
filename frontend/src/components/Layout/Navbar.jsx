import { Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import ProfileMenu from './ProfileMenu';
import NotificationBell from './NotificationBell';

export default function Navbar({ onMenuClick, onSidebarToggle, sidebarOpen, mobileOpen, theme, onToggleTheme, onLogout }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        aria-controls="mobile-navigation"
        aria-expanded={mobileOpen}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary transition-colors hover:bg-accent-soft hover:text-accent xl:hidden"
      >
        <Menu className="h-6 w-6" strokeWidth={2.25} />
      </button>
      <button
        type="button"
        onClick={onSidebarToggle}
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        aria-expanded={sidebarOpen}
        className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-text-secondary transition-colors hover:bg-accent-soft hover:text-accent xl:flex"
      >
        {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <NotificationBell />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
        <ProfileMenu theme={theme} onToggleTheme={onToggleTheme} onLogout={onLogout} />
      </div>
    </header>
  );
}
