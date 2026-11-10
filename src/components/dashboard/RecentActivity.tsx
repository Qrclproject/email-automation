import { Badge } from '../common/Badge';

export default function RecentActivity() {
  const activities = [
    { name: 'Summit 10.0 – VIP invites', status: 'Sending', val: '62%', type: 'success' as const },
    { name: 'Gala night reminder', status: 'Paused', val: '31%', type: 'warning' as const },
    { name: 'Wedding – Adeyemi', status: 'Scheduled', val: 'Fri 09:00', type: 'info' as const }
  ];

  return (
    <div className="space-y-4">
      {activities.map((c, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
          <span className="font-medium text-sm text-gray-900 dark:text-gray-100 w-1/2 truncate pr-2">{c.name}</span>
          <Badge status={c.type} text={c.status} />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 w-16 text-right">{c.val}</span>
        </div>
      ))}
    </div>
  );
}