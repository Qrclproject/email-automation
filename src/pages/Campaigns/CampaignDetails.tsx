import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Pause, Search } from 'lucide-react';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const campaign = { id, name: 'Summit 10.0 – VIP invites', status: 'Sending', sent: 746, total: 1204, failed: 12, bounced: 5 };
  const recipients = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Delivered', time: '10:42 AM', error: '-' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Delivered', time: '10:42 AM', error: '-' },
    { id: 3, name: 'Alice Johnson', email: 'alice@example.com', status: 'Failed', time: '10:43 AM', error: 'Mailbox full' },
    { id: 4, name: 'Bob Williams', email: 'bob@example.com', status: 'Bounced', time: '10:43 AM', error: 'Invalid domain' },
  ];
  const filteredRecipients = recipients.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </button>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Sending</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Started 2 hours ago</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Download className="w-4 h-4"/> Export Results</button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"><Pause className="w-4 h-4"/> Pause</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Recipients</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{campaign.total}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Successfully Sent</p><p className="text-2xl font-bold text-green-600 dark:text-green-500">{campaign.sent}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Failed</p><p className="text-2xl font-bold text-red-600 dark:text-red-500">{campaign.failed}</p></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"><p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bounced</p><p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{campaign.bounced}</p></div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recipient Log</h2>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-gray-900 dark:text-white transition-colors" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
              <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
              <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Time</th>
              <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Error Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredRecipients.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{r.name}</td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{r.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    r.status === 'Delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    r.status === 'Failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' : 
                    'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  }`}>{r.status}</span>
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{r.time}</td>
                <td className={`px-6 py-4 text-sm ${r.error !== '-' ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'}`}>{r.error}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}