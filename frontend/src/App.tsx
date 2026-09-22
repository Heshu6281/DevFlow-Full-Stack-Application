import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

import Sidebar from '@/components/Layout/Sidebar';
import Navbar from '@/components/Layout/Navbar';
import MobileMenu from '@/components/Layout/MobileMenu';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Projects from '@/pages/Projects';
import Tasks from '@/pages/Tasks';
import Activity from '@/pages/Activity';
import Analytics from '@/pages/Analytics';
import Settings from '@/pages/Settings';
import Profile from '@/pages/Profile';
import AIAssistant from '@/pages/AIAssistant';
import LoginScreen from '@/components/Layout/LoginScreen';

import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/context/AuthContext';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft text-accent">
        <Compass className="h-8 w-8" />
      </div>

      <h1 className="text-2xl font-bold text-text-primary">
        Page not found
      </h1>

      <p className="mt-1.5 text-sm text-text-secondary">
        The page you're looking for doesn't exist.
      </p>

      <a
        href="/"
        className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Back to Home
      </a>
    </div>
  );
}

function ProtectedLayout({
  theme,
  toggleTheme,
  mobileOpen,
  setMobileOpen,
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        open={sidebarOpen}
        onNavigate={() => {}}
      />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Navbar
          onMenuClick={() => setMobileOpen(true)}
          onSidebarToggle={() =>
            setSidebarOpen((open) => !open)
          }
          sidebarOpen={sidebarOpen}
          mobileOpen={mobileOpen}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
        />

        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/activity" element={<Activity />} />
              <Route path="/analytics" element={<Analytics />} />

              <Route
                path="/settings"
                element={
                  <Settings
                    theme={theme}
                    onToggleTheme={toggleTheme}
                  />
                }
              />

              <Route path="/profile" element={<Profile />} />
              <Route
                path="/ai-assistant"
                element={<AIAssistant />}
              />

              <Route
                path="*"
                element={<Navigate to="/dashboard" replace />}
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { theme, toggleTheme } = useTheme();

  const {
    isAuthenticated,
    login,
    register,
    logout,
    loading: authLoading,
  } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogin = async (
    email: string,
    password: string
  ) => {
    await login(email, password);
  };

 const handleLogout = async () => {
  await logout();
  window.location.href = '/';
};

  return (
    <Routes>
      {/* Public Home Page */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Home />
          )
        }
      />

      {/* Public Login Page */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginScreen
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogin={handleLogin}
              onRegister={register}
              loading={authLoading}
            />
          )
        }
      />

      {/* Public Register Page */}
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginScreen
              theme={theme}
              onToggleTheme={toggleTheme}
              onLogin={handleLogin}
              onRegister={register}
              loading={authLoading}
            />
          )
        }
      />

      {/* Protected Application */}
      {isAuthenticated ? (
        <Route
          path="/*"
          element={
            <ProtectedLayout
              theme={theme}
              toggleTheme={toggleTheme}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              handleLogout={handleLogout}
            />
          }
        />
      ) : (
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      )}

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}