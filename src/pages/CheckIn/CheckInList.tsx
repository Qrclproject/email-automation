import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Search, CheckCircle2, XCircle, Loader2, QrCode } from 'lucide-react';
import { api } from '../../services/api';
import * as XLSX from 'xlsx';

export default function CheckInList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/campaigns/${id}`).then(res => {
      setCampaign(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#FFA45C]"/></div>;
  if (!campaign) return <div className="p-12 text-center text-red-500">Campaign not found.</div>;

  const getRecipientName = (data: any) => {
    if (!data) return 'Unknown';
    return data['Full Name'] || data['Name'] || data['Attendee Name'] || data['Recipient Name'] || Object.values(data)[0] || 'Unknown';
  };

  const getRecipientEmail = (data: any) => {
    if (!data) return 'N/A';
    return data.email || data['Email Address'] || data['Email'] || 'N/A';
  };

  const filteredRecipients = campaign.recipients.filter((r: any) => {
    const name = String(getRecipientName(r.data)).toLowerCase();
    const email = String(getRecipientEmail(r.data)).toLowerCase();
    return name.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());
  });

  const totalScanned = campaign.recipients.filter((r: any) => r.checkedIn).length;
  const totalAttendees = campaign.recipients.length;

  const handleExport = (type: 'csv' | 'excel') => {
    const exportData = campaign.recipients.map((r: any) => ({
      'Name': getRecipientName(r.data),
      'Email': getRecipientEmail(r.data),
      'Status': r.checkedIn ? 'Checked In' : 'Pending',
      'Check-in Time': r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : '-',
      ...r.data // Include all other original CSV data
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CheckIn_List');

    if (type === 'excel') {
      XLSX.writeFile(wb, `${campaign.name}_CheckIn.xlsx`);
    } else {
      const csv = XLSX.utils.sheet_to_csv(ws);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${campaign.name}_CheckIn.csv`;
      link.click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={() => navigate('/checkin')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Campaigns
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{campaign.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Event Check-in Management</p>
        </div>
        
        <div className="flex gap-3">
          <button onClick={() => handleExport('csv')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download className="w-4 h-4"/> CSV
          </button>
          <button onClick={() => handleExport('excel')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2">
            <Download className="w-4 h-4"/> Excel
          </button>
          <button onClick={() => navigate(`/checkin/${id}/scan`)} className="px-4 py-2 bg-[#FFA45C] text-[#2b1500] rounded-lg text-sm font-bold hover:bg-orange-400 flex items-center gap-2 shadow-sm">
            <QrCode className="w-4 h-4"/> Open Scanner
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Attendees</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAttendees}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Checked In</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">{totalScanned}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-400">{totalAttendees - totalScanned}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Attendee List</h2>
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search attendee..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FFA45C] text-gray-900 dark:text-white" 
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[800px]">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Email</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="px-6 py-4 font-medium text-gray-500 dark:text-gray-400">Check-in Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredRecipients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No attendees found.</td>
                </tr>
              ) : (
                filteredRecipients.map((r: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{getRecipientName(r.data)}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{getRecipientEmail(r.data)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        r.checkedIn 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {r.checkedIn ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {r.checkedIn ? 'Checked In' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}