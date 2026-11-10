import { useRef, useState } from 'react';
import { useCampaignStore } from '../../store/useCampaignStore';
import { UploadCloud, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AudienceUploader() {
  const { setSpreadsheetData } = useCampaignStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws) as Record<string, any>[];
        if (rawData.length > 0) {
          const headers = Object.keys(rawData[0]);
          const cleanData = rawData.map(row => {
            const cleanRow: Record<string, string> = {};
            headers.forEach(h => { cleanRow[h] = row[h] !== undefined && row[h] !== null ? String(row[h]) : ''; });
            return cleanRow;
          });
          setSpreadsheetData(headers, cleanData, file.name);
        } else {
          setError('The uploaded file appears to be empty.');
        }
      } catch (err) { setError('Failed to parse the file. Please ensure it is a valid Excel or CSV file.'); }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-center max-w-2xl mx-auto transition-colors">
      <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-[#FFA45C] dark:hover:border-[#FFA45C] transition-colors">
        <UploadCloud className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">Click to upload Audience</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Select an Excel (.xlsx, .xls) or CSV file containing your recipient list.</p>
        <button className="bg-[#FFA45C] hover:bg-orange-400 text-[#2b1500] font-semibold py-2 px-6 rounded-lg transition-colors">Browse Files</button>
      </div>
      {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm flex items-center gap-2 justify-center"><AlertCircle className="w-4 h-4" /> {error}</div>}
    </div>
  );
}