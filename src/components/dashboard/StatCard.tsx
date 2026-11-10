interface StatCardProps {
  label: string;
  value: string | number;
  trend?: string;
}

export default function StatCard({ label, value, trend }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
      {trend && (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
          {trend} <span className="text-gray-400 dark:text-gray-500 font-normal">vs last month</span>
        </p>
      )}
    </div>
  );
}