import { useNavigate } from 'react-router-dom';
import {
  Code2,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <Code2 className="h-5 w-5" />
            </div>

            <span className="text-lg font-bold">
              DevFlow
            </span>
          </button>

          <nav className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary sm:block"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text-primary"
            >
              <LogIn className="h-4 w-4" />
              Login
            </button>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Register
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-white shadow-card">
              <Code2 className="h-7 w-7" />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Developer Productivity Platform
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Build. Track.{' '}
              <span className="text-accent">Flow.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">
              DevFlow helps developers manage projects, organize tasks,
              monitor productivity, analyze progress, and use AI assistance
              in one workspace.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-2 sm:w-auto"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-text-primary sm:text-3xl">
                Everything you need in one workspace
              </h2>

              <p className="mt-2 text-sm text-text-secondary">
                Organize your development workflow and keep track of your progress.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <FeatureCard
                icon={FolderKanban}
                title="Projects"
                description="Create and manage development projects with progress tracking."
              />

              <FeatureCard
                icon={CheckSquare}
                title="Tasks"
                description="Organize tasks, priorities, statuses, and deadlines."
              />

              <FeatureCard
                icon={BarChart3}
                title="Analytics"
                description="Understand productivity and monitor project progress."
              />

              <FeatureCard
                icon={Sparkles}
                title="AI Assistant"
                description="Use AI assistance to plan projects and generate tasks."
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-surface p-8 text-center shadow-card sm:p-10">
            <h2 className="text-2xl font-bold text-text-primary">
              Ready to organize your workflow?
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">
              Create your DevFlow account and start managing your development
              workflow.
            </p>

            <button
              type="button"
              onClick={() => navigate('/register')}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-card">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="text-base font-semibold text-text-primary">
        {title}
      </h3>

      <p className="mt-1.5 text-sm leading-6 text-text-secondary">
        {description}
      </p>
    </div>
  );
}