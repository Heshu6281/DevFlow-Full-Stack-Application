import { useEffect, useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Activity as ActivityIcon } from 'lucide-react';

import ProductivityChart from '@/components/Dashboard/ProductivityChart';
import ErrorState from '@/components/common/ErrorState';
import { ChartSkeleton, SkeletonBlock } from '@/components/common/LoadingSkeleton';
import { api } from '@/services/api';

function ChartCard({
  title,
  subtitle,
  children,
  height = 260,
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-text-primary">
          {title}
        </h3>

        {subtitle && (
          <p className="text-xs text-text-tertiary">
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ width: '100%', height }}>
        {children}
      </div>
    </div>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: '1px solid rgb(var(--border))',
  background: 'rgb(var(--surface))',
  fontSize: 12,
};

const getColor = (name) => {
  const colors = {
    Completed: 'rgb(var(--success))',
    'In Progress': 'rgb(var(--accent))',
    'To Do': 'rgb(var(--warning))',
    High: 'rgb(var(--error))',
    Medium: 'rgb(var(--warning))',
    Low: 'rgb(var(--success))',
  };

  return colors[name] || 'rgb(var(--accent))';
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.request('/analytics');

      if (!response?.success || !response?.data) {
        throw new Error(
          response?.message ||
            'Analytics data is unavailable.'
        );
      }

      setAnalytics(response.data);
    } catch (err) {
      console.error('Analytics API error:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load analytics.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const {
    overview = {},
    taskStatus = [],
    priorityDistribution = [],
    projectProgress = [],
    monthlyProductivity = [],
  } = analytics || {};

  const completionRate = Number(
    overview.completionRate || 0
  );

  const taskCompletionData = useMemo(
    () =>
      taskStatus.map((item) => ({
        name: item.status,
        value: Number(item.count || 0),
        color: getColor(item.status),
      })),
    [taskStatus]
  );

  const priorityData = useMemo(
    () =>
      priorityDistribution.map((item) => ({
        name: item.priority || 'Unknown',
        value: Number(item.count || 0),
        color: getColor(item.priority),
      })),
    [priorityDistribution]
  );

  const projectProgressData = useMemo(
    () =>
      projectProgress.map((project) => ({
        id: project.id,
        name: project.name,
        progress: Number(project.progress || 0),
      })),
    [projectProgress]
  );

  const radialData = [
    {
      name: 'Completed',
      value: completionRate,
      fill: 'rgb(var(--success))',
    },
  ];

  /*
   * Convert monthly productivity into the format expected
   * by the existing Task 1 ProductivityChart.
   */
  const productivityData = useMemo(
    () =>
      monthlyProductivity.map((item) => ({
        day:
          item.month ||
          item.label ||
          item.date ||
          '',
        value: Number(
          item.completed ??
            item.count ??
            item.tasks ??
            item.value ??
            0
        ),
      })),
    [monthlyProductivity]
  );

  /*
   * Calculate a simple comparison message from the
   * current backend analytics data.
   */
  const productivityMessage = useMemo(() => {
    if (!monthlyProductivity.length) {
      return 'Keep working on your projects and tasks to build your productivity insights.';
    }

    const values = monthlyProductivity.map((item) =>
      Number(
        item.completed ??
          item.count ??
          item.tasks ??
          item.value ??
          0
      )
    );

    if (values.length < 2) {
      return 'Your productivity data is being tracked. Keep it up!';
    }

    const current = values[values.length - 1];
    const previous = values[values.length - 2];

    if (previous <= 0) {
      return 'Your productivity is being tracked. Keep it up!';
    }

    const change = Math.round(
      ((current - previous) / previous) * 100
    );

    if (change > 0) {
      return `You're ${change}% more productive than the previous period. Keep it up!`;
    }

    if (change < 0) {
      return `Your productivity is ${Math.abs(change)}% lower than the previous period. Keep working on it!`;
    }

    return 'Your productivity is steady compared with the previous period.';
  }, [monthlyProductivity]);

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonBlock className="mt-2 h-4 w-64" />
        </div>

        <ChartSkeleton />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <ErrorState
        message={
          error ||
          "We couldn't load your analytics."
        }
        onRetry={loadAnalytics}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Analytics
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Insights into your productivity and project progress.
        </p>
      </div>

      {/* Productivity Trend */}
      <ProductivityChart
        data={productivityData}
      />

      {/* Task / Project Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Task Completion */}
        <ChartCard
          title="Task Completion"
          subtitle="Distribution of task statuses"
        >
          {taskCompletionData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
              No task data available.
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={taskCompletionData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {taskCompletionData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="rgb(var(--surface))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Priority Distribution */}
        <ChartCard
          title="Priority Distribution"
          subtitle="Tasks by priority level"
        >
          {priorityData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
              No priority data available.
            </div>
          ) : (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={priorityData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="rgb(var(--surface))"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                />

                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Project Progress */}
        <ChartCard
          title="Project Progress"
          subtitle="Completion percentage by project"
        >
          {projectProgressData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-text-tertiary">
              No project data available.
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart
                data={projectProgressData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgb(var(--border))"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: 'rgb(var(--text-tertiary))',
                  }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{
                    fontSize: 11,
                    fill: 'rgb(var(--text-tertiary))',
                  }}
                  domain={[0, 100]}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{
                    fill: 'rgb(var(--surface-2))',
                  }}
                  formatter={(value) => [
                    `${value}%`,
                    'Progress',
                  ]}
                />

                <Bar
                  dataKey="progress"
                  fill="rgb(var(--accent))"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Completed vs Pending */}
        <ChartCard
          title="Completed vs Pending"
          subtitle="Overall task completion rate"
        >
          <ResponsiveContainer>
            <RadialBarChart
              innerRadius="40%"
              outerRadius="90%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                background={{
                  fill: 'rgb(var(--surface-2))',
                }}
                dataKey="value"
                cornerRadius={20}
              />

              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-text-primary"
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                }}
              >
                {completionRate}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Productivity Summary */}
      <div className="flex items-center gap-2 rounded-xl border border-border bg-accent-soft p-4 text-sm text-accent">
        <ActivityIcon
          className="h-4 w-4 shrink-0"
        />

        {productivityMessage}
      </div>

    </div>
  );
}