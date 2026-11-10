import { useNavigate } from 'react-router-dom';
import { Badge } from '../common/Badge';

interface Campaign {
  id: string;
  name: string;
  account: string;
  recipients: string;
  sent: string;
  status: 'Sending' | 'Paused' | 'Scheduled' | 'Completed' | 'Failed';
}

export default function CampaignTable({ campaigns }: { campaigns: Campaign[] }) {
  const navigate = useNavigate();

  const getStatusType = (status: string) => {
    switch(status) {
      case 'Sending': case 'Completed': return 'success';
      case 'Paused': return 'warning';
      case 'Scheduled': return 'info';
      default: return 'neutral';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
      <table className="w-full text-left text-sm min-w-[600px]">
        <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Campaign</th>
            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Sending Account</th>
            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Recipients</th>
            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Sent</th>
            <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {campaigns.map((c) => (
            <tr 
              key={c.id} 
              onClick={() => navigate(`/campaigns/${c.id}`)}
              className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
            >
              <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.account}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.recipients}</td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.sent}</td>
              <td className="px-6 py-4"><Badge status={getStatusType(c.status) as any} text={c.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}