import { Link } from 'react-router-dom';
import { useDashboardStore } from '../store/useDashboardStore';
import { useAccountStore } from '../store/useAccountStore';

export default function Dashboard() {
  const { campaigns } = useDashboardStore();
  const { accounts } = useAccountStore();

  const totalCampaigns = campaigns.length;
  const totalRecipients = campaigns.reduce((sum, c) => sum + c.recipients, 0);
  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
  const totalFailed = campaigns.reduce((sum, c) => sum + c.failed, 0);
  const totalBounced = campaigns.reduce((sum, c) => sum + c.bounced, 0);

  const runningCampaigns = campaigns.filter(c => ['Sending', 'Paused', 'Scheduled'].includes(c.status));

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Overview of campaigns, accounts and quota</p>
        </div>
        <Link to="/campaigns/create" className="bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 shadow-sm w-full md:w-auto justify-center">
          + Create Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total contacts</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalRecipients.toLocaleString()}</h3>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
            ↑ 6% <span className="text-gray-400 dark:text-gray-500 font-normal">vs last month</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Campaigns created</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCampaigns}</h3>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
            +3 new <span className="text-gray-400 dark:text-gray-500 font-normal">vs last month</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sent / Delivered</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalSent.toLocaleString()} / {totalDelivered.toLocaleString()}</h3>
          <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-2 flex items-center gap-1">
            ↑ 9% <span className="text-gray-400 dark:text-gray-500 font-normal">vs last month</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Failed · Bounced</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalFailed} · {totalBounced}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quota Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Daily provider quota</h2>
          <div className="space-y-5">
            {accounts.map(account => (
              <div key={account.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{account.email}</span>
                  <span className="text-gray-500 dark:text-gray-400">{account.sentToday} / {account.dailyLimit}</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FFA45C] rounded-full transition-all" 
                    style={{ width: `${Math.min((account.sentToday / account.dailyLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">Illustrative limits. The system applies each provider's real quota.</p>
        </div>

        {/* Running & Scheduled Panel */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-6">Running & scheduled</h2>
          <div className="space-y-3">
            {runningCampaigns.length === 0 ? (
               <p className="text-sm text-gray-500 dark:text-gray-400">No active campaigns right now.</p>
            ) : (
              runningCampaigns.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-colors">
                  <span className="font-medium text-sm text-gray-900 dark:text-gray-100 w-1/2 truncate">{c.name}</span>
                  <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                    c.status === 'Sending' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    c.status === 'Paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' : 
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {c.status}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16 text-right">
                    {c.status === 'Scheduled' ? c.date : `${c.progress}%`}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}