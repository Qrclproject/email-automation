import { Button } from '../components/common/Button';
import StatCard from '../components/dashboard/StatCard';

export default function CommandCenter() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Command Center</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Queue, limits and system health</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Pause all</Button>
          <Button>Resume</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Queued now" value="1,420" />
        <StatCard label="Sent today" value="550" />
        <StatCard label="Active users" value="7" />
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Queue status</p>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-500">Healthy</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Sending Controls</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Batch size</span>
                <span className="text-gray-500 dark:text-gray-400">25 emails</span>
              </div>
              <input type="range" min="5" max="100" defaultValue="25" className="w-full accent-[#FFA45C]" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">Interval between batches</span>
                <span className="text-gray-500 dark:text-gray-400">30 seconds</span>
              </div>
              <input type="range" min="5" max="120" defaultValue="30" className="w-full accent-[#FFA45C]" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Audit Log</h2>
          <div className="space-y-4">
            {[
              { user: 'Ada O.', action: 'Approved campaign', time: '2m ago' },
              { user: 'Tunde K.', action: 'Uploaded 1,204 contacts', time: '18m ago' },
              { user: 'Admin', action: 'Changed permissions', time: '1h ago' },
            ].map((log, i) => (
              <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="font-medium text-gray-900 dark:text-white w-24">{log.user}</span>
                <span className="text-gray-600 dark:text-gray-300 flex-1">{log.action}</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}