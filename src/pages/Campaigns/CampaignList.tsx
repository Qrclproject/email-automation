import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, LayoutList, Trash2 } from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';

export default function CampaignList() {
  const { campaigns, deleteCampaign, deleteMultipleCampaigns } = useDashboardStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [showStats, setShowStats] = useState(true);
  const navigate = useNavigate();

  const toggleSelect = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === campaigns.length ? [] : campaigns.map(c => c.id));

  const handleDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(id);
      setSelected(prev => prev.filter(x => x !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selected.length} campaigns?`)) {
      deleteMultipleCampaigns(selected);
      setSelected([]);
    }
  };

  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalDelivered = campaigns.reduce((sum, c) => sum + c.delivered, 0);
  const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100).toFixed(1) : '0.0';

  return (
    <div className="relative pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1></div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center">
          <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <LayoutList className="w-4 h-4" /> <span className="hidden sm:inline">Table View</span>
          </button>
          <button className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" /> <span className="hidden sm:inline">Filter</span>
          </button>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-200 ml-2 cursor-pointer">
            <input type="checkbox" checked={showStats} onChange={() => setShowStats(!showStats)} className="accent-[#FFA45C] w-4 h-4" /> <span className="hidden sm:inline">Show Stats</span>
          </label>
          <Link to="/campaigns/create" className="bg-[#FFA45C] text-[#2b1500] px-4 py-2 rounded-lg font-semibold text-sm hover:bg-orange-400 transition-colors ml-auto md:ml-0">
            + Create
          </Link>
        </div>
      </div>

      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total campaigns', value: campaigns.length.toString(), trend: '+3 new' },
            { label: 'Emails sent', value: totalSent.toLocaleString(), trend: '↑ 9%' },
            { label: 'Delivery rate', value: `${deliveryRate}%`, trend: '↑ 1%' },
            { label: 'Avg. replies / day', value: '86', trend: '↑ 5%' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
              <p className="text-[10px] md:text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                {stat.trend} <span className="text-gray-400 dark:text-gray-500 hidden sm:inline">vs last month</span>
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Responsive Table Container */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input type="checkbox" onChange={toggleAll} checked={campaigns.length > 0 && selected.length === campaigns.length} className="accent-[#FFA45C] w-4 h-4 cursor-pointer" />
                </th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Campaign</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Sending Account</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Recipients</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Sent</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Progress</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-4 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {campaigns.map((c) => (
                <tr key={c.id} className={`transition-colors cursor-pointer ${selected.includes(c.id) ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`} onClick={() => navigate(`/campaigns/${c.id}`)}>
                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleSelect(c.id)} className="accent-[#FFA45C] w-4 h-4 cursor-pointer" />
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">{c.name}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{c.account}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{c.recipients.toLocaleString()}</td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{c.sent.toLocaleString()}</td>
                  <td className="px-4 py-4">
                    <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${c.status === 'Failed' ? 'bg-red-500' : c.status === 'Completed' ? 'bg-green-500' : 'bg-[#FFA45C]'}`} style={{ width: `${c.progress}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                      c.status === 'Sending' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      c.status === 'Paused' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      c.status === 'Scheduled' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' : 
                      c.status === 'Failed' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button onClick={(e) => handleDeleteSingle(e, c.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete Campaign">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3 md:gap-4 z-50 animate-in slide-in-from-bottom-4 duration-200 w-[90%] md:w-auto overflow-x-auto">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">{selected.length} Selected</span>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          <button className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white whitespace-nowrap">Pause</button>
          <button onClick={handleBulkDelete} className="text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 whitespace-nowrap">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          <button onClick={() => setSelected([])} className="ml-auto md:ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center w-6 h-6 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}