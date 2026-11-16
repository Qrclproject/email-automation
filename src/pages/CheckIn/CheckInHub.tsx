import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, QrCode, List, Users } from 'lucide-react';
import { api } from '../../services/api';

export default function CheckInHub() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const res = await api.get('/campaigns');
        setCampaigns(res.data);
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const filteredCampaigns = campaigns.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCampaigns = campaigns.length;
  const totalAttendees = campaigns.reduce((sum, c) => sum + (c.recipients?.length || 0), 0);
  const totalCheckedIn = campaigns.reduce((sum, c) => sum + (c.recipients?.filter((r: any) => r.checkedIn).length || 0), 0);
  const overallProgress = totalAttendees > 0 ? Math.round((totalCheckedIn / totalAttendees) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Check-in</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage event entry and track attendance.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search campaigns..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-gray-900 dark:text-white" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Events</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalCampaigns}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Attendees</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{totalAttendees}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Checked In</p>
          <h3 className="text-2xl font-bold text-green-600 dark:text-green-500">{totalCheckedIn}</h3>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Overall Progress</p>
          <h3 className="text-2xl font-bold text-[#FFA45C]">{overallProgress}%</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Campaign Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Date Created</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Attendees</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 w-1/4">Progress</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">Loading events...</td></tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No events found.</td></tr>
              ) : (
                filteredCampaigns.map((campaign) => {
                  const total = campaign.recipients?.length || 0;
                  const checkedIn = campaign.recipients?.filter((r: any) => r.checkedIn).length || 0;
                  const progress = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

                  return (
                    <tr key={campaign._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                            <QrCode className="w-4 h-4 text-[#FFA45C]" />
                          </div>
                          <span className="truncate max-w-[250px]">{campaign.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-400" />{new Date(campaign.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" />{total}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between text-xs font-medium mb-1">
                          <span className="text-gray-500 dark:text-gray-400">{checkedIn} checked in</span>
                          <span className="text-[#FFA45C]">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-[#FFA45C] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => navigate(`/checkin/${campaign._id}/list`)} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-1.5 text-xs font-medium transition-colors">
                            <List className="w-3.5 h-3.5" /> View List
                          </button>
                          <button onClick={() => navigate(`/checkin/${campaign._id}/scan`)} className="px-3 py-1.5 bg-[#FFA45C] text-[#2b1500] rounded-lg hover:bg-orange-400 flex items-center gap-1.5 text-xs font-bold transition-colors shadow-sm">
                            <QrCode className="w-3.5 h-3.5" /> Scan
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 