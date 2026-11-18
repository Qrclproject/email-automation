import { useState, useRef } from 'react';
import { UploadCloud, X, Loader2, Send, ChevronRight, ChevronLeft, Trash2, PlusCircle, PlusSquare, ArrowRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../../services/api';
import GmailPreview from '../preview/GmailPreview';

export default function AddRecipientsModal({ 
  campaign, 
  onClose, 
  onSuccess 
}: { 
  campaign: any; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spreadsheet Editor States
  const [showAddCol, setShowAddCol] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [fillValues, setFillValues] = useState<Record<string, string>>({});

  // Flow States
  const [step, setStep] = useState<'upload' | 'preview' | 'sending'>('upload');
  
  // Sending Progress States
  const [launchProgress, setLaunchProgress] = useState(0);
  const [sentCount, setSentCount] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setFileName(file.name);

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
          setColumns(headers);
          setData(cleanData);
        } else {
          setError('The uploaded file appears to be empty.');
        }
      } catch (err) { 
        setError('Failed to parse file. Please ensure it is a valid Excel or CSV file.'); 
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- Spreadsheet Handlers ---
  const handleCellChange = (rowIndex: number, col: string, value: string) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [col]: value };
    setData(newData);
  };

  const addRow = () => setData([...data, {}]);
  
  const deleteRow = (index: number) => setData(data.filter((_, i) => i !== index));

  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColumnName.trim()) {
      const col = newColumnName.trim();
      setColumns([...columns, col]);
      setData(data.map(row => ({ ...row, [col]: '' })));
      setNewColumnName('');
      setShowAddCol(false);
    }
  };

  const handleDeleteColumn = (col: string) => {
    if (window.confirm(`Delete column "${col}"?`)) {
      setColumns(columns.filter(c => c !== col));
      setData(data.map(row => {
        const newRow = { ...row };
        delete newRow[col];
        return newRow;
      }));
    }
  };

  const handleRenameColumn = (oldName: string, newName: string) => {
    if (columns.includes(newName)) {
      alert("A column with this name already exists.");
      return;
    }
    setColumns(columns.map(c => c === oldName ? newName : c));
    setData(data.map(row => {
      const newRow = { ...row };
      newRow[newName] = newRow[oldName] || '';
      delete newRow[oldName];
      return newRow;
    }));
  };

  const handleFillColumn = (col: string, value: string) => {
    setData(data.map(row => ({ ...row, [col]: value })));
  };
  // -----------------------------

  const handleLaunch = async () => {
    setStep('sending');
    
    const currentProcessed = (campaign.sentCount || 0) + (campaign.failedCount || 0);
    setSentCount(0);
    setLaunchProgress(0);

    try {
      const recipients = data.map(row => ({
        data: row,
        status: 'Pending',
      }));

      await api.post(`/campaigns/${campaign._id}/recipients`, { recipients });

      const interval = setInterval(async () => {
        try {
          const res = await api.get(`/campaigns/${campaign._id}`);
          const updatedCampaign = res.data;
          
          const totalProcessedNow = (updatedCampaign.sentCount || 0) + (updatedCampaign.failedCount || 0);
          const newSent = totalProcessedNow - currentProcessed;
          
          setSentCount(Math.max(0, newSent));
          const progress = Math.round((newSent / data.length) * 100);
          setLaunchProgress(Math.min(100, Math.max(0, progress)));

          if (newSent >= data.length || updatedCampaign.status === 'Completed') {
            clearInterval(interval);
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add recipients.');
      setStep('upload');
    }
  };

  // --- Preview Data Extraction ---
  const firstRow = data.length > 0 ? data[0] : {};
  const mappedName = firstRow[campaign.variableMappings?.['{{Full Name}}']] || firstRow[campaign.variableMappings?.['[Recipient Name]']] || 'Valued Guest';
  const mappedTicket = firstRow[campaign.variableMappings?.['{{Ticket Type}}']] || firstRow[campaign.variableMappings?.['[Ticket Type]']] || 'General Admission';
  const mappedQr = firstRow[campaign.variableMappings?.['QR_CODE']] || firstRow[campaign.variableMappings?.['[QR Code]']] || 'https://qrcodeng.com/verify';
  const emailColumn = campaign.variableMappings?.['{{Email Address}}'] || campaign.variableMappings?.['[Email Address]'] || 'email';
  const mappedEmail = firstRow[emailColumn] || 'recipient@example.com';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {step === 'upload' ? 'Add & Edit Recipients' : step === 'preview' ? 'Preview New Recipients' : 'Sending Campaign...'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {step === 'upload' ? 'Upload a new sheet to append to this campaign. You can edit the data below.' : 
               step === 'preview' ? 'Review the first row of your new data using the existing campaign design.' : 
               'Please keep this window open while we send the emails.'}
            </p>
          </div>
          {step !== 'sending' && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto w-full">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* STEP 1: UPLOAD & EDIT */}
          {step === 'upload' && (
            <>
              {data.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-[#FFA45C] transition-colors"
                >
                  <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Click to upload new Audience</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Select an Excel (.xlsx, .xls) or CSV file.</p>
                </div>
              ) : (
                <div className="w-full">
                  {/* Editor Toolbar */}
                  <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">{fileName}</span>
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">{data.length} new rows</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setData([]); setColumns([]); }} className="px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
                        Remove File
                      </button>
                      <button onClick={addRow} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <PlusCircle className="w-4 h-4" /> Add Row
                      </button>
                      <button onClick={() => setShowAddCol(!showAddCol)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
                        <PlusSquare className="w-4 h-4" /> Add Column
                      </button>
                    </div>
                  </div>

                  {/* Add Column Input */}
                  {showAddCol && (
                    <div className="mb-4 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
                      <span className="text-sm font-medium text-green-800 dark:text-green-400">New Column Name:</span>
                      <form onSubmit={handleAddColumnSubmit} className="flex gap-2">
                        <input autoFocus type="text" value={newColumnName} onChange={e => setNewColumnName(e.target.value)} className="border border-green-300 rounded px-2 py-1 text-sm outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g., Ticket Type" />
                        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium">Add</button>
                        <button type="button" onClick={() => setShowAddCol(false)} className="text-gray-500 text-sm hover:underline">Cancel</button>
                      </form>
                    </div>
                  )}

                  {/* Editable Spreadsheet Table */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto max-h-[50vh]">
                    <table className="w-full text-left text-sm min-w-[800px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                          <th className="px-3 py-3 w-12 font-medium">#</th>
                          {columns.map(col => (
                            <th key={col} className="px-3 py-3 font-semibold min-w-[150px] relative group">
                              <input 
                                type="text" defaultValue={col}
                                onBlur={(e) => {
                                  if (e.target.value.trim() !== '' && e.target.value !== col) {
                                    handleRenameColumn(col, e.target.value.trim());
                                  } else {
                                    e.target.value = col;
                                  }
                                }}
                                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:bg-white dark:focus:bg-gray-700 outline-none px-1 py-0.5 rounded-sm transition-colors cursor-text font-semibold text-gray-900 dark:text-white"
                                title="Click to rename column"
                              />
                              <button 
                                onClick={() => handleDeleteColumn(col)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 dark:bg-gray-800 px-1"
                                title="Delete Column"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </th>
                          ))}
                          <th className="px-3 py-3 w-16 font-medium text-center">Actions</th>
                        </tr>
                        {/* Fill all rows row */}
                        <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                          <td className="px-3 py-2 text-center text-gray-400"><ArrowRight className="w-4 h-4 mx-auto transform rotate-90" /></td>
                          {columns.map(col => (
                            <td key={`fill-${col}`} className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" placeholder="Fill all rows"
                                  value={fillValues[col] || ''}
                                  onChange={e => setFillValues({...fillValues, [col]: e.target.value})}
                                  onKeyDown={e => { if (e.key === 'Enter') { handleFillColumn(col, fillValues[col] || ''); setFillValues({...fillValues, [col]: ''}); } }}
                                  className="w-full border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-gray-600 outline-none" 
                                />
                                <button onClick={() => { handleFillColumn(col, fillValues[col] || ''); setFillValues({...fillValues, [col]: ''}); }} className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded">
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          ))}
                          <td></td>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {data.map((row, rowIndex) => (
                          <tr key={rowIndex} className="hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition-colors bg-white dark:bg-gray-800">
                            <td className="px-3 py-2 text-center text-gray-400 font-medium">{rowIndex + 1}</td>
                            {columns.map(col => (
                              <td key={`${rowIndex}-${col}`} className="px-3 py-1">
                                <input 
                                  type="text" 
                                  value={row[col] || ''} 
                                  onChange={(e) => handleCellChange(rowIndex, col, e.target.value)} 
                                  className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded px-2 py-1.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition" 
                                />
                              </td>
                            ))}
                            <td className="px-3 py-1 text-center">
                              <button onClick={() => deleteRow(rowIndex)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"><Trash2 className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* STEP 2: PREVIEW */}
          {step === 'preview' && (
            <div className="w-full">
              <GmailPreview 
                subject={campaign.subject}
                recipientName={mappedName}
                recipientEmail={mappedEmail}
                senderEmail={campaign.senderAccount}
                emailBody={campaign.emailBody} 
                mappedTicket={mappedTicket}
                qrData={mappedQr}
                variableMappings={campaign.variableMappings}
                previewRow={firstRow}
              />
            </div>
          )}

          {/* STEP 3: SENDING PROGRESS */}
          {step === 'sending' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-orange-50 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-[#FFA45C] animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sending New Batch...</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Adding your new recipients to the queue.</p>
              
              <div className="w-full max-w-md bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                <div 
                  className="bg-[#FFA45C] h-4 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${launchProgress}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between w-full max-w-md text-sm font-semibold text-gray-700 dark:text-gray-300">
                <span>{sentCount} of {data.length} sent</span>
                <span>{launchProgress}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 shrink-0">
          
          {step === 'upload' && (
            <>
              <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button 
                onClick={() => setStep('preview')} 
                disabled={data.length === 0} 
                className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                Next Step <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button onClick={() => setStep('upload')} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button 
                onClick={handleLaunch} 
                className="px-6 py-2 bg-[#FFA45C] text-[#2b1500] font-bold rounded-lg hover:bg-orange-400 transition-colors shadow-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4"/> Launch New Batch
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}