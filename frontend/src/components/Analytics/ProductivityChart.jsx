import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const monthNames = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const ProductivityChart = ({ data = [] }) => {
  const chartData = data.map((item) => ({
    month:
      monthNames[Number(item.month) - 1] ||
      `Month ${item.month}`,
    completedTasks: Number(item.completedTasks || 0),
    totalTasks: Number(item.totalTasks || 0),
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No productivity data available yet.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-muted"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip />

          <Bar
            dataKey="totalTasks"
            name="Total Tasks"
            radius={[4, 4, 0, 0]}
          />

          <Bar
            dataKey="completedTasks"
            name="Completed Tasks"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductivityChart;