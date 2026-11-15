import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Pause, Search, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';

export default function CampaignDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaign = async () => {
    try {
      const response = await api.get(`/campaigns/${id}`);
      setCampaign(response.data);
    } catch (error) {
      console.error('Failed to fetch campaign', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaign();
    
    const interval = setInterval(() => {
      if (campaign && (campaign.status === 'Sending' || campaign.status === 'Scheduled')) {
        fetchCampaign();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, campaign?.status]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin mr-3" /> Loading campaign details...
      </div>
    );
  }

  if (!campaign) {
    return <div className="p-8 text-center text-red-500">Campaign not found.</div>;
  }

  const recipients = campaign.recipients || [];
  
  // Helper function to extract name dynamically
  const getRecipientName = (data: any) => {
    if (!data) return 'Unknown';
    return data['Full Name'] || 
           data['Name'] || 
           data['Attendee Name'] || 
           data['Recipient Name'] || 
           data['name'] || 
           Object.values(data)[0] || // Fallback to the very first column in the CSV
           'Unknown';
  };

  const filteredRecipients = recipients.filter((r: any) => {
    const name = String(getRecipientName(r.data)).toLowerCase();
    const email = String(r.data?.email || r.data?.['Email Address'] || r.data?.['Email'] || '').toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase());
  });

  const totalCount = recipients.length;
  const sentCount = campaign.sentCount || 0;
  const failedCount = campaign.failedCount || 0;
  const bouncedCount = campaign.bouncedCount || 0;

  const handleExport = () => {
    const headers = ['Name', 'Email', 'Status', 'Error', 'Sent At'];
    
    const csvData = recipients.map((r: any) => {
      const name = getRecipientName(r.data);
      const email = r.data?.email || r.data?.['Email Address'] || r.data?.['Email'] || 'N/A';
      const time = r.sentAt ? new Date(r.sentAt).toLocaleString() : '-';
      const error = r.error ? `"${r.error.replace(/"/g, '""')}"` : '-';
      
      return [name, email, r.status || 'Pending', error, time].join(',');
    });

    const csvContent = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `campaign_${campaign.name}_results.csv`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => navigate('/campaigns')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Campaigns
      </button>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{campaign.name}</h1>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
              campaign.status === 'Completed' ? 'bg-green-100 text-green-700' :
              campaign.status === 'Sending' ? 'bg-blue-100 text-blue-700' : 
              'bg-gray-100 text-gray-700'
            }`}>
              {campaign.status}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">Created {new Date(campaign.createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download className="w-4 h-4"/> Export Results
          </button>
          {campaign.status === 'Sending' && (
            <button className="px-4 py-2 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 flex items-center gap-2">
              <Pause className="w-4 h-4"/> Pause
            </button>
          )}
          <button onClick={fetchCampaign} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Recipients</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Successfully Sent</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">{sentCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Failed</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">{failedCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bounced</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{bouncedCount}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recipient Log</h2>
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-gray-900 dark:text-white transition-colors" 
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Time</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400 w-1/3">Error Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No recipients found.
                  </td>
                </tr>
              ) : (
                filteredRecipients.map((r: any, index: number) => {
                  const name = getRecipientName(r.data);
                  const email = r.data?.email || r.data?.['Email Address'] || r.data?.['Email'] || 'N/A';
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{name}</td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                          r.status === 'Sent' || r.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          r.status === 'Failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          r.status === 'Bounced' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {r.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {r.sentAt ? new Date(r.sentAt).toLocaleTimeString() : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-red-500 dark:text-red-400">
                        {r.error ? (
                          <div className="flex items-start gap-1">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="break-words">{r.error}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
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