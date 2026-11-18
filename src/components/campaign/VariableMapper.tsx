import { useCampaignStore } from '../../store/useCampaignStore';
import { QrCode, Type, CheckCircle2 } from 'lucide-react';

export default function VariableMapper() {
  const { 
    excelColumns, 
    variableMappings, 
    setMapping, 
    selectedTemplate, 
    emailBody,
    checkInDisplayColumns,
    toggleCheckInColumn
  } = useCampaignStore();

  if (excelColumns.length === 0) {
    return <div className="p-8 text-center bg-orange-50 text-orange-800 rounded-xl border border-orange-100">Please go back to Step 1 and upload an Excel file.</div>;
  }

  const templateVars = selectedTemplate?.variables || [];
  const textMatches = emailBody.match(/(\{\{.*?\}\}|\[.*?\])/g) || [];
  const allVars = Array.from(new Set([...templateVars, ...textMatches]));
  
  const qrField = selectedTemplate?.qrDataField;
  const qrVar = qrField || allVars.find(v => v.includes('QR'));
  const textVars = allVars.filter(v => v !== qrVar);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Map Variables & Check-in Setup</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedTemplate ? `Template attached: ${selectedTemplate.name}` : 'No template attached. Mapping text variables only.'}
          </p>
        </div>

        {allVars.length === 0 && !qrVar ? (
          <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 mb-8">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No dynamic variables found in your email body or template.</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <Type className="w-4 h-4" /> Text Overlays
              </h3>
              
              {textVars.length === 0 && (
                 <p className="text-sm text-gray-500 dark:text-gray-400">No text variables found. Add placeholders like <code>[Recipient Name]</code> to your email body to map them.</p>
              )}

              {textVars.map((variable) => (
                <div key={variable} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg gap-3 border border-gray-100 dark:border-gray-600">
                  <span className="font-mono text-sm text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded w-fit break-all">{variable}</span>
                  
                  <select 
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded p-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-[#FFA45C] outline-none transition-colors cursor-pointer" 
                    value={variableMappings[variable] || ''} 
                    onChange={(e) => setMapping(variable, e.target.value)}
                  >
                    <option value="">-- Choose Excel Column --</option>
                    {excelColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {qrVar && (
              <div className="space-y-4 mb-8">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                  <QrCode className="w-4 h-4" /> QR Code Payload
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg gap-3">
                  <div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white block">QR Destination Data</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Map the data that will be encoded inside the QR code.</span>
                  </div>
                  
                  <select 
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded p-2 text-sm flex-1 max-w-xs focus:ring-2 focus:ring-[#FFA45C] outline-none transition-colors cursor-pointer" 
                    value={variableMappings[qrVar] || ''} 
                    onChange={(e) => setMapping(qrVar, e.target.value)}
                  >
                    <option value="">-- Choose Excel Column --</option>
                    {excelColumns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </>
        )}

        {/* CHECK-IN DISPLAY COLUMNS */}
        <div className="space-y-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
            <CheckCircle2 className="w-4 h-4 text-green-500" /> Check-in Screen Details
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Select which details should be displayed when the QR code is scanned at the door. 
            <span className="block mt-1 text-xs font-medium text-orange-600 dark:text-orange-400">(E.g., Name, Ticket Type, Seating Plan).</span>
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {excelColumns.map(col => (
              <label 
                key={col} 
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  checkInDisplayColumns.includes(col) 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checkInDisplayColumns.includes(col)}
                  onChange={() => toggleCheckInColumn(col)}
                  className="accent-[#FFA45C] w-4 h-4 rounded"
                />
                <span className={`text-sm font-medium ${
                  checkInDisplayColumns.includes(col) 
                    ? 'text-green-800 dark:text-green-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>{col}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}