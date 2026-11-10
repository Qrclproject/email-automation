import { Download, BarChart2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function Reports() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">View delivery outcomes and campaign performance</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center shadow-sm transition-colors">
        <BarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reports generated yet</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Once you send a campaign, detailed analytics will appear here.</p>
      </div>
    </div>
  );
}