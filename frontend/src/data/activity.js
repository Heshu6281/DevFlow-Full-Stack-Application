export const activity = [
  {
    id: 'a1',
    type: 'completed',
    actor: 'Heshwanthini',
    action: 'completed',
    target: 'Implement Login API',
    project: 'RentHub',
    timestamp: '2026-08-25T07:50:00Z',
  },
  {
    id: 'a2',
    type: 'created',
    actor: 'Heshwanthini',
    action: 'created a new task',
    target: 'Build Profile Page',
    project: 'DevFlow',
    timestamp: '2026-08-25T06:55:00Z',
  },
  {
    id: 'a3',
    type: 'progress',
    actor: 'Heshwanthini',
    action: 'updated progress for',
    target: 'RentHub',
    project: 'RentHub',
    detail: '65% → 78%',
    timestamp: '2026-08-25T05:30:00Z',
  },
  {
    id: 'a4',
    type: 'completed',
    actor: 'Heshwanthini',
    action: 'marked project completed',
    target: 'NOC College Management',
    project: 'NOC College Management',
    timestamp: '2026-08-24T16:10:00Z',
  },
  {
    id: 'a5',
    type: 'created',
    actor: 'Heshwanthini',
    action: 'created a new task',
    target: 'Optimize Database Queries',
    project: 'RentHub',
    timestamp: '2026-08-24T11:20:00Z',
  },
  {
    id: 'a6',
    type: 'blocked',
    actor: 'Heshwanthini',
    action: 'marked task as blocked',
    target: 'Train Anomaly Detection Model',
    project: 'SmartHome Analytics',
    timestamp: '2026-08-23T19:45:00Z',
  },
];

export const productivityData = [
  { day: 'Mon', productivity: 72, tasks: 6 },
  { day: 'Tue', productivity: 85, tasks: 8 },
  { day: 'Wed', productivity: 68, tasks: 5 },
  { day: 'Thu', productivity: 91, tasks: 9 },
  { day: 'Fri', productivity: 87, tasks: 7 },
  { day: 'Sat', productivity: 54, tasks: 3 },
  { day: 'Sun', productivity: 42, tasks: 2 },
];

export const taskCompletionData = [
  { name: 'Completed', value: 42, color: 'rgb(var(--success))' },
  { name: 'In Progress', value: 12, color: 'rgb(var(--info))' },
  { name: 'To Do', value: 9, color: 'rgb(var(--text-tertiary))' },
  { name: 'Blocked', value: 3, color: 'rgb(var(--error))' },
];

export const priorityDistribution = [
  { name: 'High', value: 14, color: 'rgb(var(--error))' },
  { name: 'Medium', value: 22, color: 'rgb(var(--warning))' },
  { name: 'Low', value: 18, color: 'rgb(var(--success))' },
];

export const projectProgressData = [
  { name: 'RentHub', progress: 78 },
  { name: 'NOC College', progress: 92 },
  { name: 'SmartHome', progress: 65 },
  { name: 'DevFlow', progress: 45 },
];
