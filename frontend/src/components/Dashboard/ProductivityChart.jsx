import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-card">
      <p className="text-xs font-medium text-text-secondary">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-accent">
        {payload[0].value}% productivity
      </p>
    </div>
  );
}

export default function ProductivityChart({
  data = [],
  height = 300,
}) {
  const chartData = data.map((item) => ({
    day: item.day,
    productivity: Number(item.productivity || 0),
  }));

  const average =
    chartData.length > 0
      ? Math.round(
          chartData.reduce(
            (total, item) => total + item.productivity,
            0
          ) / chartData.length
        )
      : 0;

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">
            Weekly Productivity
          </h3>

          <p className="text-xs text-text-tertiary">
            Productivity score over the past week
          </p>
        </div>

        <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          Avg {average}%
        </span>
      </div>

      {chartData.length === 0 ? (
        <div
          style={{ height }}
          className="flex items-center justify-center text-sm text-text-tertiary"
        >
          No productivity data available yet.
        </div>
      ) : (
        <div style={{ width: '100%', height }}>
          <ResponsiveContainer>
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: -20,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="prodGrad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="rgb(var(--accent))"
                    stopOpacity={0.3}
                  />

                  <stop
                    offset="95%"
                    stopColor="rgb(var(--accent))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(var(--border))"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fill: 'rgb(var(--text-tertiary))',
                }}
              />

              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12,
                  fill: 'rgb(var(--text-tertiary))',
                }}
                domain={[0, 100]}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="productivity"
                stroke="rgb(var(--accent))"
                strokeWidth={2.5}
                fill="url(#prodGrad)"
                dot={{
                  r: 3,
                  fill: 'rgb(var(--accent))',
                  strokeWidth: 0,
                }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}