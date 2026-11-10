import { useState } from 'react';
import { UploadCloud, Download, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

interface RecipientData {
  id: string;
  name: string;
  email: string;
  ticket: string;
}

export default function RecipientUploader() {
  const [isUploaded, setIsUploaded] = useState(false);
  const [data, setData] = useState<RecipientData[]>([]);

  // Simulate Excel Upload
  const handleMockUpload = () => {
    setData([
      { id: '1', name: 'John Doe', email: 'john@example.com', ticket: 'VIP' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', ticket: 'Regular' },
      { id: '3', name: 'Invalid Email', email: 'invalid-email', ticket: 'VIP' }, // Testing validation
    ]);
    setIsUploaded(true);
  };

  const handleEdit = (id: string, field: keyof RecipientData, value: string) => {
    setData(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Name,Email,Ticket\n" + 
      data.map(d => `${d.name},${d.email},${d.ticket}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "cleaned_recipients.csv";
    link.click();
  };

  if (!isUploaded) {
    return (
      <div 
        onClick={handleMockUpload}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 text-center transition-colors cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-4" />
        <p className="font-semibold text-gray-900 dark:text-white mb-1">Click to upload Excel or CSV</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Simulate uploading guests_summit.xlsx</p>
        <span className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium">
          Select File
        </span>
      </div>
    );
  }

  return (
    <div>
      {/* File Info Header */}
      <div className="flex justify-between items-center mb-4 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <FileSpreadsheet className="w-5 h-5" />
          <span className="font-medium text-sm">guests_summit.xlsx</span>
          <span className="text-xs bg-green-200 dark:bg-green-900 px-2 py-0.5 rounded-full">3 rows</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
          <Download className="w-3 h-3" /> Export
        </Button>
      </div>

      {/* Editable Data Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-2 font-medium text-gray-500">Name</th>
              <th className="px-3 py-2 font-medium text-gray-500">Email</th>
              <th className="px-3 py-2 font-medium text-gray-500">Ticket</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map(row => {
              const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email);
              return (
                <tr key={row.id} className="bg-white dark:bg-gray-800">
                  <td className="p-1"><input type="text" value={row.name} onChange={(e) => handleEdit(row.id, 'name', e.target.value)} className="w-full bg-transparent p-1 focus:ring-1 focus:ring-[#FFA45C] rounded border-none outline-none text-gray-900 dark:text-white" /></td>
                  <td className="p-1">
                    <div className="flex items-center gap-1">
                      <input type="text" value={row.email} onChange={(e) => handleEdit(row.id, 'email', e.target.value)} className={`w-full bg-transparent p-1 focus:ring-1 focus:ring-[#FFA45C] rounded border-none outline-none ${!isValidEmail ? 'text-red-500 font-medium' : 'text-gray-900 dark:text-white'}`} />
                      {isValidEmail ? <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" /> : <span className="text-red-500 text-[10px] shrink-0">Invalid</span>}
                    </div>
                  </td>
                  <td className="p-1"><input type="text" value={row.ticket} onChange={(e) => handleEdit(row.id, 'ticket', e.target.value)} className="w-full bg-transparent p-1 focus:ring-1 focus:ring-[#FFA45C] rounded border-none outline-none text-gray-900 dark:text-white" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}