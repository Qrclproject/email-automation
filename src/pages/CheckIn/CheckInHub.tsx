import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, QrCode, List } from 'lucide-react';
import { api } from '../../services/api';

export default function CheckInHub() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Event Check-in</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Select a campaign to start scanning attendees.</p>
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

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading campaigns...</div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <QrCode className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No campaigns found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const total = campaign.recipients?.length || 0;
            const checkedIn = campaign.recipients?.filter((r: any) => r.checkedIn).length || 0;
            const progress = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

            return (
              <div key={campaign._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                    <QrCode className="w-5 h-5 text-[#FFA45C]" />
                  </div>
                  <span className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-100 dark:bg-gray-900/50 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3" /> {new Date(campaign.createdAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1">{campaign.name}</h3>
                
                <div className="mb-6">
                  <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                    <span>Check-in Progress</span>
                    <span className="text-[#FFA45C]">{checkedIn} / {total}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-[#FFA45C] h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Link to={`/checkin/${campaign._id}/scan`} className="bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                    <QrCode className="w-4 h-4" /> Scan
                  </Link>
                  <Link to={`/checkin/${campaign._id}/list`} className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors">
                    <List className="w-4 h-4" /> View List
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}